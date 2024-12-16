### Requirements

- Python : [download](https://www.python.org/downloads/)
- Node >= 18 : [download](https://nodejs.org/en/download/package-manager)

---

### Global Packages Required :

- `npm i -g aws-cdk`
- `npm i -g typescript`
- `npm i -g aws-sdk`

---

### CDK Commands

- `cdk bootstrap`
- `cdk synth`
- `cdk deploy`

---

## Minimal Steps to setup the project

1. Install the Global Packages & Requirements mentioned above.
2. RUN `chmod +x ./setup.sh` & then run the script `./setup.sh`. Now wait for the setup to be completed. If faced any error then refer the `Detailed Steps`
3. Once the project is deployed completely, go to the created rds database & copy the host value, by default the credentials will be the following :
   ```
      DB_CONNECTION=pgsql
      DB_HOST=<Connectivity-&-security-Endpoint> // Example: xxxxxxxx.us-west-2.rds.amazonaws.com
      DB_PORT=5432
      DB_DATABASE=postgres
      DB_USERNAME=postgres
      DB_PASSWORD=postgres
   ```
   - Now go to the laravel project and update the database credentials with the above credentials and do the migration & seeding.
4. Once the step 4 is done, update the `DATABASE_URL` value in the `.env.develop` and `lib/dr-ref-api-stack.ts` file in this format :
   ```
      DATABASE_URL="postgresql://<DB_USERNAME>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DB_DATABASE>"
   ```
5. Now we need to setup the prisma & deploy. Follow the following commands :
   ```
      npx primsa db pull
      npx dotenv -e .env.develop -- npx prisma generate
      npx dotenv -e .env.develop -- npx prisma migrate dev
   ```
6. Once the above commands are executed run the following commands.

- `Note : For subsequent deployments you can use the following commands :`

  ```
     npm run build
     python3 ./layers/create_prisma_layer_from_generate.py .env.develop
     cdk synth
     cdk deploy
  ```

---

## Detailed Steps to setup the project

Running for the First time :

1. Install the npm packages
   ```
   npm install
   ```
2. Build the files.
   ```
   npm run build
   ```
   Note : If you get any error related to 'dist' then direclty use `tsc` to compile & build the files.
3. Generate the prisma client

   ```
   npx dotenv -e .env.develop -- npx prisma generate
   ```

   Note : If you get any `Error: Unknown binaryTarget debian-openssl-3.0.x and no custom binaries were provided` then use the following two commands first then run the above command again

   ```
      npm install prisma --save-dev

      npm install @prisma/client@dev prisma@dev
   ```

4. Build the prisma layer

   ```
   python3 ./layers/create_prisma_layer_from_generate.py .env.develop
   ```

5. Boostrap the project
   ```
   cdk bootstrap
   ```
6. Synthesize the project
   ```
   cdk synth
   ```
7. Deploy the project

   ```
   cdk deploy
   ```

8. Once the stack is deployed COPY the db credentials from the rds databases and update the `DATABASE_URL` values in the project.
   By default the creds will be

   ```
      DB_CONNECTION=pgsql
      DB_HOST=<Connectivity-&-security-Endpoint> // Example: xxxxxxxx.us-west-2.rds.amazonaws.com
      DB_PORT=5432
      DB_DATABASE=postgres
      DB_USERNAME=postgres
      DB_PASSWORD=postgres
   ```

   Copy the host value and update in the db url
   `DATABASE_URL="postgresql://<DB_USERNAME>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DB_DATABASE>"`

9. Once you have the URL ready update them in the following files

   1. `.env.develop`
   2. `lib/dr-ref-api-stack.ts`

10. Now do the migration & seeding from the laravel project using the db credentials.
11. Once the migration & seeding is done follow the next steps

12. Pull the schema from db to prims

```
   npx primsa db pull
```

12. Genreate the prisma client again

```
   npx dotenv -e .env.develop -- npx prisma generate
```

13. Run the migration command so that the schema is sync with db

```
   npx dotenv -e .env.develop -- npx prisma migrate dev
```

14. Build the files.

```
   npm run build
```

15. Generate the prisma layer again

```
   python3 ./layers/create_prisma_layer_from_generate.py .env.develop
```

Note : If you get any error then delete the `dist` folder and run `tsc`

16. Synth & Deploy

```
   cdk synth
   cdk deploy
```

### Subsequent Runs :

- If there any changes done related to db or prisma then the prisma layer should be build again.
- If changes are related only to the lambda stack then simply build & deploy.

---

### Some Prima Commands

- Create a migration from changes in Prisma schema, apply it to the database, trigger generators (e.g. Prisma Client)

  ```
  npx prisma migrate dev
  ```

- Reset your database and apply all migrations

  ```
  npx prisma migrate reset
  ```

- Apply pending migrations to the database in production/staging

  ```
  npx prisma migrate deploy
  ```

- Check the status of migrations in the production/staging database

  ```
  npx prisma migrate status
  ```

- Specify a schema
  ```
  npx prisma migrate status --schema=./schema.prisma
  ```
