# Gym Realtime People - Tests

This project includes comprehensive tests for the gym occupancy data API.

## Test Structure

- `tests/sources.test.ts` - Tests for data source parsing and API fetching
- `tests/routes.test.ts` - Tests for Express API endpoints
- `tests/types.test.ts` - Tests for TypeScript type definitions
- `tests/server.test.ts` - Integration tests for server setup

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui
```

## Test Coverage

The tests cover:

- ✅ Data source configuration and parsing
- ✅ API fetching with error handling
- ✅ Express route handlers
- ✅ TypeScript type safety
- ✅ Server integration

## Mocking

Tests use Vitest's mocking capabilities to:
- Mock `fetch` API calls
- Mock external data sources
- Test error scenarios
- Verify API call parameters

## Test Results

All 21 tests are currently passing:
- Types: 4 tests
- Sources: 9 tests
- Server: 3 tests
- Routes: 5 tests
