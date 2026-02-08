import mongoose, { Schema, Document, Types } from "mongoose";

export interface INote extends Document {
  content: string;
  createdBy: Types.ObjectId;
  task: Types.ObjectId;
}

const NoteSchema: Schema = new Schema(
  {
    content: {
      type: String,
      require: true,
    },
    createdBy: {
      type: Types.ObjectId,
      require: true,
      ref: "User",
    },

    task: {
      type: Types.ObjectId,
      require: true,
      ref: "Task",
    },
  },
  { timestamps: true },
);
const Note = mongoose.model<INote>("Note", NoteSchema);
export default Note;
