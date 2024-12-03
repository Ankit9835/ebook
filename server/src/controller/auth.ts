import { RequestHandler } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import UserModel from "@/models/user";
import VerificationTokenModel from "@/models/verificationToken";

export const generateLink: RequestHandler = async (req,res) => {
  const { email } = req.body;
  let user = await UserModel.findOne({ email });

  if (!user) {
    // if no user found then create new user.
    user = await UserModel.create({ email });
  }

  const userId = user._id.toString()

  await VerificationTokenModel.findOneAndDelete({userId})

  const randomToken = crypto.randomBytes(36).toString("hex");

  await VerificationTokenModel.create<{ userId: string }>({
    userId,
    token: randomToken,
  });

  // Looking to send emails in production? Check out our Email API/SMTP product!
  let transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "b765959d392f16",
      pass: "ba190da69eebad"
    }
  });

  const link = `http://localhost:8989/verify?token=${randomToken}&userId=${userId}`;

  await transport.sendMail({
    to: user.email,
    from: "verification@myapp.com",
    subject: "Auth Verification",
    html: `
      <div>
        <p>Please click on <a href="${link}">this link</a> to verify you account.</p>
      </div> 
    `,
  });

  res.json({ message: "Please check you email for link." });
}