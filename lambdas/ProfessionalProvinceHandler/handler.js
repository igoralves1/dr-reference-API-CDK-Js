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
    if (path.startsWith("/professional-province")) {
      return await handleProfessionalProvinceRoutes(
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
const handleProfessionalProvinceRoutes = async (
  httpMethod,
  pathParameters,
  body
) => {
  const professionalId = pathParameters?.professionalId
    ? BigInt(pathParameters.professionalId)
    : undefined;
  const provinceId = pathParameters?.provinceId
    ? BigInt(pathParameters.provinceId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (professionalId && provinceId) {
        const professionalProvince = await getProfessionalProvince(
          professionalId,
          provinceId,
          prisma
        );
        return professionalProvince
          ? responses._200(professionalProvince)
          : responses._404({ error: "ProfessionalProvince not found" });
      }
      const allProfessionalProvinces = await getAllProfessionalProvinces(
        prisma
      );
      return responses._200(allProfessionalProvinces);

    case "POST":
      const newProfessionalProvince = await createProfessionalProvince(
        body,
        prisma
      );
      return responses._201(newProfessionalProvince);

    case "PUT":
      if (!professionalId || !provinceId) {
        return responses._400({
          error: "Professional ID and Province ID are required",
        });
      }
      const updatedProfessionalProvince = await updateProfessionalProvince(
        professionalId,
        provinceId,
        body,
        prisma
      );
      return updatedProfessionalProvince
        ? responses._200(updatedProfessionalProvince)
        : responses._404({ error: "ProfessionalProvince not found" });

    case "DELETE":
      if (!professionalId || !provinceId) {
        return responses._400({
          error: "Professional ID and Province ID are required",
        });
      }
      const deletedProfessionalProvince = await deleteProfessionalProvince(
        professionalId,
        provinceId,
        prisma
      );
      return deletedProfessionalProvince
        ? responses._204()
        : responses._404({ error: "ProfessionalProvince not found" });

    default:
      return responses._405({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new ProfessionalProvince association.
 * @param {object} data - Data for the ProfessionalProvince.
 * @param {bigint} data.professional_id - Professional ID.
 * @param {bigint} data.province_id - Province ID.
 * @param {string} [data.permission_identifier] - Permission identifier.
 * @param {number} [data.is_active] - Active status.
 * @param {Date} [data.start] - Start date.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object>} The created ProfessionalProvince record.
 * @throws {Error} If creation fails.
 */
const createProfessionalProvince = async (data, prisma) => {
  try {
    const professionalProvince = await prisma.professional_province.create({
      data: {
        professional_id: data.professional_id,
        province_id: data.province_id,
        permission_identifier: data.permission_identifier || null,
        is_active: data.is_active || 1,
        start: data.start || null,
        created_at: new Date(),
      },
    });
    return professionalProvince;
  } catch (error) {
    console.error("Error creating ProfessionalProvince:", error);
    throw new Error("Failed to create ProfessionalProvince.");
  }
};

/**
 * Get all ProfessionalProvince records.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<object>>} List of ProfessionalProvince records.
 * @throws {Error} If retrieval fails.
 */
const getAllProfessionalProvinces = async (prisma) => {
  try {
    const professionalProvinces = await prisma.professional_province.findMany({
      include: {
        professionals: true,
        provinces: true,
      },
    });
    return professionalProvinces;
  } catch (error) {
    console.error("Error retrieving ProfessionalProvinces:", error);
    throw new Error("Failed to retrieve ProfessionalProvinces.");
  }
};

/**
 * Get a ProfessionalProvince by professional_id and province_id.
 * @param {bigint} professional_id - Professional ID.
 * @param {bigint} province_id - Province ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The ProfessionalProvince record or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getProfessionalProvince = async (
  professional_id,
  province_id,
  prisma
) => {
  try {
    const professionalProvince = await prisma.professional_province.findUnique({
      where: {
        professional_id_province_id: {
          professional_id,
          province_id,
        },
      },
      include: {
        professionals: true,
        provinces: true,
      },
    });
    return professionalProvince;
  } catch (error) {
    console.error("Error retrieving ProfessionalProvince:", error);
    throw new Error("Failed to retrieve ProfessionalProvince.");
  }
};

/**
 * Update a ProfessionalProvince association.
 * @param {bigint} professional_id - Professional ID.
 * @param {bigint} province_id - Province ID.
 * @param {object} data - Data to update.
 * @param {string} [data.permission_identifier] - Updated permission identifier.
 * @param {number} [data.is_active] - Updated active status.
 * @param {Date} [data.start] - Updated start date.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The updated ProfessionalProvince record or null if not found.
 * @throws {Error} If update fails.
 */
const updateProfessionalProvince = async (
  professional_id,
  province_id,
  data,
  prisma
) => {
  try {
    const professionalProvince = await prisma.professional_province.update({
      where: {
        professional_id_province_id: {
          professional_id,
          province_id,
        },
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return professionalProvince;
  } catch (error) {
    console.error("Error updating ProfessionalProvince:", error);
    throw new Error("Failed to update ProfessionalProvince.");
  }
};

/**
 * Delete a ProfessionalProvince association.
 * @param {bigint} professional_id - Professional ID.
 * @param {bigint} province_id - Province ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The deleted ProfessionalProvince record or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteProfessionalProvince = async (
  professional_id,
  province_id,
  prisma
) => {
  try {
    const professionalProvince = await prisma.professional_province.delete({
      where: {
        professional_id_province_id: {
          professional_id,
          province_id,
        },
      },
    });
    return professionalProvince;
  } catch (error) {
    console.error("Error deleting ProfessionalProvince:", error);
    throw new Error("Failed to delete ProfessionalProvince.");
  }
};

module.exports = {
  handler,
};
