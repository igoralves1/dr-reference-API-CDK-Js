const { Prisma } = require("@prisma/client");

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

module.exports = {
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
};
