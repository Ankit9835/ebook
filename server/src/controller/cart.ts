import CartModel from "@/models/cart";
import { CartBookHandler } from "@/types";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import { ObjectId } from "mongoose";

export const updateCart: CartBookHandler = async(req,res) => {
    const {items} = req.body
    let cart = await CartModel.findOne({userId: req.user.id})

    if(!cart){
        cart = await CartModel.create({userId: req.user.id, items})
    } else {
        for(const item of items){
            const oldProduct = cart.items.find(
                ({ product }) => item.product === product.toString()
            );
            if(oldProduct){
                oldProduct.quantity += item.quantity

                if(oldProduct.quantity < 0){
                   cart.items = cart.items.filter(({product}) => item.product !== product.toString())
                }
            } else {
                cart.items.push({
                    product: item.product as any,
                    quantity: item.quantity
                })
            }
        }

        await cart.save()
    }
    res.json({cart: cart._id})
};

export const getCart: RequestHandler = async(req,res) => {
    let cart = await CartModel.findOne({userId:req.user.id}).populate<{
        items: {
            quantity: number,
            product: {
                 _id: ObjectId;
                title: string;
                slug: string;
                cover?: { url: string; id: string };
                price: { mrp: number; sale: number };
            }
        }[]
    }>({
        path: "items.product",
        select: "title slug cover price"
    })

    if(!cart){
        return sendErrorResponse({
            res, 
            message:'Cart not found',
            status:404
        })
    }

    res.json({
        cart: {
            id: cart._id,
            items: cart.items.map((item) => ({
                quantity: item.quantity,
                product: {
                id: item.product._id,
                title: item.product.title,
                slug: item.product.slug,
                cover: item.product.cover?.url,
                price: {
                    mrp: (item.product.price.mrp / 100).toFixed(2),
                    sale: (item.product.price.sale / 100).toFixed(2),
                },
                },
            })),
        }
    })
}

export const clearCart: RequestHandler = async(req,res) => {
    const cart = await CartModel.findOneAndUpdate({userId: req.user.id}, {items: []})
    res.json({})
}