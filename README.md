# ⚡ Sincronía - App Colaborativa de Proyectos en Tiempo Real (PWA)

**Sincronía** es una Progressive Web App (PWA) diseñada para la interacción en tiempo real entre el **Líder de Proyecto** y sus **Colaboradores**. 

El Líder del proyecto escribe el listado de objetivos y tareas estratégicas, y los colaboradores van tildando a medida que las tareas se completan al 100%, actualizando las pantallas de todo el equipo de forma instantánea.

![Sincronía Logo](/public/logo.jpg)

---

## ✨ Características Principales

* 🔒 **Seguridad por Proyecto**: Acceso mediante contraseña de 4 dígitos o Autenticación Biométrica (Face ID / Touch ID).
* ⚡ **Sincronización en Tiempo Real**: Notificaciones instantáneas de cambios mediante canal broadcast y almacenamiento sincronizado sin recargar la página.
* 📱 **Progressive Web App (PWA)**: Instalable en dispositivos móviles (iOS, Android) y Escritorio con soporte offline y manifesto manifest.json.
* 📊 **Métricas de Avance**: Barra de progreso interactiva ($% = \frac{\text{Tareas completadas}}{\text{Total tareas}} \times 100$).
* 👥 **Modos de Usuario**:
  * **Líder de Proyecto**: Crear/editar/eliminar objetivos, asignar prioridades y bloquear proyectos.
  * **Colaborador**: Tildar tareas finalizadas al 100%, adjuntar notas/observaciones y ver avances en vivo.
* 🎉 **Feedback Visual y Háptico**: Celebración con confeti al finalizar tareas clave.
* 📜 **Historial de Actividad (Audit Feed)**: Registro en vivo de quién completó cada tarea.

---

## 🛠️ Despliegue (Deployment)

### 1. Despliegue en Vercel
Este repositorio incluye el archivo `vercel.json` configurado.
```bash
npx vercel
```

### 2. Despliegue en Railway
Incluye el archivo `railway.json` listo para detección automática Nixpacks.
```bash
railway up
```

### 3. GitHub
```bash
git init
git add .
git commit -m "Initial commit: Sincronía PWA App"
```
