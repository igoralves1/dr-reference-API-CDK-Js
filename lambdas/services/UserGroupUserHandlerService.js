/**
 * @file UserGroupUserHandlerService.js
 * @description CRUD operations for the User-Group relationship table.
 */

const { PrismaClient } = require("@prisma/client");

/**
 * @function createUserGroupUser
 * @description Creates a new User-Group relationship.
 * @param {bigint} userId - ID of the user.
 * @param {bigint} userGroupId - ID of the user group.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object>} The created User-Group relationship.
 * @throws {Error} If the creation fails.
 */
const createUserGroupUser = async (userId, userGroupId, prisma) => {
  try {
    const userGroupUser = await prisma.user_group_user.create({
      data: {
        user_id: userId,
        user_group_id: userGroupId,
        created_at: new Date(),
      },
    });
    return userGroupUser;
  } catch (error) {
    console.error("Error creating user-group relationship:", error);
    throw new Error("Failed to create user-group relationship.");
  }
};

/**
 * @function getUserGroupUsers
 * @description Retrieves all User-Group relationships excluding soft-deleted ones.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array>} List of User-Group relationships.
 * @throws {Error} If retrieval fails.
 */
const getUserGroupUsers = async (prisma) => {
  try {
    const userGroupUsers = await prisma.user_group_user.findMany({
      where: {
        deleted_at: null, // Exclude soft-deleted records
      },
    });
    return userGroupUsers;
  } catch (error) {
    console.error("Error retrieving user-group relationships:", error);
    throw new Error("Failed to retrieve user-group relationships.");
  }
};

/**
 * @function getUserGroupUserByIds
 * @description Retrieves a specific User-Group relationship by user ID and group ID.
 * @param {bigint} userId - ID of the user.
 * @param {bigint} userGroupId - ID of the user group.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The retrieved User-Group relationship or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getUserGroupUserByIds = async (userId, userGroupId, prisma) => {
  try {
    const userGroupUser = await prisma.user_group_user.findFirst({
      where: {
        user_id: userId,
        user_group_id: userGroupId,
        deleted_at: null, // Exclude soft-deleted records
      },
    });
    return userGroupUser;
  } catch (error) {
    console.error("Error retrieving user-group relationship by IDs:", error);
    throw new Error("Failed to retrieve user-group relationship by IDs.");
  }
};

/**
 * @function updateUserGroupUser
 * @description Updates an existing User-Group relationship.
 * @param {bigint} userId - ID of the user.
 * @param {bigint} userGroupId - ID of the user group.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object>} The updated User-Group relationship.
 * @throws {Error} If the update fails.
 */
const updateUserGroupUser = async (userId, userGroupId, prisma) => {
  try {
    const updatedUserGroupUser = await prisma.user_group_user.update({
      where: {
        user_id_user_group_id: {
          user_id: userId,
          user_group_id: userGroupId,
        },
      },
      data: {
        updated_at: new Date(),
      },
    });
    return updatedUserGroupUser;
  } catch (error) {
    console.error("Error updating user-group relationship:", error);
    throw new Error("Failed to update user-group relationship.");
  }
};

/**
 * @function deleteUserGroupUser
 * @description Soft deletes a User-Group relationship by setting the deleted_at field.
 * @param {bigint} userId - ID of the user.
 * @param {bigint} userGroupId - ID of the user group.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object>} The soft-deleted User-Group relationship.
 * @throws {Error} If the deletion fails.
 */
const deleteUserGroupUser = async (userId, userGroupId, prisma) => {
  try {
    const deletedUserGroupUser = await prisma.user_group_user.update({
      where: {
        user_id_user_group_id: {
          user_id: userId,
          user_group_id: userGroupId,
        },
      },
      data: {
        deleted_at: new Date(),
      },
    });
    return deletedUserGroupUser;
  } catch (error) {
    console.error("Error deleting user-group relationship:", error);
    throw new Error("Failed to delete user-group relationship.");
  }
};

module.exports = {
  createUserGroupUser,
  getUserGroupUsers,
  getUserGroupUserByIds,
  updateUserGroupUser,
  deleteUserGroupUser,
};
