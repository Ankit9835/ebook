import 'dotenv/config'
import "@/db/connect";
import express, { ErrorRequestHandler } from 'express'
import cookieParser from "cookie-parser";
import authRouter from './route/auth'
import { error } from 'console';
import { errorHandler } from './middlewares/error';



const app = express()


app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser());

app.use('/auth', authRouter)

app.use(errorHandler);
const port = process.env.PORT || 8989;

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port}`);
});