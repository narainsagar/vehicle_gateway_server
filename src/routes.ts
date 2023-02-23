import { ServiceApiModule } from "./service-api/service-api.module";
import { VehicleModule } from "./vehicle/vehicle.module";

export default [
  {
    path: 'service',
    module: ServiceApiModule,
  },
  {
    path: 'vehicles',
    module: VehicleModule,
  },
];
