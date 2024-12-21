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
    if (path.startsWith("/tokens")) {
      return await handleTokensRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleTokensRoutes = async (httpMethod, pathParameters, body) => {
  const id = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (id) {
        const token = await getTokenById(id, prisma);
        return token
          ? responses._200(token)
          : responses._404({ error: "Token not found" });
      }
      const tokens = await getTokens(prisma);
      return responses._200(tokens);

    case "POST":
      const newToken = await createToken(body, prisma);
      return responses._200(newToken);

    case "PUT":
      if (!id) {
        return responses._400({ error: "Token ID is required" });
      }
      const updatedToken = await updateToken(id, body, prisma);
      return updatedToken
        ? responses._200(updatedToken)
        : responses._404({ error: "Token not found" });

    case "DELETE":
      if (!id) {
        return responses._400({ error: "Token ID is required" });
      }
      const deletedToken = await deleteToken(id, prisma);
      return deletedToken
        ? responses._204()
        : responses._404({ error: "Token not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Create a new token.
 * @param {object} data - Token data.
 * @param {bigint} data.father_user_id - Father user ID.
 * @param {bigint} data.son_user_id - Son user ID.
 * @param {bigint} data.reference_id - Reference ID.
 * @param {string} data.token - The token string.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object>} The created token record.
 * @throws {Error} If the creation fails.
 */
const createToken = async (data, prisma) => {
  try {
    const token = await prisma.tokens.create({
      data: {
        father_user_id: data.father_user_id,
        son_user_id: data.son_user_id,
        reference_id: data.reference_id,
        token: data.token,
        created_at: new Date(),
      },
    });
    return token;
  } catch (error) {
    console.error("Error creating token:", error);
    throw new Error("Failed to create token.");
  }
};

/**
 * Get all tokens.
 * Excludes soft-deleted records.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<object>>} List of tokens.
 * @throws {Error} If retrieval fails.
 */
const getTokens = async (prisma) => {
  try {
    const tokens = await prisma.tokens.findMany({
      where: {
        deleted_at: null, // Exclude soft-deleted records
      },
    });
    return tokens;
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    throw new Error("Failed to retrieve tokens.");
  }
};

/**
 * Get a token by its ID.
 * Excludes soft-deleted records.
 * @param {bigint} id - Token ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The token or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getTokenById = async (id, prisma) => {
  try {
    const token = await prisma.tokens.findFirst({
      where: {
        id,
        deleted_at: null, // Exclude soft-deleted records
      },
    });
    return token;
  } catch (error) {
    console.error("Error retrieving token by ID:", error);
    throw new Error("Failed to retrieve token.");
  }
};

/**
 * Update a token by its ID.
 * @param {bigint} id - Token ID.
 * @param {object} data - Updated token data.
 * @param {bigint} [data.father_user_id] - Updated father user ID.
 * @param {bigint} [data.son_user_id] - Updated son user ID.
 * @param {bigint} [data.reference_id] - Updated reference ID.
 * @param {string} [data.token] - Updated token string.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The updated token or null if not found.
 * @throws {Error} If update fails.
 */
const updateToken = async (id, data, prisma) => {
  try {
    const token = await prisma.tokens.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return token;
  } catch (error) {
    console.error("Error updating token:", error);
    throw new Error("Failed to update token.");
  }
};

/**
 * Soft delete a token by its ID.
 * @param {bigint} id - Token ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The soft-deleted token or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteToken = async (id, prisma) => {
  try {
    const token = await prisma.tokens.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
    return token;
  } catch (error) {
    console.error("Error deleting token:", error);
    throw new Error("Failed to delete token.");
  }
};

module.exports = {
  handler,
};
