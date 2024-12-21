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
    if (path.startsWith("/professions")) {
      return await handleProfessionsRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};

const handleProfessionsRoutes = async (httpMethod, pathParameters, body) => {
  const professionId = pathParameters?.professionId
    ? BigInt(pathParameters.professionId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (professionId) {
        const profession = await getProfessionById(professionId, prisma);
        return profession
          ? responses._200(profession)
          : responses._404({ error: "Profession not found" });
      }
      const professions = await getAllProfessions(prisma);
      return responses._200(professions);

    case "POST":
      const newProfession = await createProfession(body, prisma);
      return responses._201(newProfession);

    case "PUT":
      if (!professionId) {
        return responses._400({ error: "Profession ID is required" });
      }
      const updatedProfession = await updateProfession(
        professionId,
        body,
        prisma
      );
      return updatedProfession
        ? responses._200(updatedProfession)
        : responses._404({ error: "Profession not found" });

    case "DELETE":
      if (!professionId) {
        return responses._400({ error: "Profession ID is required" });
      }
      const deletedProfession = await deleteProfession(professionId, prisma);
      return deletedProfession
        ? responses._204()
        : responses._404({ error: "Profession not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Create a new Profession.
 * @param {Object} data - Profession data.
 * @param {bigint} data.language_id - Language ID.
 * @param {string} [data.name] - Name of the profession.
 * @param {string} [data.science] - Science related to the profession.
 * @param {string} [data.acronym] - Acronym of the profession.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object>} The created profession record.
 * @throws {Error} If the creation fails.
 */
const createProfession = async (data, prisma) => {
  try {
    const profession = await prisma.professions.create({
      data: {
        ...data,
        created_at: new Date(),
      },
    });
    return profession;
  } catch (error) {
    console.error("Error creating profession:", error);
    throw new Error("Failed to create profession.");
  }
};

/**
 * Get a Profession by ID.
 * @param {bigint} id - Profession ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object|null>} The profession record or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getProfessionById = async (id, prisma) => {
  try {
    const profession = await prisma.professions.findUnique({
      where: { id },
    });
    if (!profession) {
      throw new Error(`Profession with ID ${id} not found.`);
    }
    return profession;
  } catch (error) {
    console.error("Error retrieving profession by ID:", error);
    throw new Error("Failed to retrieve profession.");
  }
};

/**
 * Get all Professions.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<Object>>} List of all professions.
 * @throws {Error} If retrieval fails.
 */
const getAllProfessions = async (prisma) => {
  try {
    const professions = await prisma.professions.findMany();
    return professions;
  } catch (error) {
    console.error("Error retrieving professions:", error);
    throw new Error("Failed to retrieve professions.");
  }
};

/**
 * Update a Profession by ID.
 * @param {bigint} id - Profession ID.
 * @param {Object} data - Updated profession data.
 * @param {bigint} [data.language_id] - Updated Language ID.
 * @param {string} [data.name] - Updated name.
 * @param {string} [data.science] - Updated science field.
 * @param {string} [data.acronym] - Updated acronym.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object|null>} The updated profession record or null if not found.
 * @throws {Error} If update fails.
 */
const updateProfession = async (id, data, prisma) => {
  try {
    const profession = await prisma.professions.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return profession;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error("Error updating profession: Record not found");
      throw new Error(`Profession with ID ${id} not found.`);
    } else {
      console.error("Error updating profession:", error);
      throw new Error("Failed to update profession.");
    }
  }
};

/**
 * Delete a Profession by ID.
 * @param {bigint} id - Profession ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object|null>} The deleted profession record or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteProfession = async (id, prisma) => {
  try {
    const profession = await prisma.professions.delete({
      where: { id },
    });
    return profession;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error("Error deleting profession: Record not found");
      throw new Error(`Profession with ID ${id} not found.`);
    } else {
      console.error("Error deleting profession:", error);
      throw new Error("Failed to delete profession.");
    }
  }
};

module.exports = {
  handler,
};
