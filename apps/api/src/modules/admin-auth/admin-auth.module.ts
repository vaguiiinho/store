import { Module } from "@nestjs/common";
import { AdminAuthController } from "./presentation/admin-auth.controller";
import { AdminAuthService } from "./admin-auth.service";

@Module({
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
  exports: [AdminAuthService]
})
export class AdminAuthModule {}
