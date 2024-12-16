/**
 * Create a new user-type relationship.
 * @param {bigint} userId - The ID of the user.
 * @param {bigint} userTypeId - The ID of the user type.
 * @param {object} prisma - The Prisma client instance.
 * @returns {Promise<object>} The created user-type relationship.
 */
const createUserTypeUser = async (userId, userTypeId, prisma) => {
  try {
    const userTypeUser = await prisma.user_type_user.create({
      data: {
        user_id: userId,
        user_type_id: userTypeId,
        created_at: new Date(),
      },
    });
    return userTypeUser;
  } catch (error) {
    console.error("Error creating user-type relationship:", error);
    throw error;
  }
};

/**
 * Retrieve all user-type relationships.
 * Excludes soft-deleted records.
 * @param {object} prisma - The Prisma client instance.
 * @returns {Promise<Array<object>>} The list of user-type relationships.
 */
const getUserTypeUsers = async (prisma) => {
  try {
    const userTypeUsers = await prisma.user_type_user.findMany({
      where: { deleted_at: null },
    });
    return userTypeUsers;
  } catch (error) {
    console.error("Error retrieving user-type relationships:", error);
    throw error;
  }
};

/**
 * Retrieve a specific user-type relationship by user ID and user type ID.
 * Excludes soft-deleted records.
 * @param {bigint} userId - The ID of the user.
 * @param {bigint} userTypeId - The ID of the user type.
 * @param {object} prisma - The Prisma client instance.
 * @returns {Promise<object|null>} The user-type relationship or null if not found.
 */
const getUserTypeUserByIds = async (userId, userTypeId, prisma) => {
  try {
    const userTypeUser = await prisma.user_type_user.findFirst({
      where: {
        user_id: userId,
        user_type_id: userTypeId,
        deleted_at: null,
      },
    });
    return userTypeUser;
  } catch (error) {
    console.error("Error retrieving user-type relationship by IDs:", error);
    throw error;
  }
};

/**
 * Update a user-type relationship by user ID and user type ID.
 * @param {bigint} userId - The ID of the user.
 * @param {bigint} userTypeId - The ID of the user type.
 * @param {object} prisma - The Prisma client instance.
 * @returns {Promise<object|null>} The updated user-type relationship or null if not found.
 */
const updateUserTypeUser = async (userId, userTypeId, prisma) => {
  try {
    const updatedUserTypeUser = await prisma.user_type_user.update({
      where: {
        user_id_user_type_id: {
          user_id: userId,
          user_type_id: userTypeId,
        },
      },
      data: {
        updated_at: new Date(),
      },
    });
    return updatedUserTypeUser;
  } catch (error) {
    console.error("Error updating user-type relationship:", error);
    throw error;
  }
};

/**
 * Soft delete a user-type relationship by user ID and user type ID.
 * @param {bigint} userId - The ID of the user.
 * @param {bigint} userTypeId - The ID of the user type.
 * @param {object} prisma - The Prisma client instance.
 * @returns {Promise<object|null>} The soft-deleted user-type relationship or null if not found.
 */
const deleteUserTypeUser = async (userId, userTypeId, prisma) => {
  try {
    const deletedUserTypeUser = await prisma.user_type_user.update({
      where: {
        user_id_user_type_id: {
          user_id: userId,
          user_type_id: userTypeId,
        },
      },
      data: {
        deleted_at: new Date(),
      },
    });
    return deletedUserTypeUser;
  } catch (error) {
    console.error("Error deleting user-type relationship:", error);
    throw error;
  }
};

module.exports = {
  createUserTypeUser,
  getUserTypeUsers,
  getUserTypeUserByIds,
  updateUserTypeUser,
  deleteUserTypeUser,
};
