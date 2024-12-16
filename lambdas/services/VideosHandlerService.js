/**
 * Create a new video.
 * @param {object} data - Video data.
 * @param {string} data.path - Path to the video file.
 * @param {number} [data.is_active=1] - Whether the video is active.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object>} The created video record.
 * @throws {Error} If the creation fails.
 */
const createVideo = async (data, prisma) => {
  try {
    const video = await prisma.videos.create({
      data: {
        path: data.path,
        is_active: data.is_active ?? 1,
        created_at: new Date(),
      },
    });
    return video;
  } catch (error) {
    console.error("Error creating video:", error);
    throw new Error("Failed to create video.");
  }
};

/**
 * Get all videos.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<Array<object>>} List of videos.
 * @throws {Error} If retrieval fails.
 */
const getVideos = async (prisma) => {
  try {
    const videos = await prisma.videos.findMany();
    return videos;
  } catch (error) {
    console.error("Error retrieving videos:", error);
    throw new Error("Failed to retrieve videos.");
  }
};

/**
 * Get a video by its ID.
 * @param {bigint} id - Video ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The video or null if not found.
 * @throws {Error} If retrieval fails.
 */
const getVideoById = async (id, prisma) => {
  try {
    const video = await prisma.videos.findUnique({
      where: { id },
    });
    return video;
  } catch (error) {
    console.error("Error retrieving video by ID:", error);
    throw new Error("Failed to retrieve video.");
  }
};

/**
 * Update a video by its ID.
 * @param {bigint} id - Video ID.
 * @param {object} data - Updated video data.
 * @param {string} [data.path] - Updated video path.
 * @param {number} [data.is_active] - Updated active status.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The updated video or null if not found.
 * @throws {Error} If update fails.
 */
const updateVideo = async (id, data, prisma) => {
  try {
    const video = await prisma.videos.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
    return video;
  } catch (error) {
    console.error("Error updating video:", error);
    throw new Error("Failed to update video.");
  }
};

/**
 * Delete a video by its ID.
 * @param {bigint} id - Video ID.
 * @param {PrismaClient} prisma - Prisma client instance.
 * @returns {Promise<object|null>} The deleted video or null if not found.
 * @throws {Error} If deletion fails.
 */
const deleteVideo = async (id, prisma) => {
  try {
    const video = await prisma.videos.delete({
      where: { id },
    });
    return video;
  } catch (error) {
    console.error("Error deleting video:", error);
    throw new Error("Failed to delete video.");
  }
};

module.exports = {
  createVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
};
