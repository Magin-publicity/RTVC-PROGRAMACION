# Documentación de API

## Base URL
```
http://localhost:3000/api
```

## Autenticación
Actualmente no se requiere autenticación. En producción se implementará JWT.

## Endpoints

### Personal

#### Obtener todo el personal
```http
GET /personnel
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Luis Fajardo",
    "area": "PRODUCCIÓN",
    "role": "Productor de Emisión",
    "current_shift": "5:00",
    "email": "luis.fajardo@rtvc.gov.co",
    "phone": "3001234567",
    "active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
]
```

#### Crear personal
```http
POST /personnel
Content-Type: application/json

{
  "name": "Juan Pérez",
  "area": "PRODUCCIÓN",
  "role": "Asistente de producción",
  "current_shift": "8:00",
  "email": "juan.perez@rtvc.gov.co",
  "phone": "3009876543"
}
```

### Programación

#### Obtener programación semanal
```http
GET /schedule/week?startDate=2025-01-06&endDate=2025-01-12
```

#### Crear programación masiva
```http
POST /schedule/bulk
Content-Type: application/json

{
  "schedules": [
    {
      "personnel_id": 1,
      "date": "2025-01-06",
      "shift_time": "5:00",
      "program": "EL CALENTAO",
      "location": "ESTUDIO 5"
    }
  ]
}
```

### Novedades

#### Crear novedad
```http
POST /novelties
Content-Type: application/json

{
  "personnel_id": 1,
  "date": "2025-01-10",
  "type": "VIAJE",
  "description": "Viaje a Villavicencio por 4 días"
}
```

## Códigos de Respuesta

- `200` - OK
- `201` - Creado
- `400` - Petición inválida
- `404` - No encontrado
- `500` - Error del servidor