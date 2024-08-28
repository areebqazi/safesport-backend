import express from "express";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import errorHandler from "../utils/error.js";
import jwt from "jsonwebtoken";
// import createTransporter from "../mailer1.js";
import createTransporter from "../mailer.js";


const router = express.Router();

router.post("/signup", async (req, res, next) => {
  const { firstName,lastName, email, password, birthdate, sport } = req.body;
  if (!password)
    return next({
      statusCode: 400,
      message: "Password must be at least 6 characters long",
    });
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    birthdate,
    sport,
  });
  try {
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
});

router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(401, "Invalid email or password"));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword)
      return next(errorHandler(401, "Invalid email or password"));
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: userPassword, ...userWithoutPassword } = validUser._doc;

    // Include the token in the user object in the response
    res.status(200).json({
      user: {
        ...userWithoutPassword,
        token: token, // Include the token here
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/signin", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const adminUser = await User.findOne({ email });
    if (!adminUser) return next(errorHandler(401, "Invalid email or password"));

    // Check if the user is an admin (assuming there's an isAdmin field in your User schema)
    if (!adminUser.isAdmin)
      return next(errorHandler(403, "Unauthorized access"));

    const validPassword = bcryptjs.compareSync(password, adminUser.password);
    if (!validPassword)
      return next(errorHandler(401, "Invalid email or password"));

    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);
    const { password: userPassword, ...userWithoutPassword } = adminUser._doc;

    // Include the token in the user object in the response
    res.status(200).json({
      user: {
        ...userWithoutPassword,
        token: token, // Include the token here
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/signout", async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("Signout successfully...");
  } catch (error) {}
});

router.post("/sendOTP", async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpirationTime = new Date(Date.now() + 600000); // 10 minutes
    await user.save();

    const mailOptions = {
      from: "hello@safesportforyouth.org", // Sender address
      to: email,
      subject: "OTP for password reset",
      text: `Your OTP for password reset is ${otp}`,
    };

    const transporter = await createTransporter();
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to send email", error });
      }
      res.status(200).json({ message: "Email sent successfully", info });
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/reset-password", async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.otpExpirationTime < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    user.password = bcryptjs.hashSync(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
