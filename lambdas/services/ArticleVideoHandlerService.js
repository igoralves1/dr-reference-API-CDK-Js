/**
 * @file ArticleVideoHandlerService.js
 * @description CRUD operations for managing the relationship between videos and articles.
 */

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
  addVideoToArticle,
  removeVideoFromArticle,
  getAllVideoArticleRelationships,
  getVideosByArticleId,
};
