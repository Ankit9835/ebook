import { checkout, instantCheckout } from "@/controller/checkout";
import { isAuth } from "@/middlewares/auth";
import { Router } from "express";

const checkoutRouter = Router()

checkoutRouter.post('/', isAuth, checkout)
checkoutRouter.post("/instant", isAuth, instantCheckout);

export default checkoutRouter