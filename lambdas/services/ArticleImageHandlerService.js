/**
 * @file ArticleImageHandlerService.js
 * @description CRUD operations for the `article_image` table.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Add an image to an article.
 * @param {object} data - Data for the association.
 * @param {bigint} data.image_id - Image ID.
 * @param {bigint} data.article_id - Article ID.
 * @returns {Promise<object>} The created association.
 * @throws {Error} If the creation fails.
 */
const addImageToArticle = async (data) => {
  try {
    const articleImage = await prisma.article_image.create({
      data: {
        image_id: data.image_id,
        article_id: data.article_id,
        created_at: new Date(),
      },
    });
    return articleImage;
  } catch (error) {
    console.error("Error adding image to article:", error);
    throw new Error("Failed to add image to article.");
  }
};

/**
 * Get all images associated with articles.
 * @returns {Promise<Array<object>>} List of associations.
 * @throws {Error} If retrieval fails.
 */
const getArticleImages = async () => {
  try {
    const articleImages = await prisma.article_image.findMany();
    return articleImages;
  } catch (error) {
    console.error("Error retrieving article images:", error);
    throw new Error("Failed to retrieve article images.");
  }
};

/**
 * Get a specific image-article association by IDs.
 * @param {bigint} image_id - Image ID.
 * @param {bigint} article_id - Article ID.
 * @returns {Promise<object|null>} The association or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getArticleImageByIds = async (image_id, article_id) => {
  try {
    const articleImage = await prisma.article_image.findUnique({
      where: {
        image_id_article_id: {
          image_id,
          article_id,
        },
      },
    });
    return articleImage;
  } catch (error) {
    console.error("Error retrieving article image by IDs:", error);
    throw new Error("Failed to retrieve article image.");
  }
};

/**
 * Update an image-article association.
 * @param {bigint} image_id - Image ID.
 * @param {bigint} article_id - Article ID.
 * @param {object} data - Updated data.
 * @returns {Promise<object|null>} The updated association or null if not found.
 * @throws {Error} If update fails.
 */
const updateArticleImage = async (image_id, article_id, data) => {
  try {
    const articleImage = await prisma.article_image.update({
      where: {
        image_id_article_id: {
          image_id,
          article_id,
        },
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return articleImage;
  } catch (error) {
    console.error("Error updating article image:", error);
    throw new Error("Failed to update article image.");
  }
};

/**
 * Remove an image from an article.
 * @param {bigint} image_id - Image ID.
 * @param {bigint} article_id - Article ID.
 * @returns {Promise<object>} The removed association.
 * @throws {Error} If deletion fails.
 */
const removeImageFromArticle = async (image_id, article_id) => {
  try {
    const articleImage = await prisma.article_image.delete({
      where: {
        image_id_article_id: {
          image_id,
          article_id,
        },
      },
    });
    return articleImage;
  } catch (error) {
    console.error("Error removing image from article:", error);
    throw new Error("Failed to remove image from article.");
  }
};

module.exports = {
  addImageToArticle,
  getArticleImages,
  getArticleImageByIds,
  updateArticleImage,
  removeImageFromArticle,
};
