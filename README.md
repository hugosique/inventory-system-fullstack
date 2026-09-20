# Inventário de Produtos - CRUD Fullstack Challenge

Aplicação fullstack de gerenciamento de inventário.

## 🚀 Tecnologias

- **Backend:** Node.js, Fastify, Prisma ORM, Zod, Vitest
- **Frontend:** React, Vite, CSS Modules, Zod, Framer Motion, React Query, Playwright
- **Banco de Dados:** PostgreSQL
- **Infraestrutura:** Docker e Docker Compose

## ✅ Pré-requisitos

- **Docker** + **Docker Compose** (recomendado para subir tudo)
- **Node.js 22+** e **npm** (para rodar localmente sem Docker e rodar os testes)

Para desenvolvimento local com NVM, execute `nvm use` na raiz. O arquivo `.nvmrc` seleciona Node.js 24.

## ⚙️ Inicialização via Docker (recomendado)

### 1) Configurar variáveis de ambiente

Crie o arquivo `backend/.env` a partir do exemplo:

```bash
cp backend/.env.example backend/.env
```

Por padrão, o `.env.example` já vem pronto para Docker (o host do banco é `db`).

```env
DATABASE_URL="postgresql://admin:password@db:5432/inventory_db"
```

### 2) Subir os containers

Na raiz do projeto:

```bash
docker compose up --build -d
```

### 3) Criar tabelas (Prisma) e rodar o seed

Com os containers rodando:

```bash
docker compose exec backend npm run db:push
docker compose exec backend npm run seed # opcional
```

O comando `db:push` é necessário na primeira inicialização para criar a tabela `Product`.
Subir os containers não cria as tabelas da aplicação. Na execução via Compose,
mantenha `db:5432` no `DATABASE_URL`; use `localhost:5432` somente com o backend fora do Docker.

Depois de alterar código ou dependências, atualize as imagens com
`docker compose up --build -d backend frontend`.

## 💻 Inicialização local (sem Docker para backend/frontend)

### 1) Subir apenas o banco (Postgres)

```bash
docker compose up -d db
```

### 2) Configurar `backend/.env` para apontar para o Postgres no host

Modifique o DATABASE_URL do arquivo .env para rodar localmente alterando o 'db:5432' para 'localhost:5432', pois o 'db' só é reconhecido dentro do docker

```env
DATABASE_URL="postgresql://admin:password@localhost:5432/inventory_db"
```

### 3) Rodar backend

```bash
cd backend
npm install
npm run db:push
npm run seed # opcional
npm run dev
```

### 4) Rodar frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

## 🌐 URLs / Portas

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3333`
- **Swagger UI**: `http://localhost:3333/docs`

## ✅ Testes unitários (backend)

Funciona apenas com a versão 22 ou superior do Node.js (por conta do vitest)

```bash
cd backend
npm install
npm test
```

## ✅ Testes E2E (frontend)

```bash
cd frontend
npm install
npm run e2e
npm run ui
```

## 📝 Decisões técnicas

### 1) Banco de dados:

- **PostgreSQL:** Foi o banco de dados escolhido conforme especificado nos requisitos do projeto. Foi feita ainda, uma configuração no arquivo `docker-compose.yml` para que o banco de dados seja persistido entre as inicializações da aplicação, através do uso de `volumes`.

### 2) ORM/Query Builder:

- **Prisma:** Escolhido por sua simplicidade de implementação e alinhamento com requisitos simples do projeto, talvez se fosse algo maior e mais robusto a utilização do Drizzle seria uma opção melhor por uma flexibilidade e performance superiores.

### 3) API:

- **Fastify:** Foi o framework escolhido para o backend, devido a sua alta performance comparado ao Express.js e por ser uma ferramenta moderna, que ainda não conhecia. Mesmo tendo um ecossistema menor, para os requisitos deste projeto foi mais que suficiente.

### 4) Tipagem/Validação:

- **Zod:** Foi o validador de tipos e contratos utilizado devido a sua melhor integração com o TypeScript e inferência de tipos.

### 5) Interface:

- **React:** Foi escolhida uma rota com `react-router-dom` para a navegação entre as páginas de listagem de produtos e formulário de criação/edição de produto, assim separando páginas e componentes de diferentes responsabilidades.

### 6) Gerenciamento de Estado:

- **TanStack Query (React Query):** Utilizado para gerenciar o estado das chamadas a API centralizando o consumo e gerenciamento de estado.
- **React Hooks (useState e useEffect)**: Foram utilizados para gerenciar o estado local de alguns componentes mantendo a UI atualizada também.

### 7) Estilização:

- **CSS Modules:** Foi o responsável pela estilização dos componentes do frontend, garantindo que os estilos não conflitassem entre os componentes, escolhido principalmente pela baixa poluição visual do código em comparação com Tailwind CSS.

### 8) Componentização:

- **UI Base:** Foi criado uma base de componentes UI reutilizáveis com Button, Table, etc. Permitindo customização dos dados, modos e outros elementos visuais e funcionais. Também houve a separação de componentes de páginas para separação de responsabilidades e legibilidade do código.

### 9) Bônus (Aprendizado):

- **Swagger:** Facilitou a visualização e documentação da API pensado para algo que precise de escalabilidade futura.
- **Vitest:** Utilizado para realizar os testes unitários no backend, testando controller, service, inicialização da aplicação e validando os contratos com zod.
- **Playwright:** Escolhido para realizar os testes end-to-end no frontend, cobrindo a visualização, criação, edição e exclusão de produtos.
- **Framer Motion:** Foi utilizado para criar transições entre páginas e componentes, agregando na experiência do usuário.

## ⚠️ Importante: Configuração do dev-config (delay)

Foi implementada uma variável para controlar o delay de resposta das requisições. Para simular um loading de baixa latência, foi definido o valor 500ms. Podendo ser modificado no arquivo `frontend/dev-config.ts`.
