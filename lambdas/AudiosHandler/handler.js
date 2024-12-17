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
    if (path.startsWith("/audios")) {
      return await handleAudiosRoutes(httpMethod, pathParameters, body);
    }
    return responses._400({ error: "Route not found" });
  } catch (error) {
    console.error("Error: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return responses._500({ error: errorMessage });
  }
};
const handleAudiosRoutes = async (httpMethod, pathParameters, body) => {
  const audioId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (audioId) {
        const audio = await getAudioById(audioId, prisma);
        return audio
          ? responses._200(audio)
          : responses._404({ error: "Audio not found" });
      }
      const audios = await getAudios(prisma);
      return responses._200(audios);

    case "POST":
      if (!body || !body.path) {
        return responses._400({ error: "Path is required to create an audio" });
      }
      const newAudio = await createAudio(body, prisma);
      return responses._200(newAudio);

    case "PUT":
      if (!audioId) {
        return responses._400({ error: "Audio ID is required for update" });
      }
      const updatedAudio = await updateAudio(audioId, body, prisma);
      return updatedAudio
        ? responses._200(updatedAudio)
        : responses._404({ error: "Audio not found" });

    case "DELETE":
      if (!audioId) {
        return responses._400({ error: "Audio ID is required for deletion" });
      }
      const deletedAudio = await deleteAudio(audioId, prisma);
      return deletedAudio
        ? responses._204()
        : responses._404({ error: "Audio not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create a new audio.
 * @param {object} data - Audio data.
 * @param {string} data.path - Path to the audio file.
 * @param {string} [data.caption] - Caption for the audio.
 * @param {number} [data.is_active] - Status of the audio (1 for active, 0 for inactive).
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object>} The created audio record.
 * @throws {Error} If the creation fails.
 */
const createAudio = async (data, prisma) => {
  try {
    const audio = await prisma.audios.create({
      data: {
        path: data.path,
        caption: data.caption || null,
        is_active: data.is_active || 1,
        created_at: new Date(),
      },
    });
    return audio;
  } catch (error) {
    console.error("Error creating audio:", error);
    throw new Error("Failed to create audio.");
  }
};

/**
 * Get all audios.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<object>>} List of audios.
 * @throws {Error} If retrieval fails.
 */
const getAudios = async (prisma) => {
  try {
    const audios = await prisma.audios.findMany();
    return audios;
  } catch (error) {
    console.error("Error retrieving audios:", error);
    throw new Error("Failed to retrieve audios.");
  }
};

/**
 * Get an audio by its ID.
 * @param {bigint} id - Audio ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The audio or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getAudioById = async (id, prisma) => {
  try {
    const audio = await prisma.audios.findUnique({
      where: { id },
    });
    return audio;
  } catch (error) {
    console.error("Error retrieving audio by ID:", error);
    throw new Error("Failed to retrieve audio.");
  }
};

/**
 * Update an audio by its ID.
 * @param {bigint} id - Audio ID.
 * @param {object} data - Updated audio data.
 * @param {string} [data.path] - Updated path to the audio file.
 * @param {string} [data.caption] - Updated caption for the audio.
 * @param {number} [data.is_active] - Updated status of the audio.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The updated audio or null if not found.
 * @throws {Error} If update fails.
 */
const updateAudio = async (id, data, prisma) => {
  try {
    const audio = await prisma.audios.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return audio;
  } catch (error) {
    console.error("Error updating audio:", error);
    throw new Error("Failed to update audio.");
  }
};

/**
 * Delete an audio by its ID.
 * @param {bigint} id - Audio ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The deleted audio or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteAudio = async (id, prisma) => {
  try {
    const audio = await prisma.audios.delete({
      where: { id },
    });
    return audio;
  } catch (error) {
    console.error("Error deleting audio:", error);
    throw new Error("Failed to delete audio.");
  }
};

module.exports = {
  handler,
};
