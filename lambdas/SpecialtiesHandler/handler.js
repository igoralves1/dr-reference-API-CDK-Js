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
    if (path.startsWith("/specialties")) {
      return await handleSpecialtiesRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};

const handleSpecialtiesRoutes = async (httpMethod, pathParameters, body) => {
  const id = pathParameters?.id ? BigInt(pathParameters.id) : undefined;
  const professionId = pathParameters?.professionId
    ? BigInt(pathParameters.professionId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (id) {
        const specialty = await getSpecialtyById(id, prisma);
        return specialty
          ? responses._200(specialty)
          : responses._404({ error: "Specialty not found" });
      }
      if (professionId) {
        const specialties = await getSpecialtiesByProfessionId(
          professionId,
          prisma
        );
        return responses._200(specialties);
      }
      const allSpecialties = await getAllSpecialties(prisma);
      return responses._200(allSpecialties);

    case "POST":
      const newSpecialty = await createSpecialty(body, prisma);
      return responses._200(newSpecialty);

    case "PUT":
      if (!id) {
        return responses._400({ error: "Specialty ID is required" });
      }
      const updatedSpecialty = await updateSpecialty(id, body, prisma);
      return updatedSpecialty
        ? responses._200(updatedSpecialty)
        : responses._404({ error: "Specialty not found" });

    case "DELETE":
      if (!id) {
        return responses._400({ error: "Specialty ID is required" });
      }
      const deletedSpecialty = await deleteSpecialty(id, prisma);
      return deletedSpecialty
        ? responses._204()
        : responses._404({ error: "Specialty not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new Specialty.
 * @param {object} data - Specialty data.
 * @param {bigint} data.profession_id - Profession ID.
 * @param {string} data.name - Specialty name.
 * @returns {Promise<object>} The created specialty.
 * @throws {Error} If the creation fails.
 */
const createSpecialty = async (data) => {
  try {
    const specialty = await prisma.specialties.create({
      data: {
        profession_id: data.profession_id,
        name: data.name,
        created_at: new Date(),
      },
    });
    return specialty;
  } catch (error) {
    console.error("Error creating specialty:", error);
    throw new Error("Failed to create specialty.");
  }
};

/**
 * Get all Specialties.
 * @returns {Promise<Array<object>>} List of specialties.
 * @throws {Error} If retrieval fails.
 */
const getAllSpecialties = async () => {
  try {
    const specialties = await prisma.specialties.findMany();
    return specialties;
  } catch (error) {
    console.error("Error retrieving specialties:", error);
    throw new Error("Failed to retrieve specialties.");
  }
};

/**
 * Get a Specialty by ID.
 * @param {bigint} id - Specialty ID.
 * @returns {Promise<object|null>} The specialty or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getSpecialtyById = async (id) => {
  try {
    const specialty = await prisma.specialties.findUnique({
      where: { id },
    });
    return specialty;
  } catch (error) {
    console.error("Error retrieving specialty by ID:", error);
    throw new Error("Failed to retrieve specialty.");
  }
};

/**
 * Get all Specialties by Profession ID.
 * @param {bigint} profession_id - Profession ID.
 * @returns {Promise<Array<object>>} List of specialties.
 * @throws {Error} If retrieval fails.
 */
const getSpecialtiesByProfessionId = async (profession_id) => {
  try {
    const specialties = await prisma.specialties.findMany({
      where: { profession_id },
    });
    return specialties;
  } catch (error) {
    console.error("Error retrieving specialties by profession ID:", error);
    throw new Error("Failed to retrieve specialties.");
  }
};

/**
 * Update a Specialty by ID.
 * @param {bigint} id - Specialty ID.
 * @param {object} data - Updated data.
 * @param {string} [data.name] - Updated specialty name.
 * @param {bigint} [data.profession_id] - Updated profession ID.
 * @returns {Promise<object|null>} The updated specialty or null if not found.
 * @throws {Error} If update fails.
 */
const updateSpecialty = async (id, data) => {
  try {
    const specialty = await prisma.specialties.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return specialty;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error("Error updating specialty: Record not found");
      throw new Error(`Specialty with ID ${id} not found.`);
    } else {
      console.error("Error updating specialty:", error);
      throw new Error("Failed to update specialty.");
    }
  }
};

/**
 * Delete a Specialty by ID.
 * @param {bigint} id - Specialty ID.
 * @returns {Promise<object|null>} The deleted specialty or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteSpecialty = async (id) => {
  try {
    const specialty = await prisma.specialties.delete({
      where: { id },
    });
    return specialty;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.error("Error deleting specialty: Record not found");
      throw new Error(`Specialty with ID ${id} not found.`);
    } else {
      console.error("Error deleting specialty:", error);
      throw new Error("Failed to delete specialty.");
    }
  }
};

module.exports = {
  handler,
};
