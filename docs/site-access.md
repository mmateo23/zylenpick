# Entrada por clave

La web abre en `/entrada` hasta introducir la clave compartida `PickyaTala`.
El servidor comprueba la clave y entrega una cookie firmada, HttpOnly, SameSite=Lax
y Secure en HTTPS. El acceso se recuerda durante 30 días y conserva el destino
original. No sustituye la autenticación del panel ni los tokens de comercio.

Configuración opcional del servidor (nunca `NEXT_PUBLIC_*`):

- `PICKYALO_ACCESS_GATE=false`: retirar la capa sin eliminarla.
- `PICKYALO_ACCESS_PASSWORD`: cambiar la clave inicial.
- `PICKYALO_ACCESS_SECRET`: secreto de firma independiente. Si no existe, se usa
  la clave compartida; esta es una invitación lúdica, no autenticación individual.

Los recursos gráficos y scripts siguen siendo públicos. La capa bloquea páginas
y endpoints de la aplicación; no convierte los datos públicos de Supabase o las
imágenes en datos privados. Las páginas abiertas anteriormente en una pestaña
no pueden borrarse a distancia. El service worker ya no guarda HTML de la Home:
abrir o recargar una página requiere conexión para validar la invitación.

No se han añadido cuentas, tablas, servicios ni dependencias. En este proyecto
Next 14 el middleware se sitúa en `src/middleware.ts`, junto a `src/app`.
