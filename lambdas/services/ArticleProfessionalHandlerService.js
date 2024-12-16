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
  addProfessionalToArticle,
  getAllArticleProfessionals,
  getArticleProfessionalByIds,
  updateArticleProfessional,
  deleteArticleProfessional,
};
