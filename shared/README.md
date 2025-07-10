# RoomSpark Shared Types

This package contains shared TypeScript definitions used across the RoomSpark backend and mobile app to ensure type consistency.

## Setup

This package is used as a local dependency in both the backend and mobile projects. It's linked via the file system using `"@roomspark/shared": "file:../shared"` in the package.json.

## Installation

To install and build the shared package:

```bash
# From the shared directory
npm install
npm run build

# Then from the backend and mobile directories
npm install
```

## Usage

### Backend Usage

In your backend code, import the types:

```typescript
import { Product, GetProductsResponse } from "@roomspark/shared";

// Use the types
const response: GetProductsResponse = {
  status: "success",
  products: [],
};
```

### Mobile Usage

In your mobile code, import the types:

```typescript
import { Product, GetProjectResponse } from "@roomspark/shared";

// Use with the API hook
const { data, isLoading, error, fetch } =
  useApiRequest<GetProjectResponse>("/api/get-project");
```

## Type Definitions

The package includes definitions for:

- API responses
- Product types
- Project types
- Common interfaces

## Development

When you update types in this package:

1. Make your changes
2. Run `npm run build` in the shared directory
3. The changes will automatically be available to the backend and mobile projects

## Benefits

- Single source of truth for API types
- Type safety across the entire application
- Automatic type checking for API responses
- Reduced duplication and potential for type mismatches
