/**
 * API Route: Report Generation Progress (SSE)
 * GET /api/reports/progress/[id]
 * 
 * Server-Sent Events endpoint for real-time report generation progress
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      console.log(`[SSE] Starting progress stream for report: ${id}`);
      
      // Poll the database for status updates
      const pollInterval = setInterval(async () => {
        try {
          const reportRequest = await prisma.reportRequest.findUnique({
            where: { id },
            select: {
              id: true,
              status: true,
              progress: true,
              progressMessage: true,
              errorMessage: true,
              totalTransactions: true,
              cloudinaryUrl: true,
            },
          });

          if (!reportRequest) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Report request not found' })}\n\n`)
            );
            clearInterval(pollInterval);
            controller.close();
            return;
          }

          // Send progress update with real-time data from database
          const progressData = {
            type: 'progress',
            status: reportRequest.status,
            progress: reportRequest.progress || getProgressPercentage(reportRequest.status),
            message: reportRequest.progressMessage || getProgressMessage(reportRequest.status),
            totalTransactions: reportRequest.totalTransactions,
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`)
          );

          // If completed or error, close the stream
          if (reportRequest.status === 'completed') {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'complete', 
                cloudinaryUrl: reportRequest.cloudinaryUrl,
                totalTransactions: reportRequest.totalTransactions,
              })}\n\n`)
            );
            clearInterval(pollInterval);
            controller.close();
          } else if (reportRequest.status === 'error') {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                message: reportRequest.errorMessage || 'Unknown error occurred' 
              })}\n\n`)
            );
            clearInterval(pollInterval);
            controller.close();
          }
        } catch (error) {
          console.error('[SSE] Error polling database:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: 'Failed to check report status' 
            })}\n\n`)
          );
          clearInterval(pollInterval);
          controller.close();
        }
      }, 1000); // Poll every second

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected from progress stream: ${id}`);
        clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Get progress percentage based on status
 */
function getProgressPercentage(status: string): number {
  switch (status) {
    case 'draft':
      return 0;
    case 'processing':
      return 50; // Approximate middle
    case 'completed':
      return 100;
    case 'error':
      return 0;
    default:
      return 0;
  }
}

/**
 * Get user-friendly progress message
 */
function getProgressMessage(status: string): string {
  switch (status) {
    case 'draft':
      return 'Preparando...';
    case 'processing':
      return 'Generando informe...';
    case 'completed':
      return '¡Completado!';
    case 'error':
      return 'Error';
    default:
      return 'Procesando...';
  }
}

