import BookModel, { BookDoc } from "@/models/book";
import CartModel from "@/models/cart";
import OrderModel from "@/models/order";
import stripe from "@/stripe";
import { sanitizeUrl, sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import Stripe from "stripe";


type StripeLineItems = Stripe.Checkout.SessionCreateParams.LineItem[];

type options = {
  customer: Stripe.CustomerCreateParams;
  line_items: StripeLineItems;
};

const generateStripeCheckoutSession = async (options: options) => {
  const customer = await stripe.customers.create(options.customer);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    success_url: process.env.PAYMENT_SUCCESS_URL,
    cancel_url: process.env.PAYMENT_CANCEL_URL,
    line_items: options.line_items,
    customer: customer.id,
  });

  return session;
};

export const checkout: RequestHandler = async(req,res) => {
    const {cartId} = req.body
    if(!isValidObjectId(cartId)){
        return sendErrorResponse({res, message: 'Invalid cart id', status:401})
    }
    const cart = await CartModel.findOne({_id:cartId, userId:req.user.id}).populate<{
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

    const order = await OrderModel.create({
      userId: req.user.id,
      orderItems: cart.items.map(({product, quantity}) => {
        const parsedPrice = JSON.parse(product.price);
        console.log(parsedPrice.sale)
        return {
          id: product._id,
          price:parsedPrice.sale,
          qty: quantity,
          totalPrice:parsedPrice.sale * quantity,
        }
      })
    })

    // now if the cart is valid and there are products inside the cart we will send those information to the stripe and generate the payment link.
  const customer = await stripe.customers.create({
    name: req.user.name,
    email: req.user.email,
    metadata: {
      userId: req.user.id,
      orderId: order._id.toString(),
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


export const instantCheckout: RequestHandler = async (req, res) => {
  const { productId } = req.body;
  if (!isValidObjectId(productId)) {
    return sendErrorResponse({
      res,
      message: "Invalid product id!",
      status: 401,
    });
  }

  const product = await BookModel.findById(productId);
  if (!product) {
    return sendErrorResponse({
      res,
      message: "Product not found!",
      status: 404,
    });
  }

  const parsedPrice = typeof product.price === "string"
      ? JSON.parse(product.price)
      : product.price;

  const order = await OrderModel.create({
      userId: req.user.id,
       orderItems: [
      {
        id: product._id,
        price: parsedPrice.sale,
        qty: 1,
        totalPrice: parsedPrice.sale,
      },
    ],
    })

    // now if the cart is valid and there are products inside the cart we will send those information to the stripe and generate the payment link.
  const customer = await stripe.customers.create({
    name: req.user.name,
    email: req.user.email,
    metadata: {
      userId: req.user.id,
      orderId: order._id.toString(),
      type: "instant-checkout",
    },
  });

  

    const images = product.cover
      ? { images: [sanitizeUrl(product.cover.url)] }
      : {};


   const session = await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"],
  success_url: process.env.PAYMENT_SUCCESS_URL,
  cancel_url: process.env.PAYMENT_CANCEL_URL,
  billing_address_collection: "required", // ✅ Required for India
  customer: customer.id,
  line_items: [{
      quantity: 1,
      price_data: {
        currency: "inr", // or "usd" if cross-border
        unit_amount: parsedPrice.sale * 100,
        product_data: {
          name: product.title,
          ...images,
        },
      },
    }],
  
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
  

  
};

