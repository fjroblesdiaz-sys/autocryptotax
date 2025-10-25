'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, Shield, Calendar, Trophy } from 'lucide-react';

export const AirdropInfo = () => {
  return (
    <section className=" mx-auto px-4 py-12 bg-muted/30 w-full">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Información del Airdrop</h2>
          <p className="text-muted-foreground">
            Todo lo que necesitas saber sobre el ACT Genesis Airdrop
          </p>
        </div>

        {/* Key Information Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inicio:</span>
                <span className="font-semibold">20 Octubre 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finalización:</span>
                <span className="font-semibold">31 Diciembre 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distribución:</span>
                <span className="font-semibold">Enero 2026</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Recompensas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pool Total:</span>
                <span className="font-semibold">1,000,000 ACT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Por Usuario:</span>
                <span className="font-semibold">Hasta 1,000 ACT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Estimado:</span>
                <span className="font-semibold">~$500 USD</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Qué es el token ACT?</AccordionTrigger>
                <AccordionContent>
                  ACT (Auto Crypto Tax) es el token de utilidad de nuestra plataforma. Los holders 
                  de ACT tendrán acceso a funciones premium, descuentos en servicios, y participación 
                  en la gobernanza de la plataforma. El token será lanzado en la red Ethereum y estará 
                  disponible en exchanges descentralizados.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>¿Cuándo recibiré mis tokens?</AccordionTrigger>
                <AccordionContent>
                  Los tokens ACT serán distribuidos en enero de 2026, después de que finalice el 
                  período del airdrop el 31 de diciembre de 2025. Todos los participantes elegibles 
                  recibirán sus tokens directamente en la cartera que conectaron durante el airdrop.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>¿Hay límites geográficos?</AccordionTrigger>
                <AccordionContent>
                  El airdrop está abierto a usuarios de todo el mundo, con especial enfoque en la 
                  comunidad española. Sin embargo, usuarios de países con restricciones regulatorias 
                  específicas pueden no ser elegibles. Consulta los términos y condiciones completos 
                  para más detalles.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>¿Necesito completar todas las tareas?</AccordionTrigger>
                <AccordionContent>
                  No es obligatorio completar todas las tareas, pero cuantas más completes, mayor 
                  será tu recompensa. Cada tarea otorga puntos que se traducen en tokens ACT. 
                  La recompensa máxima de 1,000 ACT se obtiene completando todas las tareas disponibles.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>¿Es seguro conectar mi cartera?</AccordionTrigger>
                <AccordionContent>
                  Sí, es completamente seguro. Nunca pedimos tus claves privadas ni tenemos acceso 
                  a tus fondos. Solo utilizamos tu dirección de cartera pública para verificar tu 
                  participación y enviar los tokens del airdrop. Utilizamos protocolos estándar de 
                  la industria como WalletConnect y thirdweb para garantizar la seguridad.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>¿Puedo participar con múltiples carteras?</AccordionTrigger>
                <AccordionContent>
                  No, solo se permite una participación por persona. Utilizamos sistemas de 
                  verificación para detectar múltiples cuentas. Los intentos de fraude resultarán 
                  en la descalificación del airdrop.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  Aviso Importante
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Este airdrop es completamente gratuito. Nunca te pediremos que envíes criptomonedas 
                  o compartas tus claves privadas. Ten cuidado con los estafadores que se hacen pasar 
                  por Auto Crypto Tax. Verifica siempre que estás en el sitio web oficial.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Seguridad y Privacidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                <div>
                  <p className="font-semibold">Sin claves privadas</p>
                  <p className="text-sm text-muted-foreground">
                    Solo necesitamos tu dirección de cartera pública
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                <div>
                  <p className="font-semibold">Conexión segura</p>
                  <p className="text-sm text-muted-foreground">
                    Utilizamos WalletConnect y thirdweb para conexiones seguras
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                <div>
                  <p className="font-semibold">Datos encriptados</p>
                  <p className="text-sm text-muted-foreground">
                    Toda tu información está protegida con encriptación de extremo a extremo
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                <div>
                  <p className="font-semibold">Cumplimiento GDPR</p>
                  <p className="text-sm text-muted-foreground">
                    Cumplimos con todas las regulaciones europeas de protección de datos
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
