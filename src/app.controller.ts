import { Controller, Get, Post } from "@nestjs/common";
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
  
}
