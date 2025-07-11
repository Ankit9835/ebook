import CartModel from "@/models/cart";
import OrderModel from "@/models/order";
import UserModel from "@/models/user";
import stripe from "@/stripe";
import { StripeCustomer, StripeFailedIntent, StripeSuccessIntent } from "@/stripe/stripe";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";


export const handlePayment: RequestHandler = async(req, res) => {
    console.log('test')
  const sig = req.headers["stripe-signature"];

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
    const succeed = event.type === "payment_intent.succeeded";
    const failed = event.type === "payment_intent.payment_failed";

    if(succeed || failed){
      const stripeSession = event.data.object as unknown as
        | StripeSuccessIntent
        | StripeFailedIntent;
      const customerId = stripeSession.customer;

      const customer = await stripe.customers.retrieve(
        customerId
      ) as unknown as StripeCustomer;
      const { orderId, type, userId } = customer.metadata;

       const order = await OrderModel.findByIdAndUpdate(orderId, {
        stripeCustomerId: customerId,
        paymentId: stripeSession.id,
        totalAmount: stripeSession.amount_received,
        paymentStatus: stripeSession.status,
        paymentErrorMessage: stripeSession.last_payment_error?.message,
      });

      const bookIds =
        order?.orderItems.map((item) => {
          return item.id.toString();
        }) || [];

      if(succeed && order){
        await UserModel.findByIdAndUpdate(userId, {
          $push:{$books: {$each: bookIds}, order: {$each: bookIds}}
        })
        await CartModel.findOneAndUpdate({ userId }, { items: [] });
      }
    }
  } catch (err) {
    console.log('error',err)
    return sendErrorResponse({
      res,
      message: "Could not complete payment!",
      status: 400,
    });
  }

   console.log('event',event);

  res.send();
};