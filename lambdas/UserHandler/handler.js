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
    if (path.startsWith("/users")) {
      return await handleUserRoutes(httpMethod, pathParameters?.id, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleUserRoutes = async (httpMethod, userId, body) => {
  switch (httpMethod) {
    case "GET":
      if (userId) {
        const id = BigInt(userId);
        const user = await getUserById(id, prisma);
        return user
          ? responses._200(user)
          : responses._400({ error: "User not found" });
      } else {
        const users = await listUsers(prisma, true);
        return responses._200(users);
      }

    case "POST":
      const newUser = await createUser(body, prisma);
      return responses._200(newUser);

    case "PUT":
      if (!userId) return responses._400({ error: "User ID is required" });
      const idToUpdate = BigInt(userId);
      const updatedUser = await updateUser(idToUpdate, body, prisma);
      return updatedUser
        ? responses._200(updatedUser)
        : responses._400({ error: "User not found" });

    case "DELETE":
      if (!userId) return responses._400({ error: "User ID is required" });
      const idToDelete = BigInt(userId);
      const deletedUser = await deleteUser(idToDelete, prisma);
      return deletedUser
        ? responses._204({ message: "User deleted successfully" })
        : responses._400({ error: "User not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * @typedef {Object} UserData
 * @property {string} name
 * @property {string} [middleName]
 * @property {string} [lastName]
 * @property {string } [avatar]
 * @property {string} role
 * @property {string} email
 * @property {string} password
 * @property {string} [rememberToken]
 * @property {string | null} [emailVerifiedAt]
 * @property {boolean} [isActive]
 * @property {boolean} [isAccepted]
 * @property {number} [maxTokens]
 * @property {number} [usedTokens]
 * @property {string} [status]
 * @property {string} [inviteToken]
 */

/**
 * Create a new user.
 * @param {UserData} userData
 * @param {any} prisma
 * @returns {Promise<Object>}
 */
const createUser = async (userData, prisma) => {
  try {
    const user = await prisma.users.create({
      data: {
        name: userData.name,
        middle_name: userData.middleName,
        last_name: userData.lastName,
        avatar: userData.avatar,
        role: userData.role,
        email: userData.email,
        password: userData.password,
        remember_token: userData.rememberToken,
        email_verified_at: userData.emailVerifiedAt
          ? new Date(userData.emailVerifiedAt)
          : null,
        is_active: userData.isActive ?? true,
        is_accepted: userData.isAccepted ?? true,
        max_tokens: userData.maxTokens ?? 20,
        used_tokens: userData.usedTokens ?? 0,
        status: userData.status,
        invite_token: userData.inviteToken ?? "default-invite-token",
      },
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user. Please check the provided data.");
  }
};

/**
 * Get a user by ID.
 * @param {bigint} id
 * @param {any} prisma
 * @returns {Promise<Object | null>}
 */
const getUserById = async (id, prisma) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Failed to fetch user.");
  }
};

/**
 * Update a user.
 * @param {bigint} id
 * @param {Partial<UserData>} updateData
 * @param {any} prisma
 * @returns {Promise<Object>}
 */
const updateUser = async (id, updateData, prisma) => {
  try {
    const user = await prisma.users.update({
      where: { id },
      data: updateData,
    });
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("User not found.");
    }
    throw new Error("Failed to update user.");
  }
};

/**
 * Soft delete a user.
 * @param {bigint} id
 * @param {any} prisma
 * @returns {Promise<Object>}
 */
const deleteUser = async (id, prisma) => {
  try {
    const user = await prisma.users.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
    return user;
  } catch (error) {
    console.error("Error deleting user:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("User not found.");
    }
    throw new Error("Failed to delete user.");
  }
};

/**
 * List users with optional filtering for active users.
 * @param {boolean} [activeOnly=true]
 * @param {any} prisma
 * @returns {Promise<Array<Object>>}
 */
const listUsers = async (prisma, activeOnly = true) => {
  try {
    const users = await prisma.users.findMany({
      where: { is_active: activeOnly, deleted_at: null },
    });
    return users;
  } catch (error) {
    console.error("Error listing users:", error);
    throw new Error("Failed to retrieve users.");
  }
};

module.exports = {
  handler,
};
