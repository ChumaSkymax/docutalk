import { z } from "zod";

const MAX_PDF_SIZE = 50 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];

export const UploadSchema = z.object({
  pdfFile: z
    .instanceof(File, { message: "Please upload a PDF file" })
    .refine((file) => file.size > 0, "PDF file is required")
    .refine((file) => file.size <= MAX_PDF_SIZE, "PDF must be 50MB or smaller")
    .refine(
      (file) => file.type === "application/pdf",
      "File must be a PDF",
    ),
  coverImage: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_IMAGE_SIZE,
      "Cover image must be 5MB or smaller",
    )
    .refine(
      (file) => ACCEPTED_IMAGE_MIME.includes(file.type),
      "Cover image must be JPEG, PNG, or WEBP",
    )
    .optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  author: z
    .string()
    .min(1, "Author name is required")
    .max(200, "Author name is too long"),
  persona: z.string().min(1, "Please choose an assistant voice"),
});
