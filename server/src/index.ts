import 'dotenv/config'
import "@/db/connect";
import express from 'express'
import authRouter from './route/auth'
import { error } from 'console';


const app = express()


app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/auth', authRouter)

app.use((error,req,res,next) => {
  res.status(500).json({error:error.message})
}) as ErrorRequestHandler)

const port = process.env.PORT || 8989;

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port}`);
});