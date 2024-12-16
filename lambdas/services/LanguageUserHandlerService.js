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
  createLanguageUser,
  getLanguageUsers,
  getLanguageUserByIds,
  updateLanguageUser,
  deleteLanguageUser,
};
