const { Duration, RemovalPolicy, Stack, Fn } = require("aws-cdk-lib");
const { Code, LayerVersion, Runtime } = require("aws-cdk-lib/aws-lambda");
const path = require("path");
const { NodejsFunction } = require("aws-cdk-lib/aws-lambda-nodejs");
const {
  LambdaRestApi,
  Cors,
  LambdaIntegration,
} = require("aws-cdk-lib/aws-apigateway");

class DrRefApiPart2Stack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { databaseUrlExportName } = props;
    const DATABASE_URL = Fn.importValue(databaseUrlExportName);
    
    const api_prisma_layer = new LayerVersion(this, "api_prisma_layer_part2", {
      compatibleRuntimes: [Runtime.NODEJS_18_X],
      removalPolicy: RemovalPolicy.DESTROY,
      code: Code.fromAsset(
        path.join(__dirname, "../layers/api_prisma_layer.zip")
      ),
    });

    const rootHandler = new NodejsFunction(this, "part2-root-handler", {
      runtime: Runtime.NODEJS_18_X,
      entry: `lambdas/handler.js`,
      handler: "handler",
      memorySize: 256,
      timeout: Duration.seconds(10),
      environment: {
        DATABASE_URL: DATABASE_URL,
      },
      bundling: {
        minify: true,
        externalModules: ["@prisma/client", "prisma"],
      },
      layers: [api_prisma_layer],
    });

    const api = new LambdaRestApi(this, "dr-ref-api-part2", {
      restApiName: "Dr Reference API - Part 2",
      handler: rootHandler,
      proxy: false,
      deployOptions: {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: ["GET", "POST", "PUT", "DELETE"],
        allowCredentials: true,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
      },
    });

    const createIntegration = (folder) => {
      const fn = new NodejsFunction(this, `lambda-${folder}`, {
        runtime: Runtime.NODEJS_18_X,
        entry: `lambdas/${folder}/handler.js`,
        handler: "handler",
        memorySize: 256,
        timeout: Duration.seconds(10),
        environment: {
          DATABASE_URL,
        },
        bundling: {
          minify: true,
          externalModules: ["@prisma/client", "prisma"],
        },
        layers: [api_prisma_layer],
      });
      return new LambdaIntegration(fn);
    };

    // Country User
    const countryUserIntegration = createIntegration("CountryUserHandler");
    const countryUserRes = api.root.addResource("country-user");
    countryUserRes.addMethod("GET", countryUserIntegration);
    countryUserRes.addMethod("POST", countryUserIntegration);
    const countryUserByUserIdRes = countryUserRes.addResource("{userId}");
    const countryUserByUserIdAndCountryIdRes =
      countryUserByUserIdRes.addResource("{countryId}");
    countryUserByUserIdAndCountryIdRes.addMethod("GET", countryUserIntegration);
    countryUserByUserIdAndCountryIdRes.addMethod("PUT", countryUserIntegration);
    countryUserByUserIdAndCountryIdRes.addMethod(
      "DELETE",
      countryUserIntegration
    );

    // Language User
    const languageUserIntegration = createIntegration("LanguageUserHandler");
    const languageUserRes = api.root.addResource("language-user");
    languageUserRes.addMethod("GET", languageUserIntegration);
    languageUserRes.addMethod("POST", languageUserIntegration);
    const languageUserByUserIdRes = languageUserRes.addResource("{userId}");
    const languageUserByUserIdAndLanguageIdRes =
      languageUserByUserIdRes.addResource("{languageId}");
    languageUserByUserIdAndLanguageIdRes.addMethod(
      "GET",
      languageUserIntegration
    );
    languageUserByUserIdAndLanguageIdRes.addMethod(
      "PUT",
      languageUserIntegration
    );
    languageUserByUserIdAndLanguageIdRes.addMethod(
      "DELETE",
      languageUserIntegration
    );

    // User Group User
    const userGroupUserIntegration = createIntegration("UserGroupUserHandler");
    const userGroupUserRes = api.root.addResource("user-group-user");
    userGroupUserRes.addMethod("GET", userGroupUserIntegration);
    userGroupUserRes.addMethod("POST", userGroupUserIntegration);
    const userGroupUserByUserIdRes = userGroupUserRes.addResource("{userId}");
    const userGroupUserByUserIdAndGroupIdRes =
      userGroupUserByUserIdRes.addResource("{userGroupId}");
    userGroupUserByUserIdAndGroupIdRes.addMethod(
      "GET",
      userGroupUserIntegration
    );
    userGroupUserByUserIdAndGroupIdRes.addMethod(
      "PUT",
      userGroupUserIntegration
    );
    userGroupUserByUserIdAndGroupIdRes.addMethod(
      "DELETE",
      userGroupUserIntegration
    );

    // User Type User
    const userTypeUserIntegration = createIntegration("UserTypeUserHandler");
    const userTypeUserRes = api.root.addResource("user-type-user");
    userTypeUserRes.addMethod("GET", userTypeUserIntegration);
    userTypeUserRes.addMethod("POST", userTypeUserIntegration);
    const userTypeUserByUserIdRes = userTypeUserRes.addResource("{userId}");
    const userTypeUserByUserIdAndTypeIdRes =
      userTypeUserByUserIdRes.addResource("{userTypeId}");
    userTypeUserByUserIdAndTypeIdRes.addMethod("GET", userTypeUserIntegration);
    userTypeUserByUserIdAndTypeIdRes.addMethod("PUT", userTypeUserIntegration);
    userTypeUserByUserIdAndTypeIdRes.addMethod(
      "DELETE",
      userTypeUserIntegration
    );

    // Professionals
    const professionalsIntegration = createIntegration("ProfessionalsHandler");
    const professionalsRes = api.root.addResource("professionals");
    professionalsRes.addMethod("GET", professionalsIntegration);
    professionalsRes.addMethod("POST", professionalsIntegration);
    const professionalsByIdRes = professionalsRes.addResource("{id}");
    professionalsByIdRes.addMethod("GET", professionalsIntegration);
    professionalsByIdRes.addMethod("PUT", professionalsIntegration);
    professionalsByIdRes.addMethod("DELETE", professionalsIntegration);

    // Tokens
    const tokensIntegration = createIntegration("TokensHandler");
    const tokensRes = api.root.addResource("tokens");
    tokensRes.addMethod("GET", tokensIntegration);
    tokensRes.addMethod("POST", tokensIntegration);
    const tokensByIdRes = tokensRes.addResource("{id}");
    tokensByIdRes.addMethod("GET", tokensIntegration);
    tokensByIdRes.addMethod("PUT", tokensIntegration);
    tokensByIdRes.addMethod("DELETE", tokensIntegration);

    // References
    const referencesIntegration = createIntegration("ReferencesHandler");
    const referencesRes = api.root.addResource("references");
    referencesRes.addMethod("GET", referencesIntegration);
    referencesRes.addMethod("POST", referencesIntegration);
    const referencesByIdRes = referencesRes.addResource("{id}");
    referencesByIdRes.addMethod("GET", referencesIntegration);
    referencesByIdRes.addMethod("PUT", referencesIntegration);
    referencesByIdRes.addMethod("DELETE", referencesIntegration);

    // Videos
    const videosIntegration = createIntegration("VideosHandler");
    const videosRes = api.root.addResource("videos");
    videosRes.addMethod("GET", videosIntegration);
    videosRes.addMethod("POST", videosIntegration);
    const videosByIdRes = videosRes.addResource("{id}");
    videosByIdRes.addMethod("GET", videosIntegration);
    videosByIdRes.addMethod("PUT", videosIntegration);
    videosByIdRes.addMethod("DELETE", videosIntegration);

    // Images
    const imagesIntegration = createIntegration("ImagesHandler");
    const imagesRes = api.root.addResource("images");
    imagesRes.addMethod("GET", imagesIntegration);
    imagesRes.addMethod("POST", imagesIntegration);
    const imageByIdRes = imagesRes.addResource("{id}");
    imageByIdRes.addMethod("GET", imagesIntegration);
    imageByIdRes.addMethod("PUT", imagesIntegration);
    imageByIdRes.addMethod("DELETE", imagesIntegration);

    // Audios
    const audiosIntegration = createIntegration("AudiosHandler");
    const audiosRes = api.root.addResource("audios");
    audiosRes.addMethod("GET", audiosIntegration);
    audiosRes.addMethod("POST", audiosIntegration);
    const audioByIdRes = audiosRes.addResource("{id}");
    audioByIdRes.addMethod("GET", audiosIntegration);
    audioByIdRes.addMethod("PUT", audiosIntegration);
    audioByIdRes.addMethod("DELETE", audiosIntegration);

    // Article Video
    const articleVideoIntegration = createIntegration("ArticleVideoHandler");
    const articleVideoRes = api.root.addResource("article-video");
    articleVideoRes.addMethod("GET", articleVideoIntegration);
    articleVideoRes.addMethod("POST", articleVideoIntegration);
    const articleVideoByVideoIdRes = articleVideoRes.addResource("{videoId}");
    const articleVideoByVideoIdAndArticleIdRes =
      articleVideoByVideoIdRes.addResource("{articleId}");
    articleVideoByVideoIdAndArticleIdRes.addMethod(
      "GET",
      articleVideoIntegration
    );
    articleVideoByVideoIdAndArticleIdRes.addMethod(
      "DELETE",
      articleVideoIntegration
    );

    // Article Image
    const articleImageIntegration = createIntegration("ArticleImageHandler");
    const articleImageRes = api.root.addResource("article-image");
    articleImageRes.addMethod("GET", articleImageIntegration);
    articleImageRes.addMethod("POST", articleImageIntegration);
    const articleImageByImageIdRes = articleImageRes.addResource("{imageId}");
    const articleImageByImageIdAndArticleIdRes =
      articleImageByImageIdRes.addResource("{articleId}");
    articleImageByImageIdAndArticleIdRes.addMethod(
      "GET",
      articleImageIntegration
    );
    articleImageByImageIdAndArticleIdRes.addMethod(
      "PUT",
      articleImageIntegration
    );
    articleImageByImageIdAndArticleIdRes.addMethod(
      "DELETE",
      articleImageIntegration
    );

    // Specialties
    const specialtiesIntegration = createIntegration("SpecialtiesHandler");
    const specialtiesRes = api.root.addResource("specialties");
    specialtiesRes.addMethod("GET", specialtiesIntegration);
    specialtiesRes.addMethod("POST", specialtiesIntegration);
    const specialtyByIdRes = specialtiesRes.addResource("{id}");
    specialtyByIdRes.addMethod("GET", specialtiesIntegration);
    specialtyByIdRes.addMethod("PUT", specialtiesIntegration);
    specialtyByIdRes.addMethod("DELETE", specialtiesIntegration);
    const specialtiesByProfessionIdRes = specialtiesRes
      .addResource("profession")
      .addResource("{professionId}");
    specialtiesByProfessionIdRes.addMethod("GET", specialtiesIntegration);

    // Professions
    const professionsIntegration = createIntegration("ProfessionsHandler");
    const professionsRes = api.root.addResource("professions");
    professionsRes.addMethod("GET", professionsIntegration);
    professionsRes.addMethod("POST", professionsIntegration);
    const professionsByIdRes = professionsRes.addResource("{professionId}");
    professionsByIdRes.addMethod("GET", professionsIntegration);
    professionsByIdRes.addMethod("PUT", professionsIntegration);
    professionsByIdRes.addMethod("DELETE", professionsIntegration);

    // Article Professional
    const articleProfessionalIntegration = createIntegration(
      "ArticleProfessionalHandler"
    );
    const articleProfessionalRes = api.root.addResource("article-professional");
    articleProfessionalRes.addMethod("GET", articleProfessionalIntegration);
    articleProfessionalRes.addMethod("POST", articleProfessionalIntegration);
    const articleProfessionalByProfessionalIdRes =
      articleProfessionalRes.addResource("{professionalId}");
    const articleProfessionalByProfessionalIdAndArticleIdRes =
      articleProfessionalByProfessionalIdRes.addResource("{articleId}");
    articleProfessionalByProfessionalIdAndArticleIdRes.addMethod(
      "GET",
      articleProfessionalIntegration
    );
    articleProfessionalByProfessionalIdAndArticleIdRes.addMethod(
      "PUT",
      articleProfessionalIntegration
    );
    articleProfessionalByProfessionalIdAndArticleIdRes.addMethod(
      "DELETE",
      articleProfessionalIntegration
    );

    // Professional Specialty
    const professionalSpecialtyIntegration = createIntegration(
      "ProfessionalSpecialtyHandler"
    );
    const professionalSpecialtyRes = api.root.addResource(
      "professional-specialty"
    );
    professionalSpecialtyRes.addMethod("GET", professionalSpecialtyIntegration);
    professionalSpecialtyRes.addMethod(
      "POST",
      professionalSpecialtyIntegration
    );
    const professionalSpecialtyByProfessionalIdRes =
      professionalSpecialtyRes.addResource("{professionalId}");
    const professionalSpecialtyByProfessionalIdAndSpecialtyIdRes =
      professionalSpecialtyByProfessionalIdRes.addResource("{specialtyId}");
    professionalSpecialtyByProfessionalIdAndSpecialtyIdRes.addMethod(
      "GET",
      professionalSpecialtyIntegration
    );
    professionalSpecialtyByProfessionalIdAndSpecialtyIdRes.addMethod(
      "PUT",
      professionalSpecialtyIntegration
    );
    professionalSpecialtyByProfessionalIdAndSpecialtyIdRes.addMethod(
      "DELETE",
      professionalSpecialtyIntegration
    );

    // Professional Province
    const professionalProvinceIntegration = createIntegration(
      "ProfessionalProvinceHandler"
    );
    const professionalProvinceRes = api.root.addResource(
      "professional-province"
    );
    professionalProvinceRes.addMethod("GET", professionalProvinceIntegration);
    professionalProvinceRes.addMethod("POST", professionalProvinceIntegration);
    const professionalProvinceByProfessionalIdRes =
      professionalProvinceRes.addResource("{professionalId}");
    const professionalProvinceByProfessionalIdAndProvinceIdRes =
      professionalProvinceByProfessionalIdRes.addResource("{provinceId}");
    professionalProvinceByProfessionalIdAndProvinceIdRes.addMethod(
      "GET",
      professionalProvinceIntegration
    );
    professionalProvinceByProfessionalIdAndProvinceIdRes.addMethod(
      "PUT",
      professionalProvinceIntegration
    );
    professionalProvinceByProfessionalIdAndProvinceIdRes.addMethod(
      "DELETE",
      professionalProvinceIntegration
    );

    // For topics
    const topicsIntegration = createIntegration("TopicsHandler");
    const topicsRes = api.root.addResource("topics");
    topicsRes.addMethod("GET", topicsIntegration); // GET /topics
    topicsRes.addMethod("POST", topicsIntegration); // POST /topics
    const topicByIdRes = topicsRes.addResource("{topicId}");
    topicByIdRes.addMethod("GET", topicsIntegration);
    topicByIdRes.addMethod("PUT", topicsIntegration);
    topicByIdRes.addMethod("DELETE", topicsIntegration);

    // For user responses
    const userResponsesIntegration = createIntegration("UserResponsesHandler");
    const userResponsesRes = api.root.addResource("user-responses");
    userResponsesRes.addMethod("GET", userResponsesIntegration); // GET /user-responses
    userResponsesRes.addMethod("POST", userResponsesIntegration); // POST /user-responses
    const userResponseByIdRes = userResponsesRes.addResource("{responseId}");
    userResponseByIdRes.addMethod("GET", userResponsesIntegration);
    userResponseByIdRes.addMethod("PUT", userResponsesIntegration);
    userResponseByIdRes.addMethod("DELETE", userResponsesIntegration);

    // For quizzes
    const quizzesIntegration = createIntegration("QuizzesHandler");
    const quizzesRes = api.root.addResource("quizzes");
    quizzesRes.addMethod("GET", quizzesIntegration);
    quizzesRes.addMethod("POST", quizzesIntegration);
    const quizByIdRes = quizzesRes.addResource("{quizId}");
    quizByIdRes.addMethod("GET", quizzesIntegration);
    quizByIdRes.addMethod("PUT", quizzesIntegration);
    quizByIdRes.addMethod("DELETE", quizzesIntegration);

    // for topics questions
    const questionsIntegration = createIntegration("QuestionsHandler");
    const questionsResource = topicByIdRes.addResource("questions");
    // /topics/{topicId}/questions
    questionsResource.addMethod("GET", questionsIntegration);
    questionsResource.addMethod("POST", questionsIntegration);

    // /topics/{topicId}/questions/{questionId}
    const questionByIdRes = questionsResource.addResource("{questionId}");
    questionByIdRes.addMethod("GET", questionsIntegration);
    questionByIdRes.addMethod("PUT", questionsIntegration);
    questionByIdRes.addMethod("DELETE", questionsIntegration);
  }
}

module.exports = { DrRefApiPart2Stack };
