import * as Joi from "@hapi/joi";

export const environment = Joi.object({
  // NodeJS
  SERVER_ENV: Joi.string()
    .valid("development", "staging", "production")
    .default("development"),
  SERVER_HOST: Joi.string().default("127.0.0.1"),
  SERVER_PORT: Joi.number().default(3000),
  // Logging
  LOGGING_LEVEL: Joi.string()
    .valid("development", "staging", "production")
    .default("development"),

  // Webhooks API endpoints
  WEBHOOK_ENDPOINT_URL: Joi.string().required(),
  DEBUG_BLOB_REPORT_URL: Joi.string().required(),
  
  // TypeORM
  TYPEORM_TYPE: Joi.string().required(),
  TYPEORM_HOST: Joi.string().required(),
  TYPEORM_PORT: Joi.string().required(),
  TYPEORM_USERNAME: Joi.string().required(),
  TYPEORM_PASSWORD: Joi.string().required(),
  TYPEORM_DATABASE: Joi.string().required(),
  TYPEORM_SYNCHRONIZE: Joi.boolean().default(true),

  // SWAGGER API 
  SWAGGER_TITLE: Joi.string().default("Vehicle Service API"),
  SWAGGER_DESCRIPTION: Joi.string().default(" Vehicle Server Gateway API description"),
  SWAGGER_PREFIX: Joi.string().default("/docs"),
  SWAGGER_VERSION: Joi.string().default("1.0"),
});
