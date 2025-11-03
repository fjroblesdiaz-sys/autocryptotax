# Auto Crypto Tax - Product Roadmap & Source of Truth

**Última actualización**: Noviembre 2025  
**Versión del producto**: 0.1.0 (MVP en desarrollo)

---

## Índice

1. [Visión General del Producto](#visión-general-del-producto)
2. [Módulos Actuales](#módulos-actuales)
3. [Módulos en Desarrollo](#módulos-en-desarrollo)
4. [Módulos Planificados](#módulos-planificados)
5. [Estados y Dependencias](#estados-y-dependencias)
6. [Changelog](#changelog)

---

## Visión General del Producto

Auto Crypto Tax es una plataforma SaaS para la automatización de declaraciones fiscales de criptomonedas en España. El producto se estructura en módulos independientes pero interconectados:

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTO CRYPTO TAX                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   Generación     │  │   Suscripciones  │                │
│  │   de Reportes    │  │   y Billing      │                │
│  │   [EN DESARROLLO]│  │   [EN DESARROLLO]│                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
  │  ┌──────────────────┐  ┌──────────────────┐                │
  │  │   Panel Admin    │  │   White Label    │                │
  │  │   [EN DESARROLLO]│  │   Templates      │                │
  │  │                  │  │   [EN DESARROLLO]│                │
  │  └──────────────────┘  └──────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Módulos Actuales (En Desarrollo)

### 📊 Módulo 1: Generación de Reportes Fiscales

**Estado**: 🟡 EN DESARROLLO (80% completado)  
**Versión**: 0.8.0  
**Release estimado**: Enero 2026

#### Descripción
Motor principal de la aplicación que permite a usuarios generar declaraciones fiscales automáticas para la Agencia Tributaria española.

#### Características Implementadas ✅

##### 1.1 Conexión de Fuentes de Datos
- **Wallet Web3** ✅
  - Integración con MetaMask
  - Integración con WalletConnect
  - Soporte para múltiples blockchains:
    - Ethereum (mainnet)
    - Binance Smart Chain
    - Polygon
  - Lectura de transacciones on-chain vía Thirdweb

- **Exchange API - Binance** ✅
  - Autenticación con API Key + Secret
  - Test de conexión antes de procesar
  - Obtención automática de:
    - Spot trades
    - Deposits/Withdrawals
    - Convert operations
  - Manejo de rate limits
  - Retry logic con exponential backoff

- **CSV Upload** ✅
  - Parser de archivos CSV
  - Validación de formato
  - Soporte para formatos múltiples (Binance, Coinbase, genérico)
  - Preview de datos antes de procesar

- **Manual Entry** ✅
  - Formulario de entrada individual de transacciones
  - Validación de campos
  - Cálculo automático de valores

##### 1.2 Procesamiento de Transacciones
- **Motor de Cálculo FIFO** ✅
  - Implementación del criterio First-In-First-Out
  - Tracking de lotes de compra (cost basis)
  - Matching automático de ventas con adquisiciones
  - Soporte para ventas parciales
  - Cálculo de ganancias/pérdidas por transacción

- **Normalización de Datos** ✅
  - Conversión de diferentes formatos a estructura unificada
  - Obtención de precios históricos (CoinGecko API)
  - Conversión automática a EUR
  - Deduplicación de transacciones

- **Categorización** ✅
  - Buy / Sell / Trade
  - Deposit / Withdrawal
  - Fees / Commissions

##### 1.3 Generación de Reportes
- **Modelo 100 (IRPF)** ✅
  - Cálculo de ganancias patrimoniales
  - Separación por año fiscal
  - Desglose detallado por criptomoneda
  - Resumen de operaciones
  - Formato PDF
  - Formato CSV para importar

- **Exportación** ✅
  - Generación de PDF profesional
  - CSV estructurado para importación
  - Almacenamiento de reportes
  - Descarga de reportes generados

##### 1.4 Flujo de Usuario
- **Multi-Step Wizard** ✅
  - Proceso guiado paso a paso para generar reportes
  - Selección de fuente de datos
  - Input de datos según fuente seleccionada
  - Configuración del reporte (modelo fiscal, año)
  - Generación con seguimiento de progreso
  - Descarga del reporte finalizado

- **Persistencia de Estado** ✅
  - Almacenamiento de reportes generados
  - Recovery en caso de error
  - Histórico de reportes generados
  - Seguimiento automático de progreso

#### Características en Desarrollo 🚧

##### Exchange Integrations
- **Coinbase** 🚧 (2 semanas)
  - API Key authentication
  - Obtención de trades
  - Obtención de transfers
  - Conversión de formato a estructura unificada

- **WhiteBit** 🚧 (2 semanas)
  - API Key authentication
  - Obtención de spot trades
  - Manejo de trading pairs
  - Rate limiting específico

##### Modelos Fiscales Adicionales
- **Modelo 720** 🚧 (3 semanas)
  - Declaración de bienes en el extranjero
  - Cálculo de saldos a 31 de diciembre
  - Umbral de 50.000€
  - Desglose por tipo de activo

- **Modelo 714** 🚧 (2 semanas)
  - Impuesto sobre el patrimonio
  - Valoración de holdings
  - Aplicación de mínimos exentos por CCAA

##### Mejoras de UX
- Testing con usuarios beta 🚧 (ongoing)
- Refinamiento de mensajes de error
- Tooltips educativos
- Tutorial interactivo first-time

---

## Módulos en Desarrollo (Para Lanzamiento Enero 2026)

### 💳 Módulo 2: Sistema de Suscripciones y Billing

**Estado**: 🔴 NO INICIADO  
**Prioridad**: ALTA  
**Release estimado**: Enero 2026  
**Duración estimada**: 4-5 semanas (Diciembre 2025 - Enero 2026)

#### Descripción
Sistema completo de gestión de suscripciones que permite monetizar la plataforma mediante planes de pago con límites configurables.

#### Objetivos del Módulo
- Permitir a usuarios registrarse y seleccionar un plan
- Procesar pagos recurrentes de forma automática
- Aplicar límites según el plan contratado
- Gestionar upgrades/downgrades
- Facturación automática

#### Características Planificadas

##### 2.1 Planes de Suscripción

| Plan | Precio | Reportes/Año | Transacciones | Exchanges | Características |
|------|--------|--------------|---------------|-----------|-----------------|
| **Free** | 0€ | 1 | 50 | 1 | Modelo 100 básico |
| **Basic** | 29€/año | 5 | 500 | 2 | Todos los modelos, email support |
| **Pro** | 79€/año | Ilimitado | Ilimitadas | Todos | Todo lo anterior + prioridad en soporte |
| **Business** | 299€/año | Ilimitado | Ilimitadas | Todos | API access, templates, multi-usuario |

##### 2.2 Gestión de Usuarios
- **Registro/Login** 🔴
  - Email + password
  - OAuth (Google, Twitter)
  - Verificación de email
  - Password recovery

- **Perfil de Usuario** 🔴
  - Datos fiscales (NIF, nombre, apellidos)
  - Datos de contacto
  - Configuración de notificaciones
  - Preferencias

- **Histórico de Reportes** 🔴
  - Lista de reportes generados
  - Re-descarga de reportes antiguos
  - Estadísticas de uso

##### 2.3 Sistema de Pagos
- **Integración con Stripe** 🔴
  - Checkout hosted
  - Webhook handling (subscription.created, payment.succeeded, etc)
  - Gestión de payment methods
  - SCA compliance (Strong Customer Authentication)

- **Billing** 🔴
  - Facturas automáticas (PDF)
  - Email de confirmación
  - Recordatorios de renovación
  - Gestión de failed payments

##### 2.4 Sistema de Límites
- **Enforcement** 🔴
  - Check de límites antes de generar reporte
  - Mensajes claros cuando se alcanza límite
  - Sugerencia de upgrade
  - Tracking de uso en tiempo real

- **Configuración** 🔴
  - Límites por plan almacenados en DB
  - Reset automático anual
  - Rollover de reportes no usados (opcional)

##### 2.5 Panel de Usuario
- **Dashboard** 🔴
  - Resumen de plan actual
  - Uso de límites (visual progress bars)
  - Próximo billing date
  - Acceso rápido a generar reporte

- **Gestión de Suscripción** 🔴
  - Upgrade/downgrade de plan
  - Cancelación (con retention flow)
  - Actualización de payment method
  - Histórico de facturas

#### Criterios de Aceptación
- [ ] Usuario puede registrarse con email
- [ ] Usuario puede seleccionar un plan
- [ ] Pago se procesa correctamente con Stripe
- [ ] Límites se aplican correctamente
- [ ] Usuario no puede generar reporte si alcanzó límite
- [ ] Usuario puede upgradear plan
- [ ] Usuario puede cancelar suscripción
- [ ] Facturas se generan automáticamente
- [ ] Webhooks de Stripe se procesan correctamente
- [ ] Dashboard muestra uso actual

#### Riesgos y Mitigaciones
- **Riesgo**: Complejidad de webhooks de Stripe
  - **Mitigación**: Testing exhaustivo, idempotency keys, logging detallado
- **Riesgo**: Sincronización entre Stripe y DB local
  - **Mitigación**: Source of truth en Stripe, reconciliación diaria
- **Riesgo**: Edge cases de billing
  - **Mitigación**: Documentación de todos los flows, QA manual

---

### 🔧 Módulo 3: Panel Administrativo

**Estado**: 🔴 NO INICIADO  
**Prioridad**: MEDIA  
**Release estimado**: Enero 2026  
**Duración estimada**: 3-4 semanas (Diciembre 2025 - Enero 2026)

#### Descripción
Dashboard administrativo para que el propietario del negocio pueda gestionar la plataforma, monitorear métricas clave y administrar usuarios.

#### Objetivos del Módulo
- Visibilidad completa de métricas de negocio
- Gestión de usuarios y suscripciones
- Monitoreo de salud del sistema
- Herramientas de soporte al cliente

#### Características Planificadas

##### 3.1 Dashboard Ejecutivo
- **Métricas en Tiempo Real** 🔴
  - Usuarios totales
  - Usuarios activos (DAU, WAU, MAU)
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)
  - Reportes generados (hoy, semana, mes)
  - Tasa de conversión (free → paid)
  - Churn rate

- **Gráficos y Visualizaciones** 🔴
  - Crecimiento de usuarios (timeline)
  - Distribución de planes
  - Ingresos por mes
  - Uso de recursos (CPU, memoria, storage)
  - Top errores

##### 3.2 Gestión de Usuarios
- **Lista de Usuarios** 🔴
  - Tabla con búsqueda y filtros
  - Información por usuario:
    - Datos personales
    - Plan actual
    - Fecha de registro
    - Último login
    - Reportes generados
    - Lifetime value (LTV)

- **Acciones sobre Usuarios** 🔴
  - Ver detalles completos
  - Editar perfil
  - Cambiar plan manualmente
  - Activar/desactivar cuenta
  - Eliminar usuario (GDPR)
  - Impersonar (para soporte)
  - Enviar email

##### 3.3 Gestión de Suscripciones
- **Overview de Suscripciones** 🔴
  - Suscripciones activas
  - Suscripciones canceladas
  - Próximas renovaciones
  - Failed payments

- **Acciones** 🔴
  - Extender suscripción
  - Aplicar descuento
  - Cancelar suscripción
  - Reactivar suscripción
  - Generar factura manual

##### 3.4 Gestión de Reportes
- **Lista de Reportes Generados** 🔴
  - Todos los reportes del sistema
  - Filtros por fecha, usuario, tipo
  - Estado de generación
  - Métricas por reporte

- **Acciones** 🔴
  - Ver detalles del reporte
  - Descargar reporte
  - Re-generar reporte
  - Eliminar reporte

##### 3.5 Logs y Monitoreo
- **Logs del Sistema** 🔴
  - Logs de aplicación
  - Logs de errores
  - Logs de API (rate limiting)
  - Logs de webhooks

- **Alertas** 🔴
  - Errores críticos (email/Slack)
  - Spike de errores
  - Failed payments acumulados
  - Uso de recursos alto

##### 3.6 Configuración del Sistema
- **Planes y Precios** 🔴
  - Editar límites de planes
  - Crear nuevo plan
  - Desactivar plan
  - Aplicar descuentos globales

- **Configuración de Integraciones** 🔴
  - API keys de servicios externos
  - Configuración de Stripe
  - Configuración de email

##### 3.7 Herramientas de Soporte
- **Tickets de Soporte** 🔴 (futuro)
  - Sistema integrado de tickets
  - Historial de conversaciones
  - Asignación de tickets
  - Estados (abierto, en progreso, cerrado)

- **Knowledge Base** 🔴 (futuro)
  - Artículos de ayuda
  - FAQs
  - Tutoriales

#### Sistema de Permisos
- Roles administrativos: Owner, Admin, Support
- Permisos granulares por funcionalidad
- Audit log de todas las acciones administrativas

#### Criterios de Aceptación
- [ ] Admin puede ver dashboard con métricas clave
- [ ] Admin puede buscar y filtrar usuarios
- [ ] Admin puede editar información de usuario
- [ ] Admin puede cambiar plan de usuario manualmente
- [ ] Admin puede ver todos los reportes generados
- [ ] Admin puede ver logs de errores
- [ ] Admin puede configurar límites de planes
- [ ] Sistema registra todas las acciones admin (audit log)

---

## Módulos en Desarrollo (Para Lanzamiento Enero 2026) - Continuación

### 🎨 Módulo 4: White Label & Templates

**Estado**: 🔴 NO INICIADO  
**Prioridad**: MEDIA  
**Release estimado**: Enero 2026  
**Duración estimada**: 10-12 semanas (Octubre-Noviembre 2025 - Enero 2026)

#### Descripción
Sistema que permite a empresas (asesorías, gestorías, contables) crear sus propias instancias white-label de Auto Crypto Tax con branding personalizado, templates propios y gestión multi-cliente.

#### Objetivos del Módulo
- Permitir multi-tenancy (múltiples "empresas" en la plataforma)
- Personalización completa de branding
- Templates de reportes personalizables
- API pública para integraciones externas
- Modelo de negocio B2B

#### Características Planificadas

##### 4.1 Sistema Multi-Tenant
- **Arquitectura de Tenants** 🔴
  - Isolación de datos por tenant
  - Subdominios personalizados (e.g., `empresa.autocryptotax.com`)
  - Configuración independiente por tenant

- **Registro de Empresas** 🔴
  - Formulario de solicitud
  - Validación manual (onboarding)
  - Configuración inicial
  - Precio y billing específico

##### 4.2 Personalización de Branding
- **Visual Identity** 🔴
  - Logo personalizado
  - Colores primarios/secundarios
  - Tipografía
  - Favicon
  - Email templates con branding

- **Contenido** 🔴
  - Nombre de la empresa
  - Información de contacto
  - Textos legales personalizados
  - Footer personalizado

##### 4.3 Templates de Reportes
- **Editor de Templates** 🔴
  - Interfaz visual para diseñar reportes
  - Drag & drop de secciones
  - Variables dinámicas (nombre, NIF, datos fiscales)
  - Preview en tiempo real

- **Componentes de Template** 🔴
  - Header con logo empresa
  - Tabla de transacciones personalizable
  - Resumen ejecutivo
  - Gráficos opcionales
  - Footer con firma digital (opcional)
  - Disclaimers legales

- **Tipos de Templates** 🔴
  - Template por modelo fiscal (100, 720, 714)
  - Template por industria (particular, empresa)
  - Template personalizado

##### 4.4 Gestión Multi-Cliente
- **Dashboard de Empresa** 🔴
  - Lista de clientes (end-users)
  - Reportes generados por cliente
  - Estadísticas de uso
  - Facturación

- **Portal del Cliente** 🔴
  - Acceso personalizado para cada cliente
  - Histórico de reportes
  - Comunicación con asesor
  - Upload de documentos

##### 4.5 API Pública
- **REST API** 🔴
  - Autenticación con API key
  - Endpoints para:
    - Crear usuario
    - Generar reporte
    - Obtener estado de reporte
    - Descargar reporte
    - Listar reportes

- **Webhooks** 🔴
  - Notificación cuando reporte está listo
  - Notificación de errores
  - Configuración de endpoint

- **Documentación** 🔴
  - OpenAPI/Swagger
  - Ejemplos de uso
  - SDKs (JavaScript, Python)

##### 4.6 Marketplace de Templates
- **Catálogo de Templates** 🔴
  - Templates pre-diseñados
  - Preview
  - Rating y reviews
  - Filtros por industria/caso de uso

- **Monetización** 🔴
  - Templates gratuitos
  - Templates premium (pago único)
  - Revenue sharing con creadores

##### 4.7 Sistema de Permisos y Roles
- **Roles en Empresa** 🔴
  - Owner: Full access
  - Admin: Gestión de clientes y reportes
  - Accountant: Solo generación de reportes
  - Support: Solo visualización

- **Gestión de Equipo** 🔴
  - Invitar miembros del equipo
  - Asignar roles
  - Permisos granulares

#### Modelo de Negocio

**Pricing para Empresas:**

| Plan | Precio | Clientes | Reportes/Mes | Features |
|------|--------|----------|--------------|----------|
| **Starter** | 149€/mes | Hasta 50 | 100 | Branding básico, 1 template |
| **Professional** | 299€/mes | Hasta 200 | 500 | Branding completo, templates ilimitados, API |
| **Enterprise** | Custom | Ilimitado | Ilimitado | Todo lo anterior + soporte dedicado, SLA |

**Comisiones:**
- 5€ por reporte generado (sobre el límite mensual)
- 20% comisión en templates vendidos en marketplace

#### Criterios de Aceptación
- [ ] Empresa puede registrarse y crear tenant
- [ ] Empresa puede personalizar branding (logo, colores)
- [ ] Empresa puede crear template personalizado
- [ ] Empresa puede añadir clientes
- [ ] Cliente puede acceder a su portal personalizado
- [ ] API pública funciona correctamente
- [ ] Webhooks se disparan correctamente
- [ ] Tenant isolation está garantizado (seguridad)
- [ ] Subdominios funcionan correctamente

#### Riesgos y Mitigaciones
- **Riesgo**: Complejidad de multi-tenancy
  - **Mitigación**: Empezar con arquitectura simple, iterar
- **Riesgo**: Seguridad (data leakage entre tenants)
  - **Mitigación**: Auditoría de seguridad externa, tests de penetración
- **Riesgo**: Performance con muchos tenants
  - **Mitigación**: Caching agresivo, CDN, monitoreo

---

## Estados y Dependencias

### Matriz de Dependencias

```
Módulo 1: Generación de Reportes ✅
  ↓ (necesario para monetizar)
Módulo 2: Suscripciones 🔴
  ↓ (necesario para gestionar usuarios de pago)
Módulo 3: Panel Admin 🔴
  ↓ (paralelo, gestión de la plataforma)
Módulo 4: White Label & Templates 🔴
  ↓ (depende de Módulos 1, 2 y 3 para funcionalidad completa)
```

### Timeline Estimado

**Objetivo: Completar todos los módulos (1, 2, 3 y 4) y lanzar a producción en enero 2026**

```
Octubre-Noviembre 2025
└── 🔴 Módulo 4: White Label & Templates (inicio temprano)
    ├── Arquitectura multi-tenant (2 semanas)
    └── Sistema de branding básico (2 semanas)

Noviembre 2025
├── 🟡 Módulo 1: Generación de Reportes (continuación)
│   ├── Integración Coinbase API (2 semanas)
│   ├── Integración WhiteBit API (2 semanas)
│   └── Testing exhaustivo de cálculos FIFO
│
└── 🔴 Módulo 4: White Label & Templates (continuación)
    ├── Editor de templates (2 semanas)
    └── Gestión multi-cliente básica (1 semana)

Diciembre 2025
├── 🟡 Módulo 1: Generación de Reportes (finalización)
│   ├── Generación de Modelo 720 (1 semana)
│   └── Generación de Modelo 714 (1 semana)
│
├── 🔴 Módulo 2: Suscripciones (inicio)
│   ├── Semana 1: Diseño y arquitectura
│   ├── Semana 2-3: Integración Stripe
│   └── Semana 4: Sistema de límites y quotas
│
├── 🔴 Módulo 3: Panel Admin (inicio)
│   ├── Dashboard con métricas básicas (1 semana)
│   └── Gestión de usuarios admin (inicio)
│
└── 🔴 Módulo 4: White Label & Templates (continuación)
    ├── API pública básica (2 semanas)
    └── Marketplace de templates básico (1 semana)

Enero 2026
├── 🔴 Módulo 2: Suscripciones (finalización)
│   ├── Panel de usuario completo
│   └── Email notifications
│
├── 🔴 Módulo 3: Panel Admin (finalización)
│   ├── Gestión de usuarios admin (completar)
│   ├── Sistema de permisos/roles básicos (3 días)
│   └── Logs y monitoreo básico (2 días)
│
├── 🔴 Módulo 4: White Label & Templates (finalización)
│   ├── Completar API pública
│   ├── Webhooks y documentación
│   └── Testing de multi-tenancy
│
├── ✅ Testing y Validación (todo el sistema integrado)
│   ├── UI/UX polish final (1 semana)
│   ├── Testing con usuarios beta (1 semana)
│   ├── Validación con asesores fiscales (3 días)
│   └── Corrección de bugs críticos
│
└── 🚀 LANZAMIENTO A PRODUCCIÓN (finales de enero 2026)

2026 en adelante
└── Expansión, optimización, nuevas features
```

---

## Changelog

### v0.8.0 (Noviembre 2025) - EN DESARROLLO
- ✅ Integración con Binance API
- ✅ Generación de Modelo 100 (IRPF)
- ✅ Sistema de persistencia de reportes
- ✅ Almacenamiento de reportes generados
- ✅ UI multi-step wizard
- 🚧 Integración Coinbase (in progress)
- 🚧 Integración WhiteBit (in progress)
- 🚧 Modelo 720 (in progress)
- 🚧 Modelo 714 (in progress)
- 🔴 Sistema de Suscripciones (pendiente - dic-ene 2026)
- 🔴 Panel Administrativo (pendiente - dic-ene 2026)
- 🔴 White Label & Templates (pendiente - nov 2025 - ene 2026)

### v0.1.0 (Octubre 2025)
- ✅ Setup inicial del proyecto
- ✅ Integración con wallets Web3
- ✅ UI components básicos
- ✅ Sistema de persistencia de datos

---

## Métricas de Éxito

### KPIs por Módulo

**Módulo 1: Generación de Reportes**
- ✅ Tasa de éxito de generación: >95%
- ✅ Tiempo medio de generación: <2 min
- ✅ Precisión de cálculos: 100% (validado por asesor fiscal)

**Módulo 2: Suscripciones** (para enero 2026)
- Free → Paid conversion: >8%
- MRR growth: >15% mensual
- Churn rate: <5% mensual

**Módulo 3: Panel Admin** (para enero 2026)
- Admin session time: Monitoreo diario
- Issues resolved per day: >10
- User satisfaction: >4.5/5

**Módulo 4: White Label** (para enero 2026)
- Enterprise clients: >5 en primer trimestre 2026
- API calls per day: >500 inicialmente
- Template marketplace: Funcional básico para lanzamiento

---

## Notas Finales

Este documento es la **fuente de verdad** para el producto Auto Crypto Tax. Debe actualizarse:

- **Semanalmente** durante desarrollo activo
- **Mensualmente** en fases de estabilidad
- **Inmediatamente** cuando haya cambios de prioridad

Última revisión: Noviembre 2025 por Miguel

---

**Próximos pasos inmediatos (Noviembre 2025 - Enero 2026) - Todo listo para enero 2026:**

1. **Noviembre 2025**: 
   - Finalizar integraciones Coinbase + WhiteBit y testing de cálculos FIFO
   - Continuar desarrollo de Módulo 4 (White Label)
2. **Diciembre 2025**: 
   - Completar Modelos 720 + 714 (Módulo 1)
   - Iniciar y avanzar Sistema de Suscripciones (Módulo 2)
   - Iniciar Panel Administrativo (Módulo 3)
   - Continuar Módulo 4 (API pública y marketplace)
3. **Enero 2026**: 
   - Finalizar Sistema de Suscripciones (Módulo 2)
   - Finalizar Panel Administrativo (Módulo 3)
   - Finalizar White Label & Templates (Módulo 4)
   - Testing exhaustivo completo de todos los módulos integrados
   - Validación con asesores fiscales
   - Lanzamiento público completo con todos los módulos

