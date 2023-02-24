import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RouterModule } from "@nestjs/core";
import { AppController } from "./app.controller";
import routes from "./routes";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { environment } from "./env.schema";
import { VehicleModule } from "./vehicle/vehicle.module";
import { ServiceApiModule } from './service-api/service-api.module';
import { NestModule } from "@nestjs/common";
import { jsonMiddleware } from "./json.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: environment,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        ({
          type: configService.get('TYPEORM_TYPE'),
          host: configService.get('TYPEORM_HOST'),
          port: +configService.get<number>('TYPEORM_PORT'),
          username: configService.get('TYPEORM_USERNAME'),
          password: configService.get('TYPEORM_PASSWORD'),
          database: configService.get('TYPEORM_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('TYPEORM_SYNCHRONIZE'),
          logging: configService.get('REST_API_SERVER_ENV') === 'development',
          namingStrategy: new SnakeNamingStrategy(),
          legacySpatialSupport: false,
        } as TypeOrmModuleOptions),
      inject: [ConfigService],
    }),
    VehicleModule,
    ServiceApiModule, 
    RouterModule.register(routes), /* Note: RouterModule must be last one */
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jsonMiddleware).forRoutes({
      path: '/**',
      method: RequestMethod.ALL,
    });
  }
}