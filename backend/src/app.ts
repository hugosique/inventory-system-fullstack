import fastify from 'fastify';
import { ZodTypeProvider, hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod';
import { swaggerConfig } from './lib/swagger';
import { productRoutes } from './modules/products/product.routes';

export const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

swaggerConfig(app);

app.addHook('onRoute', ({ method, url }) => {
  if (method) console.log(`[ROUTE]: ${method} ${url}`);
});

app.get("/", async (req, reply) => {
  return { hello: "world" };
});

app.register(productRoutes);

app.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({ message: 'Validation error.', issues: error.validation });
  }

  if (error instanceof Error && 'statusCode' in error &&
      typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ message: error.message });
  }

  request.log.error({ err: error }, 'Request failed');
  return reply.status(500).send({ message: 'Internal server error.' });
});
