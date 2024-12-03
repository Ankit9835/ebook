import 'dotenv/config'
import "@/db/connect";
import express from 'express'
import authRouter from './route/auth'


const app = express()


app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/auth', authRouter)

const port = process.env.PORT || 8989;

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port}`);
});