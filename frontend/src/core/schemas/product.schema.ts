import { z } from "zod";

export const productSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Informe um nome com pelo menos 3 caracteres."),

    description: z
        .string()
        .trim()
        .min(1, "Informe uma descrição."),

    price: z
        .number()
        .positive("Informe um preço maior que zero."),

    stockQuantity: z
        .number()
        .int("Informe um estoque inteiro.")
        .min(0, "Informe um estoque não negativo."),
});

export type ProductPayload = z.infer<typeof productSchema>;

export type Product = ProductPayload & {
    id: string;
    createdAt: string;
    updatedAt: string;
};

export type ProductFormErrors = Partial<Record<keyof ProductPayload, string>>;
