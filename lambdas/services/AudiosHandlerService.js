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
  createAudio,
  getAudios,
  getAudioById,
  updateAudio,
  deleteAudio,
};
