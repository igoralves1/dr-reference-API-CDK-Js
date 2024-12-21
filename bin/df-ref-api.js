#!/usr/bin/env node
const cdk = require("aws-cdk-lib");
const { DatabaseStack } = require("../lib/database-stack");
const { DrRefApiPart1Stack } = require("../lib/dr-ref-api-part1-stack");
const { DrRefApiPart2Stack } = require("../lib/dr-ref-api-part2-stack");

const app = new cdk.App();

// Deploy the database stack first
const dbStack = new DatabaseStack(app, "DatabaseStackJS");

// Exporting values from DB stack
const databaseUrlExportName = "DatabaseURLExport";

// We export the database URL from the db stack
dbStack.exportValue(dbStack.databaseUrl, { name: databaseUrlExportName });

// Deploy Part 1 stack, importing the database URL
new DrRefApiPart1Stack(app, "DrRefApiPart1StackJS", {
  databaseUrlExportName,
});

// Deploy Part 2 stack, importing the database URL
new DrRefApiPart2Stack(app, "DrRefApiPart2StackJS", {
  databaseUrlExportName,
});
