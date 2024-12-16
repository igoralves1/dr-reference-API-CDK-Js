/**
 * Create a new professional.
 * @param {object} data - Professional data.
 * @param {bigint} data.user_id - User ID.
 * @param {string} data.name - First name of the professional.
 * @param {string} data.last_name - Last name of the professional.
 * @param {string} data.sex - Gender of the professional ('M' or 'F').
 * @param {string} [data.url] - URL for the professional's profile.
 * @param {string} [data.image_path] - Path to the professional's image.
 * @param {object} prisma - The Prisma client instance.
 * @returns {Promise<object>} The created professional.
 */
const createProfessional = async (data, prisma) => {
  try {
    const professional = await prisma.professionals.create({
      data: {
        ...data,
        created_at: new Date(),
      },
    });
    return professional;
  } catch (error) {
    console.error("Error creating professional:", error);
    throw new Error("Failed to create professional.");
  }
};

/**
 * Get a professional by ID.
 * @param {bigint} id - Professional ID.
 * @param {object} prisma - The Prisma client instance.
 * @returns {Promise<object|null>} The professional or null if not found.
 */
const getProfessionalById = async (id, prisma) => {
  try {
    const professional = await prisma.professionals.findUnique({
      where: { id },
    });
    return professional;
  } catch (error) {
    console.error("Error retrieving professional:", error);
    throw new Error("Failed to retrieve professional.");
  }
};

/**
 * Update a professional by ID.
 * @param {bigint} id - Professional ID.
 * @param {object} data - Updated professional data.
 * @param {string} [data.name] - Updated first name.
 * @param {string} [data.last_name] - Updated last name.
 * @param {string} [data.sex] - Updated gender ('M' or 'F').
 * @param {string} [data.url] - Updated URL.
 * @param {string} [data.image_path] - Updated image path.
 * @param {object} prisma - The Prisma client instance.
 * @returns {Promise<object|null>} The updated professional or null if not found.
 */
const updateProfessional = async (id, data, prisma) => {
  try {
    const professional = await prisma.professionals.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return professional;
  } catch (error) {
    console.error("Error updating professional:", error);
    throw new Error("Failed to update professional.");
  }
};

/**
 * Hard delete a professional by ID.
 * @param {bigint} id - Professional ID.
 * @param {object} prisma - The Prisma client instance.
 * @returns {Promise<object|null>} The deleted professional or null if not found.
 */
const deleteProfessional = async (id, prisma) => {
  try {
    const professional = await prisma.professionals.delete({
      where: { id },
    });
    return professional;
  } catch (error) {
    console.error("Error deleting professional:", error);
    throw new Error("Failed to delete professional.");
  }
};

/**
 * Get all professionals.
 * @param {object} prisma - The Prisma client instance.
 * @returns {Promise<Array<object>>} List of professionals.
 */
const getProfessionals = async (prisma) => {
  try {
    const professionals = await prisma.professionals.findMany();
    return professionals;
  } catch (error) {
    console.error("Error retrieving professionals:", error);
    throw new Error("Failed to retrieve professionals.");
  }
};

module.exports = {
  createProfessional,
  getProfessionalById,
  updateProfessional,
  deleteProfessional,
  getProfessionals,
};
