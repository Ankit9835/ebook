import { RequestHandler } from "express";
import formidable, { File } from "formidable";

declare global {
    namespace Express {
      export interface Request {
        // files: {[key: string]: File | File[]}
        files: Record<string, File | File[]>;
      }
    }
  }
  

 export const fileParser: RequestHandler = async (req, res, next) => {
  const form = formidable({ keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ error: 'Invalid form data' });
    }

    req.body = {};
    req.files = {};

    // Handle fields (like `name`)
    for (const key in fields) {
      const value = fields[key];
      req.body[key] = Array.isArray(value) ? value[0] : value;
    }

    // Handle files
    for (const key in files) {
      const value = files[key];
      req.files[key] = Array.isArray(value) ? value : value[0];
    }

    next();
  });
};