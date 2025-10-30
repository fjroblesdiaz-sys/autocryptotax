/**
 * API Route: Single Report Request
 * GET /api/report-requests/[id] - Get a specific report request
 * PATCH /api/report-requests/[id] - Update a report request
 * DELETE /api/report-requests/[id] - Delete a report request
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Validation schema for updating a report request
const UpdateReportRequestSchema = z.object({
  dataSource: z.enum(['wallet', 'csv', 'manual', 'api-key', 'oauth']).optional(),
  sourceData: z.any().optional(),
  reportType: z.enum(['model-100', 'model-720', 'model-714']).optional(),
  fiscalYear: z.number().int().min(2009).max(new Date().getFullYear()).optional(),
  taxpayerNif: z.string().optional(),
  taxpayerName: z.string().optional(),
  taxpayerSurname: z.string().optional(),
  status: z.enum(['draft', 'processing', 'completed', 'error']).optional(),
  errorMessage: z.string().optional(),
  generatedReport: z.any().optional(),
  cloudinaryPublicId: z.string().optional(),
  cloudinaryUrl: z.string().optional(),
  fileFormat: z.string().optional(),
  totalTransactions: z.number().optional(),
  totalGains: z.number().optional(),
  totalLosses: z.number().optional(),
  netResult: z.number().optional(),
});

/**
 * GET - Retrieve a specific report request by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reportRequest = await prisma.reportRequest.findUnique({
      where: { id },
    });

    if (!reportRequest) {
      return NextResponse.json({
        error: 'Report request not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      reportRequest,
    }, { status: 200 });

  } catch (error) {
    console.error('[API] Error fetching report request:', error);

    return NextResponse.json({
      error: 'Failed to fetch report request',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * PATCH - Update a report request
 * Used to save progress as user fills out forms
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateReportRequestSchema.parse(body);

    // Check if report request exists
    const existingRequest = await prisma.reportRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({
        error: 'Report request not found',
      }, { status: 404 });
    }

    // Update the report request
    const reportRequest = await prisma.reportRequest.update({
      where: { id },
      data: validated,
    });

    console.log(`[API] Updated report request: ${id}`);

    return NextResponse.json({
      success: true,
      reportRequest,
    }, { status: 200 });

  } catch (error) {
    console.error('[API] Error updating report request:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to update report request',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * DELETE - Delete a report request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if report request exists
    const existingRequest = await prisma.reportRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({
        error: 'Report request not found',
      }, { status: 404 });
    }

    // TODO: Also delete from Cloudinary if file exists
    // if (existingRequest.cloudinaryPublicId) {
    //   await deleteReportFromCloudinary(existingRequest.cloudinaryPublicId);
    // }

    // Delete the report request
    await prisma.reportRequest.delete({
      where: { id },
    });

    console.log(`[API] Deleted report request: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Report request deleted successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('[API] Error deleting report request:', error);

    return NextResponse.json({
      error: 'Failed to delete report request',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

