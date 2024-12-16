"use strict";

const {
  createPrismaClient,
} = require("../layers/api_prisma_layer/nodejs/api_prisma_layer");
const UserHandlerService = require("./services/UserHandlerService");
const PasswordResetTokenHandler = require("./services/PasswordResetTokensHandlerService");
const CountriesHandlerService = require("./services/CountriesHandlerService");
const ProvincesHandlerService = require("./services/ProvincesHandlerService");
const CitiesHandlerService = require("./services/CitiesHandlerService");
const PhonesHandlerService = require("./services/PhonesHandlerService");
const CellPhonesHandlerService = require("./services/CellPhonesHandlerService");
const FaxesHandlerService = require("./services/FaxesHandlerService");
const LanguagesHandlerService = require("./services/LanguagesHandlerService");
const UserTypesHandlerService = require("./services/UserTypesHandlerService");
const UserGroupsHandlerService = require("./services/UserGroupsHandlerService");
const CountryUserHandlerService = require("./services/CountryUserHandlerService");
const LanguageUserHandlerService = require("./services/LanguageUserHandlerService");
const UserGroupUserHandlerService = require("./services/UserGroupUserHandlerService");
const UserTypeUserHandlerService = require("./services/UserTypeUserHandlerService");
const ProfessionalsHandlerService = require("./services/ProfessionalsHandlerService");
const TokensHandlerService = require("./services/TokensHandlerService");
const ReferencesHandlerService = require("./services/ReferencesHandlerService");
const VideosHandlerService = require("./services/VideosHandlerService");
const ImagesHandlerService = require("./services/ImagesHandlerService");
const AudiosHandlerService = require("./services/AudiosHandlerService");
const ArticleVideoHandlerService = require("./services/ArticleVideoHandlerService");
const ArticleImageHandlerService = require("./services/ArticleImageHandlerService");
const SpecialtiesHandlerService = require("./services/SpecialtiesHandlerService");
const ProfessionsHandlerService = require("./services/ProfessionsHandlerService");
const ArticleProfessionalHandlerService = require("./services/ArticleProfessionalHandlerService");
const ProfessionalSpecialtyHandlerService = require("./services/ProfessionalSpecialtyHandlerService");
const ProfessionalProvinceHandlerService = require("./services/ProfessionalProvinceHandlerService");

const ArticleHandlerService = require("./services/ArticlesTableHandlerService");
const AddressesHandlerService = require("./services/AddressesHandlerService");
const AddressTypesHandlerService = require("./services/AddressTypesHandlerService");
const AddressUserHandlerService = require("./services/AddressUserHandlerService");
const ArticleAudioHandlerService = require("./services/ArticleAudioHandlerService");

const logger = require("./utils/logger");
const responses = require("./utils/api_responses");

const prisma = createPrismaClient();
BigInt.prototype.toJSON = function () {
  return Number(this);
};

const handler = async (event, context) => {
  logger.log("Event triggered: ", event);

  const { path, httpMethod, pathParameters, body: requestBody } = event;
  const body = requestBody ? JSON.parse(requestBody) : {};

  try {
    if (path.startsWith("/users")) {
      return await handleUserRoutes(httpMethod, pathParameters?.id, body);
    } else if (path.startsWith("/password-reset-tokens")) {
      return await handlePasswordResetTokenRoutes(
        httpMethod,
        pathParameters?.email,
        body
      );
    } else if (path.startsWith("/articles")) {
      return await handleArticleRoutes(httpMethod, pathParameters?.id, body);
    } else if (path.startsWith("/addresses")) {
      return await handleAddressRoutes(httpMethod, pathParameters?.id, body);
    } else if (path.startsWith("/address-types")) {
      return await handleAddressTypesRoutes(
        httpMethod,
        pathParameters?.id,
        body
      );
    } else if (path.startsWith("/address-user")) {
      return await handleAddressUserRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/article-audio")) {
      return await handleArticleAudioRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/countries")) {
      return await handleCountryRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/provinces")) {
      return await handleProvinceRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/cities")) {
      return await handleCityRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/phones")) {
      return await handlePhoneRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/cell-phones")) {
      return await handleCellPhoneRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/faxes")) {
      return await handleFaxRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/languages")) {
      return await handleLanguageRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/user-types")) {
      return await handleUserTypeRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/user-groups")) {
      return await handleUserGroupRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/country-user")) {
      return await handleCountryUserRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/language-user")) {
      return await handleLanguageUserRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/user-group-user")) {
      return await handleUserGroupUserRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/user-type-user")) {
      return await handleUserTypeUserRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/professionals")) {
      return await handleProfessionalsRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/tokens")) {
      return await handleTokensRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/references")) {
      return await handleReferencesRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/videos")) {
      return await handleVideosRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/images")) {
      return await handleImagesRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/audios")) {
      return await handleAudiosRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/article-video")) {
      return await handleArticleVideoRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/article-image")) {
      return await handleArticleImageRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/specialties")) {
      return await handleSpecialtiesRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/professions")) {
      return await handleProfessionsRoutes(httpMethod, pathParameters, body);
    } else if (path.startsWith("/article-professional")) {
      return await handleArticleProfessionalRoutes(
        httpMethod,
        pathParameters,
        body
      );
    } else if (path.startsWith("/professional-specialty")) {
      return await handleProfessionalSpecialtyRoutes(
        httpMethod,
        pathParameters,
        body
      );
    } else if (path.startsWith("/professional-province")) {
      return await handleProfessionalProvinceRoutes(
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

const handleProfessionalProvinceRoutes = async (
  httpMethod,
  pathParameters,
  body
) => {
  const professionalId = pathParameters?.professionalId
    ? BigInt(pathParameters.professionalId)
    : undefined;
  const provinceId = pathParameters?.provinceId
    ? BigInt(pathParameters.provinceId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (professionalId && provinceId) {
        const professionalProvince =
          await ProfessionalProvinceHandlerService.getProfessionalProvince(
            professionalId,
            provinceId,
            prisma
          );
        return professionalProvince
          ? responses._200(professionalProvince)
          : responses._404({ error: "ProfessionalProvince not found" });
      }
      const allProfessionalProvinces =
        await ProfessionalProvinceHandlerService.getAllProfessionalProvinces(
          prisma
        );
      return responses._200(allProfessionalProvinces);

    case "POST":
      const newProfessionalProvince =
        await ProfessionalProvinceHandlerService.createProfessionalProvince(
          body,
          prisma
        );
      return responses._201(newProfessionalProvince);

    case "PUT":
      if (!professionalId || !provinceId) {
        return responses._400({
          error: "Professional ID and Province ID are required",
        });
      }
      const updatedProfessionalProvince =
        await ProfessionalProvinceHandlerService.updateProfessionalProvince(
          professionalId,
          provinceId,
          body,
          prisma
        );
      return updatedProfessionalProvince
        ? responses._200(updatedProfessionalProvince)
        : responses._404({ error: "ProfessionalProvince not found" });

    case "DELETE":
      if (!professionalId || !provinceId) {
        return responses._400({
          error: "Professional ID and Province ID are required",
        });
      }
      const deletedProfessionalProvince =
        await ProfessionalProvinceHandlerService.deleteProfessionalProvince(
          professionalId,
          provinceId,
          prisma
        );
      return deletedProfessionalProvince
        ? responses._204()
        : responses._404({ error: "ProfessionalProvince not found" });

    default:
      return responses._405({ error: "Method Not Allowed" });
  }
};

const handleProfessionalSpecialtyRoutes = async (
  httpMethod,
  pathParameters,
  body
) => {
  const professionalId = pathParameters?.professionalId
    ? BigInt(pathParameters.professionalId)
    : undefined;
  const specialtyId = pathParameters?.specialtyId
    ? BigInt(pathParameters.specialtyId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (professionalId && specialtyId) {
        const relationship =
          await ProfessionalSpecialtyHandlerService.getProfessionalSpecialtyByIds(
            professionalId,
            specialtyId,
            prisma
          );
        return relationship
          ? responses._200(relationship)
          : responses._404({
              error: "Professional-Specialty relationship not found",
            });
      }
      const allRelationships =
        await ProfessionalSpecialtyHandlerService.getProfessionalSpecialties(
          prisma
        );
      return responses._200(allRelationships);

    case "POST":
      const newRelationship =
        await ProfessionalSpecialtyHandlerService.createProfessionalSpecialty(
          body,
          prisma
        );
      return responses._201(newRelationship);

    case "PUT":
      if (!professionalId || !specialtyId) {
        return responses._400({
          error: "Professional ID and Specialty ID are required",
        });
      }
      const updatedRelationship =
        await ProfessionalSpecialtyHandlerService.updateProfessionalSpecialty(
          professionalId,
          specialtyId,
          body,
          prisma
        );
      return updatedRelationship
        ? responses._200(updatedRelationship)
        : responses._404({
            error: "Professional-Specialty relationship not found",
          });

    case "DELETE":
      if (!professionalId || !specialtyId) {
        return responses._400({
          error: "Professional ID and Specialty ID are required",
        });
      }
      const deletedRelationship =
        await ProfessionalSpecialtyHandlerService.deleteProfessionalSpecialty(
          professionalId,
          specialtyId,
          prisma
        );
      return deletedRelationship
        ? responses._204()
        : responses._404({
            error: "Professional-Specialty relationship not found",
          });

    default:
      return responses._405({ error: "Method Not Allowed" });
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
        const record =
          await ArticleProfessionalHandlerService.getArticleProfessionalByIds(
            professionalId,
            articleId,
            prisma
          );
        return record
          ? responses._200(record)
          : responses._404({ error: "Record not found." });
      }
      const allRecords =
        await ArticleProfessionalHandlerService.getAllArticleProfessionals(
          prisma
        );
      return responses._200(allRecords);

    case "POST":
      if (!body.professional_id || !body.article_id) {
        return responses._400({
          error: "Professional ID and Article ID are required.",
        });
      }
      const newRecord =
        await ArticleProfessionalHandlerService.addProfessionalToArticle(
          body,
          prisma
        );
      return responses._201(newRecord);

    case "PUT":
      if (!professionalId || !articleId) {
        return responses._400({
          error: "Professional ID and Article ID are required.",
        });
      }
      const updatedRecord =
        await ArticleProfessionalHandlerService.updateArticleProfessional(
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
      const removedRecord =
        await ArticleProfessionalHandlerService.deleteArticleProfessional(
          professionalId,
          articleId,
          prisma
        );
      return responses._204(removedRecord);

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleProfessionsRoutes = async (httpMethod, pathParameters, body) => {
  const professionId = pathParameters?.professionId
    ? BigInt(pathParameters.professionId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (professionId) {
        const profession = await ProfessionsHandlerService.getProfessionById(
          professionId,
          prisma
        );
        return profession
          ? responses._200(profession)
          : responses._404({ error: "Profession not found" });
      }
      const professions = await ProfessionsHandlerService.getAllProfessions(
        prisma
      );
      return responses._200(professions);

    case "POST":
      const newProfession = await ProfessionsHandlerService.createProfession(
        body,
        prisma
      );
      return responses._201(newProfession);

    case "PUT":
      if (!professionId) {
        return responses._400({ error: "Profession ID is required" });
      }
      const updatedProfession =
        await ProfessionsHandlerService.updateProfession(
          professionId,
          body,
          prisma
        );
      return updatedProfession
        ? responses._200(updatedProfession)
        : responses._404({ error: "Profession not found" });

    case "DELETE":
      if (!professionId) {
        return responses._400({ error: "Profession ID is required" });
      }
      const deletedProfession =
        await ProfessionsHandlerService.deleteProfession(professionId, prisma);
      return deletedProfession
        ? responses._204()
        : responses._404({ error: "Profession not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleSpecialtiesRoutes = async (httpMethod, pathParameters, body) => {
  const id = pathParameters?.id ? BigInt(pathParameters.id) : undefined;
  const professionId = pathParameters?.professionId
    ? BigInt(pathParameters.professionId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (id) {
        const specialty = await SpecialtiesHandlerService.getSpecialtyById(
          id,
          prisma
        );
        return specialty
          ? responses._200(specialty)
          : responses._404({ error: "Specialty not found" });
      }
      if (professionId) {
        const specialties =
          await SpecialtiesHandlerService.getSpecialtiesByProfessionId(
            professionId,
            prisma
          );
        return responses._200(specialties);
      }
      const allSpecialties = await SpecialtiesHandlerService.getAllSpecialties(
        prisma
      );
      return responses._200(allSpecialties);

    case "POST":
      const newSpecialty = await SpecialtiesHandlerService.createSpecialty(
        body,
        prisma
      );
      return responses._200(newSpecialty);

    case "PUT":
      if (!id) {
        return responses._400({ error: "Specialty ID is required" });
      }
      const updatedSpecialty = await SpecialtiesHandlerService.updateSpecialty(
        id,
        body,
        prisma
      );
      return updatedSpecialty
        ? responses._200(updatedSpecialty)
        : responses._404({ error: "Specialty not found" });

    case "DELETE":
      if (!id) {
        return responses._400({ error: "Specialty ID is required" });
      }
      const deletedSpecialty = await SpecialtiesHandlerService.deleteSpecialty(
        id,
        prisma
      );
      return deletedSpecialty
        ? responses._204()
        : responses._404({ error: "Specialty not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleArticleImageRoutes = async (httpMethod, pathParameters, body) => {
  const imageId = pathParameters?.imageId
    ? BigInt(pathParameters.imageId)
    : undefined;
  const articleId = pathParameters?.articleId
    ? BigInt(pathParameters.articleId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (imageId && articleId) {
        const articleImage =
          await ArticleImageHandlerService.getArticleImageByIds(
            imageId,
            articleId,
            prisma
          );
        return articleImage
          ? responses._200(articleImage)
          : responses._404({ error: "Article image relationship not found" });
      }
      const articleImages = await ArticleImageHandlerService.getArticleImages(
        prisma
      );
      return responses._200(articleImages);

    case "POST":
      const newArticleImage =
        await ArticleImageHandlerService.addImageToArticle(body, prisma);
      return responses._200(newArticleImage);

    case "PUT":
      if (!imageId || !articleId) {
        return responses._400({
          error: "Image ID and Article ID are required",
        });
      }
      const updatedArticleImage =
        await ArticleImageHandlerService.updateArticleImage(
          imageId,
          articleId,
          body,
          prisma
        );
      return updatedArticleImage
        ? responses._200(updatedArticleImage)
        : responses._404({ error: "Article image relationship not found" });

    case "DELETE":
      if (!imageId || !articleId) {
        return responses._400({
          error: "Image ID and Article ID are required",
        });
      }
      const deletedArticleImage =
        await ArticleImageHandlerService.removeImageFromArticle(
          imageId,
          articleId,
          prisma
        );
      return deletedArticleImage
        ? responses._204()
        : responses._404({ error: "Article image relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleArticleVideoRoutes = async (httpMethod, pathParameters, body) => {
  const videoId = pathParameters?.videoId
    ? BigInt(pathParameters.videoId)
    : undefined;
  const articleId = pathParameters?.articleId
    ? BigInt(pathParameters.articleId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (articleId) {
        const videosForArticle =
          await ArticleVideoHandlerService.getVideosByArticleId(
            articleId,
            prisma
          );
        return responses._200(videosForArticle);
      }
      const allVideoArticles =
        await ArticleVideoHandlerService.getAllVideoArticleRelationships(
          prisma
        );
      return responses._200(allVideoArticles);

    case "POST":
      if (!body || !body.video_id || !body.article_id) {
        return responses._400({
          error: "Video ID and Article ID are required",
        });
      }
      const newArticleVideo =
        await ArticleVideoHandlerService.addVideoToArticle(body, prisma);
      return responses._200(newArticleVideo);

    case "DELETE":
      if (!videoId || !articleId) {
        return responses._400({
          error: "Video ID and Article ID are required",
        });
      }
      const removedArticleVideo =
        await ArticleVideoHandlerService.removeVideoFromArticle(
          videoId,
          articleId,
          prisma
        );
      return removedArticleVideo
        ? responses._204()
        : responses._404({ error: "Video-article relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleAudiosRoutes = async (httpMethod, pathParameters, body) => {
  const audioId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (audioId) {
        const audio = await AudiosHandlerService.getAudioById(audioId, prisma);
        return audio
          ? responses._200(audio)
          : responses._404({ error: "Audio not found" });
      }
      const audios = await AudiosHandlerService.getAudios(prisma);
      return responses._200(audios);

    case "POST":
      if (!body || !body.path) {
        return responses._400({ error: "Path is required to create an audio" });
      }
      const newAudio = await AudiosHandlerService.createAudio(body, prisma);
      return responses._200(newAudio);

    case "PUT":
      if (!audioId) {
        return responses._400({ error: "Audio ID is required for update" });
      }
      const updatedAudio = await AudiosHandlerService.updateAudio(
        audioId,
        body,
        prisma
      );
      return updatedAudio
        ? responses._200(updatedAudio)
        : responses._404({ error: "Audio not found" });

    case "DELETE":
      if (!audioId) {
        return responses._400({ error: "Audio ID is required for deletion" });
      }
      const deletedAudio = await AudiosHandlerService.deleteAudio(
        audioId,
        prisma
      );
      return deletedAudio
        ? responses._204()
        : responses._404({ error: "Audio not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleImagesRoutes = async (httpMethod, pathParameters, body) => {
  const imageId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (imageId) {
        const image = await ImagesHandlerService.getImageById(imageId, prisma);
        return image
          ? responses._200(image)
          : responses._404({ error: "Image not found" });
      }
      const images = await ImagesHandlerService.getImages(prisma);
      return responses._200(images);

    case "POST":
      if (!body || !body.path) {
        return responses._400({ error: "Path is required to create an image" });
      }
      const newImage = await ImagesHandlerService.createImage(body, prisma);
      return responses._200(newImage);

    case "PUT":
      if (!imageId) {
        return responses._400({ error: "Image ID is required for update" });
      }
      const updatedImage = await ImagesHandlerService.updateImage(
        imageId,
        body,
        prisma
      );
      return updatedImage
        ? responses._200(updatedImage)
        : responses._404({ error: "Image not found" });

    case "DELETE":
      if (!imageId) {
        return responses._400({ error: "Image ID is required for deletion" });
      }
      const deletedImage = await ImagesHandlerService.deleteImage(
        imageId,
        prisma
      );
      return deletedImage
        ? responses._204()
        : responses._404({ error: "Image not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleVideosRoutes = async (httpMethod, pathParameters, body) => {
  const id = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (id) {
        const video = await VideosHandlerService.getVideoById(id, prisma);
        return video
          ? responses._200(video)
          : responses._404({ error: "Video not found" });
      }
      const videos = await VideosHandlerService.getVideos(prisma);
      return responses._200(videos);

    case "POST":
      const newVideo = await VideosHandlerService.createVideo(body, prisma);
      return responses._201(newVideo);

    case "PUT":
      if (!id) {
        return responses._400({ error: "Video ID is required" });
      }
      const updatedVideo = await VideosHandlerService.updateVideo(
        id,
        body,
        prisma
      );
      return updatedVideo
        ? responses._200(updatedVideo)
        : responses._404({ error: "Video not found" });

    case "DELETE":
      if (!id) {
        return responses._400({ error: "Video ID is required" });
      }
      const deletedVideo = await VideosHandlerService.deleteVideo(id, prisma);
      return deletedVideo
        ? responses._204()
        : responses._404({ error: "Video not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleReferencesRoutes = async (httpMethod, pathParameters, body) => {
  const id = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (id) {
        const reference = await ReferencesHandlerService.getReferenceById(
          id,
          prisma
        );
        return reference
          ? responses._200(reference)
          : responses._404({ error: "Reference not found" });
      }
      const references = await ReferencesHandlerService.getReferences(prisma);
      return responses._200(references);

    case "POST":
      const newReference = await ReferencesHandlerService.createReference(
        body,
        prisma
      );
      return responses._200(newReference);

    case "PUT":
      if (!id) {
        return responses._400({ error: "Reference ID is required" });
      }
      const updatedReference = await ReferencesHandlerService.updateReference(
        id,
        body,
        prisma
      );
      return updatedReference
        ? responses._200(updatedReference)
        : responses._404({ error: "Reference not found" });

    case "DELETE":
      if (!id) {
        return responses._400({ error: "Reference ID is required" });
      }
      const deletedReference = await ReferencesHandlerService.deleteReference(
        id,
        prisma
      );
      return deletedReference
        ? responses._204()
        : responses._404({ error: "Reference not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleTokensRoutes = async (httpMethod, pathParameters, body) => {
  const id = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (id) {
        const token = await TokensHandlerService.getTokenById(id, prisma);
        return token
          ? responses._200(token)
          : responses._404({ error: "Token not found" });
      }
      const tokens = await TokensHandlerService.getTokens(prisma);
      return responses._200(tokens);

    case "POST":
      const newToken = await TokensHandlerService.createToken(body, prisma);
      return responses._200(newToken);

    case "PUT":
      if (!id) {
        return responses._400({ error: "Token ID is required" });
      }
      const updatedToken = await TokensHandlerService.updateToken(
        id,
        body,
        prisma
      );
      return updatedToken
        ? responses._200(updatedToken)
        : responses._404({ error: "Token not found" });

    case "DELETE":
      if (!id) {
        return responses._400({ error: "Token ID is required" });
      }
      const deletedToken = await TokensHandlerService.deleteToken(id, prisma);
      return deletedToken
        ? responses._204()
        : responses._404({ error: "Token not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleProfessionalsRoutes = async (httpMethod, pathParameters, body) => {
  const id = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (id) {
        const professional =
          await ProfessionalsHandlerService.getProfessionalById(id, prisma);
        return professional
          ? responses._200(professional)
          : responses._404({ error: "Professional not found" });
      }
      const professionals = await ProfessionalsHandlerService.getProfessionals(
        prisma
      );
      return responses._200(professionals);

    case "POST":
      const newProfessional =
        await ProfessionalsHandlerService.createProfessional(body, prisma);
      return responses._200(newProfessional);

    case "PUT":
      if (!id) {
        return responses._400({ error: "Professional ID is required" });
      }
      const updatedProfessional =
        await ProfessionalsHandlerService.updateProfessional(id, body, prisma);
      return updatedProfessional
        ? responses._200(updatedProfessional)
        : responses._404({ error: "Professional not found" });

    case "DELETE":
      if (!id) {
        return responses._400({ error: "Professional ID is required" });
      }
      const deletedProfessional =
        await ProfessionalsHandlerService.deleteProfessional(id, prisma);
      return deletedProfessional
        ? responses._204()
        : responses._404({ error: "Professional not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleUserTypeUserRoutes = async (httpMethod, pathParameters, body) => {
  const userId = pathParameters?.userId
    ? BigInt(pathParameters.userId)
    : undefined;
  const userTypeId = pathParameters?.userTypeId
    ? BigInt(pathParameters.userTypeId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (userId && userTypeId) {
        const userTypeUser =
          await UserTypeUserHandlerService.getUserTypeUserByIds(
            userId,
            userTypeId,
            prisma
          );
        return userTypeUser
          ? responses._200(userTypeUser)
          : responses._404({ error: "User-type relationship not found" });
      }
      const userTypeUsers = await UserTypeUserHandlerService.getUserTypeUsers(
        prisma
      );
      return responses._200(userTypeUsers);

    case "POST":
      const newUserTypeUser =
        await UserTypeUserHandlerService.createUserTypeUser(
          body.user_id,
          body.user_type_id,
          prisma
        );
      return responses._200(newUserTypeUser);

    case "PUT":
      if (!userId || !userTypeId) {
        return responses._400({
          error: "User ID and User Type ID are required",
        });
      }
      const updatedUserTypeUser =
        await UserTypeUserHandlerService.updateUserTypeUser(
          userId,
          userTypeId,
          prisma
        );
      return updatedUserTypeUser
        ? responses._200(updatedUserTypeUser)
        : responses._404({ error: "User-type relationship not found" });

    case "DELETE":
      if (!userId || !userTypeId) {
        return responses._400({
          error: "User ID and User Type ID are required",
        });
      }
      const deletedUserTypeUser =
        await UserTypeUserHandlerService.deleteUserTypeUser(
          userId,
          userTypeId,
          prisma
        );
      return deletedUserTypeUser
        ? responses._204()
        : responses._404({ error: "User-type relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleUserGroupUserRoutes = async (httpMethod, pathParameters, body) => {
  const userId = pathParameters?.userId
    ? BigInt(pathParameters.userId)
    : undefined;
  const userGroupId = pathParameters?.userGroupId
    ? BigInt(pathParameters.userGroupId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (userId && userGroupId) {
        const userGroupUser =
          await UserGroupUserHandlerService.getUserGroupUserByIds(
            userId,
            userGroupId,
            prisma
          );
        return userGroupUser
          ? responses._200(userGroupUser)
          : responses._404({ error: "User-group relationship not found" });
      }
      const userGroupUsers =
        await UserGroupUserHandlerService.getUserGroupUsers(prisma);
      return responses._200(userGroupUsers);

    case "POST":
      const newUserGroupUser =
        await UserGroupUserHandlerService.createUserGroupUser(
          body.user_id,
          body.user_group_id,
          prisma
        );
      return responses._200(newUserGroupUser);

    case "PUT":
      if (!userId || !userGroupId) {
        return responses._400({ error: "User ID and Group ID are required" });
      }
      const updatedUserGroupUser =
        await UserGroupUserHandlerService.updateUserGroupUser(
          userId,
          userGroupId,
          prisma
        );
      return updatedUserGroupUser
        ? responses._200(updatedUserGroupUser)
        : responses._404({ error: "User-group relationship not found" });

    case "DELETE":
      if (!userId || !userGroupId) {
        return responses._400({ error: "User ID and Group ID are required" });
      }
      const deletedUserGroupUser =
        await UserGroupUserHandlerService.deleteUserGroupUser(
          userId,
          userGroupId,
          prisma
        );
      return deletedUserGroupUser
        ? responses._204()
        : responses._404({ error: "User-group relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleLanguageUserRoutes = async (httpMethod, pathParameters, body) => {
  const userId = pathParameters?.userId
    ? BigInt(pathParameters.userId)
    : undefined;
  const languageId = pathParameters?.languageId
    ? BigInt(pathParameters.languageId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (userId && languageId) {
        const languageUser =
          await LanguageUserHandlerService.getLanguageUserByIds(
            userId,
            languageId,
            prisma
          );
        return languageUser
          ? responses._200(languageUser)
          : responses._404({ error: "Language-user relationship not found" });
      }
      const languageUsers = await LanguageUserHandlerService.getLanguageUsers(
        prisma
      );
      return responses._200(languageUsers);

    case "POST":
      const newLanguageUser =
        await LanguageUserHandlerService.createLanguageUser(
          body.user_id,
          body.language_id,
          prisma
        );
      return responses._200(newLanguageUser);

    case "PUT":
      if (!userId || !languageId) {
        return responses._400({
          error: "User ID and Language ID are required",
        });
      }
      const updatedLanguageUser =
        await LanguageUserHandlerService.updateLanguageUser(
          userId,
          languageId,
          prisma
        );
      return updatedLanguageUser
        ? responses._200(updatedLanguageUser)
        : responses._404({ error: "Language-user relationship not found" });

    case "DELETE":
      if (!userId || !languageId) {
        return responses._400({
          error: "User ID and Language ID are required",
        });
      }
      const deletedLanguageUser =
        await LanguageUserHandlerService.deleteLanguageUser(
          userId,
          languageId,
          prisma
        );
      return deletedLanguageUser
        ? responses._204()
        : responses._404({ error: "Language-user relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleCountryUserRoutes = async (httpMethod, pathParameters, body) => {
  const userId = pathParameters?.userId
    ? BigInt(pathParameters.userId)
    : undefined;
  const countryId = pathParameters?.countryId
    ? BigInt(pathParameters.countryId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (userId && countryId) {
        const countryUser = await CountryUserHandlerService.getCountryUserByIds(
          userId,
          countryId,
          prisma
        );
        return countryUser
          ? responses._200(countryUser)
          : responses._404({ error: "Country-user relationship not found" });
      }
      const countryUsers = await CountryUserHandlerService.getCountryUsers(
        prisma
      );
      return responses._200(countryUsers);

    case "POST":
      const newCountryUser = await CountryUserHandlerService.createCountryUser(
        body.user_id,
        body.country_id,
        prisma
      );
      return responses._200(newCountryUser);

    case "PUT":
      if (!userId || !countryId) {
        return responses._400({ error: "User ID and Country ID are required" });
      }
      const updatedCountryUser =
        await CountryUserHandlerService.updateCountryUser(
          userId,
          countryId,
          prisma
        );
      return updatedCountryUser
        ? responses._200(updatedCountryUser)
        : responses._404({ error: "Country-user relationship not found" });

    case "DELETE":
      if (!userId || !countryId) {
        return responses._400({ error: "User ID and Country ID are required" });
      }
      const deletedCountryUser =
        await CountryUserHandlerService.deleteCountryUser(
          userId,
          countryId,
          prisma
        );
      return deletedCountryUser
        ? responses._204()
        : responses._404({ error: "Country-user relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleUserGroupRoutes = async (httpMethod, pathParameters, body) => {
  const userGroupId = pathParameters?.id
    ? BigInt(pathParameters.id)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (userGroupId) {
        const userGroup = await UserGroupsHandlerService.getUserGroupById(
          userGroupId,
          prisma
        );
        return userGroup
          ? responses._200(userGroup)
          : responses._404({ error: "User group not found" });
      }
      const userGroups = await UserGroupsHandlerService.getUserGroups(prisma);
      return responses._200(userGroups);

    case "POST":
      const newUserGroup = await UserGroupsHandlerService.createUserGroup(
        body,
        prisma
      );
      return responses._200(newUserGroup);

    case "PUT":
      if (!userGroupId) {
        return responses._400({ error: "User group ID is required" });
      }
      const updatedUserGroup = await UserGroupsHandlerService.updateUserGroup(
        userGroupId,
        body,
        prisma
      );
      return updatedUserGroup
        ? responses._200(updatedUserGroup)
        : responses._404({ error: "User group not found" });

    case "DELETE":
      if (!userGroupId) {
        return responses._400({ error: "User group ID is required" });
      }
      const deletedUserGroup = await UserGroupsHandlerService.deleteUserGroup(
        userGroupId,
        prisma
      );
      return deletedUserGroup
        ? responses._204()
        : responses._404({ error: "User group not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleUserTypeRoutes = async (httpMethod, pathParameters, body) => {
  const userTypeId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (userTypeId) {
        const userType = await UserTypesHandlerService.getUserTypeById(
          userTypeId,
          prisma
        );
        return userType
          ? responses._200(userType)
          : responses._404({ error: "User type not found" });
      }
      const userTypes = await UserTypesHandlerService.getUserTypes(prisma);
      return responses._200(userTypes);

    case "POST":
      const newUserType = await UserTypesHandlerService.createUserType(
        body,
        prisma
      );
      return responses._200(newUserType);

    case "PUT":
      if (!userTypeId) {
        return responses._400({ error: "User type ID is required" });
      }
      const updatedUserType = await UserTypesHandlerService.updateUserType(
        userTypeId,
        body,
        prisma
      );
      return updatedUserType
        ? responses._200(updatedUserType)
        : responses._404({ error: "User type not found" });

    case "DELETE":
      if (!userTypeId) {
        return responses._400({ error: "User type ID is required" });
      }
      const deletedUserType = await UserTypesHandlerService.deleteUserType(
        userTypeId,
        prisma
      );
      return deletedUserType
        ? responses._204()
        : responses._404({ error: "User type not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleLanguageRoutes = async (httpMethod, pathParameters, body) => {
  const languageId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (languageId) {
        const language = await LanguagesHandlerService.getLanguageById(
          languageId,
          prisma
        );
        return language
          ? responses._200(language)
          : responses._404({ error: "Language not found" });
      }
      const languages = await LanguagesHandlerService.getLanguages(prisma);
      return responses._200(languages);

    case "POST":
      const newLanguage = await LanguagesHandlerService.createLanguage(
        body,
        prisma
      );
      return responses._200(newLanguage);

    case "PUT":
      if (!languageId) {
        return responses._400({ error: "Language ID is required" });
      }
      const updatedLanguage = await LanguagesHandlerService.updateLanguage(
        languageId,
        body,
        prisma
      );
      return updatedLanguage
        ? responses._200(updatedLanguage)
        : responses._404({ error: "Language not found" });

    case "DELETE":
      if (!languageId) {
        return responses._400({ error: "Language ID is required" });
      }
      const deletedLanguage = await LanguagesHandlerService.deleteLanguage(
        languageId,
        prisma
      );
      return deletedLanguage
        ? responses._204()
        : responses._404({ error: "Language not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleFaxRoutes = async (httpMethod, pathParameters, body) => {
  const faxId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (faxId) {
        const fax = await FaxesHandlerService.getFaxById(faxId, prisma);
        return fax
          ? responses._200(fax)
          : responses._404({ error: "Fax not found" });
      }
      const faxes = await FaxesHandlerService.getFaxes(prisma);
      return responses._200(faxes);

    case "POST":
      const newFax = await FaxesHandlerService.createFax(body, prisma);
      return responses._200(newFax);

    case "PUT":
      if (!faxId) {
        return responses._400({ error: "Fax ID is required" });
      }
      const updatedFax = await FaxesHandlerService.updateFax(
        faxId,
        body,
        prisma
      );
      return updatedFax
        ? responses._200(updatedFax)
        : responses._404({ error: "Fax not found" });

    case "DELETE":
      if (!faxId) {
        return responses._400({ error: "Fax ID is required" });
      }
      const deletedFax = await FaxesHandlerService.deleteFax(faxId, prisma);
      return deletedFax
        ? responses._204()
        : responses._404({ error: "Fax not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handleCellPhoneRoutes = async (httpMethod, pathParameters, body) => {
  const cellPhoneId = pathParameters?.id
    ? BigInt(pathParameters.id)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (cellPhoneId) {
        const cellPhone = await CellPhonesHandlerService.getCellPhoneById(
          cellPhoneId,
          prisma
        );
        return cellPhone
          ? responses._200(cellPhone)
          : responses._404({ error: "Cell phone not found" });
      }
      const cellPhones = await CellPhonesHandlerService.getCellPhones(prisma);
      return responses._200(cellPhones);

    case "POST":
      const newCellPhone = await CellPhonesHandlerService.createCellPhone(
        body,
        prisma
      );
      return responses._200(newCellPhone);

    case "PUT":
      if (!cellPhoneId) {
        return responses._400({ error: "Cell phone ID is required" });
      }
      const updatedCellPhone = await CellPhonesHandlerService.updateCellPhone(
        cellPhoneId,
        body,
        prisma
      );
      return updatedCellPhone
        ? responses._200(updatedCellPhone)
        : responses._404({ error: "Cell phone not found" });

    case "DELETE":
      if (!cellPhoneId) {
        return responses._400({ error: "Cell phone ID is required" });
      }
      const deletedCellPhone = await CellPhonesHandlerService.deleteCellPhone(
        cellPhoneId,
        prisma
      );
      return deletedCellPhone
        ? responses._204()
        : responses._404({ error: "Cell phone not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

const handlePhoneRoutes = async (httpMethod, pathParameters, body) => {
  const phoneId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (phoneId) {
        const phone = await PhonesHandlerService.getPhoneById(phoneId, prisma);
        return phone
          ? responses._200(phone)
          : responses._404({ error: "Phone not found" });
      }
      const phones = await PhonesHandlerService.getPhones(prisma);
      return responses._200(phones);

    case "POST":
      const newPhone = await PhonesHandlerService.createPhone(body, prisma);
      return responses._200(newPhone);

    case "PUT":
      if (!phoneId) {
        return responses._400({ error: "Phone ID is required" });
      }
      const updatedPhone = await PhonesHandlerService.updatePhone(
        phoneId,
        body,
        prisma
      );
      return updatedPhone
        ? responses._200(updatedPhone)
        : responses._404({ error: "Phone not found" });

    case "DELETE":
      if (!phoneId) {
        return responses._400({ error: "Phone ID is required" });
      }
      const deletedPhone = await PhonesHandlerService.deletePhone(
        phoneId,
        prisma
      );
      return deletedPhone
        ? responses._204()
        : responses._404({ error: "Phone not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Handle Address-User routes.
 * @param {string} httpMethod - HTTP method.
 * @param {Object} pathParameters - Path parameters.
 * @param {Object} body - Request body.
 * @returns {Promise<Object>} API Gateway response.
 */
const handleCityRoutes = async (httpMethod, pathParameters, body) => {
  const cityId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (cityId) {
        const city = await CitiesHandlerService.getCityById(cityId, prisma);
        return city
          ? responses._200(city)
          : responses._404({ error: "City not found" });
      }
      const cities = await CitiesHandlerService.getCities(prisma);
      return responses._200(cities);

    case "POST":
      const newCity = await CitiesHandlerService.createCity(body, prisma);
      return responses._200(newCity);

    case "PUT":
      if (!cityId) {
        return responses._400({ error: "City ID is required" });
      }
      const updatedCity = await CitiesHandlerService.updateCity(
        cityId,
        body,
        prisma
      );
      return updatedCity
        ? responses._200(updatedCity)
        : responses._404({ error: "City not found" });

    case "DELETE":
      if (!cityId) {
        return responses._400({ error: "City ID is required" });
      }
      const deletedCity = await CitiesHandlerService.deleteCity(cityId, prisma);
      return deletedCity
        ? responses._204()
        : responses._404({ error: "City not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Handle Address-User routes.
 * @param {string} httpMethod - HTTP method.
 * @param {Object} pathParameters - Path parameters.
 * @param {Object} body - Request body.
 * @returns {Promise<Object>} API Gateway response.
 */
const handleProvinceRoutes = async (httpMethod, pathParameters, body) => {
  const provinceId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (provinceId) {
        const province = await ProvincesHandlerService.getProvinceById(
          provinceId,
          prisma
        );
        return province
          ? responses._200(province)
          : responses._404({ error: "Province not found" });
      }
      const provinces = await ProvincesHandlerService.getProvinces(prisma);
      return responses._200(provinces);

    case "POST":
      const newProvince = await ProvincesHandlerService.createProvince(
        body,
        prisma
      );
      return responses._200(newProvince);

    case "PUT":
      if (!provinceId) {
        return responses._400({ error: "Province ID is required" });
      }
      const updatedProvince = await ProvincesHandlerService.updateProvince(
        provinceId,
        body,
        prisma
      );
      return updatedProvince
        ? responses._200(updatedProvince)
        : responses._404({ error: "Province not found" });

    case "DELETE":
      if (!provinceId) {
        return responses._400({ error: "Province ID is required" });
      }
      const deletedProvince = await ProvincesHandlerService.deleteProvince(
        provinceId,
        prisma
      );
      return deletedProvince
        ? responses._204()
        : responses._404({ error: "Province not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Handle Address-User routes.
 * @param {string} httpMethod - HTTP method.
 * @param {Object} pathParameters - Path parameters.
 * @param {Object} body - Request body.
 * @returns {Promise<Object>} API Gateway response.
 */
const handleCountryRoutes = async (httpMethod, pathParameters, body) => {
  const countryId = pathParameters?.id ? BigInt(pathParameters.id) : undefined;

  switch (httpMethod) {
    case "GET":
      if (countryId) {
        const country = await CountriesHandlerService.getCountryById(
          countryId,
          prisma
        );
        return country
          ? responses._200(country)
          : responses._404({ error: "Country not found" });
      }
      const countries = await CountriesHandlerService.getCountries(prisma);
      return responses._200(countries);

    case "POST":
      const newCountry = await CountriesHandlerService.createCountry(
        body,
        prisma
      );
      return responses._200(newCountry);

    case "PUT":
      if (!countryId) {
        return responses._400({ error: "Country ID is required" });
      }
      const updatedCountry = await CountriesHandlerService.updateCountry(
        countryId,
        body,
        prisma
      );
      return updatedCountry
        ? responses._200(updatedCountry)
        : responses._404({ error: "Country not found" });

    case "DELETE":
      if (!countryId) {
        return responses._400({ error: "Country ID is required" });
      }
      const deletedCountry = await CountriesHandlerService.deleteCountry(
        countryId,
        prisma
      );
      return deletedCountry
        ? responses._204()
        : responses._404({ error: "Country not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Handle Address-User routes.
 * @param {string} httpMethod - HTTP method.
 * @param {Object} pathParameters - Path parameters.
 * @param {Object} body - Request body.
 * @returns {Promise<Object>} API Gateway response.
 */
const handleArticleAudioRoutes = async (httpMethod, pathParameters, body) => {
  const audioId = pathParameters?.audioId
    ? BigInt(pathParameters.audioId)
    : undefined;
  const articleId = pathParameters?.articleId
    ? BigInt(pathParameters.articleId)
    : undefined;

  switch (httpMethod) {
    case "GET":
      if (audioId && articleId) {
        const articleAudio =
          await ArticleAudioHandlerService.getAudioForArticle(
            audioId,
            articleId,
            prisma
          );
        return articleAudio
          ? responses._200(articleAudio)
          : responses._404({ error: "Article-Audio relationship not found" });
      }
      const articleAudios =
        await ArticleAudioHandlerService.getAllArticleAudios(prisma);
      return responses._200(articleAudios);

    case "POST":
      const newArticleAudio =
        await ArticleAudioHandlerService.addAudioToArticle(body, prisma);
      return responses._200(newArticleAudio);

    case "PUT":
      if (!audioId || !articleId) {
        return responses._400({
          error: "Audio ID and Article ID are required",
        });
      }
      const updatedArticleAudio =
        await ArticleAudioHandlerService.updateAudioForArticle(
          audioId,
          articleId,
          body,
          prisma
        );
      return updatedArticleAudio
        ? responses._200(updatedArticleAudio)
        : responses._404({ error: "Article-Audio relationship not found" });

    case "DELETE":
      if (!audioId || !articleId) {
        return responses._400({
          error: "Audio ID and Article ID are required",
        });
      }
      const deletedArticleAudio =
        await ArticleAudioHandlerService.removeAudioFromArticle(
          audioId,
          articleId,
          prisma
        );
      return deletedArticleAudio
        ? responses._204()
        : responses._404({ error: "Article-Audio relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Handle Address-User routes.
 * @param {string} httpMethod - HTTP method.
 * @param {Object} pathParameters - Path parameters.
 * @param {Object} body - Request body.
 * @returns {Promise<Object>} API Gateway response.
 */
const handleAddressUserRoutes = async (httpMethod, pathParameters, body) => {
  const userId = pathParameters?.userId
    ? BigInt(pathParameters.userId)
    : undefined;
  const addressId = pathParameters?.addressId
    ? BigInt(pathParameters.addressId)
    : undefined;

  switch (httpMethod) {
    case "POST":
      if (!userId || !addressId) {
        return responses._400({ error: "User ID and Address ID are required" });
      }
      const newAddressUser = await AddressUserHandlerService.createAddressUser(
        userId,
        addressId,
        prisma
      );
      return responses._200(newAddressUser);

    case "GET":
      if (userId && addressId) {
        const addressUser = await AddressUserHandlerService.getAddressUserByIds(
          userId,
          addressId,
          prisma
        );
        return addressUser
          ? responses._200(addressUser)
          : responses._400({ error: "Address-User relationship not found" });
      }
      const addressUsers = await AddressUserHandlerService.getAddressUsers(
        prisma
      );
      return responses._200(addressUsers);

    case "PUT":
      if (!userId || !addressId) {
        return responses._400({ error: "User ID and Address ID are required" });
      }
      const updatedAddressUser =
        await AddressUserHandlerService.updateAddressUser(
          userId,
          addressId,
          prisma
        );
      return updatedAddressUser
        ? responses._200(updatedAddressUser)
        : responses._400({ error: "Address-User relationship not found" });

    case "DELETE":
      if (!userId || !addressId) {
        return responses._400({ error: "User ID and Address ID are required" });
      }
      const deletedAddressUser =
        await AddressUserHandlerService.deleteAddressUser(
          userId,
          addressId,
          prisma
        );
      return deletedAddressUser
        ? responses._204()
        : responses._400({ error: "Address-User relationship not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Handle Address Types routes
 * @param {string} httpMethod - HTTP method
 * @param {string|undefined} addressTypeId - Address type ID (optional)
 * @param {Object} body - Request body
 * @returns {Promise<Object>} - API Gateway response
 */
const handleAddressTypesRoutes = async (httpMethod, addressTypeId, body) => {
  switch (httpMethod) {
    case "GET":
      if (addressTypeId) {
        const id = BigInt(addressTypeId);
        const addressType = await AddressTypesHandlerService.getAddressTypeById(
          id
        );
        return addressType
          ? responses._200(addressType)
          : responses._400({ error: "Address type not found" });
      } else {
        const addressTypes = await AddressTypesHandlerService.getAddressTypes();
        return responses._200(addressTypes);
      }

    case "POST":
      const newAddressType = await AddressTypesHandlerService.createAddressType(
        body
      );
      return responses._200(newAddressType);

    case "PUT":
      if (!addressTypeId)
        return responses._400({ error: "Address type ID is required" });
      const idToUpdate = BigInt(addressTypeId);
      const updatedAddressType =
        await AddressTypesHandlerService.updateAddressType(idToUpdate, body);
      return updatedAddressType
        ? responses._200(updatedAddressType)
        : responses._400({ error: "Address type not found" });

    case "DELETE":
      if (!addressTypeId)
        return responses._400({ error: "Address type ID is required" });
      const idToDelete = BigInt(addressTypeId);
      const deletedAddressType =
        await AddressTypesHandlerService.deleteAddressType(idToDelete);
      return deletedAddressType
        ? responses._204()
        : responses._400({ error: "Address type not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Handle Address routes
 * @param {string} httpMethod - HTTP method
 * @param {string|undefined} addressId - Address ID (optional)
 * @param {Object} body - Request body
 * @returns {Promise<Object>} - API Gateway response
 */
const handleAddressRoutes = async (httpMethod, addressId, body) => {
  switch (httpMethod) {
    case "GET":
      if (addressId) {
        const id = BigInt(addressId);
        const address = await AddressesHandlerService.getAddressById(id);
        return address
          ? responses._200(address)
          : responses._400({ error: "Address not found" });
      } else {
        const addresses = await AddressesHandlerService.getAddresses();
        return responses._200(addresses);
      }

    case "POST":
      const newAddress = await AddressesHandlerService.createAddress(body);
      return responses._200(newAddress);

    case "PUT":
      if (!addressId)
        return responses._400({ error: "Address ID is required" });
      const idToUpdate = BigInt(addressId);
      const updatedAddress = await AddressesHandlerService.updateAddress(
        idToUpdate,
        body
      );
      return updatedAddress
        ? responses._200(updatedAddress)
        : responses._400({ error: "Address not found" });

    case "DELETE":
      if (!addressId)
        return responses._400({ error: "Address ID is required" });
      const idToDelete = BigInt(addressId);
      const deletedAddress = await AddressesHandlerService.deleteAddress(
        idToDelete
      );
      return deletedAddress
        ? responses._204()
        : responses._400({ error: "Address not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Handle User routes
 * @param {string} httpMethod - HTTP method (GET, POST, etc.)
 * @param {string|undefined} userId - User ID (optional)
 * @param {Object} body - Request body
 * @returns {Promise<Object>} - API Gateway response
 */
const handleUserRoutes = async (httpMethod, userId, body) => {
  switch (httpMethod) {
    case "GET":
      if (userId) {
        const id = BigInt(userId);
        const user = await UserHandlerService.getUserById(id, prisma);
        return user
          ? responses._200(user)
          : responses._400({ error: "User not found" });
      } else {
        const users = await UserHandlerService.listUsers(prisma, true);
        return responses._200(users);
      }

    case "POST":
      const newUser = await UserHandlerService.createUser(body, prisma);
      return responses._200(newUser);

    case "PUT":
      if (!userId) return responses._400({ error: "User ID is required" });
      const idToUpdate = BigInt(userId);
      const updatedUser = await UserHandlerService.updateUser(
        idToUpdate,
        body,
        prisma
      );
      return updatedUser
        ? responses._200(updatedUser)
        : responses._400({ error: "User not found" });

    case "DELETE":
      if (!userId) return responses._400({ error: "User ID is required" });
      const idToDelete = BigInt(userId);
      const deletedUser = await UserHandlerService.deleteUser(
        idToDelete,
        prisma
      );
      return deletedUser
        ? responses._204({ message: "User deleted successfully" })
        : responses._400({ error: "User not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Handle Password Reset Token routes
 * @param {string} httpMethod - HTTP method
 * @param {string|undefined} email - Email address (optional)
 * @param {Object} body - Request body
 * @returns {Promise<Object>} - API Gateway response
 */
const handlePasswordResetTokenRoutes = async (httpMethod, email, body) => {
  switch (httpMethod) {
    case "POST":
      const { email: upsertEmail, token } = body;
      const upsertedToken =
        await PasswordResetTokenHandler.upsertPasswordResetToken(
          upsertEmail,
          token,
          prisma
        );
      return responses._200(upsertedToken);

    case "GET":
      if (email) {
        const token = await PasswordResetTokenHandler.getPasswordResetToken(
          email,
          prisma
        );
        return token
          ? responses._200(token)
          : responses._400({ error: "Token not found" });
      } else {
        const showOnlyActive = body.showOnlyActive ?? true;
        const tokens = await PasswordResetTokenHandler.listPasswordResetTokens(
          showOnlyActive,
          prisma
        );
        return responses._200(tokens);
      }

    case "DELETE":
      if (!email) return responses._400({ error: "Email is required" });
      const deletedToken =
        await PasswordResetTokenHandler.deletePasswordResetToken(email, prisma);
      return deletedToken
        ? responses._204()
        : responses._400({ error: "Token not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

/**
 * Handle Article routes
 * @param {string} httpMethod - HTTP method
 * @param {string|undefined} articleId - Article ID (optional)
 * @param {Object} body - Request body
 * @returns {Promise<Object>} - API Gateway response
 */
const handleArticleRoutes = async (httpMethod, articleId, body) => {
  switch (httpMethod) {
    case "GET":
      if (articleId) {
        const id = BigInt(articleId);
        const article = await ArticleHandlerService.getArticleById(id, prisma);
        return article
          ? responses._200(article)
          : responses._400({ error: "Article not found" });
      } else {
        const articles = await prisma.articles.findMany();
        return responses._200(articles);
      }

    case "POST":
      const newArticle = await ArticleHandlerService.createArticle(
        body,
        prisma
      );
      return responses._200(newArticle);

    case "PUT":
      if (!articleId)
        return responses._400({ error: "Article ID is required" });
      const idToUpdate = BigInt(articleId);
      const updatedArticle = await ArticleHandlerService.updateArticle(
        idToUpdate,
        body,
        prisma
      );
      return updatedArticle
        ? responses._200(updatedArticle)
        : responses._400({ error: "Article not found" });

    case "DELETE":
      if (!articleId)
        return responses._400({ error: "Article ID is required" });
      const idToDelete = BigInt(articleId);
      const deletedArticle = await ArticleHandlerService.deleteArticle(
        idToDelete,
        prisma
      );
      return deletedArticle
        ? responses._204()
        : responses._400({ error: "Article not found" });

    default:
      return responses._400({ error: "Method Not Allowed" });
  }
};

module.exports = {
  handler,
};
