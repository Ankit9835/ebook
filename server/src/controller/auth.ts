import { RequestHandler } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import UserModel from "@/models/user";
import VerificationTokenModel from "@/models/verificationToken";
import mail from "@/utils/mail";
import { formatUserProfile, sendErrorResponse } from "@/utils/helper";
import jwt from "jsonwebtoken"
import s3Client from "@/cloud/aws";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import * as fs from 'fs'; // ✅ Recommended for your current setup
import { uploadAvatarToAws } from "@/utils/fileUpload";
import slugify from "slugify";



export const generateLink: RequestHandler = async (req,res,next) => {
  try {
    const { email } = req.body;
    console.log('email',email)
    let user = await UserModel.findOne({ email });
  
    if (!user) {
      // if no user found then create new user.
      user = await UserModel.create({ email });
    }
  
    const userId = user._id.toString()
    console.log('id',userId)
  
    await VerificationTokenModel.findOneAndDelete({userId})
  
    const randomToken = crypto.randomBytes(36).toString("hex");
  console.log('ttttttt',randomToken)
    await VerificationTokenModel.create<{ userId: string }>({
      userId,
      token: randomToken,
    });
  
    
    const link = `http://localhost:8989/auth/verify?token=${randomToken}&userId=${userId}`;
  
    await mail.sendVerificationMail({
      link,
      to: user.email
    })
  
    res.json({ message: "Please check you email for link." });
  } catch (error) {
    next(error)
  }
}

export const verifyAuthToken: RequestHandler = async (req,res) => {
  const {token, userId} = req.query
  console.log('token',token)

  if(typeof token !== "string" || typeof userId !== "string"){
    return sendErrorResponse({
      res,
      status:201,
      message:"Invalid request"
    })
  }

    const verificationToken = await VerificationTokenModel.findOne({userId})
    if(!verificationToken || !verificationToken.compare(token)){
      return sendErrorResponse({
        res,
        status:201,
        message:"Invalid request, token mismatch"
      })
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return sendErrorResponse({
        status: 500,
        message: "Something went wrong, user not found!",
        res,
      });
    }
  
    await VerificationTokenModel.findByIdAndDelete(verificationToken._id)

  const payload = { userId: user._id };

  const authToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });

  

  console.log('verify token', authToken)
  res.cookie("authToken", authToken, {
    httpOnly:true,
    secure:process.env.NODE_ENV !== "development",
    sameSite: "strict",
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  })

  // res.redirect(
  //   `${process.env.AUTH_SUCCESS_URL}?profile=${JSON.stringify(
  //     formatUserProfile(user)
  //   )}`
  // );

  res.send()

  
}

export const sendProfileInfo: RequestHandler = (req, res) => {
  res.json({
    profile: req.user,
  });
};

export const updateProfile: RequestHandler = async (req, res) => {
  console.log('id',req.body.name)
  const user = await UserModel.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      signedUp: true,
    },
    {
      new: true,
    }
  );

  if (!user)
    return sendErrorResponse({
      res,
      message: "Something went wrong user not found!",
      status: 500,
    });

    

  // if there is any file upload them to cloud and update the database
  const file = req?.files?.avatar
  c
  const uniqueFileName = user._id + '-' + user.name + '.png'
  
 if (Array.isArray(file) && file.length > 0) {


  
  const uniqueFileName = `${user._id}-${slugify(req.body.name, {
      lower: true,
      replacement: "-",
    })}.png`;
  // ✅ Save to DB
  user.avatar = await uploadAvatarToAws(file,uniqueFileName,user.avatar?.id)

  await user.save();
}


  res.json({ profile: formatUserProfile(user) });
};