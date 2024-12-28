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
  logger.log("QuizzesHandler event: ", event);

  const { path, httpMethod, pathParameters, body: rawBody } = event;
  const body = rawBody ? JSON.parse(rawBody) : {};

  try {
    if (path.startsWith("/quizzes")) {
      return await handleQuizzesRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found in QuizzesHandler" });
  } catch (error) {
    console.error("QuizzesHandler Error: ", error);
    return responses._500({ error: error.message });
  }
};

const handleQuizzesRoutes = async (method, pathParameters, data) => {
  const quizId = pathParameters?.quizId
    ? BigInt(pathParameters.quizId)
    : undefined;

  switch (method) {
    case "GET":
      if (quizId) {
        return await getQuizById(quizId);
      } else {
        return await getAllQuizzes();
      }

    case "POST":
      return await createQuiz(data);

    case "PUT":
      if (!quizId) {
        return responses._400({ error: "Quiz ID is required for update" });
      }
      return await updateQuiz(quizId, data);

    case "DELETE":
      if (!quizId) {
        return responses._400({ error: "Quiz ID is required for delete" });
      }
      return await deleteQuiz(quizId);

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

// ============ GET ALL QUIZZES ============
const getAllQuizzes = async () => {
  try {
    const quizzes = await prisma.quizzes.findMany({
      include: {
        user_responses: true,
      },
      orderBy: { id: "desc" },
    });
    return responses._200(quizzes);
  } catch (error) {
    console.error("Error retrieving quizzes:", error);
    return responses._500({ error: "Failed to retrieve quizzes." });
  }
};

// ============ GET QUIZ BY ID ============
const getQuizById = async (quizId) => {
  try {
    const quiz = await prisma.quizzes.findUnique({
      where: { id: quizId },
      include: {
        user_responses: {
          include: {
            questions: true,
          },
        },
      },
    });
    if (!quiz) {
      return responses._404({ error: "Quiz not found" });
    }
    return responses._200(quiz);
  } catch (error) {
    console.error("Error retrieving quiz:", error);
    return responses._500({ error: "Failed to retrieve quiz." });
  }
};

// ============ CREATE QUIZ ============
const createQuiz = async (data) => {
  try {
    const newQuiz = await prisma.quizzes.create({
      data,
    });
    return responses._201(newQuiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    return responses._500({ error: "Failed to create quiz." });
  }
};

// ============ UPDATE QUIZ ============
const updateQuiz = async (quizId, data) => {
  try {
    const updated = await prisma.quizzes.update({
      where: { id: quizId },
      data,
      include: {
        user_responses: true,
      },
    });
    return responses._200(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return responses._404({ error: "Quiz not found" });
    } else {
      console.error("Error updating quiz:", error);
      return responses._500({ error: "Failed to update quiz." });
    }
  }
};

// ============ DELETE QUIZ ============
const deleteQuiz = async (quizId) => {
  try {
    const deleted = await prisma.quizzes.delete({
      where: { id: quizId },
    });
    return responses._204();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return responses._404({ error: "Quiz not found" });
    } else {
      console.error("Error deleting quiz:", error);
      return responses._500({ error: "Failed to delete quiz." });
    }
  }
};

module.exports = {
  handler,
};
