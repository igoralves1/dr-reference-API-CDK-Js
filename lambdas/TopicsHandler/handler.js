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
  logger.log("TopicsHandler event: ", event);

  const { path, httpMethod, pathParameters, body: rawBody } = event;
  const body = rawBody ? JSON.parse(rawBody) : {};

  try {
    if (path.startsWith("/topics")) {
      return await handleTopicsRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found in TopicsHandler" });
  } catch (error) {
    console.error("TopicsHandler Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};

const handleTopicsRoutes = async (method, pathParameters, data) => {
  const topicId = pathParameters?.topicId
    ? BigInt(pathParameters.topicId)
    : undefined;

  switch (method) {
    case "GET":
      if (topicId) {
        const topic = await getTopicById(topicId);
        return topic
          ? responses._200(topic)
          : responses._404({ error: "Topic not found" });
      } else {
        return await getAllTopics();
      }

    case "POST":
      return await createTopic(data);

    case "PUT":
      if (!topicId) {
        return responses._400({ error: "Topic ID is required for update" });
      }
      return await updateTopic(topicId, data);

    case "DELETE":
      if (!topicId) {
        return responses._400({ error: "Topic ID is required for delete" });
      }
      return await deleteTopic(topicId);

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const getAllTopics = async () => {
  try {
    const topics = await prisma.topics.findMany({
      include: {
        questions: true,
      },
      orderBy: { id: "asc" },
    });
    return responses._200(topics);
  } catch (error) {
    console.error("Error getting all topics:", error);
    return responses._500({ error: "Failed to retrieve topics." });
  }
};

const getTopicById = async (topicId) => {
  try {
    const topic = await prisma.topics.findUnique({
      where: { id: topicId },
      include: {
        questions: true,
      },
    });
    if (!topic) return null;
    return topic;
  } catch (error) {
    console.error("Error getting topic:", error);
    throw new Error("Failed to get topic.");
  }
};

const createTopic = async (data) => {
  try {
    const topic = await prisma.topics.create({
      data: {
        ...data,
      },
    });
    return responses._201(topic);
  } catch (error) {
    console.error("Error creating topic:", error);
    return responses._500({ error: "Failed to create topic." });
  }
};

const updateTopic = async (topicId, data) => {
  try {
    const updated = await prisma.topics.update({
      where: { id: topicId },
      data,
    });
    return responses._200(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return responses._404({ error: "Topic not found" });
    } else {
      console.error("Error updating topic:", error);
      return responses._500({ error: "Failed to update topic." });
    }
  }
};

const deleteTopic = async (topicId) => {
  try {
    const deleted = await prisma.topics.delete({
      where: { id: topicId },
    });
    return responses._204();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return responses._404({ error: "Topic not found" });
    } else {
      console.error("Error deleting topic:", error);
      return responses._500({ error: "Failed to delete topic." });
    }
  }
};

module.exports = {
  handler,
};
