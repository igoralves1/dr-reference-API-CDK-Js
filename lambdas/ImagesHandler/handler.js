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
    if (path.startsWith("/images")) {
      return await handleImagesRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleImagesRoutes = async (httpMethod, pathParameters, body) => {
  const imageId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (imageId) {
        const image = await getImageById(imageId, prisma);
        return image
          ? responses._200(image)
          : responses._404({ error: "Image not found" });
      }
      const images = await getImages(prisma);
      return responses._200(images);

    case "POST":
      if (!body || !body.path) {
        return responses._400({ error: "Path is required to create an image" });
      }
      const newImage = await createImage(body, prisma);
      return responses._200(newImage);

    case "PUT":
      if (!imageId) {
        return responses._400({ error: "Image ID is required for update" });
      }
      const updatedImage = await updateImage(imageId, body, prisma);
      return updatedImage
        ? responses._200(updatedImage)
        : responses._404({ error: "Image not found" });

    case "DELETE":
      if (!imageId) {
        return responses._400({ error: "Image ID is required for deletion" });
      }
      const deletedImage = await deleteImage(imageId, prisma);
      return deletedImage
        ? responses._204()
        : responses._404({ error: "Image not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
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
  handler,
};
