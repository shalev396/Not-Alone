# Not Alone Backend !

A Node.js backend application built with TypeScript, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/not-alone
NODE_ENV=development
```

4. Start the development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Start the development server with hot-reload
- `npm run build`: Build the TypeScript code
- `npm start`: Start the production server
- `npm run lint`: Run ESLint
- `npm test`: Run tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Generate test coverage report

## Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/         # Mongoose models
├── routes/         # Express routes
├── services/       # Business logic
└── index.ts        # App entry point
```

## Documentation

### API Documentation

[API Documentation](./docs/README.md)

## License

MIT
