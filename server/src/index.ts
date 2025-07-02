import 'dotenv/config'
import "@/db/connect";
import express, { ErrorRequestHandler } from 'express'
import cookieParser from "cookie-parser";
import authRouter from './route/auth'
import { error } from 'console';
import { errorHandler } from './middlewares/error';
import authorRouter from './route/author';
import bookRouter from './route/book';
import reviewRouter from './route/review';
import historyRouter from './route/history';



const app = express()


app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser());

app.use('/auth', authRouter)
app.use('/author', authorRouter)
app.use('/book', bookRouter)
app.use('/review', reviewRouter)
app.use('/history', historyRouter)

app.use(errorHandler);
const port = process.env.PORT || 8989;

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port}`);
});