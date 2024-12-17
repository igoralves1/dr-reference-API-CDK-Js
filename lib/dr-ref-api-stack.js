const {
  Duration,
  RemovalPolicy,
  SecretValue,
  Stack,
  App,
} = require("aws-cdk-lib");
const rds = require("aws-cdk-lib/aws-rds");
const ec2 = require("aws-cdk-lib/aws-ec2");
const { Code, LayerVersion, Runtime } = require("aws-cdk-lib/aws-lambda");
const path = require("path");
const { NodejsFunction } = require("aws-cdk-lib/aws-lambda-nodejs");
const {
  Cors,
  LambdaIntegration,
  LambdaRestApi,
} = require("aws-cdk-lib/aws-apigateway");

class DrRefApiStack extends Stack {
  /**
   * @param {App} scope
   * @param {string} id
   * @param {import("aws-cdk-lib").StackProps} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "api-vpc", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
      natGateways: 0,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: "public-subnet-1",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    const dbSG = new ec2.SecurityGroup(this, "api-public-sg", {
      vpc,
    });
    dbSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      "allow connections from anywhere from everything"
    );

    const engine = rds.DatabaseInstanceEngine.postgres({
      version: rds.PostgresEngineVersion.VER_16,
    });

    const instance = new rds.DatabaseInstance(this, "df-ref-api-db", {
      engine,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      multiAz: false,
      credentials: rds.Credentials.fromPassword(
        "postgres",
        SecretValue.unsafePlainText("postgres")
      ),
      databaseName: "postgres",
      publiclyAccessible: true,
      removalPolicy: RemovalPolicy.DESTROY,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO
      ),
    });
    instance.connections.allowDefaultPortFromAnyIpv4();

    const DATABASE_URL =
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@drrefapistack-dfrefapidba35ed994-biwgfwbqn3tb.cfuo4s42e02r.us-east-2.rds.amazonaws.com:5432/postgres";

    const api_prisma_layer = new LayerVersion(this, "api_prisma_layer", {
      compatibleRuntimes: [Runtime.NODEJS_18_X],
      removalPolicy: RemovalPolicy.DESTROY,
      code: Code.fromAsset(
        path.join(__dirname, "../layers/api_prisma_layer.zip")
      ),
    });

    // Create a helper function to create integrations for resources other than the main one
    const createLambdaIntegration = (resourceFolderName) => {
      const resourceFunction = new NodejsFunction(
        this,
        `${resourceFolderName}Function`,
        {
          runtime: Runtime.NODEJS_18_X,
          entry: path.join(
            __dirname,
            `../lambdas/${resourceFolderName}/handler.js`
          ),
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
        }
      );
      return new LambdaIntegration(resourceFunction);
    };

    const userHandlerFunction = new NodejsFunction(
      this,
      "UserHandlerFunction",
      {
        runtime: Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambdas/UserHandler/handler.js"),
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
      }
    );

    // Create the API with the main handler
    const api = new LambdaRestApi(this, "df-ref-api/v1", {
      restApiName: "Dr Reference API",
      handler: userHandlerFunction,
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

    const usersIntegration = new LambdaIntegration(userHandlerFunction);
    const usersResource = api.root.addResource("users");
    const userIdResource = usersResource.addResource("{id}");
    usersResource.addMethod("GET", usersIntegration);
    usersResource.addMethod("POST", usersIntegration);
    userIdResource.addMethod("GET", usersIntegration);
    userIdResource.addMethod("PUT", usersIntegration);
    userIdResource.addMethod("DELETE", usersIntegration);

    // Password Reset Tokens
    const passwordResetTokensIntegration = createLambdaIntegration(
      "PasswordResetTokensHandler"
    );
    const passwordResetTokensResource = api.root.addResource(
      "password-reset-tokens"
    );
    const passwordResetTokenEmailResource =
      passwordResetTokensResource.addResource("{email}");
    passwordResetTokensResource.addMethod(
      "GET",
      passwordResetTokensIntegration
    );
    passwordResetTokensResource.addMethod(
      "POST",
      passwordResetTokensIntegration
    );
    passwordResetTokenEmailResource.addMethod(
      "GET",
      passwordResetTokensIntegration
    );
    passwordResetTokenEmailResource.addMethod(
      "DELETE",
      passwordResetTokensIntegration
    );

    // Articles
    const articlesIntegration = createLambdaIntegration("ArticlesTableHandler");
    const articlesResource = api.root.addResource("articles");
    const articleIdResource = articlesResource.addResource("{id}");
    articlesResource.addMethod("GET", articlesIntegration);
    articlesResource.addMethod("POST", articlesIntegration);
    articleIdResource.addMethod("GET", articlesIntegration);
    articleIdResource.addMethod("PUT", articlesIntegration);
    articleIdResource.addMethod("DELETE", articlesIntegration);

    // Addresses
    const addressesIntegration = createLambdaIntegration("AddressesHandler");
    const addressesResource = api.root.addResource("addresses");
    const addressIdResource = addressesResource.addResource("{id}");
    addressesResource.addMethod("GET", addressesIntegration);
    addressesResource.addMethod("POST", addressesIntegration);
    addressIdResource.addMethod("GET", addressesIntegration);
    addressIdResource.addMethod("PUT", addressesIntegration);
    addressIdResource.addMethod("DELETE", addressesIntegration);

    // Address Types
    const addressTypesIntegration = createLambdaIntegration(
      "AddressTypesHandler"
    );
    const addressTypesResource = api.root.addResource("address-types");
    const addressTypeIdResource = addressTypesResource.addResource("{id}");
    addressTypesResource.addMethod("GET", addressTypesIntegration);
    addressTypesResource.addMethod("POST", addressTypesIntegration);
    addressTypeIdResource.addMethod("GET", addressTypesIntegration);
    addressTypeIdResource.addMethod("PUT", addressTypesIntegration);
    addressTypeIdResource.addMethod("DELETE", addressTypesIntegration);

    // Address User
    const addressUserIntegration =
      createLambdaIntegration("AddressUserHandler");
    const addressUserResource = api.root.addResource("address-user");
    const addressUserByUserIdResource =
      addressUserResource.addResource("{userId}");
    const addressUserByUserIdAndAddressIdResource =
      addressUserByUserIdResource.addResource("{addressId}");
    addressUserResource.addMethod("GET", addressUserIntegration);
    addressUserByUserIdAndAddressIdResource.addMethod(
      "GET",
      addressUserIntegration
    );
    addressUserByUserIdAndAddressIdResource.addMethod(
      "POST",
      addressUserIntegration
    );
    addressUserByUserIdAndAddressIdResource.addMethod(
      "PUT",
      addressUserIntegration
    );
    addressUserByUserIdAndAddressIdResource.addMethod(
      "DELETE",
      addressUserIntegration
    );

    // Article Audio
    const articleAudioIntegration = createLambdaIntegration(
      "ArticleAudioHandler"
    );
    const articleAudioResource = api.root.addResource("article-audio");
    const articleAudioByAudioIdResource =
      articleAudioResource.addResource("{audioId}");
    const articleAudioByAudioIdAndArticleIdResource =
      articleAudioByAudioIdResource.addResource("{articleId}");
    articleAudioResource.addMethod("GET", articleAudioIntegration);
    articleAudioResource.addMethod("POST", articleAudioIntegration);
    articleAudioByAudioIdAndArticleIdResource.addMethod(
      "GET",
      articleAudioIntegration
    );
    articleAudioByAudioIdAndArticleIdResource.addMethod(
      "PUT",
      articleAudioIntegration
    );
    articleAudioByAudioIdAndArticleIdResource.addMethod(
      "DELETE",
      articleAudioIntegration
    );

    // Countries
    const countriesIntegration = createLambdaIntegration("CountriesHandler");
    const countriesResource = api.root.addResource("countries");
    const countryByIdResource = countriesResource.addResource("{id}");
    countriesResource.addMethod("GET", countriesIntegration);
    countriesResource.addMethod("POST", countriesIntegration);
    countryByIdResource.addMethod("GET", countriesIntegration);
    countryByIdResource.addMethod("PUT", countriesIntegration);
    countryByIdResource.addMethod("DELETE", countriesIntegration);

    // Provinces
    const provincesIntegration = createLambdaIntegration("ProvincesHandler");
    const provincesResource = api.root.addResource("provinces");
    const provinceByIdResource = provincesResource.addResource("{id}");
    provincesResource.addMethod("GET", provincesIntegration);
    provincesResource.addMethod("POST", provincesIntegration);
    provinceByIdResource.addMethod("GET", provincesIntegration);
    provinceByIdResource.addMethod("PUT", provincesIntegration);
    provinceByIdResource.addMethod("DELETE", provincesIntegration);

    // Cities
    const citiesIntegration = createLambdaIntegration("CitiesHandler");
    const citiesResource = api.root.addResource("cities");
    const cityByIdResource = citiesResource.addResource("{id}");
    citiesResource.addMethod("GET", citiesIntegration);
    citiesResource.addMethod("POST", citiesIntegration);
    cityByIdResource.addMethod("GET", citiesIntegration);
    cityByIdResource.addMethod("PUT", citiesIntegration);
    cityByIdResource.addMethod("DELETE", citiesIntegration);

    // Phones
    const phonesIntegration = createLambdaIntegration("PhonesHandler");
    const phonesResource = api.root.addResource("phones");
    const phoneByIdResource = phonesResource.addResource("{id}");
    phonesResource.addMethod("GET", phonesIntegration);
    phonesResource.addMethod("POST", phonesIntegration);
    phoneByIdResource.addMethod("GET", phonesIntegration);
    phoneByIdResource.addMethod("PUT", phonesIntegration);
    phoneByIdResource.addMethod("DELETE", phonesIntegration);

    // Cell Phones
    const cellPhonesIntegration = createLambdaIntegration("CellPhonesHandler");
    const cellPhonesResource = api.root.addResource("cell-phones");
    const cellPhoneByIdResource = cellPhonesResource.addResource("{id}");
    cellPhonesResource.addMethod("GET", cellPhonesIntegration);
    cellPhonesResource.addMethod("POST", cellPhonesIntegration);
    cellPhoneByIdResource.addMethod("GET", cellPhonesIntegration);
    cellPhoneByIdResource.addMethod("PUT", cellPhonesIntegration);
    cellPhoneByIdResource.addMethod("DELETE", cellPhonesIntegration);

    // Faxes
    const faxesIntegration = createLambdaIntegration("FaxesHandler");
    const faxesResource = api.root.addResource("faxes");
    const faxByIdResource = faxesResource.addResource("{id}");
    faxesResource.addMethod("GET", faxesIntegration);
    faxesResource.addMethod("POST", faxesIntegration);
    faxByIdResource.addMethod("GET", faxesIntegration);
    faxByIdResource.addMethod("PUT", faxesIntegration);
    faxByIdResource.addMethod("DELETE", faxesIntegration);

    // Languages
    const languagesIntegration = createLambdaIntegration("LanguagesHandler");
    const languagesResource = api.root.addResource("languages");
    const languageByIdResource = languagesResource.addResource("{id}");
    languagesResource.addMethod("GET", languagesIntegration);
    languagesResource.addMethod("POST", languagesIntegration);
    languageByIdResource.addMethod("GET", languagesIntegration);
    languageByIdResource.addMethod("PUT", languagesIntegration);
    languageByIdResource.addMethod("DELETE", languagesIntegration);

    // User Types
    const userTypesIntegration = createLambdaIntegration("UserTypesHandler");
    const userTypesResource = api.root.addResource("user-types");
    const userTypeByIdResource = userTypesResource.addResource("{id}");
    userTypesResource.addMethod("GET", userTypesIntegration);
    userTypesResource.addMethod("POST", userTypesIntegration);
    userTypeByIdResource.addMethod("GET", userTypesIntegration);
    userTypeByIdResource.addMethod("PUT", userTypesIntegration);
    userTypeByIdResource.addMethod("DELETE", userTypesIntegration);

    // User Groups
    const userGroupsIntegration = createLambdaIntegration("UserGroupsHandler");
    const userGroupsResource = api.root.addResource("user-groups");
    const userGroupByIdResource = userGroupsResource.addResource("{id}");
    userGroupsResource.addMethod("GET", userGroupsIntegration);
    userGroupsResource.addMethod("POST", userGroupsIntegration);
    userGroupByIdResource.addMethod("GET", userGroupsIntegration);
    userGroupByIdResource.addMethod("PUT", userGroupsIntegration);
    userGroupByIdResource.addMethod("DELETE", userGroupsIntegration);

    // Country User
    const countryUserIntegration =
      createLambdaIntegration("CountryUserHandler");
    const countryUserResource = api.root.addResource("country-user");
    const countryUserByUserIdResource =
      countryUserResource.addResource("{userId}");
    const countryUserByUserIdAndCountryIdResource =
      countryUserByUserIdResource.addResource("{countryId}");
    countryUserResource.addMethod("GET", countryUserIntegration);
    countryUserResource.addMethod("POST", countryUserIntegration);
    countryUserByUserIdAndCountryIdResource.addMethod(
      "GET",
      countryUserIntegration
    );
    countryUserByUserIdAndCountryIdResource.addMethod(
      "PUT",
      countryUserIntegration
    );
    countryUserByUserIdAndCountryIdResource.addMethod(
      "DELETE",
      countryUserIntegration
    );

    // Language User
    const languageUserIntegration = createLambdaIntegration(
      "LanguageUserHandler"
    );
    const languageUserResource = api.root.addResource("language-user");
    const languageUserByUserIdResource =
      languageUserResource.addResource("{userId}");
    const languageUserByUserIdAndLanguageIdResource =
      languageUserByUserIdResource.addResource("{languageId}");
    languageUserResource.addMethod("GET", languageUserIntegration);
    languageUserResource.addMethod("POST", languageUserIntegration);
    languageUserByUserIdAndLanguageIdResource.addMethod(
      "GET",
      languageUserIntegration
    );
    languageUserByUserIdAndLanguageIdResource.addMethod(
      "PUT",
      languageUserIntegration
    );
    languageUserByUserIdAndLanguageIdResource.addMethod(
      "DELETE",
      languageUserIntegration
    );

    // User Group User
    const userGroupUserIntegration = createLambdaIntegration(
      "UserGroupUserHandler"
    );
    const userGroupUserResource = api.root.addResource("user-group-user");
    const userGroupUserByUserIdResource =
      userGroupUserResource.addResource("{userId}");
    const userGroupUserByUserIdAndGroupIdResource =
      userGroupUserByUserIdResource.addResource("{userGroupId}");
    userGroupUserResource.addMethod("GET", userGroupUserIntegration);
    userGroupUserResource.addMethod("POST", userGroupUserIntegration);
    userGroupUserByUserIdAndGroupIdResource.addMethod(
      "GET",
      userGroupUserIntegration
    );
    userGroupUserByUserIdAndGroupIdResource.addMethod(
      "PUT",
      userGroupUserIntegration
    );
    userGroupUserByUserIdAndGroupIdResource.addMethod(
      "DELETE",
      userGroupUserIntegration
    );

    // User Type User
    const userTypeUserIntegration = createLambdaIntegration(
      "UserTypeUserHandler"
    );
    const userTypeUserResource = api.root.addResource("user-type-user");
    const userTypeUserByUserIdResource =
      userTypeUserResource.addResource("{userId}");
    const userTypeUserByUserIdAndTypeIdResource =
      userTypeUserByUserIdResource.addResource("{userTypeId}");
    userTypeUserResource.addMethod("GET", userTypeUserIntegration);
    userTypeUserResource.addMethod("POST", userTypeUserIntegration);
    userTypeUserByUserIdAndTypeIdResource.addMethod(
      "GET",
      userTypeUserIntegration
    );
    userTypeUserByUserIdAndTypeIdResource.addMethod(
      "PUT",
      userTypeUserIntegration
    );
    userTypeUserByUserIdAndTypeIdResource.addMethod(
      "DELETE",
      userTypeUserIntegration
    );

    // Professionals
    const professionalsIntegration = createLambdaIntegration(
      "ProfessionalsHandler"
    );
    const professionalsResource = api.root.addResource("professionals");
    const professionalsByIdResource = professionalsResource.addResource("{id}");
    professionalsResource.addMethod("GET", professionalsIntegration);
    professionalsResource.addMethod("POST", professionalsIntegration);
    professionalsByIdResource.addMethod("GET", professionalsIntegration);
    professionalsByIdResource.addMethod("PUT", professionalsIntegration);
    professionalsByIdResource.addMethod("DELETE", professionalsIntegration);

    // Tokens
    const tokensIntegration = createLambdaIntegration("TokensHandler");
    const tokensResource = api.root.addResource("tokens");
    const tokensByIdResource = tokensResource.addResource("{id}");
    tokensResource.addMethod("GET", tokensIntegration);
    tokensResource.addMethod("POST", tokensIntegration);
    tokensByIdResource.addMethod("GET", tokensIntegration);
    tokensByIdResource.addMethod("PUT", tokensIntegration);
    tokensByIdResource.addMethod("DELETE", tokensIntegration);

    // References
    const referencesIntegration = createLambdaIntegration("ReferencesHandler");
    const referencesResource = api.root.addResource("references");
    const referencesByIdResource = referencesResource.addResource("{id}");
    referencesResource.addMethod("GET", referencesIntegration);
    referencesResource.addMethod("POST", referencesIntegration);
    referencesByIdResource.addMethod("GET", referencesIntegration);
    referencesByIdResource.addMethod("PUT", referencesIntegration);
    referencesByIdResource.addMethod("DELETE", referencesIntegration);

    // Videos
    const videosIntegration = createLambdaIntegration("VideosHandler");
    const videosResource = api.root.addResource("videos");
    const videosByIdResource = videosResource.addResource("{id}");
    videosResource.addMethod("GET", videosIntegration);
    videosResource.addMethod("POST", videosIntegration);
    videosByIdResource.addMethod("GET", videosIntegration);
    videosByIdResource.addMethod("PUT", videosIntegration);
    videosByIdResource.addMethod("DELETE", videosIntegration);

    // Images
    const imagesIntegration = createLambdaIntegration("ImagesHandler");
    const imagesResource = api.root.addResource("images");
    const imageByIdResource = imagesResource.addResource("{id}");
    imagesResource.addMethod("GET", imagesIntegration);
    imagesResource.addMethod("POST", imagesIntegration);
    imageByIdResource.addMethod("GET", imagesIntegration);
    imageByIdResource.addMethod("PUT", imagesIntegration);
    imageByIdResource.addMethod("DELETE", imagesIntegration);

    // Audios
    const audiosIntegration = createLambdaIntegration("AudiosHandler");
    const audiosResource = api.root.addResource("audios");
    const audioByIdResource = audiosResource.addResource("{id}");
    audiosResource.addMethod("GET", audiosIntegration);
    audiosResource.addMethod("POST", audiosIntegration);
    audioByIdResource.addMethod("GET", audiosIntegration);
    audioByIdResource.addMethod("PUT", audiosIntegration);
    audioByIdResource.addMethod("DELETE", audiosIntegration);

    // Article Video
    const articleVideoIntegration = createLambdaIntegration(
      "ArticleVideoHandler"
    );
    const articleVideoResource = api.root.addResource("article-video");
    const articleVideoByVideoIdResource =
      articleVideoResource.addResource("{videoId}");
    const articleVideoByVideoIdAndArticleIdResource =
      articleVideoByVideoIdResource.addResource("{articleId}");
    articleVideoResource.addMethod("GET", articleVideoIntegration);
    articleVideoResource.addMethod("POST", articleVideoIntegration);
    articleVideoByVideoIdAndArticleIdResource.addMethod(
      "GET",
      articleVideoIntegration
    );
    articleVideoByVideoIdAndArticleIdResource.addMethod(
      "DELETE",
      articleVideoIntegration
    );

    // Article Image
    const articleImageIntegration = createLambdaIntegration(
      "ArticleImageHandler"
    );
    const articleImageResource = api.root.addResource("article-image");
    const articleImageByImageIdResource =
      articleImageResource.addResource("{imageId}");
    const articleImageByImageIdAndArticleIdResource =
      articleImageByImageIdResource.addResource("{articleId}");
    articleImageResource.addMethod("GET", articleImageIntegration);
    articleImageResource.addMethod("POST", articleImageIntegration);
    articleImageByImageIdAndArticleIdResource.addMethod(
      "GET",
      articleImageIntegration
    );
    articleImageByImageIdAndArticleIdResource.addMethod(
      "PUT",
      articleImageIntegration
    );
    articleImageByImageIdAndArticleIdResource.addMethod(
      "DELETE",
      articleImageIntegration
    );

    // Specialties
    const specialtiesIntegration =
      createLambdaIntegration("SpecialtiesHandler");
    const specialtiesResource = api.root.addResource("specialties");
    const specialtyByIdResource = specialtiesResource.addResource("{id}");
    const specialtiesByProfessionIdResource = specialtiesResource
      .addResource("profession")
      .addResource("{professionId}");
    specialtiesResource.addMethod("GET", specialtiesIntegration);
    specialtiesResource.addMethod("POST", specialtiesIntegration);
    specialtyByIdResource.addMethod("GET", specialtiesIntegration);
    specialtyByIdResource.addMethod("PUT", specialtiesIntegration);
    specialtyByIdResource.addMethod("DELETE", specialtiesIntegration);
    specialtiesByProfessionIdResource.addMethod("GET", specialtiesIntegration);

    // Professions
    const professionsIntegration =
      createLambdaIntegration("ProfessionsHandler");
    const professionsResource = api.root.addResource("professions");
    const professionsByIdResource =
      professionsResource.addResource("{professionId}");
    professionsResource.addMethod("GET", professionsIntegration);
    professionsResource.addMethod("POST", professionsIntegration);
    professionsByIdResource.addMethod("GET", professionsIntegration);
    professionsByIdResource.addMethod("PUT", professionsIntegration);
    professionsByIdResource.addMethod("DELETE", professionsIntegration);

    // Article Professional
    const articleProfessionalIntegration = createLambdaIntegration(
      "ArticleProfessionalHandler"
    );
    const articleProfessionalResource = api.root.addResource(
      "article-professional"
    );
    const articleProfessionalByProfessionalIdResource =
      articleProfessionalResource.addResource("{professionalId}");
    const articleProfessionalByProfessionalIdAndArticleIdResource =
      articleProfessionalByProfessionalIdResource.addResource("{articleId}");
    articleProfessionalResource.addMethod(
      "GET",
      articleProfessionalIntegration
    );
    articleProfessionalResource.addMethod(
      "POST",
      articleProfessionalIntegration
    );
    articleProfessionalByProfessionalIdAndArticleIdResource.addMethod(
      "GET",
      articleProfessionalIntegration
    );
    articleProfessionalByProfessionalIdAndArticleIdResource.addMethod(
      "PUT",
      articleProfessionalIntegration
    );
    articleProfessionalByProfessionalIdAndArticleIdResource.addMethod(
      "DELETE",
      articleProfessionalIntegration
    );

    // Professional Specialty
    const professionalSpecialtyIntegration = createLambdaIntegration(
      "ProfessionalSpecialtyHandler"
    );
    const professionalSpecialtyResource = api.root.addResource(
      "professional-specialty"
    );
    const professionalSpecialtyByProfessionalIdResource =
      professionalSpecialtyResource.addResource("{professionalId}");
    const professionalSpecialtyByProfessionalIdAndSpecialtyIdResource =
      professionalSpecialtyByProfessionalIdResource.addResource(
        "{specialtyId}"
      );
    professionalSpecialtyResource.addMethod(
      "GET",
      professionalSpecialtyIntegration
    );
    professionalSpecialtyResource.addMethod(
      "POST",
      professionalSpecialtyIntegration
    );
    professionalSpecialtyByProfessionalIdAndSpecialtyIdResource.addMethod(
      "GET",
      professionalSpecialtyIntegration
    );
    professionalSpecialtyByProfessionalIdAndSpecialtyIdResource.addMethod(
      "PUT",
      professionalSpecialtyIntegration
    );
    professionalSpecialtyByProfessionalIdAndSpecialtyIdResource.addMethod(
      "DELETE",
      professionalSpecialtyIntegration
    );

    // Professional Province
    const professionalProvinceIntegration = createLambdaIntegration(
      "ProfessionalProvinceHandler"
    );
    const professionalProvinceResource = api.root.addResource(
      "professional-province"
    );
    const professionalProvinceByProfessionalIdResource =
      professionalProvinceResource.addResource("{professionalId}");
    const professionalProvinceByProfessionalIdAndProvinceIdResource =
      professionalProvinceByProfessionalIdResource.addResource("{provinceId}");
    professionalProvinceResource.addMethod(
      "GET",
      professionalProvinceIntegration
    );
    professionalProvinceResource.addMethod(
      "POST",
      professionalProvinceIntegration
    );
    professionalProvinceByProfessionalIdAndProvinceIdResource.addMethod(
      "GET",
      professionalProvinceIntegration
    );
    professionalProvinceByProfessionalIdAndProvinceIdResource.addMethod(
      "PUT",
      professionalProvinceIntegration
    );
    professionalProvinceByProfessionalIdAndProvinceIdResource.addMethod(
      "DELETE",
      professionalProvinceIntegration
    );
  }
}

module.exports = { DrRefApiStack };
