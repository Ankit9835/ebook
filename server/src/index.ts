import 'dotenv/config'
import express from 'express'
import authRouter from './route/auth'


const app = express()

const port = process.env.PORT || 4562
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/auth', authRouter)

app.listen(port, () => {
    console.log(`application running on ${port}`)
})