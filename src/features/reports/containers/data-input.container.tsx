'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { WalletDataComponent } from '@/features/reports/components/wallet-data.component';
import { CSVUpload } from '@/features/reports/components/csv-upload.component';
import { APIKeyConfig } from '@/features/reports/components/api-key-config.component';
import { OAuthAuthorization } from '@/features/reports/components/oauth-authorization.component';
import { ManualEntry } from '@/features/reports/components/manual-entry.component';
import {
  WalletData,
  CSVUploadData,
  APIKeyData,
  OAuthData,
  ManualEntryTransaction,
  DataSourceType,
} from '@/features/reports/types/reports.types';
import { useReportRequest } from '@/features/reports/hooks/use-report-request.hook';
import { useEffect, useState } from 'react';

interface DataInputContainerProps {
  sourceParam: string | null;
  reportRequestIdParam: string | null;
}

/**
 * Data Input Container
 * Handles data collection for all data source types and updates report request
 */
export const DataInputContainer = ({ sourceParam, reportRequestIdParam }: DataInputContainerProps) => {
  const router = useRouter();
  const { address } = useAuth();
  const { reportRequest, update, isLoading, error } = useReportRequest(reportRequestIdParam || undefined);
  
  const [source, setSource] = useState<DataSourceType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!sourceParam || !reportRequestIdParam) {
      // No source or report request ID specified, redirect back to source selection
      console.log('[DataInput] Missing params, redirecting to /reports');
      router.push('/reports');
      return;
    }
    
    const sourceType = sourceParam as DataSourceType;
    console.log('[DataInput] Using data source:', sourceType);
    console.log('[DataInput] Report request ID:', reportRequestIdParam);
    
    setSource(sourceType);
  }, [sourceParam, reportRequestIdParam, router]);

  const handleSubmit = async (
    data: WalletData | CSVUploadData | APIKeyData | OAuthData | ManualEntryTransaction[]
  ) => {
    console.log('[DataInput] Submitting data:', data);
    
    setIsSubmitting(true);
    try {
      // Update report request with source data
      await update({
        sourceData: data,
      });
      
      // Navigate to report configuration page
      router.push(`/reports/configure?reportRequestId=${reportRequestIdParam}`);
    } catch (error) {
      console.error('[DataInput] Failed to update report request:', error);
      alert('Failed to save data. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // Go back to source selection (this will create a new report request)
    router.push('/reports');
  };

  if (!source) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recopilar Datos</h1>
        <p className="text-muted-foreground mt-2">
          Proporciona la información necesaria para generar tu informe
        </p>
      </div>

      <div className="space-y-6">
        {source === 'wallet' && address && (
          <WalletDataComponent
            address={address}
            onSubmit={(data: WalletData) => handleSubmit(data)}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}

        {source === 'csv' && (
          <CSVUpload
            onSubmit={(data: CSVUploadData) => handleSubmit(data)}
            onBack={handleBack}
          />
        )}

        {source === 'api-key' && (
          <APIKeyConfig
            onSubmit={(data: APIKeyData) => handleSubmit(data)}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}

        {source === 'oauth' && (
          <OAuthAuthorization
            onSubmit={(data: OAuthData) => handleSubmit(data)}
            onBack={handleBack}
          />
        )}

        {source === 'manual' && (
          <ManualEntry
            onSubmit={(data: ManualEntryTransaction[]) => handleSubmit(data)}
            onBack={handleBack}
          />
        )}

        {source === 'wallet' && !address && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Debes conectar tu wallet para continuar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

