/**
 * Create a new phone.
 * @param {Object} data - The data for the new phone.
 * @param {bigint} data.address_id - The ID of the address associated with the phone.
 * @param {string} data.number - The phone number.
 * @param {string} [data.note] - Optional note about the phone.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created phone record.
 */
const createPhone = async (data, prisma) => {
  try {
    const phone = await prisma.phones.create({
      data: {
        address_id: data.address_id,
        number: data.number,
        note: data.note || null,
        created_at: new Date(),
      },
    });
    return phone;
  } catch (error) {
    console.error("Error creating phone:", error);
    throw new Error("Failed to create phone.");
  }
};

/**
 * Get all phones.
 * Excludes soft-deleted records.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of phone records.
 */
const getPhones = async (prisma) => {
  try {
    const phones = await prisma.phones.findMany({
      where: {
        deleted_at: null, // Exclude soft-deleted records
      },
      include: {
        addresses: true, // Include related address information
      },
    });
    return phones;
  } catch (error) {
    console.error("Error retrieving phones:", error);
    throw new Error("Failed to retrieve phones.");
  }
};

/**
 * Get a specific phone by its ID.
 * Excludes soft-deleted records.
 * @param {bigint} id - The ID of the phone.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The phone record, or null if not found or soft-deleted.
 */
const getPhoneById = async (id, prisma) => {
  try {
    const phone = await prisma.phones.findFirst({
      where: {
        id,
        deleted_at: null, // Exclude soft-deleted records
      },
      include: {
        addresses: true, // Include related address information
      },
    });
    return phone;
  } catch (error) {
    console.error("Error retrieving phone by ID:", error);
    throw new Error("Failed to retrieve phone by ID.");
  }
};

/**
 * Update a phone by its ID.
 * Only updates if the phone is not soft-deleted.
 * @param {bigint} id - The ID of the phone to update.
 * @param {Object} data - The updated data for the phone.
 * @param {bigint} [data.address_id] - The updated address ID.
 * @param {string} [data.number] - The updated phone number.
 * @param {string} [data.note] - The updated note.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The updated phone record, or null if not found or soft-deleted.
 */
const updatePhone = async (id, data, prisma) => {
  try {
    const updatedPhone = await prisma.phones.updateMany({
      where: {
        id,
        deleted_at: null, // Only update if the record is not soft-deleted
      },
      data: {
        address_id: data.address_id || undefined,
        number: data.number || undefined,
        note: data.note || undefined,
        updated_at: new Date(),
      },
    });

    if (updatedPhone.count === 0) {
      return null; // No matching record found for update
    }

    return await getPhoneById(id, prisma); // Return the updated record
  } catch (error) {
    console.error("Error updating phone:", error);
    throw new Error("Failed to update phone.");
  }
};

/**
 * Soft delete a phone by its ID.
 * @param {bigint} id - The ID of the phone to delete.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The soft-deleted phone record, or null if not found or already soft-deleted.
 */
const deletePhone = async (id, prisma) => {
  try {
    const deletedPhone = await prisma.phones.updateMany({
      where: {
        id,
        deleted_at: null, // Only delete if the record is not already soft-deleted
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return deletedPhone;
  } catch (error) {
    console.error("Error deleting phone:", error);
    throw new Error("Failed to delete phone.");
  }
};

module.exports = {
  createPhone,
  getPhones,
  getPhoneById,
  updatePhone,
  deletePhone,
};