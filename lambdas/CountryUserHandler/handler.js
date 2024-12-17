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
    if (path.startsWith("/country-user")) {
      return await handleCountryUserRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleCountryUserRoutes = async (httpMethod, pathParameters, body) => {
  const userId = pathParameters?.userId
    ? BigInt(pathParameters.userId)
    : undefined;
  const countryId = pathParameters?.countryId
    ? BigInt(pathParameters.countryId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (userId && countryId) {
        const countryUser = await getCountryUserByIds(
          userId,
          countryId,
          prisma
        );
        return countryUser
          ? responses._200(countryUser)
          : responses._404({ error: "Country-user relationship not found" });
      }
      const countryUsers = await getCountryUsers(prisma);
      return responses._200(countryUsers);

    case "POST":
      const newCountryUser = await createCountryUser(
        body.user_id,
        body.country_id,
        prisma
      );
      return responses._200(newCountryUser);

    case "PUT":
      if (!userId || !countryId) {
        return responses._400({ error: "User ID and Country ID are required" });
      }
      const updatedCountryUser = await updateCountryUser(
        userId,
        countryId,
        prisma
      );
      return updatedCountryUser
        ? responses._200(updatedCountryUser)
        : responses._404({ error: "Country-user relationship not found" });

    case "DELETE":
      if (!userId || !countryId) {
        return responses._400({ error: "User ID and Country ID are required" });
      }
      const deletedCountryUser = await deleteCountryUser(
        userId,
        countryId,
        prisma
      );
      return deletedCountryUser
        ? responses._204()
        : responses._404({ error: "Country-user relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new country-user relationship.
 * @param {bigint} userId - The user ID.
 * @param {bigint} countryId - The country ID.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created country-user relationship.
 */
const createCountryUser = async (userId, countryId, prisma) => {
  try {
    const countryUser = await prisma.country_user.create({
      data: {
        user_id: userId,
        country_id: countryId,
        created_at: new Date(),
      },
    });
    return countryUser;
  } catch (error) {
    console.error("Error creating country-user relationship:", error);
    throw new Error("Failed to create country-user relationship.");
  }
};

/**
 * Get all country-user relationships.
 * Excludes soft-deleted records.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of country-user relationships.
 */
const getCountryUsers = async (prisma) => {
  try {
    const countryUsers = await prisma.country_user.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        users: true,
        countries: true,
      },
    });
    return countryUsers;
  } catch (error) {
    console.error("Error retrieving country-user relationships:", error);
    throw new Error("Failed to retrieve country-user relationships.");
  }
};

/**
 * Get a specific country-user relationship by user ID and country ID.
 * Excludes soft-deleted records.
 * @param {bigint} userId - The user ID.
 * @param {bigint} countryId - The country ID.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The country-user relationship, or null if not found.
 */
const getCountryUserByIds = async (userId, countryId, prisma) => {
  try {
    const countryUser = await prisma.country_user.findFirst({
      where: {
        user_id: userId,
        country_id: countryId,
        deleted_at: null,
      },
      include: {
        users: true,
        countries: true,
      },
    });
    return countryUser;
  } catch (error) {
    console.error("Error retrieving country-user relationship by IDs:", error);
    throw new Error("Failed to retrieve country-user relationship.");
  }
};

/**
 * Update a country-user relationship by user ID and country ID.
 * @param {bigint} userId - The user ID.
 * @param {bigint} countryId - The country ID.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The updated country-user relationship, or null if not found.
 */
const updateCountryUser = async (userId, countryId, prisma) => {
  try {
    const updatedCountryUser = await prisma.country_user.updateMany({
      where: {
        user_id: userId,
        country_id: countryId,
        deleted_at: null,
      },
      data: {
        updated_at: new Date(),
      },
    });

    if (updatedCountryUser.count === 0) {
      return null;
    }

    return getCountryUserByIds(userId, countryId, prisma);
  } catch (error) {
    console.error("Error updating country-user relationship:", error);
    throw new Error("Failed to update country-user relationship.");
  }
};

/**
 * Soft delete a country-user relationship by user ID and country ID.
 * @param {bigint} userId - The user ID.
 * @param {bigint} countryId - The country ID.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The soft-deleted country-user relationship, or null if not found.
 */
const deleteCountryUser = async (userId, countryId, prisma) => {
  try {
    const deletedCountryUser = await prisma.country_user.updateMany({
      where: {
        user_id: userId,
        country_id: countryId,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return deletedCountryUser;
  } catch (error) {
    console.error("Error deleting country-user relationship:", error);
    throw new Error("Failed to delete country-user relationship.");
  }
};

module.exports = {
  handler,
};
