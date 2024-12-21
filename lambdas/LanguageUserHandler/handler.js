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
    if (path.startsWith("/language-user")) {
      return await handleLanguageUserRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleLanguageUserRoutes = async (httpMethod, pathParameters, body) => {
  const userId = pathParameters?.userId
    ? BigInt(pathParameters.userId)
    : undefined;
  const languageId = pathParameters?.languageId
    ? BigInt(pathParameters.languageId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (userId && languageId) {
        const languageUser = await getLanguageUserByIds(
          userId,
          languageId,
          prisma
        );
        return languageUser
          ? responses._200(languageUser)
          : responses._404({ error: "Language-user relationship not found" });
      }
      const languageUsers = await getLanguageUsers(prisma);
      return responses._200(languageUsers);

    case "POST":
      const newLanguageUser = await createLanguageUser(
        body.user_id,
        body.language_id,
        prisma
      );
      return responses._200(newLanguageUser);

    case "PUT":
      if (!userId || !languageId) {
        return responses._400({
          error: "User ID and Language ID are required",
        });
      }
      const updatedLanguageUser = await updateLanguageUser(
        userId,
        languageId,
        prisma
      );
      return updatedLanguageUser
        ? responses._200(updatedLanguageUser)
        : responses._404({ error: "Language-user relationship not found" });

    case "DELETE":
      if (!userId || !languageId) {
        return responses._400({
          error: "User ID and Language ID are required",
        });
      }
      const deletedLanguageUser = await deleteLanguageUser(
        userId,
        languageId,
        prisma
      );
      return deletedLanguageUser
        ? responses._204()
        : responses._404({ error: "Language-user relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new language-user relationship.
 * @param {bigint} userId - The ID of the user.
 * @param {bigint} languageId - The ID of the language.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created language-user relationship.
 * @throws {Error} If an error occurs during creation.
 */
const createLanguageUser = async (userId, languageId, prisma) => {
  try {
    const languageUser = await prisma.language_user.create({
      data: {
        user_id: userId,
        language_id: languageId,
        created_at: new Date(),
      },
    });
    return languageUser;
  } catch (error) {
    console.error("Error creating language-user relationship:", error);
    throw error;
  }
};

/**
 * Get all language-user relationships.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of all language-user relationships.
 * @throws {Error} If an error occurs during retrieval.
 */
const getLanguageUsers = async (prisma) => {
  try {
    const languageUsers = await prisma.language_user.findMany({
      where: { deleted_at: null },
    });
    return languageUsers;
  } catch (error) {
    console.error("Error retrieving language-user relationships:", error);
    throw error;
  }
};

/**
 * Get a specific language-user relationship by user ID and language ID.
 * @param {bigint} userId - The ID of the user.
 * @param {bigint} languageId - The ID of the language.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The language-user relationship, or null if not found.
 * @throws {Error} If an error occurs during retrieval.
 */
const getLanguageUserByIds = async (userId, languageId, prisma) => {
  try {
    const languageUser = await prisma.language_user.findFirst({
      where: {
        user_id: userId,
        language_id: languageId,
        deleted_at: null,
      },
    });
    return languageUser;
  } catch (error) {
    console.error("Error retrieving language-user relationship by IDs:", error);
    throw error;
  }
};

/**
 * Update a language-user relationship.
 * @param {bigint} userId - The ID of the user.
 * @param {bigint} languageId - The ID of the language.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The updated language-user relationship.
 * @throws {Error} If an error occurs during the update.
 */
const updateLanguageUser = async (userId, languageId, prisma) => {
  try {
    const updatedLanguageUser = await prisma.language_user.update({
      where: {
        user_id_language_id: {
          user_id: userId,
          language_id: languageId,
          deleted_at: null,
        },
      },
      data: {
        updated_at: new Date(),
      },
    });
    return updatedLanguageUser;
  } catch (error) {
    console.error("Error updating language-user relationship:", error);
    throw error;
  }
};

/**
 * Soft delete a language-user relationship.
 * @param {bigint} userId - The ID of the user.
 * @param {bigint} languageId - The ID of the language.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The soft-deleted language-user relationship.
 * @throws {Error} If an error occurs during deletion.
 */
const deleteLanguageUser = async (userId, languageId, prisma) => {
  try {
    const deletedLanguageUser = await prisma.language_user.update({
      where: {
        user_id_language_id: {
          user_id: userId,
          language_id: languageId,
        },
      },
      data: {
        deleted_at: new Date(),
      },
    });
    return deletedLanguageUser;
  } catch (error) {
    console.error("Error deleting language-user relationship:", error);
    throw error;
  }
};

module.exports = {
  handler,
};
