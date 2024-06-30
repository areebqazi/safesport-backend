import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    if (!user.isAdmin) {
      return res.status(403).send({ error: "User is not an admin." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send({ error: "Failed to authenticate token." });
  }
};

export default verifyToken;
