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
    if (path.startsWith("/user-groups")) {
      return await handleUserGroupRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleUserGroupRoutes = async (httpMethod, pathParameters, body) => {
  const userGroupId = pathParameters?.id
    ? BigInt(pathParameters.id)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (userGroupId) {
        const userGroup = await getUserGroupById(userGroupId, prisma);
        return userGroup
          ? responses._200(userGroup)
          : responses._404({ error: "User group not found" });
      }
      const userGroups = await getUserGroups(prisma);
      return responses._200(userGroups);

    case "POST":
      const newUserGroup = await createUserGroup(body, prisma);
      return responses._200(newUserGroup);

    case "PUT":
      if (!userGroupId) {
        return responses._400({ error: "User group ID is required" });
      }
      const updatedUserGroup = await updateUserGroup(userGroupId, body, prisma);
      return updatedUserGroup
        ? responses._200(updatedUserGroup)
        : responses._404({ error: "User group not found" });

    case "DELETE":
      if (!userGroupId) {
        return responses._400({ error: "User group ID is required" });
      }
      const deletedUserGroup = await deleteUserGroup(userGroupId, prisma);
      return deletedUserGroup
        ? responses._204()
        : responses._404({ error: "User group not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new user group.
 * @param {Object} data - The data for the new user group.
 * @param {bigint} data.language_id - The ID of the associated language.
 * @param {string} data.group - The name of the user group.
 * @param {string} [data.note] - Additional note about the user group.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created user group record.
 */
const createUserGroup = async (data, prisma) => {
  try {
    const userGroup = await prisma.user_groups.create({
      data: {
        language_id: data.language_id,
        group: data.group,
        note: data.note || null,
        created_at: new Date(),
      },
    });
    return userGroup;
  } catch (error) {
    console.error("Error creating user group:", error);
    throw new Error("Failed to create user group.");
  }
};

/**
 * Get all user groups.
 * Excludes soft-deleted records.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of user group records.
 */
const getUserGroups = async (prisma) => {
  try {
    const userGroups = await prisma.user_groups.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        languages: true,
      },
    });
    return userGroups;
  } catch (error) {
    console.error("Error retrieving user groups:", error);
    throw new Error("Failed to retrieve user groups.");
  }
};

/**
 * Get a specific user group by ID.
 * Excludes soft-deleted records.
 * @param {bigint} id - The ID of the user group.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The user group record, or null if not found or soft-deleted.
 */
const getUserGroupById = async (id, prisma) => {
  try {
    const userGroup = await prisma.user_groups.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        languages: true,
      },
    });
    return userGroup;
  } catch (error) {
    console.error("Error retrieving user group by ID:", error);
    throw new Error("Failed to retrieve user group by ID.");
  }
};

/**
 * Update a user group by its ID.
 * Only updates if the user group is not soft-deleted.
 * @param {bigint} id - The ID of the user group to update.
 * @param {Object} data - The updated data for the user group.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The updated user group record, or null if not found or soft-deleted.
 */
const updateUserGroup = async (id, data, prisma) => {
  try {
    const updatedUserGroup = await prisma.user_groups.updateMany({
      where: {
        id,
        deleted_at: null,
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });

    if (updatedUserGroup.count === 0) {
      return null;
    }

    return await getUserGroupById(id, prisma);
  } catch (error) {
    console.error("Error updating user group:", error);
    throw new Error("Failed to update user group.");
  }
};

/**
 * Soft delete a user group by its ID.
 * @param {bigint} id - The ID of the user group to delete.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The soft-deleted user group record, or null if not found or already soft-deleted.
 */
const deleteUserGroup = async (id, prisma) => {
  try {
    const deletedUserGroup = await prisma.user_groups.updateMany({
      where: {
        id,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });
    return deletedUserGroup;
  } catch (error) {
    console.error("Error deleting user group:", error);
    throw new Error("Failed to delete user group.");
  }
};

module.exports = {
  handler,
};
