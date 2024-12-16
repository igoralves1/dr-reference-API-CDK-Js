/**
 * Service methods for managing country-user relationships.
 */

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
  createCountryUser,
  getCountryUsers,
  getCountryUserByIds,
  updateCountryUser,
  deleteCountryUser,
};
