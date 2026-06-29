import { Module } from "@nestjs/common";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
  imports: [PrismaModule, HealthModule, NotificationsModule, CatalogModule]
})
export class AppModule {}
