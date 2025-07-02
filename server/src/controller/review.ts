import BookModel from "@/models/book";
import ReviewModel from "@/models/review";
import { ReviewBookHandler } from "@/types";
import { sendErrorResponse } from "@/utils/helper";
import { group } from "console";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import {  ObjectId,Types } from "mongoose";

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

interface PopulatedUser {
  _id: ObjectId;
  name: string;
  avatar: { id: string; url: string };
}
export const getPublicReviews: RequestHandler = async (req, res) => {
  const reviews = await ReviewModel.find({ book: req.params.bookId }).populate<{
    user: PopulatedUser;
  }>({ path: "user", select: "name avatar" });

  res.json({
    reviews: reviews.map((r) => {
      return {
        id: r._id,
        content: r.content,
        date: r.createdAt.toISOString().split("T")[0],
        rating: r.rating,
        user: {
          id: r.user._id,
          name: r.user.name,
          avatar: r.user.avatar,
        },
      };
    }),
  });
};