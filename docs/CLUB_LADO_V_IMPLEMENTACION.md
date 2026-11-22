# Club Lado V

## Estructura

- `app/api/club/signup/route.ts`: registro de landing con deduplicación y bonus.
- `app/admin/club/page.tsx`: panel de autogestión.
- `lib/club/membership.ts`: núcleo de lógica de membresía, puntos y auditoría.
- `lib/club/settings.ts`: carga de configuración por backend de registro.
- `lib/club/email.ts`: envío de email de bienvenida con Resend.
- `lib/firebaseAdmin.ts`: inicialización de Firebase Admin SDK.
- `firestore.rules`: reglas sugeridas de seguridad.

## Colecciones Firestore

- `club_lado_v`
- `club_points_ledger`
- `club_settings` (`docId: global`)
- `admin_users` (control de permisos para reglas)

## Flujo de registro

1. Landing envía POST a `/api/club/signup`.
2. Se busca por `emailLower` para evitar duplicados.
3. Si existe activo, actualiza datos sin duplicar.
4. Si no existe activo, crea/actualiza solicitud, aplica bonus una sola vez y crea ledger.
5. Se intenta enviar bienvenida por Resend una sola vez.

## Operación admin

- Aprobar y bloquear miembros.
- Alta manual.
- Ajustar puntos con auditoría inmutable.
- Cambiar nivel y forzar nivel manual.
- Configurar bonus, umbrales y mensajes comerciales.