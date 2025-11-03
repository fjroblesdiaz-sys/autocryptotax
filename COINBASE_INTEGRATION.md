# Integración de Coinbase Advanced Trade API

## Resumen

Este documento describe la implementación de la integración con Coinbase Advanced Trade API para obtener el historial de transacciones y generar declaraciones fiscales.

## Arquitectura

La integración sigue el patrón Strategy implementado en el proyecto:

```
src/features/reports/services/
├── exchange-api.service.ts         # Servicio principal (Factory)
└── exchange-strategies/
    ├── binance.strategy.ts         # Estrategia de Binance
    └── coinbase.strategy.ts        # Estrategia de Coinbase (NUEVO)
```

## API de Coinbase Utilizada

### Advanced Trade API v3

- **Base URL**: `https://api.coinbase.com`
- **Documentación**: https://docs.cdp.coinbase.com/advanced-trade-api/docs/
- **Autenticación**: JWT con firma ECDSA (ES256)

### Endpoints Implementados

1. **GET /api/v3/brokerage/accounts**
   - Obtiene todas las cuentas del usuario
   - Usado para testing de conexión

2. **GET /api/v3/brokerage/orders/historical/fills**
   - Obtiene el historial de órdenes completadas (fills)
   - Parámetros opcionales:
     - `start_sequence_timestamp`: Fecha de inicio (ISO 8601)
     - `end_sequence_timestamp`: Fecha de fin (ISO 8601)
     - `limit`: Máximo 1000 por solicitud

## Autenticación

### Formato de API Key

Coinbase CDP utiliza API Keys que incluyen:
- **API Key Name** (kid): Identificador de la clave
- **Private Key**: Clave privada en formato PEM (ECDSA P-256)

### Generación de JWT

El JWT se genera con la siguiente estructura:

```javascript
Header:
{
  "alg": "ES256",
  "kid": "api-key-name",
  "nonce": "random-hex-string",
  "typ": "JWT"
}

Payload:
{
  "sub": "api-key-name",
  "iss": "cdp",
  "nbf": current_timestamp,
  "exp": current_timestamp + 120,
  "uri": "GET api.coinbase.com/api/v3/brokerage/accounts"
}
```

La firma se genera usando ECDSA con SHA-256 sobre el mensaje `${encodedHeader}.${encodedPayload}`.

## Cómo Obtener las Credenciales

### 1. Acceder al Portal de CDP

1. Ve a https://portal.cdp.coinbase.com/
2. Inicia sesión con tu cuenta de Coinbase
3. Navega a **API Keys** en el menú

### 2. Crear una Nueva API Key

1. Haz clic en **"Create API key"**
2. Configura los siguientes campos:
   - **API key nickname**: Un nombre descriptivo (ej: "AutoCryptoTax")
   - **Signature algorithm**: Selecciona **ECDSA** (NO seleccionar Ed25519)
   - **API restrictions**: Habilita **"view"** permission
   - **IP allowlist** (opcional): Añade las IPs permitidas

3. Haz clic en **"Create API key"**

### 3. Guardar las Credenciales

⚠️ **IMPORTANTE**: Las credenciales solo se muestran UNA VEZ.

- **API Key Name**: Copia este valor (ej: `organizations/abc123/apiKeys/xyz789`)
- **Private Key**: Descarga o copia la clave privada en formato PEM

Formato de la clave privada:
```
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIBKJLQ...resto de la clave...
-----END EC PRIVATE KEY-----
```

## Uso en el Código

### Test de Conexión

```typescript
import { exchangeAPIService } from '@/features/reports/services/exchange-api.service';

const isValid = await exchangeAPIService.testConnection('coinbase', {
  apiKey: 'organizations/abc123/apiKeys/xyz789',
  apiSecret: '-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----'
});
```

### Obtener Transacciones

```typescript
const transactions = await exchangeAPIService.fetchTransactions(
  'coinbase',
  {
    apiKey: 'organizations/abc123/apiKeys/xyz789',
    apiSecret: '-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----'
  },
  new Date('2024-01-01'), // Fecha de inicio (opcional)
  new Date('2024-12-31')  // Fecha de fin (opcional)
);
```

### Formato de Respuesta

```typescript
{
  id: string;              // ID único de la transacción
  timestamp: number;       // Timestamp en milisegundos
  type: 'buy' | 'sell';   // Tipo de transacción
  asset: string;           // Activo base (ej: 'BTC')
  amount: number;          // Cantidad del activo
  price: number;           // Precio por unidad
  fee: number;             // Comisión pagada
  feeAsset: string;        // Activo de la comisión (ej: 'USD')
  total: number;           // Total de la transacción
  exchange: 'coinbase';    // Exchange de origen
  raw: any;                // Datos originales de la API
}
```

## Datos de Prueba

Para testing sin credenciales reales, usa:

```typescript
const mockTransactions = await exchangeAPIService.fetchTransactions(
  'coinbase',
  {
    apiKey: 'test',
    apiSecret: 'test'
  }
);
```

Esto retornará transacciones de prueba sin hacer llamadas a la API real.

## Limitaciones Actuales

1. **Solo Trades**: La API de Advanced Trade se enfoca en operaciones de trading. No incluye:
   - Depósitos desde cuenta bancaria
   - Retiros a cuenta bancaria
   - Transferencias entre wallets de Coinbase

2. **Rate Limits**: Coinbase tiene límites de tasa por API key. El servicio no implementa rate limiting automático.

3. **Paginación**: Actualmente obtiene hasta 1000 fills por solicitud. Si hay más transacciones, se necesitaría implementar paginación.

## Próximos Pasos

### Mejoras Planificadas

- [ ] Implementar paginación para obtener más de 1000 transacciones
- [ ] Agregar soporte para Coinbase Wallet API (para deposits/withdrawals)
- [ ] Implementar rate limiting automático
- [ ] Cache de respuestas para reducir llamadas a la API
- [ ] Soporte para múltiples portfolios

### Testing

- [ ] Tests unitarios para la estrategia de Coinbase
- [ ] Tests de integración con la API real (sandbox)
- [ ] Validación de diferentes formatos de API keys

## Recursos

- [Documentación Advanced Trade API](https://docs.cdp.coinbase.com/advanced-trade-api/docs/)
- [JWT Authentication Guide](https://docs.cdp.coinbase.com/get-started/authentication/jwt-authentication)
- [Coinbase CDP Portal](https://portal.cdp.coinbase.com/)
- [Advanced Trade API Reference](https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/introduction)

## Troubleshooting

### Error: "Invalid private key format"

**Causa**: La clave privada no está en el formato PEM correcto.

**Solución**: Asegúrate de que la clave privada incluya los headers:
```
-----BEGIN EC PRIVATE KEY-----
tu_clave_aqui
-----END EC PRIVATE KEY-----
```

### Error: "API key inválida o expirada"

**Causa**: El API Key Name o la firma JWT no son correctos.

**Solución**:
1. Verifica que el API Key Name sea exactamente como aparece en el portal CDP
2. Asegúrate de usar el algoritmo ECDSA (ES256), no Ed25519
3. Verifica que la clave privada corresponde a la API key

### Error: "Permisos insuficientes"

**Causa**: La API key no tiene el permiso "view" habilitado.

**Solución**: 
1. Ve al portal CDP
2. Edita la API key
3. Asegúrate de que "view" permission esté habilitada

### Error: "Demasiadas solicitudes"

**Causa**: Has excedido el rate limit de Coinbase.

**Solución**: Espera un momento antes de hacer más solicitudes. Considera implementar:
- Delay entre solicitudes
- Cache de respuestas
- Reducir el número de llamadas simultáneas

## Contacto y Soporte

Para preguntas sobre la integración:
- Ver documentación del proyecto: `/README.md`
- Revisar arquitectura de reportes: `/REPORTS_ARCHITECTURE.md`
- Abrir un issue en el repositorio

