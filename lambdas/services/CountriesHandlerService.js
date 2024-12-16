/**
 * Create a new country.
 * @param {Object} data - The data for the new country.
 * @param {string} data.name - The name of the country.
 * @param {string} [data.iso3_code] - The ISO3 code of the country.
 * @param {string} [data.iso2_code] - The ISO2 code of the country.
 * @param {string} [data.geocode] - The geocode of the country.
 * @param {number} [data.lat] - The latitude of the country.
 * @param {number} [data.long] - The longitude of the country.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created country.
 */
const createCountry = async (data, prisma) => {
  try {
    const country = await prisma.countries.create({
      data: {
        name: data.name,
        iso3_code: data.iso3_code || null,
        iso2_code: data.iso2_code || null,
        geocode: data.geocode || null,
        lat: data.lat || null,
        long: data.long || null,
        created_at: new Date(),
      },
    });
    return country;
  } catch (error) {
    console.error("Error creating country:", error);
    throw new Error("Failed to create country.");
  }
};

/**
 * Get all countries.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of all countries.
 */
const getCountries = async (prisma) => {
  try {
    const countries = await prisma.countries.findMany({
      where: {
        deleted_at: null, // Exclude deleted records
      },
    });
    return countries;
  } catch (error) {
    console.error("Error retrieving countries:", error);
    throw new Error("Failed to retrieve countries.");
  }
};

/**
 * Get a specific country by its ID.
 * @param {bigint} id - The ID of the country.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The country, or null if not found.
 */
const getCountryById = async (id, prisma) => {
  try {
    const country = await prisma.countries.findUnique({
      where: { id },
      deleted_at: null,
    });
    return country;
  } catch (error) {
    console.error("Error retrieving country by ID:", error);
    throw new Error("Failed to retrieve country by ID.");
  }
};

/**
 * Update a country by its ID.
 * @param {bigint} id - The ID of the country to update.
 * @param {Object} data - The updated data for the country.
 * @param {string} [data.name] - The name of the country.
 * @param {string} [data.iso3_code] - The ISO3 code of the country.
 * @param {string} [data.iso2_code] - The ISO2 code of the country.
 * @param {string} [data.geocode] - The geocode of the country.
 * @param {number} [data.lat] - The latitude of the country.
 * @param {number} [data.long] - The longitude of the country.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The updated country.
 */
const updateCountry = async (id, data, prisma) => {
  try {
    const updatedCountry = await prisma.countries.update({
      where: { id },
      data: {
        name: data.name || undefined,
        iso3_code: data.iso3_code || undefined,
        iso2_code: data.iso2_code || undefined,
        geocode: data.geocode || undefined,
        lat: data.lat || undefined,
        long: data.long || undefined,
        updated_at: new Date(),
      },
    });
    return updatedCountry;
  } catch (error) {
    console.error("Error updating country:", error);
    throw new Error("Failed to update country.");
  }
};

/**
 * Soft delete a country by its ID.
 * @param {bigint} id - The ID of the country to delete.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The deleted country.
 */
const deleteCountry = async (id, prisma) => {
  try {
    const deletedCountry = await prisma.countries.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
    return deletedCountry;
  } catch (error) {
    console.error("Error deleting country:", error);
    throw new Error("Failed to delete country.");
  }
};

module.exports = {
  createCountry,
  getCountries,
  getCountryById,
  updateCountry,
  deleteCountry,
};
