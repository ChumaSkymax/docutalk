"use server";

import { del } from "@vercel/blob";
import { CreateBook, TextSegment } from "@/types";
import { connectToDatabase } from "@/database/mongoose";
import Book from "@/database/models/book.model";
import { generateSlug, serializeData } from "../utils";
import BookSegment from "@/database/models/bookSegment.model";

export const getAllBooks = async () => {
  try {
    await connectToDatabase();
    const books = await Book.find().sort({ createdAt: -1 }).lean();
    return {
      success: true,
      books: serializeData(books),
    };
  } catch (error) {
    console.error("Error getting all books", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const checkBookExists = async (title: string) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        exists: true,
        book: serializeData(existingBook),
      };
    }

    return {
      exists: false,
    };
  } catch (e) {
    console.error("Error checking book exists", e);
    return {
      exists: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};

export const createBook = async (data: CreateBook) => {
  try {
    await connectToDatabase();
    const slug = generateSlug(data.title);

    const existingBook = await Book.findOne({ slug }).lean();
    if (existingBook) {
      return {
        success: true,
        alreadyExists: true,
        data: serializeData(existingBook),
      };
    }

    const newBook = await Book.create({ ...data, slug });

    return {
      success: true,
      alreadyExists: false,
      data: serializeData(newBook.toObject()),
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      const slug = generateSlug(data.title);
      const existing = await Book.findOne({ slug }).lean();
      if (existing) {
        return {
          success: true,
          alreadyExists: true,
          data: serializeData(existing),
        };
      }
    }

    console.error("Error creating book", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const deleteBlobs = async (blobKeys: string[]) => {
  const keys = blobKeys.filter((k): k is string => Boolean(k));
  try {
    await Promise.all(
      keys.map((key) =>
        del(key, { token: process.env.DOCUTALK_READ_WRITE_TOKEN }),
      ),
    );
    return { success: true };
  } catch (e) {
    console.error("Error deleting blobs", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};

export const cleanupFailedBook = async (
  bookId: string,
  blobKeys: string[],
) => {
  try {
    await connectToDatabase();
    await BookSegment.deleteMany({ bookId });
    await Book.findByIdAndDelete(bookId);
  } catch (e) {
    console.error("Error deleting failed book record", e);
  }
  return deleteBlobs(blobKeys);
};

export const saveBookSegments = async (
  bookId: string,
  clerkId: string,
  segments: TextSegment[],
) => {
  try {
    await connectToDatabase();

    console.log("Saving book segments...");

    const segmentsToInsert = segments.map(
      ({ text, segmentIndex, pageNumber, wordCount }) => ({
        clerkId,
        bookId,
        content: text,
        segmentIndex,
        pageNumber,
        wordCount,
      }),
    );

    await BookSegment.insertMany(segmentsToInsert);

    await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

    console.log("Book segments saved successfully.");

    return {
      success: true,
      data: { segmentsCreated: segments.length },
    };
  } catch (e) {
    console.error("Error saving book segments", e);

    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};
