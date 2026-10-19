import { Request, Response } from "express";
import { handleUpload } from "@vercel/blob/client";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const handleBlobUpload = async (req: Request, res: Response) => {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Missing BLOB_READ_WRITE_TOKEN in backend environment" });
    }

    const userId = (req.headers["x-user-id"] as string) || "user_general";

    // Build incoming URL for the request
    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5000";
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    // Convert Express req into a standard Web Request if necessary
    const webRequest = new globalThis.Request(fullUrl, {
      method: req.method,
      headers: req.headers as any,
      body: JSON.stringify(req.body),
    });

    const jsonResponse = await handleUpload({
      token,
      body: req.body,
      request: webRequest,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_FILE_SIZE,
          tokenPayload: JSON.stringify({ userId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log(`[Upload Complete] URL: ${blob.url}, Payload: ${tokenPayload}`);
      },
    });

    return res.json(jsonResponse);
  } catch (error) {
    console.error("Upload error in backend:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Upload handling failed",
    });
  }
};
