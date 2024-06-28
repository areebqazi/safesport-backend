import express from 'express';
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import errorHandler from "../utils/error.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!password)
    return next({
      statusCode: 400,
      message: "Password must be at least 6 characters long",
    });
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
});

router.post('/signin', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(401, "Invalid email or password"));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword)
      return next(errorHandler(401, "Invalid email or password"));
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: userPassword, ...user } = validUser._doc;
    res
      .cookie("access_token", token, { httpOnly: true })
      .json(user)
      .status(200);
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: userPassword, ...userData } = user._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .json(userData)
        .status(200);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.displayName.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photoURL,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: userPassword, ...userData } = newUser._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .json(userData)
        .status(200);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/signout', async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("Signout successfully...");
  } catch (error) {}
});


export default router;
