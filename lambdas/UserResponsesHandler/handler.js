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
  logger.log("UserResponsesHandler event: ", event);

  const { path, httpMethod, pathParameters, body: rawBody } = event;
  const body = rawBody ? JSON.parse(rawBody) : {};

  try {
    if (path.startsWith("/user-responses")) {
      return await handleUserResponsesRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found in UserResponsesHandler" });
  } catch (error) {
    console.error("UserResponsesHandler Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};

const handleUserResponsesRoutes = async (method, pathParameters, data) => {
  const responseId = pathParameters?.responseId
    ? BigInt(pathParameters.responseId)
    : undefined;

  switch (method) {
    case "GET":
      if (responseId) {
        return await getSingleUserResponse(responseId);
      } else {
        return await getAllUserResponses();
      }

    case "POST":
      return await createUserResponse(data);

    case "PUT":
      if (!responseId) {
        return responses._400({ error: "Response ID is required for update" });
      }
      return await updateUserResponse(responseId, data);

    case "DELETE":
      if (!responseId) {
        return responses._400({ error: "Response ID is required for delete" });
      }
      return await deleteUserResponse(responseId);

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const getAllUserResponses = async () => {
  try {
    const userResponses = await prisma.user_responses.findMany({
      include: {
        questions: {
          include: {
            question_options: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });
    return responses._200(userResponses);
  } catch (error) {
    console.error("Error fetching user responses:", error);
    return responses._500({ error: "Failed to retrieve user responses." });
  }
};

const getSingleUserResponse = async (responseId) => {
  try {
    const userResponse = await prisma.user_responses.findUnique({
      where: { id: responseId },
      include: {
        questions: {
          include: {
            question_options: true,
          },
        },
      },
    });
    if (!userResponse) {
      return responses._404({ error: "User response not found" });
    }
    return responses._200(userResponse);
  } catch (error) {
    console.error("Error fetching user response:", error);
    return responses._500({ error: "Failed to retrieve user response." });
  }
};

const createUserResponse = async (data) => {
  try {
    const {
      user_id,
      quiz_id,
      question_id,
      selected_option_id,
      time_taken = 0,
      feedback = null,
    } = data;

    const newResponse = await prisma.user_responses.create({
      data: {
        user_id: user_id ? BigInt(user_id) : null,
        quiz_id: quiz_id ? BigInt(quiz_id) : null,
        question_id: BigInt(question_id),
        selected_option_id: selected_option_id
          ? BigInt(selected_option_id)
          : null,
        time_taken,
        feedback,
      },
    });

    if (selected_option_id) {
      await prisma.question_options.update({
        where: { id: BigInt(selected_option_id) },
        data: {
          usage_count: { increment: 1 },
        },
      });
    }

    return responses._201(newResponse);
  } catch (error) {
    console.error("Error creating user response:", error);
    return responses._500({ error: "Failed to create user response." });
  }
};

const updateUserResponse = async (responseId, data) => {
  try {
    const updated = await prisma.user_responses.update({
      where: { id: responseId },
      data: {
        ...data,
      },
    });

    return responses._200(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return responses._404({ error: "User response not found" });
    } else {
      console.error("Error updating user response:", error);
      return responses._500({ error: "Failed to update user response." });
    }
  }
};

const deleteUserResponse = async (responseId) => {
  try {
    const deleted = await prisma.user_responses.delete({
      where: { id: responseId },
    });
    return responses._204();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return responses._404({ error: "User response not found" });
    } else {
      console.error("Error deleting user response:", error);
      return responses._500({ error: "Failed to delete user response." });
    }
  }
};

module.exports = {
  handler,
};
