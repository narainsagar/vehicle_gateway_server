import { Injectable } from "@nestjs/common";
import axios from "axios";
import { MESSAGE_TEMPLATES } from "src/shared/messages-templates.enum";
import { extractVariables } from "src/shared/util";
import { VehicleManager } from "./vehicle-manager";
import { VehicleService } from "./vehicle.service";

type IHandle = {
  deviceId: string;
  msg: string;
};

export type IMessage = {
  deviceId: string;
  latitude?: number;
  longitude?: number;
  running?: boolean;
  battery?: number;
  seconds?: number;

  bytes?: number;
  binary_blob?: string;

  status?: string;
  msg?: string; // original string coming from vehicle client // `HELLO, I'M {{device_id}}!`
}


@Injectable()
export class VehicleTackingService {
  constructor(
    private vehicleManager: VehicleManager,
    private vehicleService: VehicleService
  ) {}

  public async messageHandlerForClient(data: string, vehicleId: string): Promise<string> {
    try {
      const message = data.toString().trim();

      console.log(`**Received data from client: ${message}`);

      if (message === MESSAGE_TEMPLATES.PING) {
        const success = this.handleMessage(
          "heartbeat",
          { deviceId: vehicleId, msg: message }
        );
        if (success) {
          // socket.write(MESSAGE_TEMPLATES.PONG);
          return MESSAGE_TEMPLATES.PONG;
        }
      } else if (message === MESSAGE_TEMPLATES.SESSION_END_REQUEST) {
        // connection close...
        const success = this.handleMessage(
          "disconnect",
          { deviceId: vehicleId, msg: message }
        );
        if (success) {
          // socket.write(MESSAGE_TEMPLATES.SESSION_END_REPLY);
          return MESSAGE_TEMPLATES.SESSION_END_REPLY;
        }
      } else if (message.startsWith(`HELLO, I'M `)) {
        // vehicle connected
        const match = extractVariables(MESSAGE_TEMPLATES.PATTERN_HELLO, message);
        const [msg, deviceId] = match;

        if (match && msg === message) {
          // TODO: handle command -> set vehicle connected.
          const success = this.handleMessage(
            "login",
            { deviceId, msg: message }
          );
          if (success) {
            // socket.write(MESSAGE_TEMPLATES.LOGIN_REPLY);
            return MESSAGE_TEMPLATES.LOGIN_REPLY;
          }
        }
      } else if (message.startsWith(`KEEP ME POSTED EVERY `)) {
        const match = extractVariables(
          MESSAGE_TEMPLATES.PATTERN_KEEP_ME_POSTED,
          message
        );
        const [msg, seconds] = match;
        if (match && msg === message) {
          console.log('hererererererer..... match', match);
          // TODO: handle command -> update interval.
          const success = this.handleMessage(
            "updateFrequency",
            {
              deviceId: vehicleId,
              seconds: parseInt(seconds),
              msg: message,
            }
          );
          if (success) {
            // socket.write(MESSAGE_TEMPLATES.STATUS_REPLY);
            return MESSAGE_TEMPLATES.STATUS_REPLY;
          }
        }
      } else if (message.startsWith(`REPORT. I'M HERE `)) {
        const match = extractVariables(MESSAGE_TEMPLATES.PATTERN_REPORT, message);
        const [msg, latitude, longitude, status, battery] = match;
        if (match && msg === message) {
          const success = this.handleMessage(
            "status",
            {
              deviceId: vehicleId,
              latitude: Number(latitude),
              longitude: Number(longitude),
              battery: Number(battery),
              running: status === 'RUNNING',
              msg: message,
            }
          );
          if (success) {
            // socket.write(MESSAGE_TEMPLATES.THANKS);
            return MESSAGE_TEMPLATES.THANKS;
          }
        }
      } else if (message.startsWith(`FINE. I'M HERE `)) {
        const match = extractVariables(MESSAGE_TEMPLATES.PATTERN_FINE, message);
        const [msg, latitude, longitude, status, battery] = match;
        if (match && msg === message) {
          const success = this.handleMessage(
            "status",
            {
              deviceId: vehicleId,
              latitude: Number(latitude),
              longitude: Number(longitude),
              battery: Number(battery),
              running: status === 'RUNNING',
              msg: message,
            }
          );
          if (success) {
            // socket.write(MESSAGE_TEMPLATES.THANKS); // What to reply here?? TODO: Confirm?
            return MESSAGE_TEMPLATES.THANKS;
          }
        }
      } else if (message.startsWith("WTF! ")) {
        const match = extractVariables(MESSAGE_TEMPLATES.PATTERN_WTF, message);
        const [msg, bytes, binary_blob] = match;
        if (match && msg === message) {
          const success = this.handleMessage(
            "error",
            {
              deviceId: vehicleId,
              bytes: parseInt(bytes),
              binary_blob,
              msg: message,
            }
          );
          if (success) {
            // socket.write(MESSAGE_TEMPLATES.BLOB_REPLY);
            return MESSAGE_TEMPLATES.BLOB_REPLY;
          }
        }
      } else if (message) { // not empty
        // throw new Error(`Invalid message ${message}`);
        return MESSAGE_TEMPLATES.MESSAGE_RECEIVED;
      }
    } catch (err) {
      console.log("errr:", err);
    }

    return '';
  }

  // TODO: Confirm `IMessage` and `message` implementation here.
  handleMessage(cmd: string, message: IMessage): boolean {
    console.log("***** cmd: ", cmd, " message:", message);
    let response;
    if (cmd === "login") {
      response = this.handleLoginMessage(message);
    } else if (cmd === "heartbeat") {
      response = this.handleHeartbeatMessage(message);
    } else if (cmd === "status") {
      response = this.handleStatusMessage(message);
    } else if (cmd === "updateFrequency") {
      response = this.handleUpdateFrequencyMessage(message);
    } else if (cmd === "connect") {
      response = this.handleConnectMessage(message);
    } else if (cmd === "disconnect") {
      response = this.handleDisconnectMessage(message);
    } else if (cmd === "error") {
      response = this.handleErrorBlobMessage(message);
    } else {
      throw new Error("Invalid command");
    }

    return response;
  }

  async getVehicleStatus(deviceId: string) {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (!vehicle) {
      // throw new Error(`Vehicle ${deviceId} not found`); // 404
      return { error: true, message: `Vehicle ${deviceId} not found` };
    }

    if (vehicle.isOnline()) {
      return {
        status: "CONNECTED",
        latitude: vehicle.getLatitude(),
        longitude: vehicle.getLongitude(),
        running: vehicle.isRunning(),
        battery: vehicle.getBattery(),
      };
    }

    return { status: "DISCONNECTED" };
  }

  async setUpdateFrequency(deviceId: string, seconds: number) {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (vehicle) {
      vehicle.setUpdateFrequency(seconds);
      this.vehicleService.update(vehicle.id, vehicle);
    }
  }

  async getUpdateFrequency(deviceId: string): Promise<number> {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (!vehicle) {
      // TODO: NOT FOUND ERROR
      throw new Error(`vehicle ${deviceId} not found`);
    }

    return vehicle.getUpdateFrequency();
  }

  async turnOn(deviceId: string) {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (vehicle) {
      // vehicle.setOnline(true);
      vehicle.setRunning(true);
      this.vehicleService.update(vehicle.id, vehicle);
    }
  }

  async turnOff(deviceId: string) {
    const vehicle = await this.vehicleManager.getVehicleById(deviceId);
    if (vehicle) {
      // vehicle.setOnline(false);
      vehicle.setRunning(false);
      this.vehicleService.update(vehicle.id, vehicle);
    }
  }

  disconnectVehicle(deviceId: string) {
    // TODO: Disconnect vehicle
    this.handleDisconnectMessage({ deviceId });
  }

  connectVehicle(deviceId: string) {
    // TODO: Connect vehicle
    this.handleConnectMessage({ deviceId });
  }

  private async vehicleLoginHandler(deviceId: string) {
    try {
      const vehicle = await this.vehicleManager.getVehicleById(deviceId);
      if (vehicle) { // update existing
        // vehicle exist in DB
        vehicle.setOnline(true);
        this.vehicleService.update(vehicle.id, vehicle);
        return true;
      } else { // create new
        // add new vehicle in DB
        const vehicle = await this.vehicleManager.createVehicle(deviceId);
        vehicle.setOnline(true);
        this.vehicleService.update(vehicle.id, vehicle);
        return true;
      }
    } catch (err) {
      return false;
    }
  }

  private async handleLoginMessage(message: { deviceId: string }) {
    const { deviceId } = message;
    return this.vehicleLoginHandler(deviceId);
  }

  private async handleHeartbeatMessage(message: { deviceId: string }) {
    try {
      const { deviceId } = message;
      const vehicle = await this.vehicleManager.getVehicleById(deviceId);
      if (vehicle) {
        // TODO: Update vehicle status
        // this.sendCommand(deviceId, "heartbeat");
        vehicle.setLastHeartbeat();
        this.vehicleService.update(vehicle.id, vehicle);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  private async handleStatusMessage(message: IMessage) {
    try {
      const { deviceId, latitude, longitude, running, battery } = message;
      const vehicle = await this.vehicleManager.getVehicleById(deviceId);
      if (vehicle) {
        vehicle.setLatitude(latitude);
        vehicle.setLongitude(longitude);
        vehicle.setRunning(running); // running === "RUNNING"
        vehicle.setBattery(battery); // parseInt(battery, 10)
        this.vehicleService.update(vehicle.id, vehicle);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  private async handleUpdateFrequencyMessage(message: IMessage): Promise<boolean> {
    try {
      const { deviceId, seconds } = message;
      const vehicle = await this.vehicleManager.getVehicleById(deviceId);
      if (vehicle) {
        vehicle.setUpdateFrequency(seconds);
        this.vehicleService.update(vehicle.id, vehicle);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  private async handleDisconnectMessage(message: { deviceId: string }) {
    const { deviceId } = message;
    this.vehicleManager.disconnectVehicle(deviceId);
  }

  private async handleConnectMessage(message: { deviceId: string }) {
    // TODO: Connect vehicle
    const { deviceId } = message;
    // this.vehicleManager.addVehicle(deviceId);
    this.vehicleManager.connectVehicle(deviceId);
  }

  private async handleErrorBlobMessage(message: IMessage) {
    // TODO: Handle error blob message
    const { deviceId, bytes, binary_blob, msg } = message;
    if (binary_blob) {
      // When a debug blob is received
      try {
        await axios.post(process.env.DEBUG_BLOB_REPORT_URL, {
          deviceId,
          bytes,
          binary_blob,
        });
      return true;
      } catch(err) {
        console.log('some error in blob:', err);
        return false;
      }
    }
  }
}
