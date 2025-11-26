import { v2 as cloudinary } from 'cloudinary';

// Konfiguracja Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload obrazu do Cloudinary
 * @param {Buffer|string} file - Plik do uploadowania (base64 string lub buffer)
 * @param {Object} options - Opcje uploadu
 * @param {string} options.folder - Folder w Cloudinary (opcjonalne)
 * @param {string} options.public_id - Public ID (opcjonalne)
 * @param {string} options.resource_type - Typ zasobu ('image', 'video', 'auto') - domyślnie 'image'
 * @param {Array} options.transformation - Transformacje obrazu (opcjonalne)
 * @returns {Promise<Object>} - URL obrazu i metadane
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

    // Jeśli file jest string (base64), użyj upload z base64
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
      // Jeśli file jest Buffer, użyj upload_stream
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
      // Dla innych typów, spróbuj przekonwertować na base64
      throw new Error('Nieobsługiwany typ pliku. Oczekiwano string (base64) lub Buffer.');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Usuń obraz z Cloudinary
 * @param {string} public_id - Public ID obrazu do usunięcia
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
 * Konwertuj plik na base64 string
 * @param {File} file - Plik do konwersji
 * @returns {Promise<string>} - Base64 string z prefixem data:image/...
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

