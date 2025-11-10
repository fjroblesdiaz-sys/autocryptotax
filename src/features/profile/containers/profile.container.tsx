'use client';

/**
 * Profile Container
 * Main container for user profile management
 */

import { ProfileForm } from '../components/profile-form.component';

export interface ProfileContainerProps {
  userData?: {
    name: string;
    email: string;
    phone?: string;
    nif?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    avatar?: string;
  };
}

export function ProfileContainer({ userData }: ProfileContainerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      <ProfileForm initialData={userData} />
    </div>
  );
}

