import { createBook } from "@/controller/book";
import { isAuth, isAuthor } from "@/middlewares/auth";
import { fileParser } from "@/middlewares/file";
import { newBookSchema, validate } from "@/middlewares/validator";
import { Router } from "express";

const bookRouter = Router()

bookRouter.post('/create', isAuth, isAuthor, fileParser,  createBook)

export default bookRouter
