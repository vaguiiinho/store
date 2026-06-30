import { Module } from "@nestjs/common";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AdminAuthModule } from "./modules/admin-auth/admin-auth.module";
import { OrdersModule } from "./modules/orders/orders.module";

@Module({
  imports: [PrismaModule, HealthModule, NotificationsModule, AdminAuthModule, CatalogModule, OrdersModule]
})
export class AppModule {}
