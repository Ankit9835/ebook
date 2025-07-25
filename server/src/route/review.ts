import { createReview, getPublicReviews, getReview } from "@/controller/review";
import { isAuth, isPurchasedByUser } from "@/middlewares/auth";
import { newReviewSchema, validate } from "@/middlewares/validator";
import { Router } from "express";

const reviewRouter = Router()

reviewRouter.post('/create', isAuth, validate(newReviewSchema), isPurchasedByUser, createReview)
reviewRouter.get('/:bookId', isAuth, getReview)
reviewRouter.get('/list/:bookId',  getPublicReviews)

export default reviewRouter