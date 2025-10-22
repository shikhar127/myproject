const transformService = require('../services/transform.service');

const transformImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Received image:', req.file.originalname);

    // Transform the image to Krishna avatar
    const transformedImageUrl = await transformService.transformToKrishna(
      req.file.buffer,
      req.file.originalname
    );

    res.json({
      success: true,
      transformedImageUrl: transformedImageUrl,
      message: 'Image transformed successfully',
    });
  } catch (error) {
    console.error('Transform error:', error);
    res.status(500).json({
      error: 'Failed to transform image',
      message: error.message,
    });
  }
};

const healthCheck = (req, res) => {
  res.json({
    status: 'OK',
    message: 'Transform API is running',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  transformImage,
  healthCheck,
};
