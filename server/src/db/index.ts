import mongoose from "mongoose";
// Set strictQuery option
mongoose.set('strictQuery', true);
const uri = process.env.MONGO_URI;

if (!uri) throw new Error("Database uri is missing!");

export const dbConnect = () => {
    mongoose
    .connect(uri)
    .then(() => {
      console.log("db connected!");
    })
    .catch((error) => {
      console.log("db connection failed: ", error.message);
    });
}