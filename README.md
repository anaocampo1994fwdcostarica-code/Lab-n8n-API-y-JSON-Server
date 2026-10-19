# Laboratorio POO y n8n

## Pedidos con verificación geográfica de cobertura

Este proyecto automatiza la validación de pedidos de una tienda. El workflow recibe el identificador del pedido y una dirección IP, consulta el pedido en JSON Server, obtiene la ubicación aproximada mediante IP-API y decide si la entrega puede realizarse y cuál es su costo. La lógica de negocio se modela con clases de JavaScript y se aplica en el nodo Code de n8n.

## Tecnologías usadas

- **n8n:** orquesta el proceso y sus rutas de aceptación, rechazo y error.
- **JSON Server:** funciona como API REST local para consultar y actualizar pedidos.
- **JavaScript POO:** modela las entidades `Pedido` y `ZonaCobertura`.
- **IP-API:** obtiene el país y la región asociados con la dirección IP.
- **Postman:** permite enviar solicitudes de prueba al Webhook.

## Archivos principales

- `db.json`: contiene los pedidos utilizados por JSON Server.
- `clases.js`: contiene las clases y reglas de negocio en JavaScript.
- `workflow-n8n.json`: contiene el workflow exportado de n8n.
- `Documento_Logica_Negocio.pdf`: explica el problema, el flujo y las decisiones técnicas.

## Recorrido del workflow

La ruta principal es:

```text
Webhook → Buscar pedido → Consultar IP → Evaluar cobertura → If
                                                             ├─ Aceptar pedido
                                                             └─ Rechazar pedido
```

El workflow también contempla estas rutas de error:

- **Pedido no existe:** se utiliza cuando JSON Server no encuentra el identificador solicitado.
- **Error al consultar IP:** captura un fallo técnico de IP-API y dirige el resultado a **Rechazar pedido** con un motivo claro.

Los nodos **Aceptar pedido** y **Rechazar pedido** actualizan el registro correspondiente en JSON Server.

## Reglas de negocio

- El cliente debe ser texto no vacío después de eliminar espacios al inicio y al final.
- El total debe ser numérico, finito y mayor que cero.
- Solo se aceptan ubicaciones de Costa Rica, identificadas con el código `CR`.
- Las zonas principales son San José, Heredia, Alajuela y Cartago; el envío cuesta **₡2 500**.
- Las zonas extendidas son Guanacaste, Puntarenas y Limón; el envío cuesta **₡4 500**.
- Las regiones que no pertenecen a una zona reconocida se rechazan.
- El envío es gratis únicamente cuando el total es igual o mayor a **₡50 000** y la región ya fue reconocida.

## Ejecutar JSON Server

Desde la carpeta principal del repositorio, instala las dependencias e inicia la API:

```bash
npm install
npm run api
```

JSON Server queda disponible en `http://localhost:3000` y los pedidos en `http://localhost:3000/pedidos`.

## Probar el workflow con n8n y Postman

1. Importa `workflow-n8n.json` en n8n.
2. Verifica que JSON Server esté ejecutándose.
3. En n8n, presiona **Execute workflow** antes de cada prueba para habilitar temporalmente el Webhook de prueba.
4. En Postman, configura la solicitud:

   - **Método:** `POST`
   - **URL:** `http://localhost:5678/webhook-test/pedido-cobertura`
   - **Header:** `Content-Type: application/json`
   - **Body:** selecciona `raw` y formato JSON.

```json
{
  "pedidoId": "2",
  "ip": "201.202.14.240"
}
```

La dirección IP debe sustituirse por una IP pública válida de la ubicación que se quiera probar. IP-API proporciona una ubicación aproximada, por lo que el país y la región obtenidos dependen de la IP utilizada.

## Ejemplos de pruebas

### Pedido aceptado

Utiliza el pedido `2` y una IP válida de Costa Rica cuya región sea reconocida. Como el total del pedido es igual o mayor a ₡50 000, el resultado esperado es `aceptado` con costo de envío `0`.

```json
{
  "pedidoId": "2",
  "ip": "201.202.14.240"
}
```

### Fuera de cobertura

Utiliza un pedido válido y una IP de un país diferente de Costa Rica. El resultado esperado es `rechazado` con el motivo `Fuera de zona de cobertura`.

```json
{
  "pedidoId": "1",
  "ip": "8.8.8.8"
}
```

### Datos incompletos

El pedido `3` no tiene un cliente válido. Con una IP válida, el resultado esperado es `rechazado` con el motivo `Datos incompletos`.

```json
{
  "pedidoId": "3",
  "ip": "201.202.14.240"
}
```

### Pedido inexistente

Utiliza un identificador que no exista en `db.json`. El workflow debe seguir la ruta **Pedido no existe**.

```json
{
  "pedidoId": "999",
  "ip": "201.202.14.240"
}
```
