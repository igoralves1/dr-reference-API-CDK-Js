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
    if (path.startsWith("/professionals")) {
      return await handleProfessionalsRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleProfessionalsRoutes = async (httpMethod, pathParameters, body) => {
  const id = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (id) {
        const professional = await getProfessionalById(id, prisma);
        return professional
          ? responses._200(professional)
          : responses._404({ error: "Professional not found" });
      }
      const professionals = await getProfessionals(prisma);
      return responses._200(professionals);

    case "POST":
      const newProfessional = await createProfessional(body, prisma);
      return responses._200(newProfessional);

    case "PUT":
      if (!id) {
        return responses._400({ error: "Professional ID is required" });
      }
      const updatedProfessional = await updateProfessional(id, body, prisma);
      return updatedProfessional
        ? responses._200(updatedProfessional)
        : responses._404({ error: "Professional not found" });

    case "DELETE":
      if (!id) {
        return responses._400({ error: "Professional ID is required" });
      }
      const deletedProfessional = await deleteProfessional(id, prisma);
      return deletedProfessional
        ? responses._204()
        : responses._404({ error: "Professional not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
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
  handler,
};
