import { generateLink, sendProfileInfo, updateProfile, verifyAuthToken } from '@/controller/auth'
import { isAuth } from '@/middlewares/auth';
import { fileParser } from '@/middlewares/file';
import { emailValidationSchema, newUserSchema, validate } from '@/middlewares/validator';
import {Router} from 'express'
import { z } from "zod";


const authRouter = Router()

// const schema = z.object({
//     email: z
//       .string({
//         required_error: "Email is missing!",
//       })
//       .email("Zod says it is invalid!"),
//   });
  

authRouter.post(
  "/generate-link",
  validate(emailValidationSchema),
  generateLink
);
authRouter.post('/test', fileParser, (req,res) => {
  console.log(req.files)
  console.log(req.body)
})
authRouter.get('/verify', verifyAuthToken)
//authRouter.get('/profile', isAuth, sendProfileInfo)
authRouter.put(
  "/profile",
  isAuth,
  fileParser,
  //validate(newUserSchema),
  updateProfile
);

export default authRouter