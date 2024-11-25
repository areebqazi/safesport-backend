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
      subject: "Your Safe Sport Education for Youth Completion Certificate",
      html: `<img src="https://www.safesportforyouth.org/static/media/safesportlogo.7257988d1679cec6cdbd.png"><br /><br /><p><b>Thank You!</b></p> <br />
        <p>Thank you for completing the Safe Sport Education for Youth program!</p>
        <p>Attached you will find your certificate of completion that can be submitted to your club as proof of completion, if required. You can also log into your account at <a href="https://safesportforyouth.org">safesportforyouth.org</a> to download your certificate.</p>
        <p>Additional Safe Sport resources are available at <a href="https://www.safesportforyouth.org/Resources">this link</a> and the videos will remain online for you to re-watch at any time by logging into your account.</p>
        <p>If you have any questions about the program please visit our Frequently Asked Questions page or contact us at <a href="mailto:hello@safesportforyouth.org">hello@safesportforyouth.org</a>.</p> <br /> <br /> <br />
        
        <p>------------------------------------------------</p> <br /><br /><br />
        
        <img src="https://www.safesportforyouth.org/static/media/safesportlogoFrench.72e91f10a9372110abe0.png"><br /><br /><p><b>Merci!</b></p>
        <p>Merci d'avoir suivi le programme de formation au sport sécuritaire pour les jeunes !</p>
        <p>Vous trouverez ci-joint votre certificat de réussite que vous pourrez présenter à votre club ou à votre organisme provincial de sport comme preuve de réussite, le cas échéant. Vous pouvez également vous connecter à votre compte sur <a href="https://safesportforyouth.org">safesportforyouth.org</a> pour télécharger votre certificat.</p>
        <p>D'autres ressources sur le sport sécuritaire sont disponibles à <a href="https://www.safesportforyouth.org/Resources">cette page</a>. Les vidéos demeurent en ligne et vous pouvez les visionner à tout moment en vous connectant à votre compte.</p>
        <p>Si vous avez des questions sur le programme, visitez notre page de questions fréquemment posées ou contactez-nous à <a href="mailto:hello@safesportforyouth.org">hello@safesportforyouth.org</a>.</p>`,
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
