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
    if (path.startsWith("/address-types")) {
      return await handleAddressTypesRoutes(
        httpMethod,
        pathParameters?.id,
        body
      );
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};

const handleAddressTypesRoutes = async (httpMethod, addressTypeId, body) => {
  switch (httpMethod) {
    case "GET":
      if (addressTypeId) {
        const id = BigInt(addressTypeId);
        const addressType = await getAddressTypeById(id);
        return addressType
          ? responses._200(addressType)
          : responses._400({ error: "Address type not found" });
      } else {
        const addressTypes = await getAddressTypes();
        return responses._200(addressTypes);
      }

    case "POST":
      const newAddressType = await createAddressType(body);
      return responses._200(newAddressType);

    case "PUT":
      if (!addressTypeId)
        return responses._400({ error: "Address type ID is required" });
      const idToUpdate = BigInt(addressTypeId);
      const updatedAddressType = await updateAddressType(idToUpdate, body);
      return updatedAddressType
        ? responses._200(updatedAddressType)
        : responses._400({ error: "Address type not found" });

    case "DELETE":
      if (!addressTypeId)
        return responses._400({ error: "Address type ID is required" });
      const idToDelete = BigInt(addressTypeId);
      const deletedAddressType = await deleteAddressType(idToDelete);
      return deletedAddressType
        ? responses._204()
        : responses._400({ error: "Address type not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new address type.
 * @param {Object} data - The data for the new address type.
 * @param {string} data.name - The name of the address type.
 * @param {string} [data.description] - The description of the address type.
 * @returns {Promise<Object>} The created address type.
 */
const createAddressType = async (data) => {
  try {
    const addressType = await prisma.address_types.create({
      data: {
        name: data.name,
        description: data.description || null,
        created_at: new Date(),
      },
    });
    return addressType;
  } catch (error) {
    console.error("Error creating address type:", error);
    throw error;
  }
};

/**
 * Get all address types.
 * @returns {Promise<Object[]>} The list of address types.
 */
const getAddressTypes = async () => {
  try {
    const addressTypes = await prisma.address_types.findMany();
    return addressTypes;
  } catch (error) {
    console.error("Error retrieving address types:", error);
    throw error;
  }
};

/**
 * Get a specific address type by ID.
 * @param {bigint} id - The ID of the address type.
 * @returns {Promise<Object|null>} The address type, or null if not found.
 */
const getAddressTypeById = async (id) => {
  try {
    const addressType = await prisma.address_types.findUnique({
      where: { id },
    });
    return addressType;
  } catch (error) {
    console.error("Error retrieving address type by ID:", error);
    throw error;
  }
};

/**
 * Update an address type by its ID.
 * @param {bigint} id - The ID of the address type to update.
 * @param {Object} data - The updated data.
 * @param {string} [data.name] - The name of the address type.
 * @param {string} [data.description] - The description of the address type.
 * @returns {Promise<Object>} The updated address type.
 */
const updateAddressType = async (id, data) => {
  try {
    const updatedAddressType = await prisma.address_types.update({
      where: { id },
      data: {
        name: data.name || undefined,
        description: data.description || undefined,
        updated_at: new Date(),
      },
    });
    return updatedAddressType;
  } catch (error) {
    console.error("Error updating address type:", error);
    throw error;
  }
};

/**
 * Soft delete an address type by its ID.
 * @param {bigint} id - The ID of the address type to delete.
 * @returns {Promise<Object>} The deleted address type.
 */
const deleteAddressType = async (id) => {
  try {
    const deletedAddressType = await prisma.address_types.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
    return deletedAddressType;
  } catch (error) {
    console.error("Error deleting address type:", error);
    throw error;
  }
};

module.exports = {
  handler,
};
