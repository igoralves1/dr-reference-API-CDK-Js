const {
  createPrismaClient,
} = require("../../layers/api_prisma_layer/nodejs/api_prisma_layer");
const logger = require("../../utils/logger");
const responses = require("../../utils/api_responses");

const prisma = createPrismaClient();
BigInt.prototype.toJSON = function () {
  return Number(this);
};

const handler = async (event, context) => {
  logger.log("Event triggered: ", event);

  const { path, httpMethod, pathParameters, body: requestBody } = event;
  const body = requestBody ? JSON.parse(requestBody) : {};

  try {
    if (path.startsWith("/article-video")) {
      return await handleArticleVideoRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleArticleVideoRoutes = async (httpMethod, pathParameters, body) => {
  const videoId = pathParameters?.videoId
    ? BigInt(pathParameters.videoId)
    : undefined;
  const articleId = pathParameters?.articleId
    ? BigInt(pathParameters.articleId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (articleId) {
        const videosForArticle = await getVideosByArticleId(articleId, prisma);
        return responses._200(videosForArticle);
      }
      const allVideoArticles = await getAllVideoArticleRelationships(prisma);
      return responses._200(allVideoArticles);

    case "POST":
      if (!body || !body.video_id || !body.article_id) {
        return responses._400({
          error: "Video ID and Article ID are required",
        });
      }
      const newArticleVideo = await addVideoToArticle(body, prisma);
      return responses._200(newArticleVideo);

    case "DELETE":
      if (!videoId || !articleId) {
        return responses._400({
          error: "Video ID and Article ID are required",
        });
      }
      const removedArticleVideo = await removeVideoFromArticle(
        videoId,
        articleId,
        prisma
      );
      return removedArticleVideo
        ? responses._204()
        : responses._404({ error: "Video-article relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Add a video to an article.
 * @param {object} data - Data for the video-article relationship.
 * @param {bigint} data.video_id - Video ID.
 * @param {bigint} data.article_id - Article ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object>} The created relationship record.
 * @throws {Error} If creation fails.
 */
const addVideoToArticle = async (data, prisma) => {
  try {
    const articleVideo = await prisma.article_video.create({
      data: {
        video_id: data.video_id,
        article_id: data.article_id,
        created_at: new Date(),
      },
    });
    return articleVideo;
  } catch (error) {
    console.error("Error adding video to article:", error);
    throw new Error("Failed to add video to article.");
  }
};

/**
 * Remove a video from an article.
 * @param {bigint} video_id - Video ID.
 * @param {bigint} article_id - Article ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The removed relationship record or null if not found.
 * @throws {Error} If deletion fails.
 */
const removeVideoFromArticle = async (video_id, article_id, prisma) => {
  try {
    const articleVideo = await prisma.article_video.delete({
      where: {
        video_id_article_id: {
          video_id,
          article_id,
        },
      },
    });
    return articleVideo;
  } catch (error) {
    console.error("Error removing video from article:", error);
    throw new Error("Failed to remove video from article.");
  }
};

/**
 * Get all video-article relationships.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<object>>} List of video-article relationships.
 * @throws {Error} If retrieval fails.
 */
const getAllVideoArticleRelationships = async (prisma) => {
  try {
    const videoArticles = await prisma.article_video.findMany();
    return videoArticles;
  } catch (error) {
    console.error("Error retrieving video-article relationships:", error);
    throw new Error("Failed to retrieve video-article relationships.");
  }
};

/**
 * Get videos linked to a specific article.
 * @param {bigint} article_id - Article ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<object>>} List of videos linked to the article.
 * @throws {Error} If retrieval fails.
 */
const getVideosByArticleId = async (article_id, prisma) => {
  try {
    const videoArticles = await prisma.article_video.findMany({
      where: { article_id },
    });
    return videoArticles;
  } catch (error) {
    console.error("Error retrieving videos for article:", error);
    throw new Error("Failed to retrieve videos for the article.");
  }
};

module.exports = {
  handler,
};
