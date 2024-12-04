import { RequestHandler } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import UserModel from "@/models/user";
import VerificationTokenModel from "@/models/verificationToken";
import mail from "@/utils/mail";

export const generateLink: RequestHandler = async (req,res,next) => {
  try {
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
  
    
    const link = `http://localhost:8989/verify?token=${randomToken}&userId=${userId}`;
  
    await mail.sendVerificationMail({
      link,
      to: user.email
    })
  
    res.json({ message: "Please check you email for link." });
  } catch (error) {
    next(error)
  }
 
}