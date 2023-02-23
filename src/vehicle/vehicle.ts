import * as uuid from "uuid";

export class Vehicle {
  private id: string; // TODO: FIX
  private online = false;
  private webhooks: string[] = [];

  deviceId: string;
  latitude = 0;
  longitude = 0;
  battery = 100;
  running = false;
  updateFrequency = 0;

  createdAt: Date;
  updatedAt: Date;

  // status: 'RESTING' | 'RUNNING' = 'RESTING';

  constructor(
    deviceId: string,
    dto: {
      online?: boolean;
      latitude?: number;
      longitude?: number;
      running?: boolean;
      battery?: number;
      updateFrequency?: number;
    }
  ) {
    const { latitude, longitude, running, battery, updateFrequency, online } =
      dto;
    this.id = uuid.v4();
    this.deviceId = deviceId;
    this.online = online || false;
    this.latitude = latitude || 0;
    this.longitude = longitude || 0;
    this.updateFrequency = updateFrequency || 0;
    this.running = running || false;
    this.battery = battery || 100;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  getLatitude() {
    return this.latitude;
  }

  setLatitude(latitude: number) {
    this.latitude = latitude;
    this.updatedAt = new Date();
  }

  getLongitude() {
    return this.longitude;
  }

  setLongitude(longitude: number) {
    this.longitude = longitude;
    this.updatedAt = new Date();
  }

  setPosition(longitude: number, latitude: number) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.updatedAt = new Date();
  }

  getBattery() {
    return this.battery;
  }

  setBattery(battery: number) {
    this.battery = battery;
    this.updatedAt = new Date();
  }

  isRunning() {
    return this.running;
  }

  setRunning(running: boolean) {
    this.running = running;
    this.updatedAt = new Date();
  }

  isOnline() {
    // return this.running;
    return this.online;
  }

  setOnline(online: boolean) {
    this.online = online;
    this.updatedAt = new Date();
  }

  setUpdateFrequency(seconds: number) {
    this.updateFrequency = seconds;
    this.updatedAt = new Date();
  }

  getUpdateFrequency() {
    return this.updateFrequency;
  }
}
