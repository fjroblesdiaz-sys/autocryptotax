import { Metadata } from 'next';
import { ProfileContainer } from '@/features/profile/containers/profile.container';

export const metadata: Metadata = {
  title: 'Perfil | Auto Crypto Tax',
  description: 'Gestiona tu información personal',
};

export default function ProfilePage() {
  // TODO: Get user data from session/auth
  const userData = {
    name: 'Miguel García',
    email: 'miguel@example.com',
    phone: '+34 600 000 000',
    nif: '12345678A',
    address: 'Calle Mayor 123, 4º B',
    city: 'Madrid',
    postalCode: '28013',
  };

  return <ProfileContainer userData={userData} />;
}

