import { prisma } from "../../lib/prisma";
import { CreateProductBody, UpdateProductBody } from "./product.schema";

class ProductNotFoundError extends Error {
    readonly statusCode = 404;

    constructor() {
        super('Produto não encontrado');
    }
}

export class ProductService {
    async listProducts(query?: string) {
        return await prisma.product.findMany({
            where: query
                ? {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                }
                : undefined,
        });
    }

    async createProduct(data: CreateProductBody) {
        return await prisma.product.create({ data });
    }

    async findById(id: string) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new ProductNotFoundError();

        return product;
    }

    async updateProduct(id: string, data: UpdateProductBody) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new ProductNotFoundError();

        return await prisma.product.update({ where: { id }, data });
    }

    async deleteProduct(id: string) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new ProductNotFoundError();

        return await prisma.product.delete({ where: { id } });
    }
}
