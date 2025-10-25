'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, AlertCircle, Calculator, Award } from 'lucide-react';

export const StakingInfo = () => {
  return (
    <section className="mx-auto px-4 py-12 bg-muted/30 w-full">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Información de Staking</h2>
          <p className="text-muted-foreground">
            Todo lo que necesitas saber sobre el staking de ACT
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Cómo Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Elige un Pool</h4>
                <p className="text-sm text-muted-foreground">
                  Selecciona el pool que mejor se adapte a tu estrategia: flexible o con período de bloqueo.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">2. Stake tus Tokens</h4>
                <p className="text-sm text-muted-foreground">
                  Deposita tus tokens ACT en el pool seleccionado. Puedes activar el auto-compound para maximizar ganancias.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">3. Gana Recompensas</h4>
                <p className="text-sm text-muted-foreground">
                  Las recompensas se acumulan diariamente. Puedes reclamarlas en cualquier momento o dejar que se reinviertan automáticamente.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Beneficios del Staking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold">Ingresos Pasivos</p>
                    <p className="text-sm text-muted-foreground">
                      Gana recompensas automáticamente mientras mantienes tus tokens
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold">Apoyo al Ecosistema</p>
                    <p className="text-sm text-muted-foreground">
                      Contribuyes a la seguridad y estabilidad de la plataforma
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-semibold">Beneficios Adicionales</p>
                    <p className="text-sm text-muted-foreground">
                      Acceso a funciones premium y descuentos en servicios
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Qué es el staking?</AccordionTrigger>
                <AccordionContent>
                  El staking es el proceso de bloquear tus tokens ACT en un contrato inteligente 
                  para ayudar a asegurar la red y ganar recompensas. Es similar a depositar dinero 
                  en una cuenta de ahorros que genera intereses, pero con criptomonedas.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>¿Cuándo puedo retirar mis tokens?</AccordionTrigger>
                <AccordionContent>
                  Depende del pool que elijas. El pool flexible te permite retirar en cualquier 
                  momento sin penalización. Los pools con período de bloqueo (30, 90, 180 días) 
                  requieren que esperes hasta que finalice el período para retirar tus tokens sin 
                  penalización. A cambio, ofrecen APY más altos.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>¿Cómo se calculan las recompensas?</AccordionTrigger>
                <AccordionContent>
                  Las recompensas se calculan en base al APY (Annual Percentage Yield) del pool. 
                  Por ejemplo, si stakeas 1,000 ACT en un pool con 25% APY durante 30 días, 
                  ganarías aproximadamente: 1,000 × 0.25 ÷ 365 × 30 = 20.55 ACT. Las recompensas 
                  se acumulan diariamente y puedes reclamarlas en cualquier momento.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>¿Qué es el auto-compound?</AccordionTrigger>
                <AccordionContent>
                  El auto-compound reinvierte automáticamente tus recompensas en el mismo pool de 
                  staking. Esto te permite aprovechar el interés compuesto, maximizando tus 
                  ganancias a largo plazo. Por ejemplo, si ganas 10 ACT de recompensas, esos 10 ACT 
                  también comenzarán a generar recompensas automáticamente.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>¿Es seguro el staking?</AccordionTrigger>
                <AccordionContent>
                  Sí, nuestros contratos de staking han sido auditados por empresas de seguridad 
                  reconocidas en la industria. Además, utilizamos las mejores prácticas de seguridad 
                  y los contratos son de código abierto, lo que permite a la comunidad verificar su 
                  seguridad. Sin embargo, como con cualquier inversión en criptomonedas, siempre 
                  existe un riesgo inherente.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>¿Hay penalizaciones por retiro anticipado?</AccordionTrigger>
                <AccordionContent>
                  Para el pool flexible, no hay penalizaciones. Para los pools con período de 
                  bloqueo, si intentas retirar antes de que finalice el período, perderás una 
                  porción de tus recompensas acumuladas (generalmente entre 10-25% dependiendo del 
                  pool). Tu capital inicial siempre está protegido.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>¿Puedo stakear en múltiples pools?</AccordionTrigger>
                <AccordionContent>
                  Sí, puedes stakear en tantos pools como desees simultáneamente. Muchos usuarios 
                  diversifican su staking entre diferentes pools para equilibrar riesgo y 
                  rendimiento. Por ejemplo, podrías poner parte de tus tokens en el pool flexible 
                  para liquidez y otra parte en un pool de 90 días para mayor APY.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger>¿Los impuestos aplican a las recompensas de staking?</AccordionTrigger>
                <AccordionContent>
                  Sí, en España las recompensas de staking generalmente se consideran ganancias de 
                  capital y deben declararse en tu declaración de impuestos (Modelo 100). Auto 
                  Crypto Tax te ayuda a rastrear automáticamente todas tus recompensas de staking y 
                  generar los informes necesarios para Hacienda.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Security & Risks */}
        <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Shield className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Seguridad y Auditorías
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Nuestros contratos de staking han sido auditados por CertiK y Hacken, dos de las 
                  empresas de auditoría de seguridad más respetadas en el espacio blockchain. 
                  Todos nuestros contratos son de código abierto y pueden ser verificados en GitHub.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Warning */}
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  Aviso de Riesgo
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  El staking de criptomonedas conlleva riesgos. El valor de los tokens puede 
                  fluctuar, y aunque los contratos están auditados, siempre existe un riesgo de 
                  vulnerabilidades. Solo stakea lo que puedas permitirte perder y considera 
                  diversificar tus inversiones. Este no es un consejo financiero.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
