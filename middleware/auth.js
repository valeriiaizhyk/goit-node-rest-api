import jwt, { decode } from "jsonwebtoken";

import User from "../models/user.js";

function authMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (typeof authorizationHeader === "undefined") {
    return res.status(401).send({ message: "Not authorized" });
  }

  const [bearer, token] = authorizationHeader.split(" ", 2);

  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Not authorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
    if (err) {
      return res.status(401).send({ message: "Not authorized" });
    }

    try {
      const user = await User.findById(decode.id);

      if (user === null || user.token !== token) {
        return res.status(401).send({ message: "Not authorized" });
      }

      req.user = {
        id: decode.id,
        email: decode.email,
      };
    } catch (error) {
      next(error);
    }
  });
}

export default authMiddleware;
