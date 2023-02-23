import { Module } from "@nestjs/common";
import { VehicleTackingService } from "./vehicle-tracking.service";
import { VehicleWebhookController } from "./vehicle-webhook.controller";
import { VehicleController } from "./vehicle.controller";
import { VehicleManager } from "./vehicle-manager";
import { VehicleEntity } from "./vehicle.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VehicleService } from "./vehicle.service";

@Module({
  imports: [TypeOrmModule.forFeature([VehicleEntity])],
  providers: [VehicleTackingService, VehicleManager, VehicleService],
  controllers: [VehicleController, VehicleWebhookController],
  exports: [VehicleTackingService]
})
export class VehicleModule {}
