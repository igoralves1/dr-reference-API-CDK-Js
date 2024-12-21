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
    if (path.startsWith("/references")) {
      return await handleReferencesRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleReferencesRoutes = async (httpMethod, pathParameters, body) => {
  const id = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (id) {
        const reference = await getReferenceById(id, prisma);
        return reference
          ? responses._200(reference)
          : responses._404({ error: "Reference not found" });
      }
      const references = await getReferences(prisma);
      return responses._200(references);

    case "POST":
      const newReference = await createReference(body, prisma);
      return responses._200(newReference);

    case "PUT":
      if (!id) {
        return responses._400({ error: "Reference ID is required" });
      }
      const updatedReference = await updateReference(id, body, prisma);
      return updatedReference
        ? responses._200(updatedReference)
        : responses._404({ error: "Reference not found" });

    case "DELETE":
      if (!id) {
        return responses._400({ error: "Reference ID is required" });
      }
      const deletedReference = await deleteReference(id, prisma);
      return deletedReference
        ? responses._204()
        : responses._404({ error: "Reference not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

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
  handler,
};
