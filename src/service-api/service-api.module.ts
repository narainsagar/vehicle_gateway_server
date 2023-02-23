import { Module } from '@nestjs/common';
import { VehicleModule } from 'src/vehicle/vehicle.module';
import { ServiceApiController } from './service-api.controller';
import { ServiceApiService } from './service-api.service';

@Module({
  imports: [
    VehicleModule
  ],
  controllers: [ServiceApiController],
  providers: [ServiceApiService]
})
export class ServiceApiModule {}
