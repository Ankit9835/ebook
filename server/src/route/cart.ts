
import { clearCart, getCart, updateCart } from "@/controller/cart";
import { isAuth } from "@/middlewares/auth";
import { Router } from "express";

const cartRouter = Router();

cartRouter.post("/", isAuth, updateCart);
cartRouter.get("/", isAuth, getCart);
cartRouter.post("/clear", isAuth, clearCart);

export default cartRouter;

