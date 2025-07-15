import { createBook, getAllPurchasedBooks, getBooksByGenre, getBooksPublicDetails, getCommonBookAccessUrl, getRecommendedBooks, updateBook } from "@/controller/book";
import { isAuth, isAuthor } from "@/middlewares/auth";
import { fileParser } from "@/middlewares/file";
import { newBookSchema, validate } from "@/middlewares/validator";
import { Router } from "express";

const bookRouter = Router()

bookRouter.post('/create', isAuth, isAuthor, fileParser,  createBook)
bookRouter.patch('/', isAuth, isAuthor, fileParser,  updateBook)
bookRouter.get('/list', isAuth, getAllPurchasedBooks)
bookRouter.get('/:slug', isAuth, getBooksPublicDetails)
bookRouter.get('/by-genre/:genre', getBooksByGenre)
bookRouter.get('/read/:slug', isAuth, getCommonBookAccessUrl)
bookRouter.get("/recommended/:bookId", getRecommendedBooks);

export default bookRouter
