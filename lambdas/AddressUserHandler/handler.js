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
    if (path.startsWith("/address-user")) {
      return await handleAddressUserRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleAddressUserRoutes = async (httpMethod, pathParameters, body) => {
  const userId = pathParameters?.userId
    ? BigInt(pathParameters.userId)
    : undefined;
  const addressId = pathParameters?.addressId
    ? BigInt(pathParameters.addressId)
    : undefined;

  switch (httpMethod) {
    case "POST":
      if (!userId || !addressId) {
        return responses._400({ error: "User ID and Address ID are required" });
      }
      const newAddressUser = await createAddressUser(userId, addressId, prisma);
      return responses._200(newAddressUser);

    case "GET":
      if (userId && addressId) {
        const addressUser = await getAddressUserByIds(
          userId,
          addressId,
          prisma
        );
        return addressUser
          ? responses._200(addressUser)
          : responses._400({ error: "Address-User relationship not found" });
      }
      const addressUsers = await getAddressUsers(prisma);
      return responses._200(addressUsers);

    case "PUT":
      if (!userId || !addressId) {
        return responses._400({ error: "User ID and Address ID are required" });
      }
      const updatedAddressUser = await updateAddressUser(
        userId,
        addressId,
        prisma
      );
      return updatedAddressUser
        ? responses._200(updatedAddressUser)
        : responses._400({ error: "Address-User relationship not found" });

    case "DELETE":
      if (!userId || !addressId) {
        return responses._400({ error: "User ID and Address ID are required" });
      }
      const deletedAddressUser = await deleteAddressUser(
        userId,
        addressId,
        prisma
      );
      return deletedAddressUser
        ? responses._204()
        : responses._400({ error: "Address-User relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
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
  handler,
};
