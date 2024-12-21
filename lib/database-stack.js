const { Stack, RemovalPolicy, SecretValue } = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const rds = require("aws-cdk-lib/aws-rds");

class DatabaseStack extends Stack {
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
      "allow connections from anywhere"
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
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE2,
        ec2.InstanceSize.MICRO
      ),
      allocatedStorage: 20,
      multiAz: false,
      credentials: rds.Credentials.fromPassword(
        "postgres", // will be changed later
        SecretValue.unsafePlainText("postgres") // will be changed later
      ),
      databaseName: "postgres",
      publiclyAccessible: true,
      removalPolicy: RemovalPolicy.DESTROY,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO
      ),
      securityGroups: [dbSG],
    });
    instance.connections.allowDefaultPortFromAnyIpv4();

    // Construct the DATABASE_URL for lambda environment
    // Format: postgresql://username:password@host:port/databasename
    const dbEndpoint = instance.instanceEndpoint.hostname;
    const dbPort = instance.instanceEndpoint.port.toString();
    const dbUser = "postgres";
    const dbPass = "postgres";
    const dbName = "postgres";
    console.log("db endpoint", dbEndpoint);
    this.databaseUrl = `postgresql://${dbUser}:${dbPass}@${dbEndpoint}:${dbPort}/${dbName}`;
  }
}

module.exports = { DatabaseStack };
