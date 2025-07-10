# RoomSparkApp Project Overview

## Project Structure

This project is a full-stack application with three main components:

- **Mobile App**: React Native application built with Expo
- **Backend**: Next.js server with API routes
- **Shared Types**: TypeScript definitions shared between the mobile app and backend

## Technology Stack

### Mobile App

- **Framework**: React Native with Expo
- **Routing**: Expo Router
- **Authentication**: Clerk Auth
- **Data Fetching**: TanStack React Query v4 for intelligent caching and state management
- **UI Components**: Native React Native components with shared skeleton loading components
- **API Management**: React Query-powered API hooks with automatic caching, refetching, and error handling
- **Error Handling**: Standardized toast notification system
- **Key Dependencies**:
  - expo-router for navigation
  - @clerk/clerk-expo for authentication
  - @tanstack/react-query for server state management
  - expo-image-picker for image handling
  - expo-haptics for tactile feedback
  - react-native-reanimated for animations

### Backend

- **Framework**: Next.js 15
- **Authentication**: Clerk Auth integration with Next.js
- **Database**: Supabase
- **Image Processing**: Sharp and Jimp
- **AI Integration**: Sofabrain room generation
- **Product Search**: SerpAPI for google lens
- **Product Processing**: ProductProcessorService for cleaning product data and improving ordering
- **Mock Services**: Development mock services for image generation and product search controlled by environment variables
- **Prompt System**: Room-type-specific prompt generation for AI image creation

### Shared Types

- **TypeScript**: Strong type definitions for API responses and data models
- **Cross-project Types**: Ensures type consistency between backend and mobile
- **Single Source of Truth**: All API interface types defined in one location
- **Room Type Enums**: Shared enums for room types used in prompt generation

## Development Requirements

### Type Safety Requirements

- **REQUIRED**: All new API endpoints MUST define their response types in the shared types package
- **REQUIRED**: All existing API endpoints MUST be updated to use shared types when modified
- **REQUIRED**: API responses MUST conform to the defined shared interfaces
- **REQUIRED**: Type definitions for requests and responses MUST be added to shared/types/api.ts
- **PROHIBITED**: Defining API-related types directly in the backend or mobile projects

### How to Add New API Types

1. Define the interface in `shared/types/api.ts`
2. Run `npm run build` in the shared directory to compile updated type definitions
3. Use the shared type in both backend and mobile code

## Application Features

### User Authentication

The app uses Clerk for authentication, providing a comprehensive authentication flow:

1. **Landing Page**: Entry point with login, signup, and sign in with Google options
2. **Sign Up**: Form with name, email, password, and confirmation fields
3. **Login**: Email and password login with forgot password option
4. **Email Verification**: Code-based verification for new sign-ups
5. **Token-based API Authentication**: Secure API requests with Clerk tokens

### project Creation and Management

Users can create "projects" which appear to be collections of images with both uploaded and AI-generated content.

#### Key Features:

1. **Create projects**: Users can create new project projects with custom names
2. **View projects**: List and browse existing projects
3. **Image Upload**: Upload images to a project
4. **AI Image Generation**: Generate images using AI (likely via OpenAI's DALL-E)

### Data Flow

1. Mobile app authenticates users with Clerk
2. API requests include auth tokens for secure backend communication
3. Backend processes requests, interacts with Supabase database, and handles image processing
4. AI-generated content is created via Sofabrain
5. React Query intelligently caches responses and manages refetching

### API Endpoints

- `/api/project-list`: View projects and create a new project
- `/api/get-projects`: Retrieve all user projects
- `/api/get-project`: Get details of a specific project
- `/api/upload`: Upload images to a project
- `/api/generate-image`: Generate AI images for a project with room-type-specific prompts
- `/api/get-products`: Get products identified in an image with automated title cleaning and Amazon product prioritization
- `/api/like-product`: Mark a product as liked or unliked by the user
- `/api/get-liked-products`: Retrieve all products liked by the current user

### API Request Management (React Query Powered)

The mobile app uses TanStack React Query for intelligent server state management with clean, modern API hooks:

1. **useApiQuery**: For GET requests with automatic caching and refetching

   - Intelligent background refetching when data becomes stale
   - Automatic refetching when navigating back to screens
   - Request deduplication across components
   - Optimistic updates and error boundaries

2. **useApiMutation**: For POST/PUT/DELETE operations with optimistic updates

   - Automatic error handling and loading states
   - Integration with query invalidation
   - Support for optimistic UI updates

3. **useFocusRefetch**: React Navigation integration
   - Automatically refetches data when navigating back to screens
   - Configurable for all queries or specific query sets

### React Query Benefits

- **Intelligent Caching**: Data is cached and reused across components
- **Background Refetching**: Keeps data fresh automatically
- **Request Deduplication**: Multiple components requesting same data = single request
- **Offline Support**: Works offline and syncs when connection restored
- **Performance**: Reduced API calls and improved user experience

### Error Handling and User Feedback

The application implements a standardized error handling and notification system:

1. **Toast Notifications**: Centralized toast system for displaying errors, warnings, and success messages
2. **Consistent Error Handling**: Common error handling utilities across the app
3. **API Error Integration**: Automatic error display for API requests via React Query hooks
4. **Custom Error Messages**: Support for custom error messages and fallback handling

### Error Handling Utilities

- **ToastContext**: React Context for managing toast notifications app-wide
- **useToast**: Hook for triggering toast notifications from any component
- **useErrorHandler**: Hook for standardized error processing and display
- **withErrorHandling**: HOC utility for wrapping async functions with error handling

## User Interface

The mobile app features a clean interface with:

- Authentication screens
- project listing/browsing view
- project editor with image uploading and generation capabilities

## Project Purpose

RoomSparkApp appears to be an application that helps users visualize room designs or modifications through a combination of their own uploaded images and AI-generated alternatives or enhancements. It also shows you a list of products in those generated images.

## Technical Architecture

The application follows a client-server architecture with:

- Mobile client for user interaction with React Query for intelligent state management
- Next.js backend for business logic and API endpoints
- Supabase for data persistence
- OpenAI for generative AI capabilities
- Clerk for authentication across both platforms
- Shared TypeScript types to ensure consistency between frontend and backend
- TanStack React Query for efficient data fetching, caching, and synchronization

### Mock Services for Development

The backend includes mock services that can be enabled via environment variables for development and testing:

- **MOCK_IMAGE_GEN**: When set to "true", uses MockImageService instead of real AI image generation
- **MOCK_PRODUCTS**: When set to "true", uses MockProductService instead of real product search APIs

Mock services return realistic sample data with simulated processing delays to mimic real service behavior without requiring external API keys or network calls.

### Prompt Generation System

The application includes a sophisticated prompt generation system for AI image creation:

1. **Room Type Enum**: Shared enum defining different interior design styles (mid_century_modern, scandinavian, industrial, bohemian, modern_farmhouse, japandi, traditional, contemporary, coastal, eclectic, transitional, generic)
2. **RoomTypePrompt Class**: Handles generation of style-specific prompts for AI image generation
3. **Dynamic Prompting**: Customizes AI generation prompts based on the chosen interior design style
4. **Extensible Design**: Easy to add new design styles and customize prompts

# Helpful commands

- Regen the DB types
  Inside /backend, run

```bash
npx supabase gen types typescript --project-id trjqmryilqwfkjidoysf --schema public > src/utils/database.types.ts
```
