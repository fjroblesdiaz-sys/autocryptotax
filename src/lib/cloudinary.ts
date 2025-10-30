/**
 * Cloudinary Configuration and Upload Utilities
 */

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadReportOptions {
  reportId: string;
  format: 'csv' | 'pdf' | 'json';
  fiscalYear: number;
  reportType: string;
}

/**
 * Upload a report file to Cloudinary
 * @param buffer - File buffer to upload
 * @param options - Upload options including reportId, format, etc.
 * @returns Cloudinary upload response
 */
export async function uploadReportToCloudinary(
  buffer: Buffer,
  options: UploadReportOptions
): Promise<UploadApiResponse> {
  const { reportId, format, fiscalYear, reportType } = options;
  
  // Determine resource type based on format
  const resourceType = format === 'pdf' ? 'raw' : 'raw';
  
  // Create a public ID with folder structure
  const publicId = `${process.env.CLOUDINARY_FOLDER || 'crypto-tax-reports'}/${fiscalYear}/${reportType}/${reportId}`;
  
  // Convert buffer to base64 data URI
  const base64Data = buffer.toString('base64');
  const dataURI = `data:${getMimeType(format)};base64,${base64Data}`;

  try {
    const result = await cloudinary.uploader.upload(dataURI, {
      public_id: publicId,
      resource_type: resourceType,
      format: format,
      overwrite: true,
      invalidate: true,
      tags: [reportType, `year-${fiscalYear}`, 'tax-report'],
    });

    console.log(`[Cloudinary] Successfully uploaded report: ${publicId}`);
    return result;
  } catch (error) {
    console.error('[Cloudinary] Upload error:', error);
    throw new Error(`Failed to upload report to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a report from Cloudinary
 * @param publicId - The public ID of the file to delete
 */
export async function deleteReportFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
      invalidate: true,
    });
    console.log(`[Cloudinary] Successfully deleted report: ${publicId}`);
  } catch (error) {
    console.error('[Cloudinary] Delete error:', error);
    throw new Error(`Failed to delete report from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the MIME type for a file format
 */
function getMimeType(format: string): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'csv':
      return 'text/csv';
    case 'json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
}

export { cloudinary };

