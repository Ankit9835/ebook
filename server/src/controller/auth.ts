import { RequestHandler } from "express";
import crypto from "crypto";

export const generateLink: RequestHandler = (req,res) => {
    const randomToken = crypto.randomBytes(36).toString("hex");
    console.log(req.body);

    res.json({ ok: true });
}