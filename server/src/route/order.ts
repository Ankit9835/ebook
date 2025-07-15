import { getOrders, getOrderStatus, getOrderSuccessStatus } from "@/controller/order"
import { isAuth } from "@/middlewares/auth"
import { Router } from "express"

const orderRouter = Router()

orderRouter.get('/', isAuth, getOrders)
orderRouter.get("/check-status/:bookId", isAuth, getOrderStatus);
orderRouter.post("/success", isAuth, getOrderSuccessStatus);

export default orderRouter