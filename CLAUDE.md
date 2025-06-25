# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS REST API boilerplate with support for both relational (PostgreSQL via TypeORM) and document (MongoDB via Mongoose) databases. The project uses Hexagonal Architecture (Ports and Adapters) to maintain clean separation between business logic and infrastructure.

## Essential Commands

### Development
```bash
yarn build                 # Build the application
yarn start         # Start production build
```

### Testing
```bash
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run E2E tests

# Docker-based E2E tests
npm run test:e2e:relational:docker  # PostgreSQL E2E tests
npm run test:e2e:document:docker    # MongoDB E2E tests
```

### Code Quality
```bash
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### Database Operations (TypeORM/PostgreSQL)
```bash
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration
npm run seed:run:relational  # Run database seeds
```

### Database Operations (Mongoose/MongoDB)
```bash
npm run seed:run:document  # Run database seeds
```

### Code Generation
```bash
# Generate new resource/module
npm run generate:resource:relational  # For PostgreSQL
npm run generate:resource:document    # For MongoDB
npm run generate:resource:all-db      # For both databases

# Add property to existing entity
npm run add:property:to-relational    # For PostgreSQL entity
npm run add:property:to-document      # For MongoDB schema
npm run add:property:to-all-db        # For both
```

## Architecture

The project follows Hexagonal Architecture with this structure:

```
src/[module]/
├── domain/               # Business entities (no infrastructure dependencies)
├── dto/                  # Data Transfer Objects
├── infrastructure/       # Infrastructure implementations
│   └── persistence/
│       ├── document/     # MongoDB implementation
│       ├── relational/   # PostgreSQL implementation
│       └── [module].repository.ts  # Repository interface (port)
├── [module].controller.ts  # HTTP controllers
├── [module].module.ts      # NestJS module definition
└── [module].service.ts     # Business logic services
```

### Key Principles:
- Domain entities contain only business logic, no infrastructure dependencies
- Repository interfaces (ports) are defined separately from implementations (adapters)
- Services orchestrate business logic using repository interfaces
- Controllers handle HTTP concerns and delegate to services
- DTOs handle data validation and transformation

### Repository Pattern:
- Create specific methods instead of generic ones (e.g., `findByEmail()` not `find({ email })`)
- Each repository method should have a single responsibility
- Repository interfaces allow switching between databases without changing business logic

## Development Setup

### For PostgreSQL Development:
1. Copy environment file: `cp env-example-relational .env`
2. Update `.env`: Change `DATABASE_HOST=postgres` to `DATABASE_HOST=localhost`
3. Start infrastructure: `docker compose up -d postgres adminer maildev`
4. Install dependencies: `npm install`
5. Run migrations: `npm run migration:run`
6. Seed database: `npm run seed:run:relational`
7. Start development: `npm run start:dev`

### For MongoDB Development:
1. Copy environment file: `cp env-example-document .env`
2. Update `.env`: Change `DATABASE_URL=mongodb://mongo:27017` to `DATABASE_URL=mongodb://localhost:27017`
3. Start infrastructure: `docker compose -f docker-compose.document.yaml up -d mongo mongo-express maildev`
4. Install dependencies: `npm install`
5. Seed database: `npm run seed:run:document`
6. Start development: `npm run start:dev`

### Development URLs:
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/docs
- Adminer (PostgreSQL): http://localhost:8080
- MongoDB Express: http://localhost:8081
- Maildev: http://localhost:1080

## Important Notes

- Run `npm run app:config` only once on new projects for initial configuration
- The project supports multiple authentication methods: email, Apple, Facebook, and Google
- File uploads support local storage, S3, and S3 presigned URLs
- Internationalization (i18n) is built-in with support for multiple languages
- API documentation is auto-generated using Swagger
- Both REST and GraphQL endpoints are supported (GraphQL requires additional setup)
- Environment-specific configurations are managed through `.env` files
- The project includes role-based access control (Admin/User roles)
- Email functionality uses nodemailer with maildev for local development