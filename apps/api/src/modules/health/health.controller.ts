import { Controller, Get } from "@nestjs/common";
import { Public } from "../auth/presentation/decorators";

@Public()
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}
