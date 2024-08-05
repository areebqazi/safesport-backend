import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// These credentials should come from .env file.
const GODADDY_EMAIL = process.env.GODADDY_EMAIL;
const GODADDY_PASSWORD = process.env.GODADDY_PASSWORD;

async function createTransporter() {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net', // SMTP server address for GoDaddy
      port: 465, // Port for SSL
      secure: true, // Use SSL
      auth: {
        user: GODADDY_EMAIL,
        pass: GODADDY_PASSWORD,
      },
    });
    return transporter;
  } catch (error) {
    console.error('Failed to create transporter:', error);
    throw new Error('Failed to create transporter');
  }
}

export default createTransporter;
