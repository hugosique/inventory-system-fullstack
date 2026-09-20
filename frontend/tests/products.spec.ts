import { expect, test, type Page } from '@playwright/test'
import type { Product } from '../src/core/schemas/product.schema'

const baseProducts: Product[] = [
  {
    id: '1',
    name: 'Monitor LED',
    description: 'Monitor de 24 polegadas',
    price: 899.9,
    stockQuantity: 12,
    createdAt: '2026-05-04T10:00:00.000Z',
    updatedAt: '2026-05-04T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'Teclado Mecanico',
    description: 'Switch brown',
    price: 299.9,
    stockQuantity: 8,
    createdAt: '2026-05-04T10:00:00.000Z',
    updatedAt: '2026-05-04T10:00:00.000Z',
  },
]

async function mockProductsApi(page: Page) {
  const products = [...baseProducts]

  await page.route(/\/api\/products(\?.*)?$/, async (route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (request.method() === 'GET') {
      const query = url.searchParams.get('query')?.toLowerCase()
      const response = query
        ? products.filter((product) =>
          product.name.toLowerCase().includes(query),
        )
        : products

      await route.fulfill({ json: response })
      return
    }

    if (request.method() === 'POST') {
      const payload = request.postDataJSON()
      const product = {
        id: '3',
        createdAt: '2026-05-04T10:00:00.000Z',
        updatedAt: '2026-05-04T10:00:00.000Z',
        ...payload,
      }

      products.push(product)
      await route.fulfill({ json: product, status: 201 })
      return
    }

    await route.fallback()
  })

  await page.route(/\/api\/products\/[^/]+$/, async (route) => {
    const request = route.request()
    const id = request.url().split('/').at(-1)
    const product = products.find((item) => item.id === id)

    if (!product) {
      await route.fulfill({ json: { message: 'Not found' }, status: 404 })
      return
    }

    if (request.method() === 'GET') {
      await route.fulfill({ json: product })
      return
    }

    if (request.method() === 'PATCH') {
      const payload = request.postDataJSON()
      const updatedProduct = {
        ...product,
        ...payload,
        updatedAt: '2026-05-04T11:00:00.000Z',
      }
      const index = products.findIndex((item) => item.id === id)

      products[index] = updatedProduct
      await route.fulfill({ json: updatedProduct })
      return
    }

    if (request.method() === 'DELETE') {
      const index = products.findIndex((item) => item.id === id)

      products.splice(index, 1)
      await route.fulfill({ status: 204 })
      return
    }

    await route.fallback()
  })
}

test('lista produtos e navega para edicao', async ({ page }) => {
  await mockProductsApi(page)

  await page.goto('/products')

  await expect(page.getByRole('heading', { name: 'Produtos' })).toBeVisible()
  await expect(page.getByText('Monitor LED')).toBeVisible()
  await expect(page.getByText('Teclado Mecanico')).toBeVisible()

  await page.getByRole('link', { name: 'Atualizar produto' }).first().click()

  await expect(page).toHaveURL(/\/products\/1\/edit$/)
  await expect(page.getByLabel('Nome')).toHaveValue('Monitor LED')
})

test('cria um produto e volta para listagem', async ({ page }) => {
  await mockProductsApi(page)

  await page.goto('/products/new')

  await page.getByLabel('Nome').fill('Mouse Gamer')
  await page.getByLabel('Descrição').fill('Mouse com sensor optico')
  await page.getByLabel('Preço').fill('199.9')
  await page.getByLabel('Estoque').fill('15')
  await page.getByRole('button', { name: 'Salvar' }).click()

  await expect(page).toHaveURL(/\/products$/)
  await expect(page.getByText('Mouse Gamer')).toBeVisible()
})

test('exclui um produto pela listagem', async ({ page }) => {
  await mockProductsApi(page)

  await page.goto('/products')

  await page.getByRole('button', { name: 'Excluir produto' }).first().click()

  await page.getByRole('button', { name: 'Sim, excluir' }).click()

  await expect(page.locator('strong').filter({ hasText: 'Monitor LED' })).not.toBeVisible()
  await expect(page.locator('strong').filter({ hasText: 'Teclado Mecanico' })).toBeVisible()
})

test('edita um produto e executa busca com query', async ({ page }) => {
  await mockProductsApi(page)

  await page.goto('/products')

  await page.getByPlaceholder('Buscar produto...').fill('monitor')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.getByText('Monitor LED')).toBeVisible()
  await expect(page.getByText('Teclado Mecanico')).not.toBeVisible()

  await page.getByRole('button', { name: 'Limpar busca' }).click()
  await expect(page.getByText('Teclado Mecanico')).toBeVisible()

  await page.getByRole('link', { name: 'Atualizar produto' }).nth(1).click()

  await page.getByLabel('Nome').fill('Teclado Ergonomico')
  await page.getByRole('button', { name: 'Salvar' }).click()

  await expect(page).toHaveURL(/\/products$/)
  await expect(page.getByText('Teclado Ergonomico')).toBeVisible()
})
