/**
 * @file ImagesHandlerService.js
 * @description CRUD operations for the `images` table.
 */

/**
 * Create a new image.
 * @param {object} data - Image data.
 * @param {string} data.path - Path to the image file.
 * @param {string} [data.caption] - Caption for the image.
 * @param {number} [data.is_active=1] - Whether the image is active.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object>} The created image record.
 * @throws {Error} If the creation fails.
 */
const createImage = async (data, prisma) => {
  try {
    const image = await prisma.images.create({
      data: {
        path: data.path,
        caption: data.caption || null,
        is_active: data.is_active ?? 1,
        created_at: new Date(),
      },
    });
    return image;
  } catch (error) {
    console.error("Error creating image:", error);
    throw new Error("Failed to create image.");
  }
};

/**
 * Get all images.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<object>>} List of images.
 * @throws {Error} If retrieval fails.
 */
const getImages = async (prisma) => {
  try {
    const images = await prisma.images.findMany();
    return images;
  } catch (error) {
    console.error("Error retrieving images:", error);
    throw new Error("Failed to retrieve images.");
  }
};

/**
 * Get an image by its ID.
 * @param {bigint} id - Image ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The image or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getImageById = async (id, prisma) => {
  try {
    const image = await prisma.images.findUnique({
      where: { id },
    });
    return image;
  } catch (error) {
    console.error("Error retrieving image by ID:", error);
    throw new Error("Failed to retrieve image.");
  }
};

/**
 * Update an image by its ID.
 * @param {bigint} id - Image ID.
 * @param {object} data - Updated image data.
 * @param {string} [data.path] - Updated image path.
 * @param {string} [data.caption] - Updated image caption.
 * @param {number} [data.is_active] - Updated active status.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The updated image or null if not found.
 * @throws {Error} If update fails.
 */
const updateImage = async (id, data, prisma) => {
  try {
    const image = await prisma.images.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return image;
  } catch (error) {
    console.error("Error updating image:", error);
    throw new Error("Failed to update image.");
  }
};

/**
 * Delete an image by its ID.
 * @param {bigint} id - Image ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The deleted image or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteImage = async (id, prisma) => {
  try {
    const image = await prisma.images.delete({
      where: { id },
    });
    return image;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image.");
  }
};

module.exports = {
  createImage,
  getImages,
  getImageById,
  updateImage,
  deleteImage,
};
