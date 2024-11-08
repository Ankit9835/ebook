import { RequestHandler } from "express";

export const generateLink: RequestHandler = (req,res) => {
    console.log(req.body)
}