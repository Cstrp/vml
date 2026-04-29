import { blob } from "hub:blob";

export default defineEventHandler(async (event) => {
  return blob.handleUpload(event, {
    ensure: {
      types: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      maxSize: "16MB",
    },
    put: { addRandomSuffix: true, prefix: "uploads/", access: "private" },
    formKey: "files",
    multiple: true,
  });
});
