'use client';

/**
 * Settings Container
 * Main container for application settings
 */

import { SettingsForm } from '../components/settings-form.component';

export interface SettingsContainerProps {
  initialSettings?: {
    language: string;
    currency: string;
    emailNotifications: boolean;
    reportNotifications: boolean;
    marketingEmails: boolean;
    theme: string;
  };
}

export function SettingsContainer({ initialSettings }: SettingsContainerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza tu experiencia y preferencias
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings} />
    </div>
  );
}

