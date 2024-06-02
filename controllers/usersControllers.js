import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import * as fs from "node:fs/promises";
import path from "node:path";
import jimp from "jimp";
import crypto from "node:crypto";
import sendMail from "../helpers/verifyEmail.js";

async function getAvatar(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw HttpError(404, "User not found");
    }

    if (!user.avatarURL) {
      throw HttpError(404, "Avatar not found");
    }

    res.sendFile(path.resolve("public/avatar", user.avatarURL));
  } catch (error) {
    next(error);
  }
}

async function updateAvatar(req, res, next) {
  try {
    if (!req.file) {
      throw HttpError(400, "File not found");
    }

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

async function verify(req, res, next) {
  const { verificationToken } = req.params;
  try {
    const user = User.findOneAndUpdate(
      { verificationToken },
      { verify: true, verificationToken: null }
    );

    if (!user) {
      throw HttpError(404, "User not found");
    }

    res.status(200).json({ message: "Email confirm succesfully" });
  } catch (error) {
    next(error);
  }
}

async function resendVerify(req, res, next) {
  const { email } = req.body;

  try {
    const verificationToken = crypto.randomUUID();

    const user = await User.findOneAndUpdate(
      { email },
      { verificationToken },
      { new: true }
    );

    if (!user) {
      return next(HttpError(404, "User not found"));
    }

    if (user.verify) {
      return next(HttpError(400, "Verification has already been passed"));
    }

    await sendMail({
      to: email,
      from: "valera.izhyk@gmail.com",
      subject: "Confirm your account!",
      html: `To confirm your email,please click on the <a href="http://localhost:3000/users/verify/${verificationToken}">link</a>`,
      text: `To confirm your email please open the link http://localhost:3000/users/verify/${verificationToken}`,
    });

    res.status(201).json({ message: " Verification email sent" });
  } catch (error) {
    next(error);
  }
}

export default {
  updateAvatar,
  getAvatar,
  verify,
  resendVerify,
};
