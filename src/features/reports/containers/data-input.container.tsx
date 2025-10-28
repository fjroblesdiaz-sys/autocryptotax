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
import { reportDataStorage } from '@/features/reports/utils/report-data-storage';
import { useEffect, useState } from 'react';

interface DataInputContainerProps {
  sourceParam: string | null;
}

/**
 * Data Input Container
 * Handles data collection for all data source types
 */
export const DataInputContainer = ({ sourceParam }: DataInputContainerProps) => {
  const router = useRouter();
  const { address } = useAuth();
  
  const [source, setSource] = useState<DataSourceType | null>(null);

  useEffect(() => {
    // Validate source and ensure it matches sessionStorage
    const storedSource = reportDataStorage.getField('dataSource');
    
    if (!sourceParam) {
      // No source specified, redirect back to source selection
      router.push('/reports');
      return;
    }
    
    const sourceType = sourceParam as DataSourceType;
    
    if (storedSource && storedSource !== sourceType) {
      // Mismatch between URL and storage, clear and redirect
      reportDataStorage.clear();
      router.push('/reports');
      return;
    }
    
    // Save source if not already saved
    if (!storedSource) {
      reportDataStorage.save({ dataSource: sourceType });
    }
    
    setSource(sourceType);
  }, [sourceParam, router]);

  const handleSubmit = (
    data: WalletData | CSVUploadData | APIKeyData | OAuthData | ManualEntryTransaction[]
  ) => {
    // Save collected data to session storage
    reportDataStorage.save({ sourceData: data });
    
    // Navigate to report configuration page
    router.push('/reports/configure');
  };

  const handleBack = () => {
    // Clear collected data and go back to source selection
    reportDataStorage.clear();
    router.push('/reports');
  };

  if (!source) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recopilar Datos</h1>
          <p className="text-muted-foreground mt-2">
            Proporciona la información necesaria para generar tu informe
          </p>
        </div>

        {/* Dynamic Content Based on Source */}
        {source === 'wallet' && address && (
          <WalletDataComponent
            address={address}
            onSubmit={(data: WalletData) => handleSubmit(data)}
            onBack={handleBack}
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

