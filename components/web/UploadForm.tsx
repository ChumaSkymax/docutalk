"use client"; // This tells Next.js this component runs on the client (browser)

// React core hooks
import React, { useState } from "react";

// Form management library
import { useForm } from "react-hook-form";

// Zod validation integration
import { zodResolver } from "@hookform/resolvers/zod";

// Icons for UI
import { Upload, ImageIcon } from "lucide-react";

// Validation schema
import { UploadSchema } from "@/lib/zod";

// Type definition for form data
import { BookUploadFormValues } from "@/types";

// UI components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Constants (file types, etc.)
import { ACCEPTED_PDF_TYPES, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

// Custom components
import FileUploader from "./FileUploader";
import VoiceSelector from "./VoiceSelector";
import LoadingOverlay from "./LoadingOverlay";

// Authentication (Clerk)
import { useAuth } from "@clerk/nextjs";

// Toast notifications
import { toast } from "sonner";

// Backend actions
import {
  checkBookExists,
  cleanupFailedBook,
  createBook,
  deleteBlobs,
  saveBookSegments,
} from "@/lib/actions/book.actions";

// Navigation
import { useRouter } from "next/navigation";

// PDF parsing function
import { parsePDFFile } from "@/lib/utils";

async function uploadFile(
  filename: string,
  file: File | Blob,
): Promise<{ url: string; pathname: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("filename", filename);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error ?? "Upload failed");
  }
  return res.json();
}

const UploadForm = () => {
  // Track loading state (when submitting form)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user ID
  const { userId } = useAuth();

  // Router for navigation
  const router = useRouter();

  // Initialize form
  const form = useForm<BookUploadFormValues>({
    resolver: zodResolver(UploadSchema), // validate using Zod
    defaultValues: {
      title: "",
      author: "",
      persona: "",
      pdfFile: undefined,
      coverImage: undefined,
    },
  });

  // Handle form submission
  const onSubmit = async (data: BookUploadFormValues) => {
    // Check if user is logged in
    if (!userId) {
      return toast.error("Please login to upload books");
    }

    setIsSubmitting(true); // Start loading

    try {
      // Check if book already exists
      const existsCheck = await checkBookExists(data.title);

      if (existsCheck.error) {
        toast.error(`Database check failed: ${existsCheck.error}`);
        return;
      }

      if (existsCheck.exists && existsCheck.book) {
        toast.info("Book with same title already exists.");
        form.reset(); // clear form
        router.push(`/books/${existsCheck.book.slug}`); // redirect to book
        return;
      }

      // Create file name (slug format)
      const fileTitle = data.title.replace(/\s+/g, "-").toLowerCase();

      // Get PDF file from form
      const pdfFile = data.pdfFile;

      // Parse PDF (extract text + cover)
      let parsedPDF;
      try {
        parsedPDF = await parsePDFFile(pdfFile);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`PDF parsing failed: ${msg}`);
        return;
      }

      // If parsing failed
      if (parsedPDF.content.length === 0) {
        toast.error("Failed to parse PDF: no text content extracted.");
        return;
      }

      // Upload PDF to Vercel Blob storage
      let uploadedPdfBlob;
      try {
        uploadedPdfBlob = await uploadFile(fileTitle, pdfFile);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`PDF upload failed: ${msg}`);
        return;
      }

      let coverUrl: string;
      let coverBlobKey: string;

      // If user uploaded cover image
      if (data.coverImage) {
        const coverFile = data.coverImage;

        // Upload cover image
        try {
          const uploadedCoverBlob = await uploadFile(
            `${fileTitle}_cover.png`,
            coverFile,
          );
          coverUrl = uploadedCoverBlob.url;
          coverBlobKey = uploadedCoverBlob.pathname;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          toast.error(`Cover image upload failed: ${msg}`);
          await deleteBlobs([uploadedPdfBlob.pathname]);
          return;
        }
      } else {
        // If no cover → generate from PDF
        try {
          const response = await fetch(parsedPDF.cover);
          const blob = await response.blob();

          const uploadedCoverBlob = await uploadFile(
            `${fileTitle}_cover.png`,
            blob,
          );
          coverUrl = uploadedCoverBlob.url;
          coverBlobKey = uploadedCoverBlob.pathname;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          toast.error(`Auto-generated cover upload failed: ${msg}`);
          await deleteBlobs([uploadedPdfBlob.pathname]);
          return;
        }
      }

      // Create book in database
      const book = await createBook({
        clerkId: userId,
        title: data.title,
        author: data.author,
        persona: data.persona,
        fileURL: uploadedPdfBlob.url,
        fileBlobKey: uploadedPdfBlob.pathname,
        coverURL: coverUrl,
        coverBlobKey,
        fileSize: pdfFile.size,
      });

      // If creation failed
      if (!book.success) {
        toast.error(`Failed to create book: ${book.error ?? "Unknown error"}`);
        await deleteBlobs([uploadedPdfBlob.pathname, coverBlobKey]);
        return;
      }

      // If book already exists (edge case — duplicate-key race)
      if (book.alreadyExists) {
        toast.info("Book already exists");
        await deleteBlobs([uploadedPdfBlob.pathname, coverBlobKey]);
        form.reset();
        router.push(`/books/${book.data.slug}`);
        return;
      }

      // Save segments (text chunks)
      const segments = await saveBookSegments(
        book.data._id,
        userId,
        parsedPDF.content,
      );

      // If saving segments failed → roll back the book record and blobs
      if (!segments.success) {
        toast.error(
          `Failed to save segments: ${segments.error ?? "Unknown error"}`,
        );
        await cleanupFailedBook(book.data._id, [
          uploadedPdfBlob.pathname,
          coverBlobKey,
        ]);
        return;
      }

      form.reset(); // clear form
      router.push("/"); // go back to homepage
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Upload failed: ${msg}`);
    } finally {
      setIsSubmitting(false); // stop loading
    }
  };


  return (
    <>
      {/* Show loading overlay */}
      {isSubmitting && <LoadingOverlay />}

      <div className="new-book-wrapper">
        <Form {...form}>
          {/* Form submission */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* PDF upload */}
            <FileUploader
              control={form.control}
              name="pdfFile"
              label="Book PDF File"
              acceptTypes={ACCEPTED_PDF_TYPES}
              icon={Upload}
              placeholder="Click to upload PDF"
              hint="PDF file (max 50MB)"
              disabled={isSubmitting}
            />

            {/* Cover upload */}
            <FileUploader
              control={form.control}
              name="coverImage"
              label="Cover Image (Optional)"
              acceptTypes={ACCEPTED_IMAGE_TYPES}
              icon={ImageIcon}
              placeholder="Click to upload cover image"
              hint="Leave empty to auto-generate"
              disabled={isSubmitting}
            />

            {/* Title input */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Author input */}
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Voice selector */}
            <FormField
              control={form.control}
              name="persona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice</FormLabel>
                  <FormControl>
                    <VoiceSelector
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit button */}
            <Button type="submit" disabled={isSubmitting}>
              Begin Synthesis
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default UploadForm;
