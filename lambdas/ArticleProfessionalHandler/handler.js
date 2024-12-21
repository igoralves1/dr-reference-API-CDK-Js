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
    if (path.startsWith("/article-professional")) {
      return await handleArticleProfessionalRoutes(
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

const handleArticleProfessionalRoutes = async (
  httpMethod,
  pathParameters,
  body
) => {
  const professionalId = pathParameters?.professionalId
    ? BigInt(pathParameters.professionalId)
    : undefined;
  const articleId = pathParameters?.articleId
    ? BigInt(pathParameters.articleId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (professionalId && articleId) {
        const record = await getArticleProfessionalByIds(
          professionalId,
          articleId,
          prisma
        );
        return record
          ? responses._200(record)
          : responses._404({ error: "Record not found." });
      }
      const allRecords = await getAllArticleProfessionals(prisma);
      return responses._200(allRecords);

    case "POST":
      if (!body.professional_id || !body.article_id) {
        return responses._400({
          error: "Professional ID and Article ID are required.",
        });
      }
      const newRecord = await addProfessionalToArticle(body, prisma);
      return responses._201(newRecord);

    case "PUT":
      if (!professionalId || !articleId) {
        return responses._400({
          error: "Professional ID and Article ID are required.",
        });
      }
      const updatedRecord = await updateArticleProfessional(
        professionalId,
        articleId,
        body,
        prisma
      );
      return updatedRecord
        ? responses._200(updatedRecord)
        : responses._404({ error: "Record not found." });

    case "DELETE":
      if (!professionalId || !articleId) {
        return responses._400({
          error: "Professional ID and Article ID are required.",
        });
      }
      const removedRecord = await deleteArticleProfessional(
        professionalId,
        articleId,
        prisma
      );
      return responses._204(removedRecord);

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Add a Professional to an Article.
 * @param {Object} data - Data to add a professional to an article.
 * @param {bigint} data.professional_id - Professional ID.
 * @param {bigint} data.article_id - Article ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object>} The added professional-article record.
 * @throws {Error} If the operation fails.
 */
const addProfessionalToArticle = async (data, prisma) => {
  try {
    const articleProfessional = await prisma.article_professional.create({
      data: {
        professional_id: data.professional_id,
        article_id: data.article_id,
        created_at: new Date(),
      },
    });
    return articleProfessional;
  } catch (error) {
    console.error("Error adding professional to article:", error);
    throw new Error("Failed to add professional to article.");
  }
};

/**
 * Get all records from the `article_professional` table.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<Object>>} All professional-article records.
 * @throws {Error} If the operation fails.
 */
const getAllArticleProfessionals = async (prisma) => {
  try {
    const records = await prisma.article_professional.findMany();
    return records;
  } catch (error) {
    console.error("Error retrieving all records:", error);
    throw new Error("Failed to retrieve all records.");
  }
};

/**
 * Get a specific record by `professional_id` and `article_id`.
 * @param {bigint} professional_id - Professional ID.
 * @param {bigint} article_id - Article ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object>} The record or null if not found.
 * @throws {Error} If the operation fails.
 */
const getArticleProfessionalByIds = async (
  professional_id,
  article_id,
  prisma
) => {
  try {
    const record = await prisma.article_professional.findUnique({
      where: {
        professional_id_article_id: { professional_id, article_id },
      },
    });
    return record;
  } catch (error) {
    console.error("Error retrieving record:", error);
    throw new Error("Failed to retrieve record.");
  }
};

/**
 * Update a record by `professional_id` and `article_id`.
 * @param {bigint} professional_id - Professional ID.
 * @param {bigint} article_id - Article ID.
 * @param {Object} data - Updated data.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object>} The updated record.
 * @throws {Error} If the operation fails.
 */
const updateArticleProfessional = async (
  professional_id,
  article_id,
  data,
  prisma
) => {
  try {
    const updatedRecord = await prisma.article_professional.update({
      where: {
        professional_id_article_id: { professional_id, article_id },
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return updatedRecord;
  } catch (error) {
    console.error("Error updating record:", error);
    throw new Error("Failed to update record.");
  }
};

/**
 * Remove a Professional from an Article by `professional_id` and `article_id`.
 * @param {bigint} professional_id - Professional ID.
 * @param {bigint} article_id - Article ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Object>} The deleted record.
 * @throws {Error} If the operation fails.
 */
const deleteArticleProfessional = async (
  professional_id,
  article_id,
  prisma
) => {
  try {
    const deletedRecord = await prisma.article_professional.delete({
      where: {
        professional_id_article_id: { professional_id, article_id },
      },
    });
    return deletedRecord;
  } catch (error) {
    console.error("Error deleting record:", error);
    throw new Error("Failed to delete record.");
  }
};

module.exports = {
  handler,
};
