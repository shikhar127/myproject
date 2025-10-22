import axios from 'axios';

// Update this with your backend server URL
const API_BASE_URL = 'http://localhost:3000/api';

export const uploadImage = async (imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();

    // Extract filename from uri
    const filename = imageUri.split('/').pop() || 'photo.jpg';

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);

    const response = await axios.post(`${API_BASE_URL}/transform`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds timeout
    });

    return response.data.transformedImageUrl;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getHealth = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};
