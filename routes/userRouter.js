// import createTransporter from "../mailer1.js"
import createTransporter from "../mailer.js";
import path from "path";
import express from "express";
import User from "../models/userModel.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

// Create a new user
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all users
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find({});
    const notAdminUsers = users.filter((user) => !user.isAdmin);
    res.status(200).send(notAdminUsers);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a user by ID
router.patch("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a user by ID
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/send-certificate", async (req, res) => {
  try {
    const { email, certificateBase64 } = req.body;
    // Update user schema with the certificate URL
    const user = await User.findOneAndUpdate(
      { email },
      { certificateDataUrl: certificateBase64 },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create mail options
    const mailOptions = {
      // from: process.env.GODADDY_EMAIL, // Sender address
      from: "hello@safesportforyouth.org",
      to: email,
      subject: "Your Certificate",
      html: `<p>Attached is your certificate.</p>`,
      attachments: [
        {
          filename: "certificate.png",
          content: certificateBase64.split("base64,")[1],
          encoding: "base64",
        },
      ],
    };

    // Create transporter and send email
    const transporter = await createTransporter();
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to send email", error });
      }
      res.status(200).json({ message: "Email sent successfully", info });
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
