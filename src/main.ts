import { Logger, LogLevel } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { createDatabase } from "typeorm-extension";

async function createDatabaseIfNotExist() {
  // reference: https://github.com/typeorm/typeorm/issues/809#issuecomment-864900069
  await createDatabase({ ifNotExist: true });
}

async function bootstrap() {
  /**
   * This app contains a NestJS hybrid application (HTTP)
   * You can switch to a microservice with NestFactory.createMicroservice() as follows:
   *
   * const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
   *  transport: Transport.TCP,
   *  options: { retryAttempts: 5, retryDelay: 3000 },
   * });
   * await app.listen();
   */

  const app = await NestFactory.create(AppModule, {
    logger: getLoggerLevel()
  });

  const configService = app.get(ConfigService);

  const REST_API_SERVER_ENV = configService.get("REST_API_SERVER_ENV");
  const REST_API_SERVER_PORT: number = configService.get("REST_API_SERVER_PORT");
  // const REST_API_SERVER_HOST: string = configService.get("REST_API_SERVER_HOST");

  Logger.log(`REST_API_SERVER_ENV: ${REST_API_SERVER_ENV}`, "Main");

  // app.use(express.json());
  // app.use(bodyParser.json({ limit: '500mb' }));
  // app.enableCors();

  const SWAGGER_API_ACTIVATE = configService.get('SWAGGER_API_ACTIVATE') || true;
  if (SWAGGER_API_ACTIVATE) {
    createSwagger(app as NestExpressApplication);
    Logger.log(`Create Swagger API Document`, "Main");
  }

  await app.listen(REST_API_SERVER_PORT, async () => {
    Logger.log(`Application is running on: ${await app.getUrl()}`, "Main")
  });
}

bootstrap().catch((reason: any) => {
  Logger.error(`Bootstrapping error ${reason}`, "Main");
  process.exit(1);
});

// ClusterService.clusterize(() => {});

/**
 * Register a Swagger module in the NestJS application.
 * This method mutates the given `app` to register a new module dedicated to
 * Swagger API documentation. Any request performed on `SWAGGER_PREFIX` will
 * receive a documentation page as response.
 */

function createSwagger(app: NestExpressApplication) {
  const configService = app.get(ConfigService);
  const title: string = configService.get("SWAGGER_TITLE") || "Node App";
  const description: string =
    configService.get("SWAGGER_DESCRIPTION") || "REST API server";
  const version: string = configService.get("SWAGGER_VERSION") || "1.0";
  const prefix: string = configService.get("SWAGGER_PREFIX") || "/docs";
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    // .addTag('my-api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(prefix, app, document);

  Logger.log(
    `Swagger API is available on ${process.env.REST_API_SERVER_HOST}:${process.env.REST_API_SERVER_PORT}${prefix}`,
    "Main"
  );
}

/**
 * Logging configuration
 */
function getLoggerLevel(): LogLevel[] {
  const isDevelopment: boolean = process.env.LOGGING_LEVEL === "development";
  const isStaging: boolean = process.env.LOGGING_LEVEL === "staging";
  return isDevelopment
    ? ["debug", "log", "warn", "error"]
    : isStaging
    ? ["log", "warn", "error"]
    : ["log", "error"];
}
