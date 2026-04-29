export default defineEventHandler(async (event) => {
  const { query = "nature", minDuration, perPage, page } = getQuery(event);

  return pexels.searchVideos(String(query), {
    minDuration: minDuration ? Number(minDuration) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
    page: page ? Number(page) : undefined,
  });
});
