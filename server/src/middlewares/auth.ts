import UserModel from "@/models/user";
import { HistoryBookHandler, ReviewBookHandler } from "@/types";
import { formatUserProfile, sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";


declare global {
    namespace Express {
      export interface Request {
        user: {
          id: string;
          name?: string;
          email: string;
          role: "user" | "author";
          avatar?: string
          signedUp:boolean
          authorId?: string
          books?: string[]
        };
      }
    }
  }

export const isAuth: RequestHandler = async(req,res,next) => {
    const authToken = req.cookies?.authToken
    console.log('auth', authToken)
    if(!authToken){
       return sendErrorResponse({
            message:"Unauthorized Response",
            status:401,
            res
        })
    }

    const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as {
        userId: string
    }
    console.log('payload',payload)
    const user = await UserModel.findById(payload.userId)
    if(!user){
        return sendErrorResponse({
            message: "Unauthorized request user not found!",
            status: 401,
            res,
          });
    }

    req.user = formatUserProfile(user)
    console.log('req',req.user)
      next();

}

export const isAuthor: RequestHandler = (req,res,next) => {
  if (req.user.role === "author") next();
  else sendErrorResponse({ message: "Invalid request!", res, status: 401 });
}

export const isPurchasedByUser: ReviewBookHandler = async(req,res,next) => {
  const user = await UserModel.findOne({_id:req.user.id, book: req.body.bookId})
  if(!user){
    return sendErrorResponse({ message: "Review not allowed", res, status: 402 })
  }
  next()
}

export const isPurchasedByUserHistory: HistoryBookHandler = async(req,res,next) => {
  const user = await UserModel.findOne({_id:req.user.id, book: req.body.book})
  if(!user){
    return sendErrorResponse({ message: "Book Id not valid", res, status: 402 })
  }
  next()
}