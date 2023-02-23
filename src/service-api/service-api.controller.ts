import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import axios from "axios";
import { VehicleTackingService } from "src/vehicle/vehicle-tracking.service";
import { VehicleFrequencyDto, VehicleStatusDto } from "src/vehicle/vehicle.dto";
import {
  VehicleWebhookStatusUpdateBatteryDto,
  VehicleWebhookStatusUpdateDebugBlobDto,
  VehicleWebhookStatusUpdateOnlineOfflineDto,
  VehicleWebhookStatusUpdatePositionDto,
  VehicleWebhookStatusUpdateRequestDto,
  VehicleWebhookStatusUpdateRunningStatusDto,
} from "./status-update.dto";

@ApiTags("Service API")
@Controller("")
export class ServiceApiController {
  constructor(private vehicleTrackingService: VehicleTackingService) {}

  // 1. To fetch information about the vehicle: if it’s connected or not, and, if it’s connected, current location, battery charge and running status.
  @Get(":deviceId/fetch-info")
  @ApiOperation({ summary: "fetch information about the vehicle" })
  async fetchInfo(@Param("deviceId") deviceId: string) {
    try {
      return await this.vehicleTrackingService.getVehicleStatus(deviceId);
    } catch (err) {
      return { error: true, message: `Something went wrong.`, errorInfo: err };
    }
  }

  // 2. To set the update frequency to a desired interval.
  @Post(":deviceId/frequency") // YES
  @ApiOperation({ summary: "set the update frequency to a desired interval" })
  @ApiBody({ type: VehicleFrequencyDto })
  async setUpdateFrequency(
    @Param("deviceId") deviceId: string,
    @Body() body: VehicleFrequencyDto
  ) {
    try {
      const { seconds } = body;
      await this.vehicleTrackingService.setUpdateFrequency(deviceId, seconds);
      return {
        success: true,
        message: `frequency is successfully set.`,
      };
    } catch (err) {
      return { error: true, message: `Something went wrong.`, errorInfo: err };
    }
  }

  // 3. To send commands to turn on or off the vehicle.
  @Post(":deviceId/turnOnOrOff") // YES
  @ApiOperation({ summary: "Turn On / Off the vehicle" })
  @ApiBody({ type: VehicleStatusDto })
  async turnOnOrOff(
    @Param("deviceId") deviceId: string,
    @Body() body: VehicleStatusDto
  ) {
    try {
      const { running } = body;
      if (running) {
        await this.vehicleTrackingService.turnOn(deviceId);
      } else {
        await this.vehicleTrackingService.turnOff(deviceId);
      }
      return {
        success: true,
        message: `SUCCESS`,
      };
    } catch (err) {
      return { error: true, message: `Something went wrong.`, errorInfo: err };
    }
  }

  // 3.A To send commands to turn on
  @Post(":deviceId/turnOn") // YES
  @ApiOperation({ summary: "Turn On the vehicle" })
  async turnOn(@Param("deviceId") deviceId: string) {
    try {
      await this.vehicleTrackingService.turnOn(deviceId);
      return {
        success: true,
        message: `SUCCESS`,
      };
    } catch (err) {
      return { error: true, message: `Something went wrong.`, errorInfo: err };
    }
  }

  // 3.B To send commands to turn off
  @Post(":deviceId/turnOff") // YES
  @ApiOperation({ summary: "Turn Off the vehicle" })
  async turnOff(@Param("deviceId") deviceId: string) {
    try {
      await this.vehicleTrackingService.turnOff(deviceId);
      return {
        success: true,
        message: `SUCCESS`,
      };
    } catch (err) {
      return { error: true, message: `Something went wrong.`, errorInfo: err };
    }
  }

  // 4. To disconnect the vehicle on purpose.
  @Post(":deviceId/disconnect") // OK
  @ApiOperation({ summary: "disconnect the vehicle" })
  async disconnect(@Param("deviceId") deviceId: string) {
    try {
      this.vehicleTrackingService.disconnectVehicle(deviceId);
      return {
        success: true,
        message: "Disconnected",
      };
    } catch (err) {
      return { error: true, message: `Something went wrong.`, errorInfo: err };
    }
  }

  /**
   * It should also forward the updates as webhooks to an agreed address:
   */

  // 1. When the vehicle goes online or offline
  // 2. When the position changes
  // 3. When the battery changes
  // 4. When the running status changes
  // 5. When a debug blob is received (if you choose to implement it)

  @Post("status-update")
  @ApiOperation({ summary: "Forward Status Update To Webhook Address" })
  @ApiBody({ type: VehicleWebhookStatusUpdateRequestDto })
  async webhookStatusUpdate(
    @Body() update: VehicleWebhookStatusUpdateRequestDto,
    @Res() res
  ) {
    try {
      const {
        debug_blob,
        deviceId,
        latitude,
        longitude,
        running,
        battery,
        online,
        updateFrequency,
      } = update;
      if (debug_blob) {
        // When a debug blob is received
        await axios.post(process.env.DEBUG_BLOB_REPORT_URL, {
          deviceId,
          debug_blob,
        });
      } else {
        await axios.post(process.env.WEBHOOK_ENDPOINT_URL, {
          deviceId,
          latitude,
          longitude,
          running,
          battery,
          online,
          updateFrequency,
        });
      }
      res.sendStatus(200);
    } catch (err) {
      console.log("--> **error:", err);
      res.sendStatus(400);
    }
  }

  @Post("status-update/online")
  @ApiBody({ type: VehicleWebhookStatusUpdateOnlineOfflineDto })
  async handleVehicleOnline(
    @Body() data: VehicleWebhookStatusUpdateOnlineOfflineDto,
    @Res() res
  ): Promise<any> {
    try {
      // Send a webhook to the external API endpoint with the vehicle ID and status as payload
      await axios.post(process.env.WEBHOOK_ENDPOINT_URL, data);
      res.sendStatus(200);
    } catch (err) {
      console.log("--> **error:", err);
      res.sendStatus(400);
    }
  }

  @Post("status-update/offline")
  @ApiBody({ type: VehicleWebhookStatusUpdateOnlineOfflineDto })
  async handleVehicleOffline(
    @Body() data: VehicleWebhookStatusUpdateOnlineOfflineDto,
    @Res() res
  ): Promise<any> {
    try {
      // Send a webhook to the external API endpoint with the vehicle ID and status as payload
      await axios.post(process.env.WEBHOOK_ENDPOINT_URL, data);
      res.sendStatus(200);
    } catch (err) {
      console.log("--> **error:", err);
      res.sendStatus(400);
    }
  }

  @Post("status-update/position")
  @ApiBody({ type: VehicleWebhookStatusUpdatePositionDto })
  async handlePositionChange(
    @Body() data: VehicleWebhookStatusUpdatePositionDto,
    @Res() res
  ): Promise<any> {
    try {
      // Send a webhook to the external API endpoint with the vehicle ID and position as payload
      await axios.post(process.env.WEBHOOK_ENDPOINT_URL, data);
      res.sendStatus(200);
    } catch (err) {
      console.log("--> **error:", err);
      res.sendStatus(400);
    }
  }

  @Post("status-update/battery")
  @ApiBody({ type: VehicleWebhookStatusUpdateBatteryDto })
  async handleBatteryChange(
    @Body() data: VehicleWebhookStatusUpdateBatteryDto,
    @Res() res
  ): Promise<any> {
    try {
      // Send a webhook to the external API endpoint with the vehicle ID and battery percentage as payload
      await axios.post(process.env.WEBHOOK_ENDPOINT_URL, data);
      res.sendStatus(200);
    } catch (err) {
      console.log("--> **error:", err);
      res.sendStatus(400);
    }
  }

  @Post("status-update/running")
  @ApiBody({ type: VehicleWebhookStatusUpdateRunningStatusDto })
  async handleRunningStatusChange(
    @Body() data: VehicleWebhookStatusUpdateRunningStatusDto,
    @Res() res
  ): Promise<any> {
    try {
      // Send a webhook to the external API endpoint with the vehicle ID and running status as payload
      await axios.post(process.env.WEBHOOK_ENDPOINT_URL, data);
      res.sendStatus(200);
    } catch (err) {
      console.log("--> **error:", err);
      res.sendStatus(400);
    }
  }

  @Post("status-update/debug-blob")
  @ApiBody({ type: VehicleWebhookStatusUpdateDebugBlobDto })
  async handleDebugBlob(
    @Body() data: VehicleWebhookStatusUpdateDebugBlobDto,
    @Res() res
  ): Promise<any> {
    try {
      // Send a webhook to the external API endpoint with the vehicle ID and debug blob as payload
      await axios.post(process.env.WEBHOOK_ENDPOINT_URL, data);
      res.sendStatus(200);
    } catch (err) {
      console.log("--> **error:", err);
      res.sendStatus(400);
    }
  }
}
