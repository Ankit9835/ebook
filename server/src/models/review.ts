import { Model, ObjectId, Schema, Types, model } from "mongoose";
import { number } from "zod";

interface ReviewDoc {
    user: Types.ObjectId
    book: Types.ObjectId
    rating: number
    content?: string
}

const reviewSchema = new Schema<ReviewDoc>({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    book:{
        type:Schema.Types.ObjectId,
        ref:'Book',
        required: true
    },
    rating:{
        type: Number,
        required:true
    },
    content:{
        type: String
    }
},{
    timestamps: true,
})

const ReviewModel = model("Review", reviewSchema);
export default ReviewModel as Model<ReviewDoc>;