const {
  createPrismaClient,
} = require("../../layers/api_prisma_layer/nodejs/api_prisma_layer");
const logger = require("../../utils/logger");
const responses = require("../../utils/api_responses");
const { Prisma } = require("@prisma/client");

const prisma = createPrismaClient();

BigInt.prototype.toJSON = function () {
  return Number(this);
};

const handler = async (event) => {
  logger.log("QuestionsHandler event: ", event);

  const { path, httpMethod, pathParameters, body: requestBody } = event;
  const body = requestBody ? JSON.parse(requestBody) : {};

  const topicId = pathParameters?.topicId
    ? BigInt(pathParameters.topicId)
    : undefined;
  const questionId = pathParameters?.questionId
    ? BigInt(pathParameters.questionId)
    : undefined;

  try {
    if (path.match(/^\/topics\/\d+\/questions(\/\d+)?/)) {
      return await handleQuestionsRoutes(httpMethod, topicId, questionId, body);
    }

    return responses._400({ error: "Route not found in QuestionsHandler" });
  } catch (error) {
    console.error("QuestionsHandler Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};

const handleQuestionsRoutes = async (method, topicId, questionId, data) => {
  switch (method) {
    case "GET":
      if (questionId) {
        return await getSingleQuestion(topicId, questionId);
      } else {
        return await getAllQuestionsForTopic(topicId);
      }

    case "POST":
      return await createQuestionForTopic(topicId, data);

    case "PUT":
      if (!questionId) {
        return responses._400({ error: "Question ID is required" });
      }
      return await updateQuestion(topicId, questionId, data);

    case "DELETE":
      if (!questionId) {
        return responses._400({ error: "Question ID is required" });
      }
      return await deleteQuestion(topicId, questionId);

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const getAllQuestionsForTopic = async (topicId) => {
  try {
    const questions = await prisma.questions.findMany({
      where: { topic_id: topicId },
      include: {
        question_images: true,
        question_options: true,
      },
      orderBy: { id: "asc" },
    });
    return responses._200(questions);
  } catch (error) {
    console.error("Error in getAllQuestionsForTopic:", error);
    return responses._500({ error: "Failed to retrieve questions." });
  }
};

const getSingleQuestion = async (topicId, questionId) => {
  try {
    const question = await prisma.questions.findFirst({
      where: {
        id: questionId,
        topic_id: topicId,
      },
      include: {
        question_images: true,
        question_options: true,
      },
    });
    if (!question) {
      return responses._404({ error: "Question not found" });
    }
    return responses._200(question);
  } catch (error) {
    console.error("Error in getSingleQuestion:", error);
    return responses._500({ error: "Failed to retrieve the question." });
  }
};

const createQuestionForTopic = async (topicId, data) => {
  try {
    console.log("data = ", data);
    const { images = [], options = [], ...rest } = data;

    const sanitizedImages = images.map(({ id, ...image }) => image);
    const sanitizedOptions = options.map(({ id, ...option }) => option);

    const question = await prisma.questions.create({
      data: {
        topic_id: topicId,
        ...rest,
        created_at: new Date(),
        question_images: {
          create: sanitizedImages,
        },
        question_options: {
          create: sanitizedOptions,
        },
      },
      include: {
        question_images: true,
        question_options: true,
      },
    });
    return responses._201(question);
  } catch (error) {
    console.error("Error in createQuestionForTopic:", error);
    return responses._500({ error: "Failed to create question." });
  }
};

const updateQuestion = async (topicId, questionId, data) => {
  try {
    const { images, options, ...rest } = data;

    if (typeof images !== "undefined") {
      await prisma.question_images.deleteMany({
        where: { question_id: questionId },
      });
    }
    if (typeof options !== "undefined") {
      await prisma.question_options.deleteMany({
        where: { question_id: questionId },
      });
    }

    const updated = await prisma.questions.updateMany({
      where: {
        id: questionId,
        topic_id: topicId,
      },
      data: {
        ...rest,
        updated_at: new Date(),
      },
    });

    if (updated.count === 0) {
      return responses._404({ error: "Question not found" });
    }

    if (images) {
      for (const img of images) {
        await prisma.question_images.create({
          data: {
            question_id: questionId,
            ...img,
          },
        });
      }
    }
    if (options) {
      for (const opt of options) {
        await prisma.question_options.create({
          data: {
            question_id: questionId,
            ...opt,
          },
        });
      }
    }

    const question = await prisma.questions.findFirst({
      where: { id: questionId, topic_id: topicId },
      include: {
        question_images: true,
        question_options: true,
      },
    });

    return responses._200(question);
  } catch (error) {
    console.error("Error in updateQuestion:", error);
    return responses._500({ error: "Failed to update question." });
  }
};

const deleteQuestion = async (topicId, questionId) => {
  try {
    const deleted = await prisma.questions.deleteMany({
      where: { id: questionId, topic_id: topicId },
    });
    if (deleted.count === 0) {
      return responses._404({ error: "Question not found" });
    }
    return responses._204();
  } catch (error) {
    console.error("Error in deleteQuestion:", error);
    return responses._500({ error: "Failed to delete question." });
  }
};

module.exports = { handler };
