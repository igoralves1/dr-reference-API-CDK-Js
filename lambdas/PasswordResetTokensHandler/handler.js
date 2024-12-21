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
    if (path.startsWith("/password-reset-tokens")) {
      return await handlePasswordResetTokenRoutes(
        httpMethod,
        pathParameters?.email,
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
const handlePasswordResetTokenRoutes = async (httpMethod, email, body) => {
  switch (httpMethod) {
    case "POST":
      const { email: upsertEmail, token } = body;
      const upsertedToken = await upsertPasswordResetToken(
        upsertEmail,
        token,
        prisma
      );
      return responses._200(upsertedToken);

    case "GET":
      if (email) {
        const token = await getPasswordResetToken(email, prisma);
        return token
          ? responses._200(token)
          : responses._400({ error: "Token not found" });
      } else {
        const showOnlyActive = body.showOnlyActive ?? true;
        const tokens = await listPasswordResetTokens(showOnlyActive, prisma);
        return responses._200(tokens);
      }

    case "DELETE":
      if (!email) return responses._400({ error: "Email is required" });
      const deletedToken = await deletePasswordResetToken(email, prisma);
      return deletedToken
        ? responses._204()
        : responses._400({ error: "Token not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};
/**
 * Create or update password reset token for a user.
 * @param {string} email - The email of the user.
 * @param {string} token - The password reset token.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The created or updated password reset token.
 */
const upsertPasswordResetToken = async (email, token, prisma) => {
  try {
    const resetToken = await prisma.password_reset_tokens.upsert({
      where: { email },
      update: {
        token,
        updated_at: new Date(),
      },
      create: {
        email,
        token,
        created_at: new Date(),
      },
    });
    return resetToken;
  } catch (error) {
    console.error("Error upserting password reset token:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("Failed to upsert password reset token.");
    }

    throw new Error("An unknown error occurred.");
  }
};

/**
 * Get password reset token by email.
 * @param {string} email - The email of the user.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The password reset token.
 */
const getPasswordResetToken = async (email, prisma) => {
  try {
    const resetToken = await prisma.password_reset_tokens.findUnique({
      where: { email },
    });
    if (!resetToken) {
      throw new Error("Password reset token not found.");
    }
    return resetToken;
  } catch (error) {
    console.error("Error retrieving password reset token:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("Failed to retrieve password reset token.");
    }

    throw new Error("An unknown error occurred.");
  }
};

/**
 * Soft delete password reset token by email.
 * @param {string} email - The email of the user.
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object>} The deleted password reset token.
 */
const deletePasswordResetToken = async (email, prisma) => {
  try {
    const resetToken = await prisma.password_reset_tokens.update({
      where: { email },
      data: {
        deleted_at: new Date(),
      },
    });
    return resetToken;
  } catch (error) {
    console.error("Error deleting password reset token:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("Password reset token not found.");
    }

    throw new Error("Failed to delete password reset token.");
  }
};

/**
 * List all password reset tokens.
 * @param {boolean} [showOnlyActive=true] - Whether to show only active tokens (not soft-deleted).
 * @param {import("@prisma/client").PrismaClient} prisma - The Prisma client instance.
 * @returns {Promise<Object[]>} The list of password reset tokens.
 */
const listPasswordResetTokens = async (showOnlyActive = true, prisma) => {
  try {
    const tokens = await prisma.password_reset_tokens.findMany({
      where: {
        deleted_at: showOnlyActive ? null : undefined,
      },
    });
    return tokens;
  } catch (error) {
    console.error("Error listing password reset tokens:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("Failed to list password reset tokens.");
    }

    throw new Error("An unknown error occurred.");
  }
};

module.exports = {
  handler,
};
