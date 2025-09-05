import { supabase } from "./supabaseClient";
import { ImageUploadResult, ImageVariant } from "./types";

interface ProcessOptions {
  productUuid: string;
  variant: ImageVariant;
  index?: number;
}

export async function processAndUploadImage(
  file: File,
  options: ProcessOptions
): Promise<ImageUploadResult> {
  const { productUuid, variant } = options;

  const bitmap = await createImageBitmap(file);
  const origWidth = bitmap.width;
  const origHeight = bitmap.height;
  const origArea = origWidth * origHeight;

  const targetArea =
    variant === "main"
      ? 1_500_000
      : variant === "thumb"
      ? 90_000
      : 800_000;

  const scaleFactor = 
    origArea <= targetArea ? 1 : Math.sqrt(targetArea / origArea);

  const newWidth = Math.round(origWidth * scaleFactor);
  const newHeight = Math.round(origHeight * scaleFactor);

  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob(
      (b) => resolve(b as Blob),
      "image/webp",
      variant === "main" ? 0.8 : 0.75
    )
  );

  const arrayBuffer = await blob.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);

  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const filename = `${variant}.v${timestamp}.webp`;
  const bucketPath = `${productUuid}/${filename}`;

  const { data, error } = await supabase.storage
    .from("products")
    .upload(bucketPath, fileBytes, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  const publicUrl = supabase.storage.from("products").getPublicUrl(bucketPath)
    .data.publicUrl;

  return {
    bucketPath,
    publicUrl,
    width: newWidth,
    height: newHeight,
    pixelArea: newWidth * newHeight,
    filesizeBytes: blob.size,
    variant,
    originalFilename: file.name,
    uploadResult: data,
    error: error?.message,
  };
}
