import { blob } from "hub:blob";

export default defineEventHandler(async (event) => {
  const { pathname } = getRouterParams(event);

  if (!pathname) {
    throw createError({
      statusCode: 400,
      message: "Missing pathname parameter",
    });
  }

  await blob.del(pathname);

  return sendNoContent(event);
});
