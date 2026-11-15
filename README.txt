LA SUBASTA TRAMPA LIVE — LEY LERDO
===================================

ARCHIVOS
--------
index.html   Interfaz del juego
style.css    Estilo fanzine punk / fotocopia
app.js       Juego + Firebase Auth anónima + Firestore

ANTES DE PUBLICAR (UNA SOLA VEZ)
--------------------------------
1. Entra a https://console.firebase.google.com/ y crea un proyecto.
2. En Authentication > Sign-in method, activa "Anonymous".
3. En Firestore Database, crea una base de datos (modo producción).
4. En Configuración del proyecto > Tus apps > Web, registra una app web.
5. Copia el objeto firebaseConfig y pégalo en app.js, reemplazando los valores
   PEGA_AQUI_TU_... dentro del bloque que dice:
   // PEGA AQUI TU CONFIG
6. En Authentication > Settings > Authorized domains, confirma que esté
   github.io (y localhost si vas a probar localmente).

REGLAS DE FIRESTORE
-------------------
En Firestore > Rules pega estas reglas y pulsa Publish:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }

    match /games/{pin} {
      allow read: if signedIn();
      allow create: if signedIn()
        && request.resource.data.hostUid == request.auth.uid
        && request.resource.data.status == 'lobby';
      allow update: if signedIn()
        && resource.data.hostUid == request.auth.uid;

      match /players/{playerId} {
        allow read: if signedIn();
        allow create: if signedIn()
          && playerId == request.auth.uid
          && request.resource.data.uid == request.auth.uid
          && request.resource.data.name is string
          && request.resource.data.name.size() > 0
          && request.resource.data.name.size() <= 18
          && request.resource.data.score == 0;
        allow update: if signedIn() && (
          // El propio jugador solo puede enviar una respuesta una vez por pregunta.
          (playerId == request.auth.uid
            && request.resource.data.diff(resource.data).affectedKeys()
              .hasOnly(['answer','answeredQuestion','answeredAt'])
            && request.resource.data.answeredQuestion >= resource.data.answeredQuestion
            && request.resource.data.answeredQuestion <= 7)
          // El host es el único que puede modificar puntos.
          || get(/databases/$(database)/documents/games/$(pin)).data.hostUid == request.auth.uid
        );
      }
    }
  }
}

PUBLICAR EN GITHUB PAGES (APROX. 3 MINUTOS)
-------------------------------------------
1. Entra a https://github.com/new y crea un repositorio público llamado
   ley-lerdo-live.
2. Sube index.html, style.css, app.js y README.txt a la raíz del repositorio.
3. Abre Settings > Pages.
4. En "Build and deployment", elige "Deploy from a branch".
5. Selecciona la rama main y la carpeta /(root). Pulsa Save.
6. Espera a que GitHub muestre tu URL, normalmente:
   https://TU-USUARIO.github.io/ley-lerdo-live/

USAR EN EL SALÓN
----------------
1. Abre la URL publicada en la computadora que proyectará el juego.
2. Pulsa SOY HOST > CREAR PARTIDA.
3. Comparte el PIN de 4 dígitos.
4. Los participantes abren la misma URL, pulsan SOY JUGADOR e ingresan PIN
   y nombre. El host verá aparecer los nombres en vivo.
5. Pulsa EMPEZAR LA PARTIDA. Cada pregunta dura 15 segundos.
6. El host pulsa SIGUIENTE PREGUNTA para avanzar. Al terminar aparece el podio.

PUNTUACIÓN
----------
Respuesta correcta: 100 puntos + 10 por cada segundo completo que sobre.
Respuesta incorrecta o sin respuesta: 0 puntos.

IMPORTANTE / LIMITACIONES
-------------------------
- Se requiere conexión a internet y completar la configuración de Firebase.
  El ZIP no puede conectarse a tu proyecto hasta que pegues tu firebaseConfig.
- El host debe mantener abierta la pestaña durante la partida: su navegador
  recibe las respuestas y asigna los puntos.
- Este juego está pensado para una dinámica de salón, no para una evaluación
  de alto riesgo. Al ser una app estática, el código del navegador puede
  inspeccionarse. Para impedir trampas deliberadas haría falta un backend
  confiable (por ejemplo, Cloud Functions) que valide las respuestas.
- Las reglas permiten leer los datos de sala a usuarios autenticados anónimos
  para poder sincronizar el juego. No publiques datos personales sensibles.
