/**
 * API Route: Download Report from Cloudinary
 * GET /api/reports/download/[id]
 * 
 * Downloads a generated report from Cloudinary by report request ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET - Download a report by report request ID
 * Redirects to Cloudinary URL or streams the file
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

    // Check if Cloudinary URL exists
    if (!reportRequest.cloudinaryUrl) {
      return NextResponse.json({
        error: 'Report file not found',
        message: 'The report was generated but the file URL is missing.',
      }, { status: 404 });
    }

    // Redirect to Cloudinary URL for download
    // This is more efficient than streaming through the API
    return NextResponse.redirect(reportRequest.cloudinaryUrl);

  } catch (error) {
    console.error('[API] Error downloading report:', error);

    return NextResponse.json({
      error: 'Failed to download report',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

