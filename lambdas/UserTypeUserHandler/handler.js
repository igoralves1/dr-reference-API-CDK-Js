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
    if (path.startsWith("/user-type-user")) {
      return await handleUserTypeUserRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleUserTypeUserRoutes = async (httpMethod, pathParameters, body) => {
  const userId = pathParameters?.userId
    ? BigInt(pathParameters.userId)
    : undefined;
  const userTypeId = pathParameters?.userTypeId
    ? BigInt(pathParameters.userTypeId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (userId && userTypeId) {
        const userTypeUser = await getUserTypeUserByIds(
          userId,
          userTypeId,
          prisma
        );
        return userTypeUser
          ? responses._200(userTypeUser)
          : responses._404({ error: "User-type relationship not found" });
      }
      const userTypeUsers = await getUserTypeUsers(prisma);
      return responses._200(userTypeUsers);

    case "POST":
      const newUserTypeUser = await createUserTypeUser(
        body.user_id,
        body.user_type_id,
        prisma
      );
      return responses._200(newUserTypeUser);

    case "PUT":
      if (!userId || !userTypeId) {
        return responses._400({
          error: "User ID and User Type ID are required",
        });
      }
      const updatedUserTypeUser = await updateUserTypeUser(
        userId,
        userTypeId,
        prisma
      );
      return updatedUserTypeUser
        ? responses._200(updatedUserTypeUser)
        : responses._404({ error: "User-type relationship not found" });

    case "DELETE":
      if (!userId || !userTypeId) {
        return responses._400({
          error: "User ID and User Type ID are required",
        });
      }
      const deletedUserTypeUser = await deleteUserTypeUser(
        userId,
        userTypeId,
        prisma
      );
      return deletedUserTypeUser
        ? responses._204()
        : responses._404({ error: "User-type relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
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
  handler,
};
