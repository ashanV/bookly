import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {Buffer|string} file - File to upload (base64 string or buffer)
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder in Cloudinary (optional)
 * @param {string} options.public_id - Public ID (optional)
 * @param {string} options.resource_type - Resource type ('image', 'video', 'auto') - default 'image'
 * @param {Array} options.transformation - Image transformations (optional)
 * @returns {Promise<Object>} - Image URL and metadata
 */
export async function uploadToCloudinary(file, options = {}) {
  try {
    const {
      folder = 'bookly',
      public_id,
      resource_type = 'image',
      transformation = []
    } = options;

    const uploadOptions = {
      folder,
      resource_type,
      overwrite: false,
      invalidate: true,
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    if (transformation.length > 0) {
      uploadOptions.transformation = transformation;
    }

    // If file is a string (base64), use upload with base64
    if (typeof file === 'string') {
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      };
    } else if (Buffer.isBuffer(file)) {
      // If file is a Buffer, use upload_stream
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes
            });
          }
        );
        uploadStream.end(file);
      });
    } else {
      // For other types, try to convert to base64
      throw new Error('Unsupported file type. Expected string (base64) or Buffer.');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} public_id - Public ID of the image to delete
 * @returns {Promise<Object>}
 */
export async function deleteFromCloudinary(public_id) {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

/**
 * Convert file to base64 string
 * @param {File} file - File to convert
 * @returns {Promise<string>} - Base64 string with data:image/... prefix
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export { cloudinary };

