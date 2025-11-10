import { Metadata } from 'next';
import { SettingsContainer } from '@/features/settings/containers/settings.container';

export const metadata: Metadata = {
  title: 'Configuración | Auto Crypto Tax',
  description: 'Personaliza tu experiencia en Auto Crypto Tax',
};

export default function SettingsPage() {
  // TODO: Get user settings from session/database
  const initialSettings = {
    language: 'es',
    currency: 'EUR',
    emailNotifications: true,
    reportNotifications: true,
    marketingEmails: false,
    theme: 'system',
  };

  return <SettingsContainer initialSettings={initialSettings} />;
}

