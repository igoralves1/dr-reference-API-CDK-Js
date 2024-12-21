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
    if (path.startsWith("/professional-specialty")) {
      return await handleProfessionalSpecialtyRoutes(
        httpMethod,
        pathParameters,
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

const handleProfessionalSpecialtyRoutes = async (
  httpMethod,
  pathParameters,
  body
) => {
  const professionalId = pathParameters?.professionalId
    ? BigInt(pathParameters.professionalId)
    : undefined;
  const specialtyId = pathParameters?.specialtyId
    ? BigInt(pathParameters.specialtyId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (professionalId && specialtyId) {
        const relationship = await getProfessionalSpecialtyByIds(
          professionalId,
          specialtyId,
          prisma
        );
        return relationship
          ? responses._200(relationship)
          : responses._404({
              error: "Professional-Specialty relationship not found",
            });
      }
      const allRelationships = await getProfessionalSpecialties(prisma);
      return responses._200(allRelationships);

    case "POST":
      const newRelationship = await createProfessionalSpecialty(body, prisma);
      return responses._201(newRelationship);

    case "PUT":
      if (!professionalId || !specialtyId) {
        return responses._400({
          error: "Professional ID and Specialty ID are required",
        });
      }
      const updatedRelationship = await updateProfessionalSpecialty(
        professionalId,
        specialtyId,
        body,
        prisma
      );
      return updatedRelationship
        ? responses._200(updatedRelationship)
        : responses._404({
            error: "Professional-Specialty relationship not found",
          });

    case "DELETE":
      if (!professionalId || !specialtyId) {
        return responses._400({
          error: "Professional ID and Specialty ID are required",
        });
      }
      const deletedRelationship = await deleteProfessionalSpecialty(
        professionalId,
        specialtyId,
        prisma
      );
      return deletedRelationship
        ? responses._204()
        : responses._404({
            error: "Professional-Specialty relationship not found",
          });

    default:
      return responses._405({ error: "Method Not Allowed" });
  }
};

/**
 * Create a new professional-specialty relationship.
 * @param {object} data - ProfessionalSpecialty data.
 * @param {bigint} data.professional_id - Professional ID.
 * @param {bigint} data.specialty_id - Specialty ID.
 * @param {string} [data.permission_identifier] - Permission identifier.
 * @param {Date} [data.start] - Start date of the relationship.
 * @param {Date} [data.end] - End date of the relationship.
 * @param {object} prisma - Prisma client instance.
 * @returns {Promise<object>} The created professional-specialty record.
 * @throws {Error} If the creation fails.
 */
const createProfessionalSpecialty = async (data, prisma) => {
  try {
    const professionalSpecialty = await prisma.professional_specialty.create({
      data: {
        professional_id: data.professional_id,
        specialty_id: data.specialty_id,
        permission_identifier: data.permission_identifier || null,
        start: data.start || null,
        end: data.end || null,
        created_at: new Date(),
      },
    });
    return professionalSpecialty;
  } catch (error) {
    console.error("Error creating professional-specialty relationship:", error);
    throw new Error("Failed to create professional-specialty relationship.");
  }
};

/**
 * Get all professional-specialty relationships.
 * @param {object} prisma - Prisma client instance.
 * @returns {Promise<Array<object>>} List of professional-specialty relationships.
 * @throws {Error} If retrieval fails.
 */
const getProfessionalSpecialties = async (prisma) => {
  try {
    const professionalSpecialties =
      await prisma.professional_specialty.findMany({
        include: {
          professionals: true, // Include related professional information
          specialties: true, // Include related specialty information
        },
      });
    return professionalSpecialties;
  } catch (error) {
    console.error(
      "Error retrieving professional-specialty relationships:",
      error
    );
    throw new Error("Failed to retrieve professional-specialty relationships.");
  }
};

/**
 * Get a specific professional-specialty relationship by IDs.
 * @param {bigint} professional_id - Professional ID.
 * @param {bigint} specialty_id - Specialty ID.
 * @param {object} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The professional-specialty relationship or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getProfessionalSpecialtyByIds = async (
  professional_id,
  specialty_id,
  prisma
) => {
  try {
    const professionalSpecialty =
      await prisma.professional_specialty.findUnique({
        where: {
          professional_id_specialty_id: {
            professional_id,
            specialty_id,
          },
        },
        include: {
          professionals: true, // Include related professional information
          specialties: true, // Include related specialty information
        },
      });
    return professionalSpecialty;
  } catch (error) {
    console.error(
      "Error retrieving professional-specialty relationship by IDs:",
      error
    );
    throw new Error(
      "Failed to retrieve professional-specialty relationship by IDs."
    );
  }
};

/**
 * Update a professional-specialty relationship.
 * @param {bigint} professional_id - Professional ID.
 * @param {bigint} specialty_id - Specialty ID.
 * @param {object} data - Updated professional-specialty data.
 * @param {string} [data.permission_identifier] - Updated permission identifier.
 * @param {Date} [data.start] - Updated start date.
 * @param {Date} [data.end] - Updated end date.
 * @param {object} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The updated professional-specialty relationship or null if not found.
 * @throws {Error} If update fails.
 */
const updateProfessionalSpecialty = async (
  professional_id,
  specialty_id,
  data,
  prisma
) => {
  try {
    const professionalSpecialty = await prisma.professional_specialty.update({
      where: {
        professional_id_specialty_id: {
          professional_id,
          specialty_id,
        },
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return professionalSpecialty;
  } catch (error) {
    console.error("Error updating professional-specialty relationship:", error);
    throw new Error("Failed to update professional-specialty relationship.");
  }
};

/**
 * Delete a professional-specialty relationship.
 * @param {bigint} professional_id - Professional ID.
 * @param {bigint} specialty_id - Specialty ID.
 * @param {object} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The deleted professional-specialty relationship or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteProfessionalSpecialty = async (
  professional_id,
  specialty_id,
  prisma
) => {
  try {
    const professionalSpecialty = await prisma.professional_specialty.delete({
      where: {
        professional_id_specialty_id: {
          professional_id,
          specialty_id,
        },
      },
    });
    return professionalSpecialty;
  } catch (error) {
    console.error("Error deleting professional-specialty relationship:", error);
    throw new Error("Failed to delete professional-specialty relationship.");
  }
};

module.exports = {
  handler,
};
