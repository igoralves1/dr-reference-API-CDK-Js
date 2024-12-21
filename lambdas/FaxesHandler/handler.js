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
    if (path.startsWith("/faxes")) {
      return await handleFaxRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleFaxRoutes = async (httpMethod, pathParameters, body) => {
  const faxId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (faxId) {
        const fax = await getFaxById(faxId, prisma);
        return fax
          ? responses._200(fax)
          : responses._404({ error: "Fax not found" });
      }
      const faxes = await getFaxes(prisma);
      return responses._200(faxes);

    case "POST":
      const newFax = await createFax(body, prisma);
      return responses._200(newFax);

    case "PUT":
      if (!faxId) {
        return responses._400({ error: "Fax ID is required" });
      }
      const updatedFax = await updateFax(faxId, body, prisma);
      return updatedFax
        ? responses._200(updatedFax)
        : responses._404({ error: "Fax not found" });

    case "DELETE":
      if (!faxId) {
        return responses._400({ error: "Fax ID is required" });
      }
      const deletedFax = await deleteFax(faxId, prisma);
      return deletedFax
        ? responses._204()
        : responses._404({ error: "Fax not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new fax.
 * @param {Object} data - The data for the new fax.
 * @param {bigint} data.address_id - The ID of the address associated with the fax.
 * @param {string} data.number - The fax number.
 * @param {string} [data.note] - Optional note about the fax.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created fax record.
 */
const createFax = async (data, prisma) => {
  try {
    const fax = await prisma.faxes.create({
      data: {
        address_id: data.address_id,
        number: data.number,
        note: data.note || null,
        created_at: new Date(),
      },
    });
    return fax;
  } catch (error) {
    console.error("Error creating fax:", error);
    throw new Error("Failed to create fax.");
  }
};

/**
 * Get all faxes.
 * Excludes soft-deleted records.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of fax records.
 */
const getFaxes = async (prisma) => {
  try {
    const faxes = await prisma.faxes.findMany({
      where: {
        deleted_at: null, // Exclude soft-deleted records
      },
      include: {
        addresses: true, // Include related address information
      },
    });
    return faxes;
  } catch (error) {
    console.error("Error retrieving faxes:", error);
    throw new Error("Failed to retrieve faxes.");
  }
};

/**
 * Get a specific fax by its ID.
 * Excludes soft-deleted records.
 * @param {bigint} id - The ID of the fax.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The fax record, or null if not found or soft-deleted.
 */
const getFaxById = async (id, prisma) => {
  try {
    const fax = await prisma.faxes.findFirst({
      where: {
        id,
        deleted_at: null, // Exclude soft-deleted records
      },
      include: {
        addresses: true, // Include related address information
      },
    });
    return fax;
  } catch (error) {
    console.error("Error retrieving fax by ID:", error);
    throw new Error("Failed to retrieve fax by ID.");
  }
};

/**
 * Update a fax by its ID.
 * Only updates if the fax is not soft-deleted.
 * @param {bigint} id - The ID of the fax to update.
 * @param {Object} data - The updated data for the fax.
 * @param {bigint} [data.address_id] - The updated address ID.
 * @param {string} [data.number] - The updated fax number.
 * @param {string} [data.note] - The updated note.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The updated fax record, or null if not found or soft-deleted.
 */
const updateFax = async (id, data, prisma) => {
  try {
    const updatedFax = await prisma.faxes.updateMany({
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

    if (updatedFax.count === 0) {
      return null; // No matching record found for update
    }

    return await getFaxById(id, prisma); // Return the updated record
  } catch (error) {
    console.error("Error updating fax:", error);
    throw new Error("Failed to update fax.");
  }
};

/**
 * Soft delete a fax by its ID.
 * @param {bigint} id - The ID of the fax to delete.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The soft-deleted fax record, or null if not found or already soft-deleted.
 */
const deleteFax = async (id, prisma) => {
  try {
    const deletedFax = await prisma.faxes.updateMany({
      where: {
        id,
        deleted_at: null, // Only delete if the record is not already soft-deleted
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return deletedFax; // Return the soft-deleted record
  } catch (error) {
    console.error("Error deleting fax:", error);
    throw new Error("Failed to delete fax.");
  }
};

module.exports = {
  handler,
};
