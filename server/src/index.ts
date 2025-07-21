import 'dotenv/config'
import "@/db/connect";
import express, { ErrorRequestHandler } from 'express'
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from './route/auth'
import { error } from 'console';
import { errorHandler } from './middlewares/error';
import authorRouter from './route/author';
import bookRouter from './route/book';
import reviewRouter from './route/review';
import historyRouter from './route/history';
import cartRouter from './route/cart';
import checkoutRouter from './route/checkout';
import webhookRouter from './route/webhook';
import orderRouter from './route/order';



const app = express()
app.use(cors({ origin: [process.env.APP_URL!], credentials: true }));
app.use("/webhook", webhookRouter);
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser());

app.use('/auth', authRouter)
app.use('/author', authorRouter)
app.use('/book', bookRouter)
app.use('/review', reviewRouter)
app.use('/history', historyRouter)
app.use('/cart', cartRouter)
app.use('/checkout', checkoutRouter)
app.use('/orders', orderRouter)

app.use(errorHandler);
const port = process.env.PORT || 8989;

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port}`);
});