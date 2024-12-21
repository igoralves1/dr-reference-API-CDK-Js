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
    if (path.startsWith("/articles")) {
      return await handleArticleRoutes(httpMethod, pathParameters?.id, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleArticleRoutes = async (httpMethod, articleId, body) => {
  switch (httpMethod) {
    case "GET":
      if (articleId) {
        const id = BigInt(articleId);
        const article = await getArticleById(id, prisma);
        return article
          ? responses._200(article)
          : responses._400({ error: "Article not found" });
      } else {
        const articles = await prisma.articles.findMany();
        return responses._200(articles);
      }

    case "POST":
      const newArticle = await createArticle(body, prisma);
      return responses._200(newArticle);

    case "PUT":
      if (!articleId)
        return responses._400({ error: "Article ID is required" });
      const idToUpdate = BigInt(articleId);
      const updatedArticle = await updateArticle(idToUpdate, body, prisma);
      return updatedArticle
        ? responses._200(updatedArticle)
        : responses._400({ error: "Article not found" });

    case "DELETE":
      if (!articleId)
        return responses._400({ error: "Article ID is required" });
      const idToDelete = BigInt(articleId);
      const deletedArticle = await deleteArticle(idToDelete, prisma);
      return deletedArticle
        ? responses._204()
        : responses._400({ error: "Article not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * @typedef {Object} ArticleData
 * @property {string} title - The title of the article.
 * @property {string} slug - The slug for the article.
 * @property {string} [path_img_cover] - The cover image path for the article.
 * @property {string} [body] - The body content of the article.
 * @property {number} [is_active] - Whether the article is active (1 for active, 0 for inactive).
 */

/**
 * Create a new article.
 * @param {ArticleData} data - The data for the new article.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created article.
 */
const createArticle = async (data, prisma) => {
  try {
    const article = await prisma.articles.create({ data });
    return article;
  } catch (error) {
    console.error("Error creating article:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("Failed to create article.");
    }
    throw new Error("An unknown error occurred.");
  }
};

/**
 * Get an article by its ID.
 * @param {bigint} id - The ID of the article.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The article with the specified ID.
 */
const getArticleById = async (id, prisma) => {
  try {
    const article = await prisma.articles.findUnique({ where: { id } });
    if (!article) throw new Error(`Article with ID ${id} not found.`);
    return article;
  } catch (error) {
    console.error("Error retrieving article:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("Article not found.");
    }
    throw new Error("Failed to retrieve article.");
  }
};

/**
 * Update an article by its ID.
 * @param {bigint} id - The ID of the article to update.
 * @param {Partial<ArticleData>} data - The updated data for the article.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The updated article.
 */
const updateArticle = async (id, data, prisma) => {
  try {
    const article = await prisma.articles.update({ where: { id }, data });
    return article;
  } catch (error) {
    console.error("Error updating article:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("Article not found.");
    }
    throw new Error("Failed to update article.");
  }
};

/**
 * Delete an article by its ID.
 * @param {bigint} id - The ID of the article to delete.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The deleted article.
 */
const deleteArticle = async (id, prisma) => {
  try {
    const article = await prisma.articles.delete({ where: { id } });
    return article;
  } catch (error) {
    console.error("Error deleting article:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("Article not found.");
    }
    throw new Error("Failed to delete article.");
  }
};

module.exports = { handler };
