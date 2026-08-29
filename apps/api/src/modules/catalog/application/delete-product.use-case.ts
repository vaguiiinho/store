import { Inject, Injectable } from "@nestjs/common";
import { DomainError } from "../../shared/domain/errors/domain-error";
import { PRODUCT_REPOSITORY } from "../catalog.tokens";
import { ProductRepository } from "../domain/repositories/product.repository";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

export type DeleteProductOutput = void;

@Injectable()
export class DeleteProductUseCase {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository, private readonly prisma: PrismaService) {}

  async execute(productId: string): Promise<DeleteProductOutput> {
    const product = await this.products.findById(productId);
    if (!product) throw new DomainError("Produto nao encontrado.");
    const linkedOrders = await this.prisma.orderItem.count({ where: { productId } });
    if (linkedOrders > 0) throw new DomainError("Este produto possui pedidos e nao pode ser excluido.");
    await this.products.delete(productId);
  }
}
