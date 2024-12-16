/**
 * Create a new reference.
 * @param {object} data - Reference data.
 * @param {string} data.token - The unique token string.
 * @param {string} data.father_message - The father message string.
 * @param {boolean} [data.is_used=false] - Indicates if the reference is used.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object>} The created reference record.
 * @throws {Error} If the creation fails.
 */
const createReference = async (data, prisma) => {
  try {
    const reference = await prisma.references.create({
      data: {
        token: data.token,
        father_message: data.father_message,
        is_used: data.is_used || false,
        created_at: new Date(),
      },
    });
    return reference;
  } catch (error) {
    console.error("Error creating reference:", error);
    throw new Error("Failed to create reference.");
  }
};

/**
 * Get all references.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<object>>} List of references.
 * @throws {Error} If retrieval fails.
 */
const getReferences = async (prisma) => {
  try {
    const references = await prisma.references.findMany();
    return references;
  } catch (error) {
    console.error("Error retrieving references:", error);
    throw new Error("Failed to retrieve references.");
  }
};

/**
 * Get a reference by its ID.
 * @param {bigint} id - Reference ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The reference or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getReferenceById = async (id, prisma) => {
  try {
    const reference = await prisma.references.findUnique({
      where: { id },
    });
    return reference;
  } catch (error) {
    console.error("Error retrieving reference by ID:", error);
    throw new Error("Failed to retrieve reference.");
  }
};

/**
 * Update a reference by its ID.
 * @param {bigint} id - Reference ID.
 * @param {object} data - Updated reference data.
 * @param {string} [data.token] - Updated token string.
 * @param {string} [data.father_message] - Updated father message string.
 * @param {boolean} [data.is_used] - Updated is_used status.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The updated reference or null if not found.
 * @throws {Error} If update fails.
 */
const updateReference = async (id, data, prisma) => {
  try {
    const reference = await prisma.references.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return reference;
  } catch (error) {
    console.error("Error updating reference:", error);
    throw new Error("Failed to update reference.");
  }
};

/**
 * Delete a reference by its ID.
 * @param {bigint} id - Reference ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The deleted reference or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteReference = async (id, prisma) => {
  try {
    const reference = await prisma.references.delete({
      where: { id },
    });
    return reference;
  } catch (error) {
    console.error("Error deleting reference:", error);
    throw new Error("Failed to delete reference.");
  }
};

module.exports = {
  createReference,
  getReferences,
  getReferenceById,
  updateReference,
  deleteReference,
};
