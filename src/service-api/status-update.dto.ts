import { PickType, ApiProperty } from "@nestjs/swagger";
import { VehicleRequestDto } from "src/vehicle/vehicle.dto";

export class VehicleWebhookStatusUpdateRequestDto extends PickType(VehicleRequestDto, [
    'deviceId',
    'online',
    'latitude',
    'longitude',
    'battery',
    'updateFrequency',
    'running'
  ]) {
    @ApiProperty({ type: String })
    debug_blob: string;
  }
  
  export class VehicleWebhookStatusUpdateDebugBlobDto extends PickType(VehicleWebhookStatusUpdateRequestDto, [
    'deviceId',
    'debug_blob'
  ]) {}
  
  
  export class VehicleWebhookStatusUpdatePositionDto extends PickType(VehicleWebhookStatusUpdateRequestDto, [
    'deviceId',
    'latitude',
    'longitude'
  ]) {}
  
  export class VehicleWebhookStatusUpdateOnlineOfflineDto extends PickType(VehicleWebhookStatusUpdateRequestDto, [
    'deviceId'
  ]) {}
  

  export class VehicleWebhookStatusUpdateBatteryDto extends PickType(VehicleWebhookStatusUpdateRequestDto, [
    'deviceId',
    'battery'
  ]) {}
  
  
  export class VehicleWebhookStatusUpdateRunningStatusDto extends PickType(VehicleWebhookStatusUpdateRequestDto, [
    'deviceId',
    'running'
  ]) {}
  
  