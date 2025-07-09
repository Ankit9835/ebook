import { isAuth } from "@/middlewares/auth";
import { Router } from "express";

const checkoutRouter = Router()

checkoutRouter.post('/', isAuth, checkout)