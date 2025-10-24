'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { HomeNavbar } from '@/features/home/components/home-navbar.component';

const reportTypes = [
  {
    id: 'model-720',
    title: 'Modelo 720',
    description: 'Declaración de bienes y derechos en el extranjero',
    status: 'No Generado',
  },
  {
    id: 'model-100',
    title: 'Modelo 100',
    description: 'Impuesto sobre la Renta de las Personas Físicas (IRPF) - Ganancias y pérdidas de capital',
    status: 'No Generado',
  },
  {
    id: 'model-714',
    title: 'Modelo 714',
    description: 'Impuesto sobre el Patrimonio',
    status: 'No Generado',
  },
];

export const ReportsContainer = () => {
  const { address } = useAuth();

  return (
    <>
      <HomeNavbar />
      <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Informes Fiscales</h1>
          <p className="text-muted-foreground mt-2">
            Genera declaraciones fiscales de criptomonedas para las autoridades españolas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cartera Conectada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono break-all">{address}</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Informes Disponibles</h2>
          {reportTypes.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{report.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.description}
                    </p>
                  </div>
                  <Badge variant="secondary">{report.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button disabled>Generar Informe</Button>
                <Button variant="outline" disabled>
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};
