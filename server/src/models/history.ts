import { Model, ObjectId, Schema, model } from "mongoose";

export interface LocationHighlights {
  lastLocation: string;
  highlights: { selection: string; fill: string }[];
}

interface HistoryDoc extends LocationHighlights{
    book: ObjectId;
    reader: ObjectId;
}

const historySchema = new Schema<HistoryDoc>({
     book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    reader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastLocation: String,
    highlights: [{ selection: String, fill: String }],
})

const HistoryModel = model("History", historySchema);

export default HistoryModel as Model<HistoryDoc>;