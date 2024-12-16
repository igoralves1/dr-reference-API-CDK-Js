/**
 * Create a new city.
 * @param {Object} data - Data for the new city.
 * @param {bigint} data.province_id - The ID of the province.
 * @param {string} data.name - The name of the city.
 * @param {string} [data.geocode] - The geocode of the city.
 * @param {number} [data.lat] - The latitude of the city.
 * @param {number} [data.long] - The longitude of the city.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created city.
 */
const createCity = async (data, prisma) => {
  try {
    const city = await prisma.cities.create({
      data: {
        province_id: data.province_id,
        name: data.name,
        geocode: data.geocode || null,
        lat: data.lat || null,
        long: data.long || null,
        created_at: new Date(),
      },
    });
    return city;
  } catch (error) {
    console.error("Error creating city:", error);
    throw new Error("Failed to create city.");
  }
};

/**
 * Get all cities.
 * Excludes cities that are soft deleted.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of cities.
 */
const getCities = async (prisma) => {
  try {
    const cities = await prisma.cities.findMany({
      where: {
        deleted_at: null, // Exclude soft-deleted records
      },
      include: {
        provinces: true, // Include province details
      },
    });
    return cities;
  } catch (error) {
    console.error("Error retrieving cities:", error);
    throw new Error("Failed to retrieve cities.");
  }
};

/**
 * Get a specific city by its ID.
 * Excludes soft-deleted records.
 * @param {bigint} id - The ID of the city.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The city, or null if not found or soft-deleted.
 */
const getCityById = async (id, prisma) => {
  try {
    const city = await prisma.cities.findFirst({
      where: {
        id,
        deleted_at: null, // Exclude soft-deleted records
      },
      include: {
        provinces: true, // Include province details
      },
    });
    return city;
  } catch (error) {
    console.error("Error retrieving city by ID:", error);
    throw new Error("Failed to retrieve city by ID.");
  }
};

/**
 * Update a city by its ID.
 * Only updates if the city is not soft-deleted.
 * @param {bigint} id - The ID of the city to update.
 * @param {Object} data - The updated data for the city.
 * @param {string} [data.name] - The name of the city.
 * @param {string} [data.geocode] - The geocode of the city.
 * @param {number} [data.lat] - The latitude of the city.
 * @param {number} [data.long] - The longitude of the city.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The updated city, or null if not found or soft-deleted.
 */
const updateCity = async (id, data, prisma) => {
  try {
    const updatedCity = await prisma.cities.updateMany({
      where: {
        id,
        deleted_at: null, // Only update if the record is not soft-deleted
      },
      data: {
        name: data.name || undefined,
        geocode: data.geocode || undefined,
        lat: data.lat || undefined,
        long: data.long || undefined,
        updated_at: new Date(),
      },
    });

    if (updatedCity.count === 0) {
      return null; // No matching record found for update
    }

    return await getCityById(id, prisma); // Return the updated record
  } catch (error) {
    console.error("Error updating city:", error);
    throw new Error("Failed to update city.");
  }
};

/**
 * Soft delete a city by its ID.
 * @param {bigint} id - The ID of the city to delete.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The deleted city, or null if not found or already soft-deleted.
 */
const deleteCity = async (id, prisma) => {
  try {
    const deletedCity = await prisma.cities.updateMany({
      where: {
        id,
        deleted_at: null, // Only delete if the record is not already soft-deleted
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return deletedCity; // Return the soft-deleted record
  } catch (error) {
    console.error("Error deleting city:", error);
    throw new Error("Failed to delete city.");
  }
};

module.exports = {
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
};
