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
    if (path.startsWith("/article-audio")) {
      return await handleArticleAudioRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};

const handleArticleAudioRoutes = async (httpMethod, pathParameters, body) => {
  const audioId = pathParameters?.audioId
    ? BigInt(pathParameters.audioId)
    : undefined;
  const articleId = pathParameters?.articleId
    ? BigInt(pathParameters.articleId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (audioId && articleId) {
        const articleAudio = await getAudioForArticle(
          audioId,
          articleId,
          prisma
        );
        return articleAudio
          ? responses._200(articleAudio)
          : responses._404({ error: "Article-Audio relationship not found" });
      }
      const articleAudios = await getAllArticleAudios(prisma);
      return responses._200(articleAudios);

    case "POST":
      const newArticleAudio = await addAudioToArticle(body, prisma);
      return responses._200(newArticleAudio);

    case "PUT":
      if (!audioId || !articleId) {
        return responses._400({
          error: "Audio ID and Article ID are required",
        });
      }
      const updatedArticleAudio = await updateAudioForArticle(
        audioId,
        articleId,
        body,
        prisma
      );
      return updatedArticleAudio
        ? responses._200(updatedArticleAudio)
        : responses._404({ error: "Article-Audio relationship not found" });

    case "DELETE":
      if (!audioId || !articleId) {
        return responses._400({
          error: "Audio ID and Article ID are required",
        });
      }
      const deletedArticleAudio = await removeAudioFromArticle(
        audioId,
        articleId,
        prisma
      );
      return deletedArticleAudio
        ? responses._204()
        : responses._404({ error: "Article-Audio relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Add an Audio to an Article.
 * @param {Object} data - The data to add an audio to an article.
 * @param {bigint} data.audio_id - The ID of the audio.
 * @param {bigint} data.article_id - The ID of the article.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created article-audio relationship.
 */
const addAudioToArticle = async (data, prisma) => {
  try {
    const articleAudio = await prisma.article_audio.create({
      data: {
        audio_id: data.audio_id,
        article_id: data.article_id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return articleAudio;
  } catch (error) {
    console.error("Error adding audio to article:", error);
    throw new Error("Failed to add audio to article.");
  }
};

/**
 * Get all Audios associated with Articles.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of article-audio relationships.
 */
const getAllArticleAudios = async (prisma) => {
  try {
    const articleAudios = await prisma.article_audio.findMany({
      include: {
        articles: true,
        audios: true,
      },
    });
    return articleAudios;
  } catch (error) {
    console.error("Error retrieving all article-audio relationships:", error);
    throw new Error("Failed to retrieve article-audio relationships.");
  }
};

/**
 * Get a specific Audio associated with an Article.
 * @param {bigint} audio_id - The ID of the audio.
 * @param {bigint} article_id - The ID of the article.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The article-audio relationship, or null if not found.
 */
const getAudioForArticle = async (audio_id, article_id, prisma) => {
  try {
    const articleAudio = await prisma.article_audio.findUnique({
      where: {
        audio_id_article_id: {
          audio_id,
          article_id,
        },
      },
      include: {
        articles: true,
        audios: true,
      },
    });
    return articleAudio;
  } catch (error) {
    console.error("Error retrieving audio for article:", error);
    throw new Error("Failed to retrieve audio for article.");
  }
};

/**
 * Update an Audio associated with an Article.
 * @param {bigint} audio_id - The ID of the audio.
 * @param {bigint} article_id - The ID of the article.
 * @param {Object} data - The updated data.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The updated article-audio relationship.
 */
const updateAudioForArticle = async (audio_id, article_id, data, prisma) => {
  try {
    const updatedArticleAudio = await prisma.article_audio.update({
      where: {
        audio_id_article_id: {
          audio_id,
          article_id,
        },
      },
      data: {
        updated_at: new Date(),
        ...data,
      },
    });
    return updatedArticleAudio;
  } catch (error) {
    console.error("Error updating audio for article:", error);
    throw new Error("Failed to update audio for article.");
  }
};

/**
 * Remove an Audio from an Article.
 * @param {bigint} audio_id - The ID of the audio.
 * @param {bigint} article_id - The ID of the article.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The deleted article-audio relationship.
 */
const removeAudioFromArticle = async (audio_id, article_id, prisma) => {
  try {
    const articleAudio = await prisma.article_audio.delete({
      where: {
        audio_id_article_id: {
          audio_id,
          article_id,
        },
      },
    });
    return articleAudio;
  } catch (error) {
    console.error("Error removing audio from article:", error);
    throw new Error("Failed to remove audio from article.");
  }
};

module.exports = {
  handler,
};
