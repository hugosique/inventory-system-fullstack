import { expect, test, describe, vi, afterAll, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  product: { findMany: vi.fn(), findUnique: vi.fn() },
}))

vi.mock('./lib/prisma', () => ({ prisma: prismaMock }))

import { app } from './app'

describe('App', () => {
  beforeEach(() => vi.resetAllMocks())
  afterAll(() => app.close())

  test('should return hello world', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/'
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ hello: 'world' })
  })

  test('invalid product data returns 400 with validation issues', async () => {
    const response = await app.inject({ method: 'POST', url: '/products', payload: {} })

    expect(response.statusCode).toBe(400)
    expect(response.json().issues).toEqual(expect.any(Array))
  })

  test.each(['GET', 'PATCH', 'DELETE'] as const)('%s rejects invalid product IDs before querying the database', async (method) => {
    const response = await app.inject({
      method, url: '/products/invalid-id',
      ...(method === 'PATCH' ? { payload: { price: 10 } } : {}),
    })

    expect(response.statusCode).toBe(400)
    expect(prismaMock.product.findUnique).not.toHaveBeenCalled()
  })

  test.each(['GET', 'PATCH', 'DELETE'] as const)('%s returns 404 for a missing product', async (method) => {
    prismaMock.product.findUnique.mockResolvedValue(null)
    const response = await app.inject({
      method, url: '/products/123e4567-e89b-42d3-a456-426614174000',
      ...(method === 'PATCH' ? { payload: { price: 10 } } : {}),
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({ message: 'Produto não encontrado' })
  })

  test('malformed JSON returns 400', async () => {
    const response = await app.inject({
      method: 'POST', url: '/products',
      headers: { 'content-type': 'application/json' }, payload: '{',
    })

    expect(response.statusCode).toBe(400)
  })

  test('database failures return 500 without exposing internal details', async () => {
    prismaMock.product.findMany.mockRejectedValue(new Error('Internal database details'))
    const response = await app.inject({ method: 'GET', url: '/products' })

    expect(response.statusCode).toBe(500)
    expect(response.json()).toEqual({ message: 'Internal server error.' })
  })
})
