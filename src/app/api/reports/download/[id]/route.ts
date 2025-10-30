/**
 * API Route: Download Report from Cloudinary
 * GET /api/reports/download/[id]
 * 
 * Downloads a generated report from Cloudinary by report request ID
 * Proxies the file to avoid CORS issues and force download
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloudinaryDownloadUrl } from '@/lib/cloudinary';

/**
 * GET - Download a report by report request ID
 * Fetches from Cloudinary and streams to client with download headers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the report request from database
    const reportRequest = await prisma.reportRequest.findUnique({
      where: { id },
    });

    if (!reportRequest) {
      return NextResponse.json({
        error: 'Report request not found',
      }, { status: 404 });
    }

    // Check if report is completed
    if (reportRequest.status !== 'completed') {
      return NextResponse.json({
        error: 'Report not ready',
        status: reportRequest.status,
        message: reportRequest.status === 'processing' 
          ? 'Report is still being generated. Please try again in a moment.'
          : reportRequest.status === 'error'
          ? `Report generation failed: ${reportRequest.errorMessage}`
          : 'Report is not yet generated.',
      }, { status: 400 });
    }

    // Check if Cloudinary public ID exists
    if (!reportRequest.cloudinaryPublicId) {
      return NextResponse.json({
        error: 'Report file not found',
        message: 'The report was generated but the Cloudinary ID is missing.',
      }, { status: 404 });
    }

    // For authenticated files, we must generate a fresh signed URL each time
    // Stored URLs may expire, so always generate from public_id
    let downloadUrl: string;
    
    if (reportRequest.cloudinaryPublicId) {
      // Generate fresh signed URL with current timestamp
      try {
        downloadUrl = getCloudinaryDownloadUrl(reportRequest.cloudinaryPublicId, 'raw');
        console.log('[API] Generated fresh authenticated signed URL:', downloadUrl);
      } catch (error) {
        console.error('[API] Failed to generate Cloudinary URL:', error);
        // Fallback to stored URL (may not work if expired)
        if (reportRequest.cloudinaryUrl) {
          downloadUrl = reportRequest.cloudinaryUrl;
          console.warn('[API] Fallback to stored URL (may be expired):', downloadUrl);
        } else {
          throw new Error('Could not get Cloudinary download URL');
        }
      }
    } else {
      throw new Error('No Cloudinary public ID available');
    }

    // Fetch the file from Cloudinary
    console.log('[API] Fetching from Cloudinary URL:', downloadUrl);
    
    const cloudinaryResponse = await fetch(downloadUrl);
    
    console.log('[API] Cloudinary response status:', cloudinaryResponse.status);
    console.log('[API] Cloudinary response headers:', Object.fromEntries(cloudinaryResponse.headers.entries()));
    
    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error('[API] Cloudinary error response:', errorText);
      throw new Error(`Failed to fetch file from Cloudinary (${cloudinaryResponse.status}): ${errorText}`);
    }

    // Get the file buffer
    const fileBuffer = await cloudinaryResponse.arrayBuffer();
    console.log('[API] Downloaded file size:', fileBuffer.byteLength, 'bytes');
    
    // Determine content type based on file format
    const contentType = getContentType(reportRequest.fileFormat || 'pdf');
    
    // Generate filename
    const extension = reportRequest.fileFormat || 'pdf';
    const filename = `informe-${reportRequest.reportType}-${reportRequest.fiscalYear}.${extension}`;

    // Return the file with download headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('[API] Error downloading report:', error);

    return NextResponse.json({
      error: 'Failed to download report',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Helper function to get content type based on file format
 */
function getContentType(format: string): string {
  switch (format.toLowerCase()) {
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

