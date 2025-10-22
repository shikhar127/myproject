# Krishna Avatar App

A mobile application that transforms user photos into divine Krishna avatars using AI-powered image transformation.

## Project Overview

This project consists of two main components:
- **Mobile App**: React Native cross-platform mobile application (iOS & Android)
- **Backend API**: Node.js/Express server for image processing and AI model integration

## Features

- Upload photos from camera or gallery
- AI-powered transformation to Krishna avatar style
- Share transformed avatars on social media
- Beautiful, user-friendly interface with divine theme

## Project Structure

```
myproject/
├── mobile-app/           # React Native mobile application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── screens/      # App screens (Home, Result)
│   │   ├── services/     # API services
│   │   ├── assets/       # Images, fonts, etc.
│   │   └── utils/        # Utility functions
│   ├── App.tsx           # Main app component
│   ├── package.json      # Dependencies
│   └── tsconfig.json     # TypeScript configuration
│
├── backend/              # Node.js backend server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Custom middleware
│   │   └── utils/        # Utility functions
│   ├── uploads/          # Uploaded images (gitignored)
│   ├── output/           # Transformed images (gitignored)
│   ├── package.json      # Dependencies
│   └── .env.example      # Environment variables template
│
└── README.md             # This file
```

## Prerequisites

- Node.js 16+ and npm/yarn
- React Native development environment:
  - For iOS: Xcode (macOS only)
  - For Android: Android Studio and SDK
- (Optional) AI API keys for production (Replicate, Hugging Face, etc.)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your AI API keys in `.env` (see AI Integration section below)

5. Start the development server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3000`

### Mobile App Setup

1. Navigate to the mobile app directory:
   ```bash
   cd mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install iOS pods (macOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

4. Update API endpoint in `src/services/api.ts`:
   - For Android emulator: `http://10.0.2.2:3000/api`
   - For iOS simulator: `http://localhost:3000/api`
   - For physical device: `http://YOUR_COMPUTER_IP:3000/api`

5. Start Metro bundler:
   ```bash
   npm start
   ```

6. Run on Android:
   ```bash
   npm run android
   ```

   Or run on iOS:
   ```bash
   npm run ios
   ```

## AI Model Integration

The current implementation includes a placeholder transformation. For production, you need to integrate with an AI model service.

### Recommended Options:

#### 1. Replicate (Easiest)
- Sign up at https://replicate.com/
- Get API key and add to `.env`:
  ```
  REPLICATE_API_KEY=your_key_here
  ```
- Install SDK: `npm install replicate`
- Use models like Stable Diffusion with ControlNet for face-to-avatar transformation

#### 2. Hugging Face Inference API
- Sign up at https://huggingface.co/
- Get API key and add to `.env`:
  ```
  HUGGINGFACE_API_KEY=your_key_here
  ```
- Use pre-trained style transfer models
- Example models: stable-diffusion-v1-5, controlnet

#### 3. Custom Model
- Train your own model using:
  - Dataset of Krishna imagery and art
  - Style transfer techniques (CycleGAN, StyleGAN)
  - Face detection + image compositing
- Deploy using TensorFlow Serving or PyTorch
- Update `backend/src/services/transform.service.js` with your endpoint

### Implementation Guide

Edit `backend/src/services/transform.service.js` and implement the `callAIModel()` method with your chosen AI service.

Example with Replicate:
```javascript
const Replicate = require('replicate');

async callAIModel(imageBuffer) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });

  const output = await replicate.run(
    "stability-ai/stable-diffusion:model-version",
    {
      input: {
        image: imageBuffer.toString('base64'),
        prompt: "Krishna avatar, divine appearance, blue skin, peacock feather crown, traditional Indian art style, detailed, high quality",
        negative_prompt: "blurry, low quality, distorted",
      }
    }
  );

  return output;
}
```

## API Endpoints

### POST /api/transform
Transform an uploaded image to Krishna avatar

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "transformedImageUrl": "/output/krishna_123456_photo.jpg",
  "message": "Image transformed successfully"
}
```

### GET /api/health
Check API health status

**Response:**
```json
{
  "status": "OK",
  "message": "Transform API is running",
  "timestamp": "2025-10-21T14:30:00.000Z"
}
```

## Mobile App Permissions

The app requires the following permissions:

**iOS (Info.plist):**
- NSCameraUsageDescription
- NSPhotoLibraryUsageDescription

**Android (AndroidManifest.xml):**
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

These are configured in the respective platform files.

## Development Tips

1. **Testing without AI:** The placeholder transformation applies basic image filters so you can test the full flow without AI integration

2. **Image size:** Images are resized to 512x512 for processing. Adjust in `transform.service.js` if needed

3. **Debugging:**
   - Backend logs in terminal where server is running
   - Mobile app logs via React Native debugger or `console.log`

4. **Performance:** For production, consider:
   - Caching transformed images
   - Queue system for processing (Bull, RabbitMQ)
   - CDN for serving images (AWS S3, Cloudinary)

## Production Deployment

### Backend
- Deploy to services like:
  - AWS EC2 / Elastic Beanstalk
  - Heroku
  - DigitalOcean
  - Google Cloud Run

### Mobile App
- iOS: Build and submit to App Store via Xcode
- Android: Build APK/AAB and submit to Google Play Console

### Environment Variables
Set all production environment variables:
- API keys for AI services
- Production server URLs
- Database connections (if added)

## Future Enhancements

- [ ] User authentication and profile management
- [ ] Save history of generated avatars
- [ ] Multiple avatar styles (Krishna, Rama, other deities)
- [ ] Face detection to ensure proper alignment
- [ ] Download high-resolution versions
- [ ] Social media integration for direct sharing
- [ ] Payment integration for premium features

## Troubleshooting

**Issue:** "Cannot connect to server"
- Ensure backend is running on correct port
- Update API_BASE_URL in `mobile-app/src/services/api.ts`
- For Android emulator, use `10.0.2.2` instead of `localhost`

**Issue:** "Image upload fails"
- Check file size limits (default 10MB)
- Verify image format is supported (JPEG, PNG)
- Check backend logs for detailed error messages

**Issue:** "Build fails on iOS"
- Run `cd ios && pod install`
- Clean build: `cd ios && xcodebuild clean`

**Issue:** "Build fails on Android"
- Clean gradle: `cd android && ./gradlew clean`
- Check Android SDK and tools are installed

## License

This project is for educational and devotional purposes. Please respect cultural and religious sensitivities when using or modifying this application.

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing style and structure
- Test your changes on both iOS and Android
- Update documentation as needed

## Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include error logs and environment details

---

**Jai Shri Krishna!** 🙏
