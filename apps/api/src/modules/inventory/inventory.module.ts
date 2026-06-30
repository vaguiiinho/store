import { Module } from "@nestjs/common";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { PrismaStockRepository } from "./infrastructure/prisma/prisma-stock.repository";
import { STOCK_REPOSITORY } from "./inventory.tokens";

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: STOCK_REPOSITORY,
      useClass: PrismaStockRepository
    }
  ],
  exports: [STOCK_REPOSITORY]
})
export class InventoryModule {}
