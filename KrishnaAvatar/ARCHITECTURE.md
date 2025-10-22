# Architecture Overview - Krishna Avatar App

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Application                       │
│                     (React Native)                           │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Home Screen  │───▶│ API Service  │───▶│Result Screen │  │
│  │              │    │              │    │              │  │
│  │ - Photo Pick │    │ - Upload     │    │ - Display    │  │
│  │ - Preview    │    │ - Transform  │    │ - Share      │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Server                           │
│                     (Node.js + Express)                      │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Routes     │───▶│ Controllers  │───▶│  Services    │  │
│  │              │    │              │    │              │  │
│  │ - Transform  │    │ - Validate   │    │ - AI Model   │  │
│  │ - Health     │    │ - Process    │    │ - Image Proc │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Service (Future)                         │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Face         │    │ Style        │    │ Krishna      │  │
│  │ Detection    │───▶│ Transfer     │───▶│ Avatar Gen   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
│  Options: Replicate, Hugging Face, Custom Model             │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Mobile Application (React Native)

#### Screens
- **HomeScreen**: Main interface for photo selection and transformation initiation
  - Camera integration via `react-native-image-picker`
  - Gallery access
  - Preview selected image
  - Trigger transformation

- **ResultScreen**: Display transformed avatar
  - Show final Krishna avatar
  - Share functionality
  - Option to create another

#### Services
- **API Service** (`src/services/api.ts`)
  - HTTP client using Axios
  - Image upload handling
  - Error handling and retry logic
  - Base URL configuration

#### Navigation
- Stack navigation using React Navigation
- Route parameters for passing image data
- Header customization

### Backend Server (Node.js)

#### API Layer

**Routes** (`src/routes/`)
- POST `/api/transform` - Transform image endpoint
- GET `/api/health` - Health check endpoint

**Controllers** (`src/controllers/`)
- Request validation
- Response formatting
- Error handling
- Business logic delegation

**Middleware**
- Multer for file upload handling
- CORS for cross-origin requests
- Error handling middleware

#### Business Logic Layer

**Services** (`src/services/`)

`transform.service.js`:
- Image processing pipeline
- AI model integration point
- File management (uploads/output)
- Placeholder transformations

Key methods:
- `transformToKrishna(imageBuffer, filename)` - Main transformation
- `applyPlaceholderTransform(imageBuffer)` - Temporary filter
- `callAIModel(imageBuffer)` - AI integration point (future)

#### Data Flow

1. **Upload**:
   ```
   Mobile App → Multer Middleware → Controller → Service
   ```

2. **Processing**:
   ```
   Service → Sharp (resize) → AI Model (future) → Output File
   ```

3. **Response**:
   ```
   Service → Controller → Mobile App → Display
   ```

## Technology Stack

### Mobile App
- **Framework**: React Native 0.72
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **HTTP Client**: Axios
- **Image Handling**: react-native-image-picker
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4
- **Image Processing**: Sharp
- **File Upload**: Multer
- **Environment**: dotenv
- **Development**: Nodemon

### Future AI Integration
- **Options**:
  - Replicate (Stable Diffusion)
  - Hugging Face Inference API
  - Custom TensorFlow/PyTorch model
- **Requirements**:
  - Face detection
  - Style transfer
  - Image generation

## Security Considerations

### Current Implementation
- File size limits (10MB)
- File type validation (images only)
- CORS configuration
- Input sanitization

### Production Recommendations
- [ ] Add authentication (JWT)
- [ ] Rate limiting
- [ ] API key management
- [ ] Secure file storage
- [ ] HTTPS/TLS
- [ ] Input validation enhancement
- [ ] Malware scanning for uploads
- [ ] CDN for static assets

## Performance Optimization

### Current
- In-memory image processing
- Synchronous request handling
- Local file storage

### Future Improvements
- [ ] Queue system (Bull/RabbitMQ) for async processing
- [ ] Caching transformed images
- [ ] CDN integration (CloudFront, Cloudflare)
- [ ] Database for user history
- [ ] Horizontal scaling with load balancer
- [ ] Image optimization and compression
- [ ] Lazy loading in mobile app

## Data Storage

### Current
```
backend/
├── uploads/          # Original uploaded images
│   └── {timestamp}_{filename}
└── output/           # Transformed images
    └── krishna_{timestamp}_{filename}
```

### Future (Database Schema)
```sql
Users:
  - id
  - email
  - created_at

Transformations:
  - id
  - user_id
  - original_image_url
  - transformed_image_url
  - created_at
  - status (pending/completed/failed)

Settings:
  - user_id
  - preferences
```

## API Specification

### POST /api/transform

**Request:**
```http
POST /api/transform HTTP/1.1
Content-Type: multipart/form-data

image: [binary data]
```

**Success Response:**
```json
{
  "success": true,
  "transformedImageUrl": "/output/krishna_123456_photo.jpg",
  "message": "Image transformed successfully"
}
```

**Error Response:**
```json
{
  "error": "Failed to transform image",
  "message": "Invalid image format"
}
```

### GET /api/health

**Response:**
```json
{
  "status": "OK",
  "message": "Transform API is running",
  "timestamp": "2025-10-21T14:30:00.000Z"
}
```

## Deployment Architecture (Production)

```
                    ┌─────────────┐
                    │   Users     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ App Stores  │
                    │ iOS/Android │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  iOS App    │          │ Android App │
       └──────┬──────┘          └──────┬──────┘
              │                         │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │Load Balancer│
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  Backend    │          │  Backend    │
       │  Server 1   │          │  Server 2   │
       └──────┬──────┘          └──────┬──────┘
              │                         │
              └────────────┬────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │   AI Model  │          │     CDN     │
       │   Service   │          │   (Images)  │
       └─────────────┘          └─────────────┘
```

## Error Handling

### Mobile App
- Network errors: Retry with exponential backoff
- Upload failures: User feedback with retry option
- Image picker errors: Alert with helpful message
- Loading states: Activity indicators

### Backend
- Invalid file format: 400 Bad Request
- File too large: 413 Payload Too Large
- Processing failure: 500 Internal Server Error
- AI service timeout: 504 Gateway Timeout

## Testing Strategy

### Unit Tests
- Services layer (transformation logic)
- Utility functions
- API endpoints

### Integration Tests
- Full upload → transform → download flow
- Error handling scenarios
- File size limits
- Permission handling

### E2E Tests
- Complete user journey
- Cross-platform testing (iOS/Android)
- Network conditions (slow 3G, offline)

## Monitoring & Logging

### Recommended Tools
- **Application Monitoring**: New Relic, Datadog
- **Error Tracking**: Sentry
- **Logging**: Winston, CloudWatch
- **Analytics**: Google Analytics, Mixpanel

### Key Metrics
- Transformation success rate
- Average processing time
- API response times
- Error rates
- User engagement

## Future Enhancements

### Phase 1 (MVP)
- [x] Basic photo upload
- [x] Placeholder transformation
- [x] Result display
- [ ] AI model integration

### Phase 2
- [ ] User authentication
- [ ] Save transformation history
- [ ] Multiple avatar styles
- [ ] Social sharing

### Phase 3
- [ ] Premium features
- [ ] Face detection optimization
- [ ] Batch processing
- [ ] Custom prompts
- [ ] HD downloads

### Phase 4
- [ ] Community features
- [ ] Avatar gallery
- [ ] Templates
- [ ] Video transformation

---

This architecture is designed to be scalable, maintainable, and ready for production deployment with minimal modifications.
