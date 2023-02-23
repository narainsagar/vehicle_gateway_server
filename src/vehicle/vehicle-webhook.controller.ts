import { Controller, Post, Body, Res } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import axios from "axios";
import { VehicleWebhookStatusUpdateRequestDto } from "src/service-api/status-update.dto";

@ApiTags("Vehicles")
@Controller("")
export class VehicleWebhookController {

  @Post("status-update")
  @ApiOperation({ summary: "Status update webhook" })
  @ApiBody({ type: VehicleWebhookStatusUpdateRequestDto })
  async handleVehicleStatusUpdate(
    @Body() update: VehicleWebhookStatusUpdateRequestDto,
    @Res() res
  ) {
    try {
      const webhookUrl = process.env.WEBHOOK_ENDPOINT_URL; // TODO: check!
      const data = await axios.post(webhookUrl, update);
      console.log("data**:", data);
      res.sendStatus(200);
    } catch (err) {
      console.log("**error:", err);
      res.sendStatus(400);
    }
  }

  // @Post("/test")
  // async test(@Body() body: VehicleRequestDto, @Res() res) {
  //   console.log(body);
  //   // await this.redisService.redis.publish('my_channel', JSON.stringify(body));
  //   res.sendStatus(200);
  // }

  // @Post('/test2')
  // async test2(@Body() body: VehicleRequestDto, @Res() res) {
  //   const channel = 'my_channel';

  //   // Subscribe to the Redis pub/sub channel
  //   const sub = this.redisService.getClient().duplicate();
  //   sub.subscribe(channel);

  //   // Publish the request body to the channel
  //   const message = JSON.stringify(body);
  //   const pub = this.redisService.getClient().duplicate();
  //   pub.publish(channel, message);

  //   // Send a response with a 200 status code
  //   res.sendStatus(200);

  //   // Unsubscribe from the Redis pub/sub channel
  //   sub.unsubscribe(channel);
  // }
}
