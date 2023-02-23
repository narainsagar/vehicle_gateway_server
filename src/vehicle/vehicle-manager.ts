import { Injectable } from '@nestjs/common';
import { VehicleRequestDto } from './vehicle.dto';
import { VehicleService } from './vehicle.service';


@Injectable()
export class VehicleManager {
  constructor(
    private readonly vehicleService: VehicleService) {}

  getAll() {
    return this.vehicleService.findAll();
  }

  getVehicleById(deviceId: string) {
    return this.vehicleService.findByDeviceId(deviceId);
  }

  getVehicleByDeviceId(deviceId: string) {
    return this.vehicleService.findByDeviceId(deviceId);
  }

  async addVehicle(dto: VehicleRequestDto) {
    const { deviceId } = dto;
    if (!deviceId) {
      throw new Error(`deviceId ${deviceId} required.`)
    }
    let vehicle = await this.vehicleService.findByDeviceId(deviceId);
    if (!vehicle) {
      vehicle = await this.vehicleService.create(dto);
      return vehicle;
    } else {
      throw new Error(`duplicate entry for vehicle with deviceId: ${deviceId}`)
      // return {
      //   error: true,
      //   message: `duplicate entry for vehicle with deviceId: ${deviceId}`
      // }
    }
  }

  async createVehicle(deviceId: string) {
    if (!deviceId) {
      throw new Error(`deviceId ${deviceId} required.`)
    }
    let vehicle = await this.vehicleService.findByDeviceId(deviceId);
    if (!vehicle) {
      vehicle = await this.vehicleService.createOne(deviceId);
      return vehicle;
    } else {
      throw new Error(`duplicate entry for vehicle with deviceId: ${deviceId}`)
      // return {
      //   error: true,
      //   message: `duplicate entry for vehicle with deviceId: ${deviceId}`
      // }
    }
  }

  async setUpdateFrequency(deviceId: string, intervalInSeconds: number) {
    const vehicle = await this.vehicleService.findByDeviceId(deviceId);
    if (vehicle) {
      vehicle.setUpdateFrequency(intervalInSeconds);
      this.vehicleService.update(vehicle.id, vehicle);
    }
  }

  async connectVehicle(deviceId: string) {
    const vehicle = await this.vehicleService.findByDeviceId(deviceId);
    if (vehicle) {
      vehicle.setOnline(true);
      this.vehicleService.update(vehicle.id, vehicle);
    }
  }

  async disconnectVehicle(deviceId: string) {
    const vehicle = await this.vehicleService.findByDeviceId(deviceId);
    if (vehicle) {
      vehicle.setOnline(false);
      this.vehicleService.update(vehicle.id, vehicle);
    }
  }

  async removeVehicle(deviceId: string) {
    const vehicle = await this.vehicleService.findByDeviceId(deviceId);
    if (vehicle) {
      this.vehicleService.deleteByDeviceId(deviceId);
    }
  }
}
