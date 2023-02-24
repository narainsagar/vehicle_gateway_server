import { Injectable } from "@nestjs/common";
import cluster from "cluster";
import * as os from "os";

const numCPUs = os.cpus().length;

@Injectable()
export class ClusterService {
  static clusterize(callback: Function): void {
    if (cluster.isPrimary && process.env.REST_API_SERVER_ENV !== "development") {
      console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork(); // create child processes
        cluster.on("exit", (worker, code, signal) => {
          console.log(`worker ${worker.process.pid} died`);
        });
      }

      process.stdout.on("error", function (err) {
        console.log(err);
        if (err.code == "EPIPE") {
          process.exit(0);
        }
      });
    } else {
      callback();
    }
  }
}
