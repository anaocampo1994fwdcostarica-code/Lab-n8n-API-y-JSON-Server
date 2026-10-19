# Laboratorio de POO, n8n y JSON Server

## Escenario 2: pedidos con verificación geográfica de cobertura

Este proyecto automatiza la revisión de pedidos para determinar si pueden entregarse en Costa Rica y cuánto cuesta el envío. La ubicación geográfica se obtiene a partir de la dirección IP que llega al Webhook.

## Problema que resuelve

Antes de aceptar un pedido, es necesario verificar que exista, que tenga un cliente y un total válido, y que su ubicación corresponda a una zona de cobertura reconocida. El flujo aplica las mismas reglas de forma consistente y devuelve una decisión de aceptación o rechazo con el motivo correspondiente.

## Componentes

- **JSON Server:** expone `db.json` como una API REST local para consultar los pedidos.
- **n8n:** coordina la recepción de la solicitud, la búsqueda del pedido, la consulta geográfica, la evaluación y la respuesta.
- **IP-API:** obtiene datos aproximados de ubicación para la IP consultada, incluidos el código de país y la región. La evaluación solo considera ubicaciones con `countryCode` igual a `CR`.
- **Clases JavaScript:** implementan las validaciones del pedido y las reglas de cobertura en `clases.js`.

## Recorrido del workflow

El flujo del escenario debe recorrer estos pasos:

1. **Webhook** recibe la solicitud y el identificador del pedido.
2. **Buscar pedido** consulta en JSON Server el pedido correspondiente.
3. **Pedido no existe** responde con rechazo si la consulta no encuentra el pedido.
4. **Consultar IP** solicita a IP-API información geográfica de la IP recibida.
5. **Evaluar cobertura** aplica las validaciones del pedido y de ubicación.
6. **¿Está en cobertura?** dirige el resultado a la respuesta correspondiente.
7. **Aceptar pedido** devuelve la aceptación y el costo de envío calculado.
8. **Rechazar pedido** devuelve el rechazo y su motivo.

El archivo `workflow-n8n.json` contiene los nodos y sus conexiones, incluida una rama controlada para los errores de consulta a IP-API.

## Reglas de negocio

- El pedido debe tener un cliente no vacío y un total numérico mayor que cero.
- La ubicación debe estar verificada y contener país y región.
- Solo se acepta el país identificado con el código `CR` (Costa Rica).
- Las zonas principales son San José, Heredia, Alajuela y Cartago. El envío cuesta ₡2.500.
- Las zonas extendidas son Guanacaste, Puntarenas y Limón. El envío cuesta ₡4.500.
- El envío es gratis para pedidos de ₡50.000 o más, siempre que la zona esté reconocida.
- Se rechazan los datos incompletos, las ubicaciones no verificadas y las zonas que no se reconocen.

## Clases JavaScript

- **`Pedido`** representa un pedido y valida que tenga cliente y total válido. También determina si cumple el mínimo para envío gratis.
- **`ZonaCobertura`** comprueba el código de país, reconoce las regiones de cobertura, calcula el envío y devuelve el resultado de la evaluación.

Puedes revisar o ejecutar las clases con:

```bash
node main.js
```

## Ejecución de JSON Server

Desde la carpeta principal del repositorio, inicia la API en el puerto 3000:

```bash
npx json-server --watch db.json --port 3000
```

Con la base de datos disponible, los pedidos se consultan en `http://localhost:3000/pedidos`.

## Prueba del Webhook desde Postman

1. Importa `workflow-n8n.json` en n8n y activa el workflow para usar la URL de producción, o selecciona **Listen for test event** para una prueba.
2. En Postman, crea una solicitud con estos datos:
   - **Método:** `POST`
   - **Ruta de producción:** `/webhook/pedido-cobertura`
   - **Ruta de prueba:** `/webhook-test/pedido-cobertura`
   - **Header:** `Content-Type: application/json`
   - **Cuerpo:**

```json
{
  "pedidoId": "2",
  "ip": "8.8.8.8"
}
```

3. Envía la solicitud y revisa la respuesta de aceptación o rechazo.
4. Asegúrate de que JSON Server esté ejecutándose y de que las URL de JSON Server e IP-API sean accesibles desde el entorno donde corre n8n.

## Archivos del proyecto

- [Workflow de n8n](./workflow-n8n.json)
- [Clases JavaScript](./clases.js)
- [Base de datos](./db.json)
- [Documento de lógica de negocio](./Documento_Logica_Negocio.pdf)

## Entregables incluidos

- `workflow-n8n.json`: workflow exportado de n8n.
- `clases.js` y `main.js`: modelo de POO y prueba independiente.
- `db.json`: datos para JSON Server.
- `Documento_Logica_Negocio.pdf`: documento de lógica de negocio.
