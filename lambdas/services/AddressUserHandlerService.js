const { PrismaClient } = require("@prisma/client");
/**
 * Create a new address-user relationship.
 * @param {bigint} userId - The user ID.
 * @param {bigint} addressId - The address ID.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created address-user relationship.
 */
const createAddressUser = async (userId, addressId, prisma) => {
  try {
    const addressUser = await prisma.address_user.create({
      data: {
        user_id: userId,
        address_id: addressId,
        created_at: new Date(),
      },
    });
    return addressUser;
  } catch (error) {
    console.error("Error creating address-user relationship:", error);
    throw error;
  }
};

/**
 * Get all address-user relationships.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} The list of address-user relationships.
 */
const getAddressUsers = async (prisma) => {
  try {
    const addressUsers = await prisma.address_user.findMany();
    return addressUsers;
  } catch (error) {
    console.error("Error retrieving address-user relationships:", error);
    throw error;
  }
};

/**
 * Get a specific address-user relationship by user ID and address ID.
 * @param {bigint} userId - The user ID.
 * @param {bigint} addressId - The address ID.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The address-user relationship, or null if not found.
 */
const getAddressUserByIds = async (userId, addressId, prisma) => {
  try {
    const addressUser = await prisma.address_user.findUnique({
      where: {
        user_id_address_id: {
          user_id: userId,
          address_id: addressId,
        },
      },
    });
    return addressUser;
  } catch (error) {
    console.error("Error retrieving address-user relationship by IDs:", error);
    throw error;
  }
};

/**
 * Update an address-user relationship by user ID and address ID.
 * @param {bigint} userId - The user ID.
 * @param {bigint} addressId - The address ID.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The updated address-user relationship.
 */
const updateAddressUser = async (userId, addressId, prisma) => {
  try {
    const updatedAddressUser = await prisma.address_user.update({
      where: {
        user_id_address_id: {
          user_id: userId,
          address_id: addressId,
        },
      },
      data: {
        updated_at: new Date(),
      },
    });
    return updatedAddressUser;
  } catch (error) {
    console.error("Error updating address-user relationship:", error);
    throw error;
  }
};

/**
 * Soft delete an address-user relationship by user ID and address ID.
 * @param {bigint} userId - The user ID.
 * @param {bigint} addressId - The address ID.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The deleted address-user relationship.
 */
const deleteAddressUser = async (userId, addressId, prisma) => {
  try {
    const deletedAddressUser = await prisma.address_user.update({
      where: {
        user_id_address_id: {
          user_id: userId,
          address_id: addressId,
        },
      },
      data: {
        deleted_at: new Date(),
      },
    });
    return deletedAddressUser;
  } catch (error) {
    console.error("Error deleting address-user relationship:", error);
    throw error;
  }
};

module.exports = {
  createAddressUser,
  getAddressUsers,
  getAddressUserByIds,
  updateAddressUser,
  deleteAddressUser,
};
