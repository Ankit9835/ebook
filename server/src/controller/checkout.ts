import { BookDoc } from "@/models/book";
import CartModel from "@/models/cart";
import stripe from "@/stripe";
import { sanitizeUrl, sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";




export const checkout: RequestHandler = async(req,res) => {
    const {cartId} = req.body
    if(!isValidObjectId(cartId)){
        return sendErrorResponse({res, message: 'Invalid cart id', status:401})
    }
    const cart = await CartModel.findById(cartId).populate<{
        items: {
            product: BookDoc,
            quantity: number
        }[]
    }>({
        path:"items.product"
    })

    if(!cart){
        return sendErrorResponse({
            res,
            message: 'cart not found',
            status:401
        })
    }

    // now if the cart is valid and there are products inside the cart we will send those information to the stripe and generate the payment link.
  const customer = await stripe.customers.create({
    name: req.user.name,
    email: req.user.email,
    metadata: {
      userId: req.user.id,
      cartId,
      type: "checkout",
    },
  });

   const session = await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"],
  success_url: process.env.PAYMENT_SUCCESS_URL,
  cancel_url: process.env.PAYMENT_CANCEL_URL,
  billing_address_collection: "required", // ✅ Required for India
  customer: customer.id,
  line_items: cart.items.map(({ product, quantity }) => {
    const parsedPrice = typeof product.price === "string"
      ? JSON.parse(product.price)
      : product.price;

    const images = product.cover
      ? { images: [sanitizeUrl(product.cover.url)] }
      : {};

    return {
      quantity,
      price_data: {
        currency: "inr", // or "usd" if cross-border
        unit_amount: parsedPrice.sale * 100,
        product_data: {
          name: product.title,
          ...images,
        },
      },
    };
  }),
});


   if (session.url) {
    res.json({ checkoutUrl: session.url });
  } else {
    sendErrorResponse({
      res,
      message: "Something went wrong, could not handle payment!",
      status: 500,
    });
  }

}