import { newAuthorSchema, newBookSchema, newReviewSchema, updateBookSchema } from "@/middlewares/validator";
import { RequestHandler } from "express";
import { z } from "zod";

type AuthorHandlerBody = z.infer<typeof newAuthorSchema>;
type BookHandlerBody = z.infer<typeof newBookSchema>
type UpdateBookHandlerBody = z.infer<typeof updateBookSchema>;
type ReviewHandlerBody = z.infer<typeof newReviewSchema>;

export type RequestAuthorHandler = RequestHandler<{}, {}, AuthorHandlerBody>;
export type RequestBookHandler = RequestHandler<{}, {}, BookHandlerBody>;
export type UpdateBookHandler = RequestHandler<{}, {}, UpdateBookHandlerBody>
export type ReviewBookHandler = RequestHandler<{}, {}, ReviewHandlerBody>;