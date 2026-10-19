import z from "zod";
import {
  ACCEPTED_PDF_TYPES,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
} from "./constants";

export const UploadSchema = z.object({
  pdfFile: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "PDF file must be less than 50MB",
    })
    .refine((file) => ACCEPTED_PDF_TYPES.includes(file.type), {
      message: "File must be a PDF",
    }),
  coverImage: z.instanceof(File).optional(),
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title must be less than 200 characters" }),
  author: z
    .string()
    .min(1, { message: "Author name is required" })
    .max(200, { message: "Author name must be less than 200 characters" }),
  persona: z.string().optional().default(""),
});

export type UploadFormValues = z.infer<typeof UploadSchema>;
