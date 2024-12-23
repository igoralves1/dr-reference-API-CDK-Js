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
    if (path.startsWith("/addresses")) {
      return await handleAddressRoutes(httpMethod, pathParameters?.id, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};

const handleAddressRoutes = async (httpMethod, addressId, body) => {
  switch (httpMethod) {
    case "GET":
      if (addressId) {
        const id = BigInt(addressId);
        const address = await getAddressById(id);
        return address
          ? responses._200(address)
          : responses._400({ error: "Address not found" });
      } else {
        const addresses = await getAddresses();
        return responses._200(addresses);
      }

    case "POST":
      const newAddress = await createAddress(body);
      return responses._200(newAddress);

    case "PUT":
      if (!addressId)
        return responses._400({ error: "Address ID is required" });
      const idToUpdate = BigInt(addressId);
      const updatedAddress = await updateAddress(idToUpdate, body);
      return updatedAddress
        ? responses._200(updatedAddress)
        : responses._400({ error: "Address not found" });

    case "DELETE":
      if (!addressId)
        return responses._400({ error: "Address ID is required" });
      const idToDelete = BigInt(addressId);
      const deletedAddress = await deleteAddress(idToDelete);
      return deletedAddress
        ? responses._204()
        : responses._400({ error: "Address not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new address.
 * @param {Object} data - The data for the new address.
 * @param {bigint} data.city_id - The city ID.
 * @param {bigint} data.address_type_id - The address type ID.
 * @param {string} [data.nb_civic] - The civic number.
 * @param {string} [data.nb_room] - The room number.
 * @param {string} [data.nb_office] - The office number.
 * @param {string} data.name - The name of the address.
 * @param {string} data.street - The street name.
 * @param {string} [data.zip] - The ZIP code.
 * @param {string} [data.complement] - The complement.
 * @param {string} [data.description] - The description of the address.
 * @param {number} [data.lat] - The latitude.
 * @param {number} [data.long] - The longitude.
 * @returns {Promise<Object>} The created address.
 */
const createAddress = async (data) => {
  try {
    const address = await prisma.addresses.create({
      data: {
        city_id: data.city_id,
        address_type_id: data.address_type_id,
        nb_civic: data.nb_civic || null,
        nb_room: data.nb_room || null,
        nb_office: data.nb_office || null,
        name: data.name,
        street: data.street,
        zip: data.zip || null,
        complement: data.complement || null,
        description: data.description || null,
        lat: data.lat || null,
        long: data.long || null,
        created_at: new Date(),
      },
    });
    return address;
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
};

/**
 * Get all addresses.
 * @returns {Promise<Object[]>} The list of addresses.
 */
const getAddresses = async () => {
  try {
    const addresses = await prisma.addresses.findMany({
      include: {
        cities: true,
        address_types: true,
      },
    });
    return addresses;
  } catch (error) {
    console.error("Error retrieving addresses:", error);
    throw error;
  }
};

/**
 * Get a specific address by ID.
 * @param {bigint} id - The ID of the address.
 * @returns {Promise<Object|null>} The address, or null if not found.
 */
const getAddressById = async (id) => {
  try {
    const address = await prisma.addresses.findUnique({
      where: { id },
      include: {
        cities: true,
        address_types: true,
      },
    });
    return address;
  } catch (error) {
    console.error("Error retrieving address by ID:", error);
    throw error;
  }
};

/**
 * Update an address by its ID.
 * @param {bigint} id - The ID of the address to update.
 * @param {Object} data - The updated address data.
 * @param {bigint} [data.city_id] - The city ID.
 * @param {bigint} [data.address_type_id] - The address type ID.
 * @param {string} [data.nb_civic] - The civic number.
 * @param {string} [data.nb_room] - The room number.
 * @param {string} [data.nb_office] - The office number.
 * @param {string} [data.name] - The name of the address.
 * @param {string} [data.street] - The street name.
 * @param {string} [data.zip] - The ZIP code.
 * @param {string} [data.complement] - The complement.
 * @param {string} [data.description] - The description of the address.
 * @param {number} [data.lat] - The latitude.
 * @param {number} [data.long] - The longitude.
 * @returns {Promise<Object>} The updated address.
 */
const updateAddress = async (id, data) => {
  try {
    const updatedAddress = await prisma.addresses.update({
      where: { id },
      data: {
        city_id: data.city_id || undefined,
        address_type_id: data.address_type_id || undefined,
        nb_civic: data.nb_civic || undefined,
        nb_room: data.nb_room || undefined,
        nb_office: data.nb_office || undefined,
        name: data.name || undefined,
        street: data.street || undefined,
        zip: data.zip || undefined,
        complement: data.complement || undefined,
        description: data.description || undefined,
        lat: data.lat || undefined,
        long: data.long || undefined,
        updated_at: new Date(),
      },
    });
    return updatedAddress;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

/**
 * Soft delete an address by its ID.
 * @param {bigint} id - The ID of the address to delete.
 * @returns {Promise<Object>} The deleted address.
 */
const deleteAddress = async (id) => {
  try {
    const deletedAddress = await prisma.addresses.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
    return deletedAddress;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

module.exports = {
  handler,
};
