/**
 * Create a new user type.
 * @param {Object} data - The data for the new user type.
 * @param {bigint} data.language_id - The ID of the associated language.
 * @param {string} data.type - The type of user.
 * @param {string} [data.note] - Additional note about the user type.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created user type record.
 */
const createUserType = async (data, prisma) => {
  try {
    const userType = await prisma.user_types.create({
      data: {
        language_id: data.language_id,
        type: data.type,
        note: data.note || null,
        created_at: new Date(),
      },
    });
    return userType;
  } catch (error) {
    console.error("Error creating user type:", error);
    throw new Error("Failed to create user type.");
  }
};

/**
 * Get all user types.
 * Excludes soft-deleted records.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of user type records.
 */
const getUserTypes = async (prisma) => {
  try {
    const userTypes = await prisma.user_types.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        languages: true,
      },
    });
    return userTypes;
  } catch (error) {
    console.error("Error retrieving user types:", error);
    throw new Error("Failed to retrieve user types.");
  }
};

/**
 * Get a specific user type by ID.
 * Excludes soft-deleted records.
 * @param {bigint} id - The ID of the user type.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The user type record, or null if not found or soft-deleted.
 */
const getUserTypeById = async (id, prisma) => {
  try {
    const userType = await prisma.user_types.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        languages: true,
      },
    });
    return userType;
  } catch (error) {
    console.error("Error retrieving user type by ID:", error);
    throw new Error("Failed to retrieve user type by ID.");
  }
};

/**
 * Update a user type by its ID.
 * Only updates if the user type is not soft-deleted.
 * @param {bigint} id - The ID of the user type to update.
 * @param {Object} data - The updated data for the user type.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The updated user type record, or null if not found or soft-deleted.
 */
const updateUserType = async (id, data, prisma) => {
  try {
    const updatedUserType = await prisma.user_types.updateMany({
      where: {
        id,
        deleted_at: null,
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });

    if (updatedUserType.count === 0) {
      return null;
    }

    return await getUserTypeById(id, prisma);
  } catch (error) {
    console.error("Error updating user type:", error);
    throw new Error("Failed to update user type.");
  }
};

/**
 * Soft delete a user type by its ID.
 * @param {bigint} id - The ID of the user type to delete.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The soft-deleted user type record, or null if not found or already soft-deleted.
 */
const deleteUserType = async (id, prisma) => {
  try {
    const deletedUserType = await prisma.user_types.updateMany({
      where: {
        id,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });
    return deletedUserType;
  } catch (error) {
    console.error("Error deleting user type:", error);
    throw new Error("Failed to delete user type.");
  }
};

module.exports = {
  createUserType,
  getUserTypes,
  getUserTypeById,
  updateUserType,
  deleteUserType,
};
