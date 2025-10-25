'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AirdropRequirement } from '../types/airdrop.types';
import { 
  Wallet, 
  ArrowLeftRight, 
  FileText, 
  Users, 
  CheckCircle2, 
  Circle,
  TrendingUp
} from 'lucide-react';

interface AirdropRequirementsProps {
  requirements: AirdropRequirement[];
  totalPoints: number;
  onConnect?: () => void;
}

const getRequirementIcon = (type: AirdropRequirement['type']) => {
  switch (type) {
    case 'wallet_connect':
      return Wallet;
    case 'exchange_connect':
      return ArrowLeftRight;
    case 'transaction_import':
      return TrendingUp;
    case 'report_generate':
      return FileText;
    case 'referral':
      return Users;
    default:
      return Circle;
  }
};

const getRequirementAction = (type: AirdropRequirement['type']) => {
  switch (type) {
    case 'wallet_connect':
      return 'Conectar Cartera';
    case 'exchange_connect':
      return 'Conectar Exchange';
    case 'transaction_import':
      return 'Importar Transacciones';
    case 'report_generate':
      return 'Generar Informe';
    case 'referral':
      return 'Invitar Amigos';
    default:
      return 'Completar';
  }
};

export const AirdropRequirements = ({ 
  requirements, 
  totalPoints,
  onConnect 
}: AirdropRequirementsProps) => {
  const maxPoints = requirements.reduce((sum, req) => sum + req.points, 0);
  const progress = (totalPoints / maxPoints) * 100;
  const completedCount = requirements.filter(req => req.completed).length;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Overview */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Tu Progreso</CardTitle>
                <CardDescription>
                  Completa tareas para ganar más tokens ACT
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {totalPoints} / {maxPoints} puntos
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {completedCount} de {requirements.length} tareas completadas
                </span>
                <span className="font-semibold">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Cada tarea completada aumenta tu recompensa de tokens</span>
            </div>
          </CardContent>
        </Card>

        {/* Requirements List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Tareas del Airdrop</h2>
          <div className="grid gap-4">
            {requirements.map((requirement) => {
              const Icon = getRequirementIcon(requirement.type);
              const action = getRequirementAction(requirement.type);

              return (
                <Card 
                  key={requirement.id}
                  className={`transition-all ${
                    requirement.completed 
                      ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        requirement.completed 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-primary/10'
                      }`}>
                        {requirement.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Icon className="w-6 h-6 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {requirement.description}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {requirement.completed 
                                ? '✓ Tarea completada' 
                                : `Gana ${requirement.points} puntos`
                              }
                            </p>
                          </div>
                          <Badge 
                            variant={requirement.completed ? 'default' : 'secondary'}
                            className="shrink-0"
                          >
                            {requirement.points} pts
                          </Badge>
                        </div>

                        {!requirement.completed && (
                          <Button 
                            size="sm" 
                            onClick={onConnect}
                            className="mt-2"
                          >
                            {action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Reward Estimation */}
        <Card className="bg-linear-to-br from-primary/5 to-accent/5 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Tu Recompensa Estimada
            </CardTitle>
            <CardDescription>
              Basado en tu progreso actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">
                  {((totalPoints / maxPoints) * 1000).toFixed(0)} ACT
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Completa todas las tareas para ganar 1,000 ACT
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor estimado</p>
                <p className="text-2xl font-semibold">
                  ${((totalPoints / maxPoints) * 1000 * 0.5).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

function Gift(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}
