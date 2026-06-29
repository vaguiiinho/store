import { Module } from "@nestjs/common";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OrdersModule } from "./modules/orders/orders.module";

@Module({
  imports: [PrismaModule, HealthModule, NotificationsModule, CatalogModule, OrdersModule]
})
export class AppModule {}
