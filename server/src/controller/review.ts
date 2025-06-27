import BookModel from "@/models/book";
import ReviewModel from "@/models/review";
import { ReviewBookHandler } from "@/types";
import { sendErrorResponse } from "@/utils/helper";
import { group } from "console";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { Types } from "mongoose";

export const createReview: ReviewBookHandler = async(req,res) => {
    const { bookId, rating, content } = req.body;

  await ReviewModel.findOneAndUpdate(
    { book: bookId, user: req.user.id },
    { content, rating },
    { upsert: true }
  );

  const [result] = await ReviewModel.aggregate<{averageRating:number}>([
    {
        $match:{
            book:new Types.ObjectId(bookId),
        }
    },
    {
        $group:{
            _id:null,
            averageRating: {$avg: "$rating"}
        }
    }
  ])

  await BookModel.findByIdAndUpdate(bookId,{
    averageRating: result.averageRating
  })

  res.json({
    message: "Review added.",
  });
}

export const getReview: RequestHandler = async(req,res) => {
    const {bookId} = req.params
    if(!isValidObjectId(bookId)){
        return sendErrorResponse({
            message: "Give proper object id", res, status: 404
        })
    }
    const review = await ReviewModel.findOne({book: bookId, user: req.user.id})
    if(!review){
        return sendErrorResponse({ message: "Review not found", res, status: 422 })
    }
     res.json({
        content: review.content,
        rating:review.rating
    })
}