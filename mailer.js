import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

// These id's and secrets should come from .env file.
const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function createTransporter() {
  try {
    // const accessToken = await oAuth2Client.getAccessToken();
    const accessToken = 'ya29.a0AXooCgvFvr5Bj-Enxgm7-A_66NS_cczhstdrj2TLRjPeTBNcJQHwE7IPxu3yL66MzBKt4g_jctfLJ7R_aBCvDxCr3pLDOgwo0rhQWA8I9dU6eTSos1VR6tWvn6wOOHYGl0pxz7cC_K634YwCq6IV3eCwiFcnHMkBQInxaCgYKAVMSARESFQHGX2MiDj6Bkx494CN6emdyu2RgvQ0171'

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "areebqqzi@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });
    console.log("Transporter created");
    return transporter;
  } catch (error) {
    console.error("Failed to create transporter:", error);
    throw new Error("Failed to create transporter");
  }
}

export default createTransporter;