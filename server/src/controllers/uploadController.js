import { supabase, isConfigured } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Upload image to Supabase Storage
 * POST /api/upload
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file provided', 'NO_FILE', 400);
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    if (isConfigured && supabase) {
      const { data, error } = await supabase.storage
        .from('items')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('[Upload Error]', error);
        return errorResponse(res, `Failed to upload to storage: ${error.message}`, 'STORAGE_ERROR', 500);
      }

      // Obtain public URL
      const { data: publicUrlData } = supabase.storage
        .from('items')
        .getPublicUrl(filePath);

      return successResponse(
        res,
        {
          url: publicUrlData.publicUrl,
          path: filePath,
          size: file.size,
          mimetype: file.mimetype,
        },
        201
      );
    }

    // Fallback: Convert to Base64 data URL for local prototype/testing
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    return successResponse(
      res,
      {
        url: dataUrl,
        path: filePath,
        size: file.size,
        mimetype: file.mimetype,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};
