import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VehicleRequestDto } from "./vehicle.dto";
import { VehicleEntity } from "./vehicle.entity";

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(VehicleEntity)
    private vehicleRepository: Repository<VehicleEntity>
  ) {}

  async findAll(): Promise<VehicleEntity[]> {
    return await this.vehicleRepository.find();
  }

  async find(id: number): Promise<VehicleEntity> {
    return await this.vehicleRepository.findOneBy({ id });
  }

  async findByDeviceId(deviceId: string): Promise<VehicleEntity> {
    return await this.vehicleRepository.findOneBy({ deviceId });
  }

  async create(vehicle: VehicleRequestDto): Promise<VehicleEntity> {
    const existingVehicle = await this.vehicleRepository.findOneBy({ deviceId: vehicle.deviceId });
    if(!existingVehicle) {
      return this.vehicleRepository.save(vehicle)
    }
    return existingVehicle;
  }

  async createOne(deviceId: string): Promise<VehicleEntity> {
    const existingVehicle = await this.vehicleRepository.findOneBy({ deviceId });
    if(!existingVehicle) {
      return this.vehicleRepository.save({ deviceId })
    }
    return existingVehicle;
  }

  async update(id: number, vehicle: VehicleEntity): Promise<VehicleEntity> {
    const existingVehicle = await this.vehicleRepository.findOneBy({ id: id });
    if (existingVehicle) {
      return this.vehicleRepository.save({ ...existingVehicle, ...vehicle });
    }
    return null;
  }

  async updateOne(id: number, vehicle: VehicleEntity): Promise<VehicleEntity> {
    const existingVehicle = await this.vehicleRepository.findOneBy({ id: id });
    if (existingVehicle) {
      return this.vehicleRepository.save({ ...existingVehicle, ...vehicle });
    }
    return null;
  }

  async updateByDeviceId(deviceId: string, vehicle: VehicleEntity): Promise<VehicleEntity> {
    const existingVehicle = await this.vehicleRepository.findOneBy({ deviceId });
    if (existingVehicle) {
      return this.vehicleRepository.save({ ...existingVehicle, ...vehicle });
    }
    return null;
  }

  async delete(id: number): Promise<void> {
    await this.vehicleRepository.delete(id);
  }

  async deleteByDeviceId(deviceId: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findOneBy({ deviceId });
    await this.vehicleRepository.delete(vehicle.id);
  }
}
