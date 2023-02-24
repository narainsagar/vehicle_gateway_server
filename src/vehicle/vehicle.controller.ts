import { Body, Controller, Get, Param, Post, Put, Res } from "@nestjs/common";
import { VehicleManager } from "./vehicle-manager";
import { VehicleTackingService } from "./vehicle-tracking.service";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TcpHandleRequestDto, TcpHandleResponseDto, VehicleFrequencyDto, VehicleRequestDto, VehicleResponseDto, VehicleStatusDto } from "./vehicle.dto";
import { VehicleService } from "./vehicle.service";

@ApiTags("Vehicles")
@Controller("")
export class VehicleController {
  constructor(
    private vehicleManager: VehicleManager,
    private vehicleTrackingService: VehicleTackingService,
    private  vehicleService: VehicleService
  ) {}

  @Get("/")
  @ApiOkResponse({ type: Array<VehicleResponseDto> })
  async getAll() {
    return await this.vehicleService.findAll();
  }

  @Post("/tcpHandleMessage") // OK
  @ApiOperation({ summary: "TCP Message Handler" })
  @ApiBody({ type: TcpHandleRequestDto })
  @ApiOkResponse({ type: TcpHandleResponseDto })
  async callTcpHandler(@Body() payload, @Res() res) {
    // console.log('payload:', payload);
    const { type, message, clientId } = payload;
    try {
      if (type === 'command') {
        console.log('Received command message from client: ', message);
        // GOTTA GO.
        const reply = await this.vehicleTrackingService.messageHandlerForClient(message, clientId);
        return res.status(200).send({ success: true, message: reply });
      } else if (type === 'message') {
        console.log('Received message from client: ', message);
        const reply = await this.vehicleTrackingService.messageHandlerForClient(message, clientId);
        return res.status(200).send({ success: true, message: reply });
      } else {
        console.log('Invalid type:', type);
      }
    } catch(err) {
      return res.status(200).send({
        error: true,
        message: err
      })
    }
  }
  

  @Get(":deviceId") // OK
  @ApiOkResponse({ type: VehicleResponseDto })
  async getVehicle(@Param("deviceId") deviceId: string) {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (!vehicle) {
      // throw new Error(`Vehicle ${deviceId} not found`); // 404
      return {
        error: true,
        message: `Vehicle ${deviceId} not found`
      };
    }
    return vehicle;
  }

  @Post() // OK
  @ApiBody({ type: VehicleRequestDto })
  @ApiOkResponse({ type: VehicleResponseDto })
  async addVehicle(@Body() payload: VehicleRequestDto, @Res() res) {
    const { deviceId } = payload;
    try {
      let vehicle = await this.vehicleManager.getVehicleById(deviceId);
      if (!vehicle) {
        vehicle = await this.vehicleManager.addVehicle(payload);
      } else {
        // res.status(200).send(vehicle);
        // throw new Error(`Vehicle ${deviceId} already there`); // 404
      }
      return res.status(200).send(vehicle);
    } catch(err) {
      return res.status(200).send({
        error: true,
        message: err
      })
    }
  }

  @Get(":deviceId/status") // OK
  @ApiOkResponse({ type: VehicleResponseDto })
  async getStatus(@Param("deviceId") deviceId: string) {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (!vehicle) {
      // throw new Error(`Vehicle ${deviceId} not found`); // 404
      return {
        error: true,
        message: `Vehicle ${deviceId} not found`
      };
    }
    return {
      deviceId: vehicle.deviceId,
      latitude: vehicle.getLatitude(),
      longitude: vehicle.getLongitude(),
      battery: vehicle.getBattery(),
      running: vehicle.isRunning(),
      online: vehicle.isOnline(),
      updateFrequency: vehicle.getUpdateFrequency(),
    };
  }

  @Post(":deviceId/frequency") // YES
  @ApiBody({ type: VehicleFrequencyDto })
  // @ApiOkResponse({ type: VehicleFrequencyDto })
  async setUpdateFrequency(@Param("deviceId") deviceId: string, @Body() body: VehicleFrequencyDto) {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (!vehicle) {
     return {
        error: true,
        message: `Vehicle ${deviceId} not found`
      };
    }

    const { seconds } = body;
    // if (typeof seconds === 'string') {
    //   seconds = parseInt(body.seconds);
    // }
    if (isNaN(seconds) || seconds < 10 || seconds > 3600) {
      throw new Error("Invalid seconds parameter");
    }
    this.vehicleTrackingService.setUpdateFrequency(vehicle.deviceId, seconds);
    return {
      deviceId: vehicle.deviceId,
      seconds: seconds,
    };
  }

  @Put(":deviceId/updateFrequency") // Ok.. TODO: Check!!
  @ApiBody({ type: VehicleFrequencyDto })
  // @ApiOkResponse({ type: VehicleFrequencyDto })
  async updateFrequency(@Param("deviceId") deviceId: string, @Body() body: VehicleFrequencyDto, @Res() res) {
    const { seconds } = body;
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (!vehicle) {
      res.status(404).send({
        message: `Vehicle ${deviceId} not found`
      });
      throw new Error(`Vehicle ${deviceId} not found`); // 404
    }
    this.vehicleTrackingService.setUpdateFrequency(vehicle.deviceId, seconds);
    return {
      deviceId: deviceId,
      updateFrequency: seconds,
    };
  }

  @Post(":deviceId/turnOnOrOff") // NO
  @ApiBody({ type: VehicleStatusDto })
  // @ApiOkResponse({ type: VehicleStatusDto })
  async turnOnOrOff(
    @Param("deviceId") deviceId: string,
    @Body() body: VehicleStatusDto
  ) {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (!vehicle) {
      return {
        error: true,
        message: `Vehicle ${deviceId} not found`
      };
    }

    const { running } = body;
    if (typeof running !== "boolean") {
      throw new Error("Invalid running parameter"); // 400
    }

    vehicle.setRunning(running);
    this.vehicleService.update(vehicle.id, vehicle);

    return {
      deviceId: vehicle.deviceId,
      running: vehicle.running,
    };
  }

  @Post(":deviceId/disconnect") // OK
  async disconnect(@Param("deviceId") deviceId: string) {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (!vehicle) {
      // res.status(404).send({
      //   message: `Vehicle ${deviceId}  not found`
      // });
      // throw new Error(`Vehicle ${deviceId} not found`); // 404
      return {
        error: true,
        message: `Vehicle ${deviceId} not found`
      };
    }
    this.vehicleTrackingService.disconnectVehicle(vehicle.deviceId);
    return {
      deviceId: vehicle.deviceId,
      message: "Disconnected",
    };
  }

  @Post(":deviceId/connect") // OK
  async connect(@Param("deviceId") deviceId: string, @Res() res) {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (!vehicle) {
      res.status(404).send({
        message: `Vehicle ${deviceId}  not found`
      });
      throw new Error(`Vehicle ${deviceId} not found`); // 404
    }
    this.vehicleTrackingService.connectVehicle(vehicle.deviceId);
    return {
      deviceId: vehicle.deviceId,
      message: "Connected",
    };
  }
}
