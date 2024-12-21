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
    if (path.startsWith("/countries")) {
      return await handleCountryRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleCountryRoutes = async (httpMethod, pathParameters, body) => {
  const countryId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (countryId) {
        const country = await getCountryById(countryId, prisma);
        return country
          ? responses._200(country)
          : responses._404({ error: "Country not found" });
      }
      const countries = await getCountries(prisma);
      return responses._200(countries);

    case "POST":
      const newCountry = await createCountry(body, prisma);
      return responses._200(newCountry);

    case "PUT":
      if (!countryId) {
        return responses._400({ error: "Country ID is required" });
      }
      const updatedCountry = await updateCountry(countryId, body, prisma);
      return updatedCountry
        ? responses._200(updatedCountry)
        : responses._404({ error: "Country not found" });

    case "DELETE":
      if (!countryId) {
        return responses._400({ error: "Country ID is required" });
      }
      const deletedCountry = await deleteCountry(countryId, prisma);
      return deletedCountry
        ? responses._204()
        : responses._404({ error: "Country not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

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
  handler,
};
