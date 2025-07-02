import {  getBookHistory, updateBookHistory } from "@/controller/history";
import { isAuth, isPurchasedByUserHistory } from "@/middlewares/auth";
import { Router } from "express";

const historyRouter = Router()

historyRouter.post('/', isAuth, isPurchasedByUserHistory, updateBookHistory)
historyRouter.get('/:bookId', isAuth, getBookHistory)

export default historyRouter