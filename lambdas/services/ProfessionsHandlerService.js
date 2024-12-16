/**
 * @file ProfessionsHandlerService.js
 * @description CRUD operations for the `professions` table with soft delete functionality.
 */

/**
 * Create a new Profession.
 * @param {Object} data - Profession data.
 * @param {bigint} data.language_id - Language ID.
 * @param {string} [data.name] - Name of the profession.
 * @param {string} [data.science] - Science related to the profession.
 * @param {string} [data.acronym] - Acronym of the profession.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object>} The created profession record.
 * @throws {Error} If the creation fails.
 */
const createProfession = async (data, prisma) => {
  try {
    const profession = await prisma.professions.create({
      data: {
        ...data,
        created_at: new Date(),
      },
    });
    return profession;
  } catch (error) {
    console.error("Error creating profession:", error);
    throw new Error("Failed to create profession.");
  }
};

/**
 * Get a Profession by ID.
 * @param {bigint} id - Profession ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object|null>} The profession record or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getProfessionById = async (id, prisma) => {
  try {
    const profession = await prisma.professions.findUnique({
      where: { id },
    });
    if (!profession) {
      throw new Error(`Profession with ID ${id} not found.`);
    }
    return profession;
  } catch (error) {
    console.error("Error retrieving profession by ID:", error);
    throw new Error("Failed to retrieve profession.");
  }
};

/**
 * Get all Professions.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<Object>>} List of all professions.
 * @throws {Error} If retrieval fails.
 */
const getAllProfessions = async (prisma) => {
  try {
    const professions = await prisma.professions.findMany();
    return professions;
  } catch (error) {
    console.error("Error retrieving professions:", error);
    throw new Error("Failed to retrieve professions.");
  }
};

/**
 * Update a Profession by ID.
 * @param {bigint} id - Profession ID.
 * @param {Object} data - Updated profession data.
 * @param {bigint} [data.language_id] - Updated Language ID.
 * @param {string} [data.name] - Updated name.
 * @param {string} [data.science] - Updated science field.
 * @param {string} [data.acronym] - Updated acronym.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object|null>} The updated profession record or null if not found.
 * @throws {Error} If update fails.
 */
const updateProfession = async (id, data, prisma) => {
  try {
    const profession = await prisma.professions.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return profession;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error("Error updating profession: Record not found");
      throw new Error(`Profession with ID ${id} not found.`);
    } else {
      console.error("Error updating profession:", error);
      throw new Error("Failed to update profession.");
    }
  }
};

/**
 * Delete a Profession by ID.
 * @param {bigint} id - Profession ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object|null>} The deleted profession record or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteProfession = async (id, prisma) => {
  try {
    const profession = await prisma.professions.delete({
      where: { id },
    });
    return profession;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error("Error deleting profession: Record not found");
      throw new Error(`Profession with ID ${id} not found.`);
    } else {
      console.error("Error deleting profession:", error);
      throw new Error("Failed to delete profession.");
    }
  }
};

module.exports = {
  createProfession,
  getProfessionById,
  getAllProfessions,
  updateProfession,
  deleteProfession,
};
