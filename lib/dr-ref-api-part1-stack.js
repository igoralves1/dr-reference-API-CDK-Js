const { Duration, RemovalPolicy, Stack, Fn } = require("aws-cdk-lib");
const { Code, LayerVersion, Runtime } = require("aws-cdk-lib/aws-lambda");
const path = require("path");
const { NodejsFunction } = require("aws-cdk-lib/aws-lambda-nodejs");
const {
  LambdaRestApi,
  Cors,
  LambdaIntegration,
} = require("aws-cdk-lib/aws-apigateway");

class DrRefApiPart1Stack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { databaseUrlExportName } = props;
    const DATABASE_URL = Fn.importValue(databaseUrlExportName);
    
    const api_prisma_layer = new LayerVersion(this, "api_prisma_layer_part1", {
      compatibleRuntimes: [Runtime.NODEJS_18_X],
      removalPolicy: RemovalPolicy.DESTROY,
      code: Code.fromAsset(
        path.join(__dirname, "../layers/api_prisma_layer.zip")
      ),
    });
    console.log("DATABASE_URL : ", DATABASE_URL);
    const rootHandler = new NodejsFunction(this, "part1-root-handler", {
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

    const api = new LambdaRestApi(this, "dr-ref-api-part1", {
      restApiName: "Dr Reference API - Part 1",
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
          DATABASE_URL: DATABASE_URL,
        },
        bundling: {
          minify: true,
          externalModules: ["@prisma/client", "prisma"],
        },
        layers: [api_prisma_layer],
      });
      return new LambdaIntegration(fn);
    };

    // Users
    const usersIntegration = createIntegration("UserHandler");
    const usersResource = api.root.addResource("users");
    usersResource.addMethod("GET", usersIntegration);
    usersResource.addMethod("POST", usersIntegration);
    const userIdRes = usersResource.addResource("{id}");
    userIdRes.addMethod("GET", usersIntegration);
    userIdRes.addMethod("PUT", usersIntegration);
    userIdRes.addMethod("DELETE", usersIntegration);

    // Password Reset Tokens
    const pwdResetIntegration = createIntegration("PasswordResetTokensHandler");
    const pwdResetRes = api.root.addResource("password-reset-tokens");
    pwdResetRes.addMethod("GET", pwdResetIntegration);
    pwdResetRes.addMethod("POST", pwdResetIntegration);
    const pwdResetEmailRes = pwdResetRes.addResource("{email}");
    pwdResetEmailRes.addMethod("GET", pwdResetIntegration);
    pwdResetEmailRes.addMethod("DELETE", pwdResetIntegration);

    // Articles
    const articlesIntegration = createIntegration("ArticlesTableHandler");
    const articlesRes = api.root.addResource("articles");
    articlesRes.addMethod("GET", articlesIntegration);
    articlesRes.addMethod("POST", articlesIntegration);
    const articleIdRes = articlesRes.addResource("{id}");
    articleIdRes.addMethod("GET", articlesIntegration);
    articleIdRes.addMethod("PUT", articlesIntegration);
    articleIdRes.addMethod("DELETE", articlesIntegration);

    // Addresses
    const addressesIntegration = createIntegration("AddressesHandler");
    const addressesRes = api.root.addResource("addresses");
    addressesRes.addMethod("GET", addressesIntegration);
    addressesRes.addMethod("POST", addressesIntegration);
    const addressIdRes = addressesRes.addResource("{id}");
    addressIdRes.addMethod("GET", addressesIntegration);
    addressIdRes.addMethod("PUT", addressesIntegration);
    addressIdRes.addMethod("DELETE", addressesIntegration);

    // Address Types
    const addressTypesIntegration = createIntegration("AddressTypesHandler");
    const addressTypesRes = api.root.addResource("address-types");
    addressTypesRes.addMethod("GET", addressTypesIntegration);
    addressTypesRes.addMethod("POST", addressTypesIntegration);
    const addressTypeIdRes = addressTypesRes.addResource("{id}");
    addressTypeIdRes.addMethod("GET", addressTypesIntegration);
    addressTypeIdRes.addMethod("PUT", addressTypesIntegration);
    addressTypeIdRes.addMethod("DELETE", addressTypesIntegration);

    // Address User
    const addressUserIntegration = createIntegration("AddressUserHandler");
    const addressUserRes = api.root.addResource("address-user");
    addressUserRes.addMethod("GET", addressUserIntegration);
    const addressUserByUserIdRes = addressUserRes.addResource("{userId}");
    const addressUserByUserIdAndAddressIdRes =
      addressUserByUserIdRes.addResource("{addressId}");
    addressUserByUserIdAndAddressIdRes.addMethod("GET", addressUserIntegration);
    addressUserByUserIdAndAddressIdRes.addMethod(
      "POST",
      addressUserIntegration
    );
    addressUserByUserIdAndAddressIdRes.addMethod("PUT", addressUserIntegration);
    addressUserByUserIdAndAddressIdRes.addMethod(
      "DELETE",
      addressUserIntegration
    );

    // Article Audio
    const articleAudioIntegration = createIntegration("ArticleAudioHandler");
    const articleAudioRes = api.root.addResource("article-audio");
    articleAudioRes.addMethod("GET", articleAudioIntegration);
    articleAudioRes.addMethod("POST", articleAudioIntegration);
    const articleAudioByAudioIdRes = articleAudioRes.addResource("{audioId}");
    const articleAudioByAudioIdAndArticleIdRes =
      articleAudioByAudioIdRes.addResource("{articleId}");
    articleAudioByAudioIdAndArticleIdRes.addMethod(
      "GET",
      articleAudioIntegration
    );
    articleAudioByAudioIdAndArticleIdRes.addMethod(
      "PUT",
      articleAudioIntegration
    );
    articleAudioByAudioIdAndArticleIdRes.addMethod(
      "DELETE",
      articleAudioIntegration
    );

    // Countries
    const countriesIntegration = createIntegration("CountriesHandler");
    const countriesRes = api.root.addResource("countries");
    countriesRes.addMethod("GET", countriesIntegration);
    countriesRes.addMethod("POST", countriesIntegration);
    const countryByIdRes = countriesRes.addResource("{id}");
    countryByIdRes.addMethod("GET", countriesIntegration);
    countryByIdRes.addMethod("PUT", countriesIntegration);
    countryByIdRes.addMethod("DELETE", countriesIntegration);

    // Provinces
    const provincesIntegration = createIntegration("ProvincesHandler");
    const provincesRes = api.root.addResource("provinces");
    provincesRes.addMethod("GET", provincesIntegration);
    provincesRes.addMethod("POST", provincesIntegration);
    const provinceByIdRes = provincesRes.addResource("{id}");
    provinceByIdRes.addMethod("GET", provincesIntegration);
    provinceByIdRes.addMethod("PUT", provincesIntegration);
    provinceByIdRes.addMethod("DELETE", provincesIntegration);

    // Cities
    const citiesIntegration = createIntegration("CitiesHandler");
    const citiesRes = api.root.addResource("cities");
    citiesRes.addMethod("GET", citiesIntegration);
    citiesRes.addMethod("POST", citiesIntegration);
    const cityByIdRes = citiesRes.addResource("{id}");
    cityByIdRes.addMethod("GET", citiesIntegration);
    cityByIdRes.addMethod("PUT", citiesIntegration);
    cityByIdRes.addMethod("DELETE", citiesIntegration);

    // Phones
    const phonesIntegration = createIntegration("PhonesHandler");
    const phonesRes = api.root.addResource("phones");
    phonesRes.addMethod("GET", phonesIntegration);
    phonesRes.addMethod("POST", phonesIntegration);
    const phoneByIdRes = phonesRes.addResource("{id}");
    phoneByIdRes.addMethod("GET", phonesIntegration);
    phoneByIdRes.addMethod("PUT", phonesIntegration);
    phoneByIdRes.addMethod("DELETE", phonesIntegration);

    // Cell Phones
    const cellPhonesIntegration = createIntegration("CellPhonesHandler");
    const cellPhonesRes = api.root.addResource("cell-phones");
    cellPhonesRes.addMethod("GET", cellPhonesIntegration);
    cellPhonesRes.addMethod("POST", cellPhonesIntegration);
    const cellPhoneByIdRes = cellPhonesRes.addResource("{id}");
    cellPhoneByIdRes.addMethod("GET", cellPhonesIntegration);
    cellPhoneByIdRes.addMethod("PUT", cellPhonesIntegration);
    cellPhoneByIdRes.addMethod("DELETE", cellPhonesIntegration);

    // Faxes
    const faxesIntegration = createIntegration("FaxesHandler");
    const faxesRes = api.root.addResource("faxes");
    faxesRes.addMethod("GET", faxesIntegration);
    faxesRes.addMethod("POST", faxesIntegration);
    const faxByIdRes = faxesRes.addResource("{id}");
    faxByIdRes.addMethod("GET", faxesIntegration);
    faxByIdRes.addMethod("PUT", faxesIntegration);
    faxByIdRes.addMethod("DELETE", faxesIntegration);

    // Languages
    const languagesIntegration = createIntegration("LanguagesHandler");
    const languagesRes = api.root.addResource("languages");
    languagesRes.addMethod("GET", languagesIntegration);
    languagesRes.addMethod("POST", languagesIntegration);
    const languageByIdRes = languagesRes.addResource("{id}");
    languageByIdRes.addMethod("GET", languagesIntegration);
    languageByIdRes.addMethod("PUT", languagesIntegration);
    languageByIdRes.addMethod("DELETE", languagesIntegration);

    // User Types
    const userTypesIntegration = createIntegration("UserTypesHandler");
    const userTypesRes = api.root.addResource("user-types");
    userTypesRes.addMethod("GET", userTypesIntegration);
    userTypesRes.addMethod("POST", userTypesIntegration);
    const userTypeByIdRes = userTypesRes.addResource("{id}");
    userTypeByIdRes.addMethod("GET", userTypesIntegration);
    userTypeByIdRes.addMethod("PUT", userTypesIntegration);
    userTypeByIdRes.addMethod("DELETE", userTypesIntegration);

    // User Groups
    const userGroupsIntegration = createIntegration("UserGroupsHandler");
    const userGroupsRes = api.root.addResource("user-groups");
    userGroupsRes.addMethod("GET", userGroupsIntegration);
    userGroupsRes.addMethod("POST", userGroupsIntegration);
    const userGroupByIdRes = userGroupsRes.addResource("{id}");
    userGroupByIdRes.addMethod("GET", userGroupsIntegration);
    userGroupByIdRes.addMethod("PUT", userGroupsIntegration);
    userGroupByIdRes.addMethod("DELETE", userGroupsIntegration);
  }
}

module.exports = { DrRefApiPart1Stack };
