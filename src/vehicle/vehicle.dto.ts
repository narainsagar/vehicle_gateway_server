import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString, Max, Min } from "class-validator";

export class VehicleRequestDto {
  @ApiProperty({ type: String, required: true })
  @IsString({
    always: true,
  })
  deviceId: string;

  @ApiProperty({ type: Number, required: false })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { always: true })
  latitude: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { always: true })
  longitude: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { always: true })
  @Min(0, { always: true })
  @Max(100, { always: true })
  battery: number;

  // @ApiProperty({ type: String, required: false })
  // @IsString({
  //   always: true,
  // })
  // status: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean({
    always: true,
  })
  running: boolean;

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean({
    always: true,
  })
  online: boolean;

  @ApiProperty({ type: Number, required: false })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { always: true })
  updateFrequency: number;
}

export class VehicleResponseDto extends PickType(VehicleRequestDto, [
  'deviceId',
  'online',
  'latitude',
  'longitude',
  'battery',
  'updateFrequency',
  'running',
]) {
  @ApiProperty({ type: String, required: false })
  @IsString({
    always: true,
  })
  lastHeartbeat: string;
}

export class VehicleFrequencyDto {
  @ApiProperty({ type: Number })
  seconds: number;
}

export class VehicleStatusDto {
  @ApiProperty({ type: Boolean })
  running: boolean;
}

export class VehicleWebhookDto {
  @ApiProperty({ type: String })
  webhookUrl: string;
}

export class VehicleWebhookEventDto {
  @ApiProperty({ type: String })
  event: string;
}

export class VehicleWebhookOnlineStatusDto {
  @ApiProperty({ type: String })
  webhookUrl: string;

  @ApiProperty({ type: Number })
  seconds: number;
}

export class VehicleDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  deviceId: string;

  @ApiProperty({ type: Boolean })
  online: boolean;

  @ApiProperty({ type: Number })
  latitude: number;

  @ApiProperty({ type: Number })
  longitude: number;

  @ApiProperty({ type: Number })
  battery: number;

  @ApiProperty({ type: Boolean })
  running: boolean;

  @ApiProperty({ type: Number })
  updateFrequency: number;

  // @ApiProperty({ type: String })
  // status: string;
}



export class TcpHandleRequestDto {
  @ApiProperty({ type: String })
  message: string;
}

export class TcpHandleResponseDto {
  @ApiProperty({ type: String })
  message: string;

  @ApiProperty({ type: String })
  success: boolean;
}
