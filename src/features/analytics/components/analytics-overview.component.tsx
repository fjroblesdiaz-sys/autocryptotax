'use client';

/**
 * Analytics Overview Component
 * Displays key metrics and charts for crypto portfolio analysis
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, FileText, DollarSign, PieChart } from 'lucide-react';

export function AnalyticsOverview() {
  // Mock data
  const metrics = [
    {
      title: 'Valor Total Portfolio',
      value: '€24,580.50',
      change: '+12.5%',
      isPositive: true,
      icon: Wallet,
    },
    {
      title: 'Ganancias/Pérdidas',
      value: '€3,240.80',
      change: '+8.2%',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: 'Transacciones',
      value: '847',
      change: 'Este año',
      isPositive: null,
      icon: FileText,
    },
    {
      title: 'Impuestos Estimados',
      value: '€1,620.40',
      change: 'Modelo 100',
      isPositive: null,
      icon: DollarSign,
    },
  ];

  const portfolioBreakdown = [
    { asset: 'Bitcoin (BTC)', percentage: 45, value: '€11,061.23' },
    { asset: 'Ethereum (ETH)', percentage: 30, value: '€7,374.15' },
    { asset: 'USDT', percentage: 15, value: '€3,687.08' },
    { asset: 'Otros', percentage: 10, value: '€2,458.05' },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${
                  metric.isPositive === true 
                    ? 'text-green-600' 
                    : metric.isPositive === false 
                    ? 'text-red-600' 
                    : 'text-muted-foreground'
                }`}>
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Portfolio Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            <CardTitle>Distribución del Portfolio</CardTitle>
          </div>
          <CardDescription>
            Composición actual de tus activos cripto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioBreakdown.map((item) => (
              <div key={item.asset} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.asset}</span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas transacciones de tu portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: '10/11/2025', type: 'Compra', asset: 'BTC', amount: '€500.00', status: 'completed' },
              { date: '08/11/2025', type: 'Venta', asset: 'ETH', amount: '€1,200.00', status: 'completed' },
              { date: '05/11/2025', type: 'Compra', asset: 'USDT', amount: '€800.00', status: 'completed' },
            ].map((tx, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{tx.type} - {tx.asset}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{tx.amount}</p>
                  <p className="text-xs text-green-600">Completado</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

