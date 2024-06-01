import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import * as fs from "node:fs/promises";
import path from "node:path";
import gravatar from "gravatar";
import jimp from "jimp";

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

    await User.create({
      email: emailInLowerCase,
      password: passwordHash,
      avatarURL: `http:${generatedGravatar}`,
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

async function updateAvatar(req, res, next) {
  try {
    const publicDir = path.resolve("public/avatars", req.file.filename);

    await fs.rename(req.file.path, publicDir);

    const avatar = await jimp.read(publicDir);
    await avatar.resize(250, 250).writeAsync(publicDir);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatarURL: `/avatars/${req.file.filename}`,
      },
      { new: true }
    );

    if (!user) {
      throw HttpError(404, "User not found");
    }

    res.status(200).json({ avatarURL: user.avatarURL });
  } catch (error) {
    next(error);
  }
}

async function getAvatar(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw HttpError(404, "user not found");
    }

    if (!user.avatarURL) {
      throw HttpError(404, "Avatar not found");
    }

    res.sendFile(path.resolve("public/avatar", user.avatarURL));
  } catch (error) {
    next(error);
  }
}

export default { register, login, logout, getUser, updateAvatar, getAvatar };
