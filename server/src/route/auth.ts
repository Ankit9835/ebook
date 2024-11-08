import { generateLink } from '@/controller/auth'
import {Router} from 'express'


const authRouter = Router()

authRouter.post('/generate-link', (req,res,next) => {
    const {email} = req.body
    const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$");
    if(!regex.test(email)){
        return res.json({ error: "Invalid email!"})
    }

    next()
    
}, generateLink)

export default authRouter