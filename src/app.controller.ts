import { Controller, Get, Post, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Main")
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: "Check the Server Status" })
  @ApiResponse({
    status: 200,
    description: "Success",
  })
  status() {
    return `Server is Up!!`;
  }

  @Get('/health')
  @ApiOperation({ summary: "Check the Server Health" })
  @ApiResponse({
    status: 200,
    description: "Success",
  })
  healthCheck(@Res() res) {
    return res.send(200);
  }
  
}
