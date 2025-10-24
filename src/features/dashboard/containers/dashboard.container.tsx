'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { HomeNavbar } from '@/features/home/components/home-navbar.component';

export const DashboardContainer = () => {
  const { address } = useAuth();

  return (
    <>
      <HomeNavbar />
      <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenido a tu panel de control de impuestos de criptomonedas
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Cartera Conectada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-mono break-all">{address}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Aún no hay transacciones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informes Generados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Aún no hay informes</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comenzar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Paso 1: Conecta tus Carteras</h3>
              <p className="text-sm text-muted-foreground">
                Conecta carteras adicionales de criptomonedas para importar tu historial de transacciones
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Paso 2: Revisa las Transacciones</h3>
              <p className="text-sm text-muted-foreground">
                Verifica tus transacciones importadas y realiza los ajustes necesarios
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Paso 3: Genera Informes</h3>
              <p className="text-sm text-muted-foreground">
                Crea informes fiscales listos para presentar a Hacienda (Modelos 720, 100, 714)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
