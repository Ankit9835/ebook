import { cartItemsSchema, historyValidationSchema, newAuthorSchema, newBookSchema, newReviewSchema, updateBookSchema } from "@/middlewares/validator";
import { RequestHandler } from "express";
import { z } from "zod";

type AuthorHandlerBody = z.infer<typeof newAuthorSchema>;
type BookHandlerBody = z.infer<typeof newBookSchema>
type UpdateBookHandlerBody = z.infer<typeof updateBookSchema>;
type ReviewHandlerBody = z.infer<typeof newReviewSchema>;
type HistoryHandlerBody = z.infer<typeof historyValidationSchema>;
type CartHandlerBody = z.infer<typeof cartItemsSchema>;

export type RequestAuthorHandler = RequestHandler<{}, {}, AuthorHandlerBody>;
export type RequestBookHandler = RequestHandler<{}, {}, BookHandlerBody>;
export type UpdateBookHandler = RequestHandler<{}, {}, UpdateBookHandlerBody>
export type ReviewBookHandler = RequestHandler<{}, {}, ReviewHandlerBody>;
export type HistoryBookHandler = RequestHandler<{}, {}, HistoryHandlerBody>;
export type CartBookHandler = RequestHandler<{}, {}, CartHandlerBody>;