import { apiClient } from '../../core/lib/apiClient'
import { simulateDelayMs } from '../../core/utils/delay';
import type { Product, ProductPayload } from '../../core/schemas/product.schema'

export async function listProducts(query?: string): Promise<Product[]> {
  const { data } = await simulateDelayMs(apiClient.get<Product[]>('/products', {
    params: query ? { query } : undefined,
  }));

  return data
}

export async function getProductById(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`)

  return data
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>('/products', payload)

  return data
}

export async function updateProduct(
  id: string,
  payload: ProductPayload,
): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, payload)

  return data
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}
