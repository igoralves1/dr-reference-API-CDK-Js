/**
 * Create a new province.
 * @param {Object} data - Data for the new province.
 * @param {bigint} data.country_id - The ID of the country.
 * @param {string} data.name - The name of the province.
 * @param {string} [data.uf] - The UF code of the province.
 * @param {string} [data.geocode] - The geocode of the province.
 * @param {number} [data.lat] - The latitude of the province.
 * @param {number} [data.long] - The longitude of the province.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created province.
 */
const createProvince = async (data, prisma) => {
  try {
    const province = await prisma.provinces.create({
      data: {
        country_id: data.country_id,
        name: data.name,
        uf: data.uf || null,
        geocode: data.geocode || null,
        lat: data.lat || null,
        long: data.long || null,
        created_at: new Date(),
      },
    });
    return province;
  } catch (error) {
    console.error("Error creating province:", error);
    throw new Error("Failed to create province.");
  }
};

/**
 * Get all provinces.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of provinces.
 */
const getProvinces = async (prisma) => {
  try {
    const provinces = await prisma.provinces.findMany({
      where: {
        deleted_at: null, // Exclude deleted records
      },
      include: {
        countries: true, // Include country details
      },
    });
    return provinces;
  } catch (error) {
    console.error("Error retrieving provinces:", error);
    throw new Error("Failed to retrieve provinces.");
  }
};

/**
 * Get a specific province by its ID.
 * @param {bigint} id - The ID of the province.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The province, or null if not found.
 */
const getProvinceById = async (id, prisma) => {
  try {
    const province = await prisma.provinces.findFirst({
      where: {
        id,
        deleted_at: null, // Exclude deleted records
      },
      include: {
        countries: true, // Include country details
      },
    });
    return province;
  } catch (error) {
    console.error("Error retrieving province by ID:", error);
    throw new Error("Failed to retrieve province by ID.");
  }
};

/**
 * Update a province by its ID.
 * @param {bigint} id - The ID of the province to update.
 * @param {Object} data - The updated data for the province.
 * @param {string} [data.name] - The name of the province.
 * @param {string} [data.uf] - The UF code of the province.
 * @param {string} [data.geocode] - The geocode of the province.
 * @param {number} [data.lat] - The latitude of the province.
 * @param {number} [data.long] - The longitude of the province.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The updated province.
 */
const updateProvince = async (id, data, prisma) => {
  try {
    const updatedProvince = await prisma.provinces.update({
      where: { id },
      data: {
        name: data.name || undefined,
        uf: data.uf || undefined,
        geocode: data.geocode || undefined,
        lat: data.lat || undefined,
        long: data.long || undefined,
        updated_at: new Date(),
      },
    });
    return updatedProvince;
  } catch (error) {
    console.error("Error updating province:", error);
    throw new Error("Failed to update province.");
  }
};

/**
 * Soft delete a province by its ID.
 * @param {bigint} id - The ID of the province to delete.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The deleted province.
 */
const deleteProvince = async (id, prisma) => {
  try {
    const deletedProvince = await prisma.provinces.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
    return deletedProvince;
  } catch (error) {
    console.error("Error deleting province:", error);
    throw new Error("Failed to delete province.");
  }
};

module.exports = {
  createProvince,
  getProvinces,
  getProvinceById,
  updateProvince,
  deleteProvince,
};
