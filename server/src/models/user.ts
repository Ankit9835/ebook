import { ObjectId, Schema, model } from "mongoose";

export interface UserDoc {
  _id: ObjectId;
  email: string;
  role: "user" | "author";
  name?: string;
  signedUp: boolean;
  avatar?: { url: string; id: string };
  authorId: ObjectId
  book: ObjectId[]
  order: ObjectId[]
}

const userSchema = new Schema<UserDoc>({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "author"],
    default: "user",
  },
  signedUp: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: Object,
    url: String,
    id: String,
  },
  authorId:{
    type: Schema.Types.ObjectId,
    ref:'Author',
  },
  book:[{
    type: Schema.Types.ObjectId,
    ref:'Book',
  }],
  order:[{
    type: Schema.Types.ObjectId,
    ref:'Order',
  }]
});

const UserModel = model("User", userSchema);

export default UserModel;