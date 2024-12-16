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

    // const vpc = new ec2.Vpc(this, "api-vpc", {
    //   ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
    //   natGateways: 0,
    //   maxAzs: 3,
    //   subnetConfiguration: [
    //     {
    //       name: "public-subnet-1",
    //       subnetType: ec2.SubnetType.PUBLIC,
    //       cidrMask: 24,
    //     },
    //   ],
    // });

    // const dbSG = new ec2.SecurityGroup(this, "api-public-sg", {
    //   vpc,
    // });
    // dbSG.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.allTraffic(),
    //   "allow connections from anywhere from everything"
    // );

    // const engine = rds.DatabaseInstanceEngine.postgres({
    //   version: rds.PostgresEngineVersion.VER_16,
    // });

    // const instance = new rds.DatabaseInstance(this, "df-ref-api-db", {
    //   engine,
    //   vpc,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PUBLIC,
    //   },
    //   multiAz: false,
    //   credentials: rds.Credentials.fromPassword(
    //     "postgres", // will be changed later
    //     SecretValue.unsafePlainText("postgres") // will be changed later
    //   ),
    //   databaseName: "postgres",
    //   publiclyAccessible: true,
    //   removalPolicy: RemovalPolicy.DESTROY,
    //   instanceType: ec2.InstanceType.of(
    //     ec2.InstanceClass.BURSTABLE3,
    //     ec2.InstanceSize.MICRO
    //   ),
    // });
    // instance.connections.allowDefaultPortFromAnyIpv4();

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

    const drRefApiHandler = new NodejsFunction(this, "df-ref-api-lambda", {
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

    const api = new LambdaRestApi(this, "df-ref-api/v1", {
      restApiName: "Dr Reference API",
      handler: drRefApiHandler,
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

    const lambdaIntegration = new LambdaIntegration(drRefApiHandler);

    // Users resources
    const usersResource = api.root.addResource("users");
    const userIdResource = usersResource.addResource("{id}"); // handle /users/{id}

    usersResource.addMethod("GET", lambdaIntegration); // for GET /users
    usersResource.addMethod("POST", lambdaIntegration); // for POST /users

    userIdResource.addMethod("GET", lambdaIntegration); // for GET /users/{id}
    userIdResource.addMethod("PUT", lambdaIntegration); // for PUT /users/{id}
    userIdResource.addMethod("DELETE", lambdaIntegration); // for DELETE /users/{id}

    // Password Reset Tokens resources
    const passwordResetTokensResource = api.root.addResource(
      "password-reset-tokens"
    );
    const passwordResetTokenEmailResource =
      passwordResetTokensResource.addResource("{email}");

    passwordResetTokensResource.addMethod("GET", lambdaIntegration); // for GET /password-reset-tokens
    passwordResetTokensResource.addMethod("POST", lambdaIntegration); // for POST /password-reset-tokens

    passwordResetTokenEmailResource.addMethod("GET", lambdaIntegration); // for GET /password-reset-tokens/{email}
    passwordResetTokenEmailResource.addMethod("DELETE", lambdaIntegration); // for DELETE /password-reset-tokens/{email}

    // Articles resources
    const articlesResource = api.root.addResource("articles");
    const articleIdResource = articlesResource.addResource("{id}");

    articlesResource.addMethod("GET", lambdaIntegration); // for GET /articles
    articlesResource.addMethod("POST", lambdaIntegration); // for POST /articles

    articleIdResource.addMethod("GET", lambdaIntegration); // for GET /articles/{id}
    articleIdResource.addMethod("PUT", lambdaIntegration); // for PUT /articles/{id}
    articleIdResource.addMethod("DELETE", lambdaIntegration); // for DELETE /articles/{id}

    // Addresses resources
    const addressesResource = api.root.addResource("addresses");
    const addressIdResource = addressesResource.addResource("{id}");

    addressesResource.addMethod("GET", lambdaIntegration); // for GET /addresses
    addressesResource.addMethod("POST", lambdaIntegration); // for POST /addresses

    addressIdResource.addMethod("GET", lambdaIntegration); // for GET /addresses/{id}
    addressIdResource.addMethod("PUT", lambdaIntegration); // for PUT /addresses/{id}
    addressIdResource.addMethod("DELETE", lambdaIntegration); // for DELETE /addresses/{id}

    // Address Types resources
    const addressTypesResource = api.root.addResource("address-types");
    const addressTypeIdResource = addressTypesResource.addResource("{id}");

    addressTypesResource.addMethod("GET", lambdaIntegration); // for GET /address-types
    addressTypesResource.addMethod("POST", lambdaIntegration); // for POST /address-types

    addressTypeIdResource.addMethod("GET", lambdaIntegration); // for GET /address-types/{id}
    addressTypeIdResource.addMethod("PUT", lambdaIntegration); // for PUT /address-types/{id}
    addressTypeIdResource.addMethod("DELETE", lambdaIntegration); // for DELETE /address-types/{id}

    // Address User Resource
    const addressUserResource = api.root.addResource("address-user");
    const addressUserByUserIdResource =
      addressUserResource.addResource("{userId}");
    const addressUserByUserIdAndAddressIdResource =
      addressUserByUserIdResource.addResource("{addressId}");

    // Add methods to the resources
    addressUserResource.addMethod("GET", lambdaIntegration); // for GET /address-user
    addressUserByUserIdAndAddressIdResource.addMethod("GET", lambdaIntegration); // for GET /address-user/{userId}/{addressId}
    addressUserByUserIdAndAddressIdResource.addMethod(
      "POST",
      lambdaIntegration
    ); // for POST /address-user/{userId}/{addressId}
    addressUserByUserIdAndAddressIdResource.addMethod("PUT", lambdaIntegration); // for PUT /address-user/{userId}/{addressId}
    addressUserByUserIdAndAddressIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // for DELETE /address-user/{userId}/{addressId}

    const articleAudioResource = api.root.addResource("article-audio");
    const articleAudioByAudioIdResource =
      articleAudioResource.addResource("{audioId}");
    const articleAudioByAudioIdAndArticleIdResource =
      articleAudioByAudioIdResource.addResource("{articleId}");

    // Add HTTP methods
    articleAudioResource.addMethod("GET", lambdaIntegration); // GET /article-audio
    articleAudioResource.addMethod("POST", lambdaIntegration); // POST /article-audio
    articleAudioByAudioIdAndArticleIdResource.addMethod(
      "GET",
      lambdaIntegration
    ); // GET /article-audio/{audioId}/{articleId}
    articleAudioByAudioIdAndArticleIdResource.addMethod(
      "PUT",
      lambdaIntegration
    ); // PUT /article-audio/{audioId}/{articleId}
    articleAudioByAudioIdAndArticleIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // DELETE /article-audio/{audioId}/{articleId}

    const countriesResource = api.root.addResource("countries");
    const countryByIdResource = countriesResource.addResource("{id}");

    // Add HTTP methods
    countriesResource.addMethod("GET", lambdaIntegration); // GET /countries
    countriesResource.addMethod("POST", lambdaIntegration); // POST /countries
    countryByIdResource.addMethod("GET", lambdaIntegration); // GET /countries/{id}
    countryByIdResource.addMethod("PUT", lambdaIntegration); // PUT /countries/{id}
    countryByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /countries/{id}

    const provincesResource = api.root.addResource("provinces");
    const provinceByIdResource = provincesResource.addResource("{id}");

    // Add HTTP methods
    provincesResource.addMethod("GET", lambdaIntegration); // GET /provinces
    provincesResource.addMethod("POST", lambdaIntegration); // POST /provinces
    provinceByIdResource.addMethod("GET", lambdaIntegration); // GET /provinces/{id}
    provinceByIdResource.addMethod("PUT", lambdaIntegration); // PUT /provinces/{id}
    provinceByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /provinces/{id}

    const citiesResource = api.root.addResource("cities");
    const cityByIdResource = citiesResource.addResource("{id}");

    // Add HTTP methods
    citiesResource.addMethod("GET", lambdaIntegration); // GET /cities
    citiesResource.addMethod("POST", lambdaIntegration); // POST /cities
    cityByIdResource.addMethod("GET", lambdaIntegration); // GET /cities/{id}
    cityByIdResource.addMethod("PUT", lambdaIntegration); // PUT /cities/{id}
    cityByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /cities/{id}

    const phonesResource = api.root.addResource("phones");
    const phoneByIdResource = phonesResource.addResource("{id}");

    // Add HTTP methods
    phonesResource.addMethod("GET", lambdaIntegration); // GET /phones
    phonesResource.addMethod("POST", lambdaIntegration); // POST /phones
    phoneByIdResource.addMethod("GET", lambdaIntegration); // GET /phones/{id}
    phoneByIdResource.addMethod("PUT", lambdaIntegration); // PUT /phones/{id}
    phoneByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /phones/{id}

    const cellPhonesResource = api.root.addResource("cell-phones");
    const cellPhoneByIdResource = cellPhonesResource.addResource("{id}");

    // Add HTTP methods
    cellPhonesResource.addMethod("GET", lambdaIntegration); // GET /cell-phones
    cellPhonesResource.addMethod("POST", lambdaIntegration); // POST /cell-phones
    cellPhoneByIdResource.addMethod("GET", lambdaIntegration); // GET /cell-phones/{id}
    cellPhoneByIdResource.addMethod("PUT", lambdaIntegration); // PUT /cell-phones/{id}
    cellPhoneByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /cell-phones/{id}

    const faxesResource = api.root.addResource("faxes");
    const faxByIdResource = faxesResource.addResource("{id}");

    // Add HTTP methods
    faxesResource.addMethod("GET", lambdaIntegration); // GET /faxes
    faxesResource.addMethod("POST", lambdaIntegration); // POST /faxes
    faxByIdResource.addMethod("GET", lambdaIntegration); // GET /faxes/{id}
    faxByIdResource.addMethod("PUT", lambdaIntegration); // PUT /faxes/{id}
    faxByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /faxes/{id}

    const languagesResource = api.root.addResource("languages");

    const languageByIdResource = languagesResource.addResource("{id}");

    // Add HTTP methods
    languagesResource.addMethod("GET", lambdaIntegration); // GET /languages
    languagesResource.addMethod("POST", lambdaIntegration); // POST /languages
    languageByIdResource.addMethod("GET", lambdaIntegration); // GET /languages/{id}
    languageByIdResource.addMethod("PUT", lambdaIntegration); // PUT /languages/{id}
    languageByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /languages/{id}

    const userTypesResource = api.root.addResource("user-types");
    const userTypeByIdResource = userTypesResource.addResource("{id}");

    // Add HTTP methods
    userTypesResource.addMethod("GET", lambdaIntegration); // GET /user-types
    userTypesResource.addMethod("POST", lambdaIntegration); // POST /user-types
    userTypeByIdResource.addMethod("GET", lambdaIntegration); // GET /user-types/{id}
    userTypeByIdResource.addMethod("PUT", lambdaIntegration); // PUT /user-types/{id}
    userTypeByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /user-types/{id}

    const userGroupsResource = api.root.addResource("user-groups");
    const userGroupByIdResource = userGroupsResource.addResource("{id}");

    // Add HTTP methods
    userGroupsResource.addMethod("GET", lambdaIntegration); // GET /user-groups
    userGroupsResource.addMethod("POST", lambdaIntegration); // POST /user-groups
    userGroupByIdResource.addMethod("GET", lambdaIntegration); // GET /user-groups/{id}
    userGroupByIdResource.addMethod("PUT", lambdaIntegration); // PUT /user-groups/{id}
    userGroupByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /user-groups/{id}

    // Country User Resource
    const countryUserResource = api.root.addResource("country-user");
    const countryUserByUserIdResource =
      countryUserResource.addResource("{userId}");
    const countryUserByUserIdAndCountryIdResource =
      countryUserByUserIdResource.addResource("{countryId}");

    // Add methods to the resources
    countryUserResource.addMethod("GET", lambdaIntegration); // GET /country-user
    countryUserResource.addMethod("POST", lambdaIntegration); // POST /country-user
    countryUserByUserIdAndCountryIdResource.addMethod("GET", lambdaIntegration); // GET /country-user/{userId}/{countryId}
    countryUserByUserIdAndCountryIdResource.addMethod("PUT", lambdaIntegration); // PUT /country-user/{userId}/{countryId}
    countryUserByUserIdAndCountryIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // DELETE /country-user/{userId}/{countryId}

    // Language User Resource
    const languageUserResource = api.root.addResource("language-user");
    const languageUserByUserIdResource =
      languageUserResource.addResource("{userId}");
    const languageUserByUserIdAndLanguageIdResource =
      languageUserByUserIdResource.addResource("{languageId}");

    // Add methods to the resources
    languageUserResource.addMethod("GET", lambdaIntegration); // GET /language-user
    languageUserByUserIdAndLanguageIdResource.addMethod(
      "GET",
      lambdaIntegration
    ); // GET /language-user/{userId}/{languageId}
    languageUserResource.addMethod("POST", lambdaIntegration); // POST /language-user
    languageUserByUserIdAndLanguageIdResource.addMethod(
      "PUT",
      lambdaIntegration
    ); // PUT /language-user/{userId}/{languageId}
    languageUserByUserIdAndLanguageIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // DELETE /language-user/{userId}/{languageId}

    // User Group User Resource
    const userGroupUserResource = api.root.addResource("user-group-user");
    const userGroupUserByUserIdResource =
      userGroupUserResource.addResource("{userId}");
    const userGroupUserByUserIdAndGroupIdResource =
      userGroupUserByUserIdResource.addResource("{userGroupId}");

    // Add methods to the resources
    userGroupUserResource.addMethod("GET", lambdaIntegration); // for GET /user-group-user
    userGroupUserResource.addMethod("POST", lambdaIntegration); // for POST /user-group-user/{userId}/{userGroupId}
    userGroupUserByUserIdAndGroupIdResource.addMethod("GET", lambdaIntegration); // for GET /user-group-user/{userId}/{userGroupId}
    userGroupUserByUserIdAndGroupIdResource.addMethod("PUT", lambdaIntegration); // for PUT /user-group-user/{userId}/{userGroupId}
    userGroupUserByUserIdAndGroupIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // for DELETE /user-group-user/{userId}/{userGroupId}

    // User Type User Resource
    const userTypeUserResource = api.root.addResource("user-type-user");
    const userTypeUserByUserIdResource =
      userTypeUserResource.addResource("{userId}");
    const userTypeUserByUserIdAndTypeIdResource =
      userTypeUserByUserIdResource.addResource("{userTypeId}");

    // Add HTTP methods
    userTypeUserResource.addMethod("GET", lambdaIntegration); // GET /user-type-user
    userTypeUserResource.addMethod("POST", lambdaIntegration); // POST /user-type-user
    userTypeUserByUserIdAndTypeIdResource.addMethod("GET", lambdaIntegration); // GET /user-type-user/{userId}/{userTypeId}
    userTypeUserByUserIdAndTypeIdResource.addMethod("PUT", lambdaIntegration); // PUT /user-type-user/{userId}/{userTypeId}
    userTypeUserByUserIdAndTypeIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // DELETE /user-type-user/{userId}/{userTypeId}
    // Professionals Resource

    const professionalsResource = api.root.addResource("professionals");
    const professionalsByIdResource = professionalsResource.addResource("{id}");

    // Add HTTP methods
    professionalsResource.addMethod("GET", lambdaIntegration); // GET /professionals
    professionalsResource.addMethod("POST", lambdaIntegration); // POST /professionals
    professionalsByIdResource.addMethod("GET", lambdaIntegration); // GET /professionals/{id}
    professionalsByIdResource.addMethod("PUT", lambdaIntegration); // PUT /professionals/{id}
    professionalsByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /professionals/{id}

    // Tokens Resource
    const tokensResource = api.root.addResource("tokens");
    const tokensByIdResource = tokensResource.addResource("{id}");

    // Add methods to the resources
    tokensResource.addMethod("GET", lambdaIntegration); // GET /tokens
    tokensResource.addMethod("POST", lambdaIntegration); // POST /tokens
    tokensByIdResource.addMethod("GET", lambdaIntegration); // GET /tokens/{id}
    tokensByIdResource.addMethod("PUT", lambdaIntegration); // PUT /tokens/{id}
    tokensByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /tokens/{id}

    // References Resource
    const referencesResource = api.root.addResource("references");
    const referencesByIdResource = referencesResource.addResource("{id}");

    // Add methods to the resources
    referencesResource.addMethod("GET", lambdaIntegration); // GET /references
    referencesResource.addMethod("POST", lambdaIntegration); // POST /references
    referencesByIdResource.addMethod("GET", lambdaIntegration); // GET /references/{id}
    referencesByIdResource.addMethod("PUT", lambdaIntegration); // PUT /references/{id}
    referencesByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /references/{id}

    // Videos Resource
    const videosResource = api.root.addResource("videos");
    const videosByIdResource = videosResource.addResource("{id}");

    // Add methods to the resources
    videosResource.addMethod("GET", lambdaIntegration); // GET /videos
    videosResource.addMethod("POST", lambdaIntegration); // POST /videos
    videosByIdResource.addMethod("GET", lambdaIntegration); // GET /videos/{id}
    videosByIdResource.addMethod("PUT", lambdaIntegration); // PUT /videos/{id}
    videosByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /videos/{id}

    const imagesResource = api.root.addResource("images");
    const imageByIdResource = imagesResource.addResource("{id}");

    // Add HTTP methods
    imagesResource.addMethod("GET", lambdaIntegration); // GET /images
    imagesResource.addMethod("POST", lambdaIntegration); // POST /images
    imageByIdResource.addMethod("GET", lambdaIntegration); // GET /images/{id}
    imageByIdResource.addMethod("PUT", lambdaIntegration); // PUT /images/{id}
    imageByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /images/{id}

    const audiosResource = api.root.addResource("audios");
    const audioByIdResource = audiosResource.addResource("{id}");

    // Add HTTP methods
    audiosResource.addMethod("GET", lambdaIntegration); // GET /audios
    audiosResource.addMethod("POST", lambdaIntegration); // POST /audios
    audioByIdResource.addMethod("GET", lambdaIntegration); // GET /audios/{id}
    audioByIdResource.addMethod("PUT", lambdaIntegration); // PUT /audios/{id}
    audioByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /audios/{id}

    const articleVideoResource = api.root.addResource("article-video");
    const articleVideoByVideoIdResource =
      articleVideoResource.addResource("{videoId}");
    const articleVideoByVideoIdAndArticleIdResource =
      articleVideoByVideoIdResource.addResource("{articleId}");

    // Add HTTP methods
    articleVideoResource.addMethod("GET", lambdaIntegration); // GET /article-video
    articleVideoByVideoIdAndArticleIdResource.addMethod(
      "GET",
      lambdaIntegration
    ); // GET /article-video/{videoId}/{articleId}
    articleVideoResource.addMethod("POST", lambdaIntegration); // POST /article-video
    articleVideoByVideoIdAndArticleIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // DELETE /article-video/{videoId}/{articleId}

    const articleImageResource = api.root.addResource("article-image");
    const articleImageByImageIdResource =
      articleImageResource.addResource("{imageId}");
    const articleImageByImageIdAndArticleIdResource =
      articleImageByImageIdResource.addResource("{articleId}");

    // Add HTTP methods
    articleImageResource.addMethod("GET", lambdaIntegration); // GET /article-image
    articleImageResource.addMethod("POST", lambdaIntegration); // POST /article-image
    articleImageByImageIdAndArticleIdResource.addMethod(
      "GET",
      lambdaIntegration
    ); // GET /article-image/{imageId}/{articleId}
    articleImageByImageIdAndArticleIdResource.addMethod(
      "PUT",
      lambdaIntegration
    ); // PUT /article-image/{imageId}/{articleId}
    articleImageByImageIdAndArticleIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // DELETE /article-image/{imageId}/{articleId}

    const specialtiesResource = api.root.addResource("specialties");
    const specialtyByIdResource = specialtiesResource.addResource("{id}");
    const specialtiesByProfessionIdResource = specialtiesResource
      .addResource("profession")
      .addResource("{professionId}");

    // Add HTTP methods
    specialtiesResource.addMethod("GET", lambdaIntegration); // GET /specialties
    specialtiesResource.addMethod("POST", lambdaIntegration); // POST /specialties
    specialtyByIdResource.addMethod("GET", lambdaIntegration); // GET /specialties/{id}
    specialtyByIdResource.addMethod("PUT", lambdaIntegration); // PUT /specialties/{id}
    specialtyByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /specialties/{id}
    specialtiesByProfessionIdResource.addMethod("GET", lambdaIntegration); // GET /specialties/profession/{professionId}

    const professionsResource = api.root.addResource("professions");
    const professionsByIdResource =
      professionsResource.addResource("{professionId}");

    // Add HTTP methods
    professionsResource.addMethod("GET", lambdaIntegration); // GET /professions
    professionsResource.addMethod("POST", lambdaIntegration); // POST /professions
    professionsByIdResource.addMethod("GET", lambdaIntegration); // GET /professions/{professionId}
    professionsByIdResource.addMethod("PUT", lambdaIntegration); // PUT /professions/{professionId}
    professionsByIdResource.addMethod("DELETE", lambdaIntegration); // DELETE /professions/{professionId}

    const articleProfessionalResource = api.root.addResource(
      "article-professional"
    );
    const articleProfessionalByProfessionalIdResource =
      articleProfessionalResource.addResource("{professionalId}");
    const articleProfessionalByProfessionalIdAndArticleIdResource =
      articleProfessionalByProfessionalIdResource.addResource("{articleId}");

    // Add HTTP methods
    articleProfessionalResource.addMethod("GET", lambdaIntegration); // GET /article-professional
    articleProfessionalResource.addMethod("POST", lambdaIntegration); // POST /article-professional
    articleProfessionalByProfessionalIdAndArticleIdResource.addMethod(
      "GET",
      lambdaIntegration
    ); // GET /article-professional/{professionalId}/{articleId}
    articleProfessionalByProfessionalIdAndArticleIdResource.addMethod(
      "PUT",
      lambdaIntegration
    ); // PUT /article-professional/{professionalId}/{articleId}
    articleProfessionalByProfessionalIdAndArticleIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // DELETE /article-professional/{professionalId}/{articleId}

    const professionalSpecialtyResource = api.root.addResource(
      "professional-specialty"
    );
    const professionalSpecialtyByProfessionalIdResource =
      professionalSpecialtyResource.addResource("{professionalId}");
    const professionalSpecialtyByProfessionalIdAndSpecialtyIdResource =
      professionalSpecialtyByProfessionalIdResource.addResource(
        "{specialtyId}"
      );

    // Add HTTP methods
    professionalSpecialtyResource.addMethod("GET", lambdaIntegration); // GET /professional-specialty
    professionalSpecialtyResource.addMethod("POST", lambdaIntegration); // POST /professional-specialty
    professionalSpecialtyByProfessionalIdAndSpecialtyIdResource.addMethod(
      "GET",
      lambdaIntegration
    ); // GET /professional-specialty/{professionalId}/{specialtyId}
    professionalSpecialtyByProfessionalIdAndSpecialtyIdResource.addMethod(
      "PUT",
      lambdaIntegration
    ); // PUT /professional-specialty/{professionalId}/{specialtyId}
    professionalSpecialtyByProfessionalIdAndSpecialtyIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // DELETE /professional-specialty/{professionalId}/{specialtyId}

    const professionalProvinceResource = api.root.addResource(
      "professional-province"
    );
    const professionalProvinceByProfessionalIdResource =
      professionalProvinceResource.addResource("{professionalId}");
    const professionalProvinceByProfessionalIdAndProvinceIdResource =
      professionalProvinceByProfessionalIdResource.addResource("{provinceId}");

    // Add HTTP methods
    professionalProvinceResource.addMethod("GET", lambdaIntegration); // GET /professional-province
    professionalProvinceResource.addMethod("POST", lambdaIntegration); // POST /professional-province
    professionalProvinceByProfessionalIdAndProvinceIdResource.addMethod(
      "GET",
      lambdaIntegration
    ); // GET /professional-province/{professionalId}/{provinceId}
    professionalProvinceByProfessionalIdAndProvinceIdResource.addMethod(
      "PUT",
      lambdaIntegration
    ); // PUT /professional-province/{professionalId}/{provinceId}
    professionalProvinceByProfessionalIdAndProvinceIdResource.addMethod(
      "DELETE",
      lambdaIntegration
    ); // DELETE /professional-province/{professionalId}/{provinceId}
  }
}

module.exports = { DrRefApiStack };
