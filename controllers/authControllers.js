import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import crypto from "node:crypto";
import HttpError from "../helpers/HttpError.js";
import User from "../models/user.js";
import sendMail from "../helpers/verifyEmail.js";

async function register(req, res, next) {
  const { email, password } = req.body;

  const emailInLowerCase = email.toLowerCase();

  try {
    const user = await User.findOne({ email: emailInLowerCase });

    if (user !== null) {
      throw HttpError(404);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const generatedGravatar = gravatar.url(emailInLowerCase);
    const verificationToken = crypto.randomUUID();

    await User.create({
      email: emailInLowerCase,
      password: passwordHash,
      avatarURL: `http:${generatedGravatar}`,
      verificationToken,
    });

    sendMail({
      to: emailInLowerCase,
      from: "valera.izhyk@gmail.com",
      subject: "Confirm your account!",
      html: `To confirm your email,please click on the <a href="http://localhost:3000/users/verify/${verificationToken}">link</a>`,
      text: `To confirm your email please open the link http://localhost:3000/users/verify/${verificationToken}`,
    });

    res.status(201).send({ message: "Registration succesfully" });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  const emailInLowerCase = email.toLowerCase();

  try {
    const user = await User.findOne({ email: emailInLowerCase });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw HttpError(401, "Email or password is wrong");
    }

    if (user.verify === false) {
      throw HttpError(401, "Please, verify your email");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2 days" }
    );

    await User.findByIdAndUpdate(user._id, { token });
    res.send({
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id },
      { token: null }
    );

    if (!user) {
      throw HttpError(401, "Not authorized");
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    const { email, subscription } = user;
    res.status(200).send({ email, subscription });
  } catch (error) {
    next(error);
  }
}

export default { register, login, logout, getUser };
