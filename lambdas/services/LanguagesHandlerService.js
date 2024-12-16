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
  createLanguage,
  getLanguages,
  getLanguageById,
  updateLanguage,
  deleteLanguage,
};
