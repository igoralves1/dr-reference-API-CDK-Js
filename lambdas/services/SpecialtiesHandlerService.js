/**
 * @file SpecialtiesHandlerService.js
 * @description CRUD operations for the `specialties` table.
 */

const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Create a new Specialty.
 * @param {object} data - Specialty data.
 * @param {bigint} data.profession_id - Profession ID.
 * @param {string} data.name - Specialty name.
 * @returns {Promise<object>} The created specialty.
 * @throws {Error} If the creation fails.
 */
const createSpecialty = async (data) => {
  try {
    const specialty = await prisma.specialties.create({
      data: {
        profession_id: data.profession_id,
        name: data.name,
        created_at: new Date(),
      },
    });
    return specialty;
  } catch (error) {
    console.error("Error creating specialty:", error);
    throw new Error("Failed to create specialty.");
  }
};

/**
 * Get all Specialties.
 * @returns {Promise<Array<object>>} List of specialties.
 * @throws {Error} If retrieval fails.
 */
const getAllSpecialties = async () => {
  try {
    const specialties = await prisma.specialties.findMany();
    return specialties;
  } catch (error) {
    console.error("Error retrieving specialties:", error);
    throw new Error("Failed to retrieve specialties.");
  }
};

/**
 * Get a Specialty by ID.
 * @param {bigint} id - Specialty ID.
 * @returns {Promise<object|null>} The specialty or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getSpecialtyById = async (id) => {
  try {
    const specialty = await prisma.specialties.findUnique({
      where: { id },
    });
    return specialty;
  } catch (error) {
    console.error("Error retrieving specialty by ID:", error);
    throw new Error("Failed to retrieve specialty.");
  }
};

/**
 * Get all Specialties by Profession ID.
 * @param {bigint} profession_id - Profession ID.
 * @returns {Promise<Array<object>>} List of specialties.
 * @throws {Error} If retrieval fails.
 */
const getSpecialtiesByProfessionId = async (profession_id) => {
  try {
    const specialties = await prisma.specialties.findMany({
      where: { profession_id },
    });
    return specialties;
  } catch (error) {
    console.error("Error retrieving specialties by profession ID:", error);
    throw new Error("Failed to retrieve specialties.");
  }
};

/**
 * Update a Specialty by ID.
 * @param {bigint} id - Specialty ID.
 * @param {object} data - Updated data.
 * @param {string} [data.name] - Updated specialty name.
 * @param {bigint} [data.profession_id] - Updated profession ID.
 * @returns {Promise<object|null>} The updated specialty or null if not found.
 * @throws {Error} If update fails.
 */
const updateSpecialty = async (id, data) => {
  try {
    const specialty = await prisma.specialties.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return specialty;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error("Error updating specialty: Record not found");
      throw new Error(`Specialty with ID ${id} not found.`);
    } else {
      console.error("Error updating specialty:", error);
      throw new Error("Failed to update specialty.");
    }
  }
};

/**
 * Delete a Specialty by ID.
 * @param {bigint} id - Specialty ID.
 * @returns {Promise<object|null>} The deleted specialty or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteSpecialty = async (id) => {
  try {
    const specialty = await prisma.specialties.delete({
      where: { id },
    });
    return specialty;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error("Error deleting specialty: Record not found");
      throw new Error(`Specialty with ID ${id} not found.`);
    } else {
      console.error("Error deleting specialty:", error);
      throw new Error("Failed to delete specialty.");
    }
  }
};

module.exports = {
  createSpecialty,
  getAllSpecialties,
  getSpecialtyById,
  getSpecialtiesByProfessionId,
  updateSpecialty,
  deleteSpecialty,
};
