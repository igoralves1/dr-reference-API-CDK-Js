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
    if (path.startsWith("/languages")) {
      return await handleLanguageRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleLanguageRoutes = async (httpMethod, pathParameters, body) => {
  const languageId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (languageId) {
        const language = await getLanguageById(languageId, prisma);
        return language
          ? responses._200(language)
          : responses._404({ error: "Language not found" });
      }
      const languages = await getLanguages(prisma);
      return responses._200(languages);

    case "POST":
      const newLanguage = await createLanguage(body, prisma);
      return responses._200(newLanguage);

    case "PUT":
      if (!languageId) {
        return responses._400({ error: "Language ID is required" });
      }
      const updatedLanguage = await updateLanguage(languageId, body, prisma);
      return updatedLanguage
        ? responses._200(updatedLanguage)
        : responses._404({ error: "Language not found" });

    case "DELETE":
      if (!languageId) {
        return responses._400({ error: "Language ID is required" });
      }
      const deletedLanguage = await deleteLanguage(languageId, prisma);
      return deletedLanguage
        ? responses._204()
        : responses._404({ error: "Language not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new language.
 * @param {Object} data - The data for the new language.
 * @param {bigint} data.country_id - The ID of the associated country.
 * @param {string} data.family - The language family.
 * @param {string} data.iso_name - The ISO name of the language.
 * @param {string} data.native_name - The native name of the language.
 * @param {string} [data.iso_639_1] - ISO 639-1 code.
 * @param {string} [data.iso_639_2T] - ISO 639-2T code.
 * @param {string} [data.iso_639_2B] - ISO 639-2B code.
 * @param {string} [data.iso_639_3] - ISO 639-3 code.
 * @param {string} [data.tag] - Language tag.
 * @param {string} [data.note] - Additional note.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created language record.
 */
const createLanguage = async (data, prisma) => {
  try {
    const language = await prisma.languages.create({
      data: {
        country_id: data.country_id,
        family: data.family,
        iso_name: data.iso_name,
        native_name: data.native_name,
        iso_639_1: data.iso_639_1 || null,
        iso_639_2T: data.iso_639_2T || null,
        iso_639_2B: data.iso_639_2B || null,
        iso_639_3: data.iso_639_3 || null,
        tag: data.tag || null,
        note: data.note || null,
        created_at: new Date(),
      },
    });
    return language;
  } catch (error) {
    console.error("Error creating language:", error);
    throw new Error("Failed to create language.");
  }
};

/**
 * Get all languages.
 * Excludes soft-deleted records.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of language records.
 */
const getLanguages = async (prisma) => {
  try {
    const languages = await prisma.languages.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        countries: true,
      },
    });
    return languages;
  } catch (error) {
    console.error("Error retrieving languages:", error);
    throw new Error("Failed to retrieve languages.");
  }
};

/**
 * Get a specific language by its ID.
 * Excludes soft-deleted records.
 * @param {bigint} id - The ID of the language.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The language record, or null if not found or soft-deleted.
 */
const getLanguageById = async (id, prisma) => {
  try {
    const language = await prisma.languages.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        countries: true,
      },
    });
    return language;
  } catch (error) {
    console.error("Error retrieving language by ID:", error);
    throw new Error("Failed to retrieve language by ID.");
  }
};

/**
 * Update a language by its ID.
 * Only updates if the language is not soft-deleted.
 * @param {bigint} id - The ID of the language to update.
 * @param {Object} data - The updated data for the language.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The updated language record, or null if not found or soft-deleted.
 */
const updateLanguage = async (id, data, prisma) => {
  try {
    const updatedLanguage = await prisma.languages.updateMany({
      where: {
        id,
        deleted_at: null,
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });

    if (updatedLanguage.count === 0) {
      return null;
    }

    return await getLanguageById(id, prisma);
  } catch (error) {
    console.error("Error updating language:", error);
    throw new Error("Failed to update language.");
  }
};

/**
 * Soft delete a language by its ID.
 * @param {bigint} id - The ID of the language to delete.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The soft-deleted language record, or null if not found or already soft-deleted.
 */
const deleteLanguage = async (id, prisma) => {
  try {
    const deletedLanguage = await prisma.languages.updateMany({
      where: {
        id,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return deletedLanguage;
  } catch (error) {
    console.error("Error deleting language:", error);
    throw new Error("Failed to delete language.");
  }
};

module.exports = {
  handler,
};
