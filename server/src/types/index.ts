import { newAuthorSchema, newBookSchema } from "@/middlewares/validator";
import { RequestHandler } from "express";
import { z } from "zod";

type AuthorHandlerBody = z.infer<typeof newAuthorSchema>;
type BookHandlerBody = z.infer<typeof newBookSchema>;

export type RequestAuthorHandler = RequestHandler<{}, {}, AuthorHandlerBody>;
export type RequestBookHandler = RequestHandler<{}, {}, BookHandlerBody>;