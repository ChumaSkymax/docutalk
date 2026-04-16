import { model, Schema, models } from "mongoose";
import { IBookSegment } from "@/types";

// WHAT THIS SCHEMA DOES

// 👉 This schema stores small pieces of a book (segments)

// Because:

// You don’t save the whole PDF as one big text ❌
// // You split it into chunks (like 500 words each) ✅

const BookSegmentSchema = new Schema<IBookSegment>(
  {
    clerkId: { type: String, required: true }, // User who owns this segment
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    }, //his connects segment → book, “This segment belongs to THIS book”
    content: { type: String, required: true }, // The actual text or chunk of the segment
    segmentIndex: { type: Number, required: true, index: true }, // Order of the segment in the book
    pageNumber: { type: Number, index: true }, // Page number of the segment or Which page this text came from
    wordCount: { type: Number, required: true }, // Number of words in the segment
  },
  { timestamps: true },
);

// Indexes = speed boosters for database queries

BookSegmentSchema.index({ bookId: 1, segmentIndex: 1 }, { unique: true });
BookSegmentSchema.index({ bookId: 1, pageNumber: 1 });

BookSegmentSchema.index({ bookId: 1, content: "text" });

const BookSegment =
  models.BookSegment || model<IBookSegment>("BookSegment", BookSegmentSchema);

export default BookSegment;
