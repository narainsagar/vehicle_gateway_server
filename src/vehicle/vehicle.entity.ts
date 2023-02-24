import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VehicleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 36 }) // (uuid.v4 will have length: 36 )
  deviceId: string;

  @Column({ default: true })
  online: boolean;

  // @Column('simple-array', { default: null })
  // webhooks: string[];

  @Column('double precision', { default: 0 })
  latitude: number;

  @Column('double precision', { default: 0 })
  longitude: number;

  @Column('int', { default: 100 })
  battery: number;

  @Column('int', { default: 0})
  updateFrequency: number;

  @Column({ default: true })
  running: boolean;

  // @Column({
  //   type: 'enum',
  //   enum: ['RESTING', 'RUNNING'],
  //   default: 'RESTING',
  // })
  // status: string;


  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastHeartbeat: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
  
  constructor() {
    // this.id = Number(id);
    // this.latitude = 0;
    // this.longitude = 0;
    // this.battery = 100;
    // this.running = false;
    // this.updateFrequency = 0;
  }

  getLatitude() {
    return this.latitude;
  }

  setLatitude(latitude: number) {
    this.latitude = latitude;
  }

  getLongitude() {
    return this.longitude;
  }

  setLongitude(longitude: number) {
    this.longitude = longitude;
  }

  setPosition(longitude: number, latitude: number) {
    this.longitude = longitude;
    this.latitude = latitude;
  }

  getBattery() {
    return this.battery;
  }

  setBattery(battery: number) {
    this.battery = battery;
  }

  isRunning() {
    return this.running;
  }

  setRunning(running: boolean) {
    this.running = running;
  }

  setLastHeartbeat() {
    this.lastHeartbeat = new Date();
  }

  isOnline() {
    return this.online;
  }

  setOnline(online: boolean) {
    this.online = online;
  }

  setUpdateFrequency(seconds: number) {
    if (isNaN(seconds) || seconds < 10 || seconds > 3600) {
      throw new Error("Invalid seconds parameter");
    }
    this.updateFrequency = seconds;
  }

  getUpdateFrequency() {
    return this.updateFrequency;
  }
}