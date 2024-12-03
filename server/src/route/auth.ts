import { generateLink } from '@/controller/auth'
import { emailValidationSchema, validate } from '@/middlewares/validator';
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

export default authRouter