/**
 * API Route: Report Requests
 * POST /api/report-requests - Create a new report request
 * GET /api/report-requests - Get all report requests (optional: for user dashboard)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Validation schema for creating a report request
const CreateReportRequestSchema = z.object({
  // Optional initial data
  dataSource: z.enum(['wallet', 'csv', 'manual', 'api-key', 'oauth']).optional(),
  sourceData: z.any().optional(),
  reportType: z.enum(['model-100', 'model-720', 'model-714']).optional(),
  fiscalYear: z.number().int().min(2009).max(new Date().getFullYear()).optional(),
  taxpayerNif: z.string().optional(),
  taxpayerName: z.string().optional(),
  taxpayerSurname: z.string().optional(),
});

/**
 * POST - Create a new report request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateReportRequestSchema.parse(body);

    // Create a new report request in the database
    const reportRequest = await prisma.reportRequest.create({
      data: {
        dataSource: validated.dataSource,
        sourceData: validated.sourceData,
        reportType: validated.reportType,
        fiscalYear: validated.fiscalYear,
        taxpayerNif: validated.taxpayerNif,
        taxpayerName: validated.taxpayerName,
        taxpayerSurname: validated.taxpayerSurname,
        status: 'draft',
      },
    });

    console.log(`[API] Created new report request: ${reportRequest.id}`);

    return NextResponse.json({
      success: true,
      reportRequest,
    }, { status: 201 });

  } catch (error) {
    console.error('[API] Error creating report request:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to create report request',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET - Retrieve all report requests
 * Optional: Can be used for user dashboard to show report history
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication and filter by user ID
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const reportRequests = await prisma.reportRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      reportRequests,
      count: reportRequests.length,
    }, { status: 200 });

  } catch (error) {
    console.error('[API] Error fetching report requests:', error);

    return NextResponse.json({
      error: 'Failed to fetch report requests',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

