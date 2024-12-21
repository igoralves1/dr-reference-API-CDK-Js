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
    if (path.startsWith("/cell-phones")) {
      return await handleCellPhoneRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleCellPhoneRoutes = async (httpMethod, pathParameters, body) => {
  const cellPhoneId = pathParameters?.id
    ? BigInt(pathParameters.id)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (cellPhoneId) {
        const cellPhone = await getCellPhoneById(cellPhoneId, prisma);
        return cellPhone
          ? responses._200(cellPhone)
          : responses._404({ error: "Cell phone not found" });
      }
      const cellPhones = await getCellPhones(prisma);
      return responses._200(cellPhones);

    case "POST":
      const newCellPhone = await createCellPhone(body, prisma);
      return responses._200(newCellPhone);

    case "PUT":
      if (!cellPhoneId) {
        return responses._400({ error: "Cell phone ID is required" });
      }
      const updatedCellPhone = await updateCellPhone(cellPhoneId, body, prisma);
      return updatedCellPhone
        ? responses._200(updatedCellPhone)
        : responses._404({ error: "Cell phone not found" });

    case "DELETE":
      if (!cellPhoneId) {
        return responses._400({ error: "Cell phone ID is required" });
      }
      const deletedCellPhone = await deleteCellPhone(cellPhoneId, prisma);
      return deletedCellPhone
        ? responses._204()
        : responses._404({ error: "Cell phone not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new cell phone.
 * @param {Object} data - The data for the new cell phone.
 * @param {bigint} data.address_id - The ID of the address associated with the cell phone.
 * @param {string} data.number - The cell phone number.
 * @param {string} [data.note] - Optional note about the cell phone.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created cell phone record.
 */
const createCellPhone = async (data, prisma) => {
  try {
    const cellPhone = await prisma.cell_phones.create({
      data: {
        address_id: data.address_id,
        number: data.number,
        note: data.note || null,
        created_at: new Date(),
      },
    });
    return cellPhone;
  } catch (error) {
    console.error("Error creating cell phone:", error);
    throw new Error("Failed to create cell phone.");
  }
};

/**
 * Get all cell phones.
 * Excludes soft-deleted records.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} List of cell phone records.
 */
const getCellPhones = async (prisma) => {
  try {
    const cellPhones = await prisma.cell_phones.findMany({
      where: {
        deleted_at: null, // Exclude soft-deleted records
      },
      include: {
        addresses: true, // Include related address information
      },
    });
    return cellPhones;
  } catch (error) {
    console.error("Error retrieving cell phones:", error);
    throw new Error("Failed to retrieve cell phones.");
  }
};

/**
 * Get a specific cell phone by its ID.
 * Excludes soft-deleted records.
 * @param {bigint} id - The ID of the cell phone.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The cell phone record, or null if not found or soft-deleted.
 */
const getCellPhoneById = async (id, prisma) => {
  try {
    const cellPhone = await prisma.cell_phones.findFirst({
      where: {
        id,
        deleted_at: null, // Exclude soft-deleted records
      },
      include: {
        addresses: true, // Include related address information
      },
    });
    return cellPhone;
  } catch (error) {
    console.error("Error retrieving cell phone by ID:", error);
    throw new Error("Failed to retrieve cell phone by ID.");
  }
};

/**
 * Update a cell phone by its ID.
 * Only updates if the cell phone is not soft-deleted.
 * @param {bigint} id - The ID of the cell phone to update.
 * @param {Object} data - The updated data for the cell phone.
 * @param {bigint} [data.address_id] - The updated address ID.
 * @param {string} [data.number] - The updated cell phone number.
 * @param {string} [data.note] - The updated note.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The updated cell phone record, or null if not found or soft-deleted.
 */
const updateCellPhone = async (id, data, prisma) => {
  try {
    const updatedCellPhone = await prisma.cell_phones.updateMany({
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

    if (updatedCellPhone.count === 0) {
      return null; // No matching record found for update
    }

    return await getCellPhoneById(id, prisma); // Return the updated record
  } catch (error) {
    console.error("Error updating cell phone:", error);
    throw new Error("Failed to update cell phone.");
  }
};

/**
 * Soft delete a cell phone by its ID.
 * @param {bigint} id - The ID of the cell phone to delete.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object|null>} The soft-deleted cell phone record, or null if not found or already soft-deleted.
 */
const deleteCellPhone = async (id, prisma) => {
  try {
    const deletedCellPhone = await prisma.cell_phones.updateMany({
      where: {
        id,
        deleted_at: null, // Only delete if the record is not already soft-deleted
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return deletedCellPhone; // Return the soft-deleted record
  } catch (error) {
    console.error("Error deleting cell phone:", error);
    throw new Error("Failed to delete cell phone.");
  }
};

module.exports = {
  handler,
};
