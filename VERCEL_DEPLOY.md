# 🚀 Deploy Frontend a Vercel - Guía Rápida

## ⚡ Comandos Rápidos

```bash
# 1. Verificar que todo está listo
npm run check-deploy

# 2. Probar el build localmente
npm run build
npm run preview

# 3. Deploy a Vercel
npx vercel --prod
```

---

## 📋 Opción 1: Deploy con Vercel CLI (Más Rápido)

### Paso 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Paso 2: Login
```bash
vercel login
```
Abre el navegador y autoriza.

### Paso 3: Deploy
```bash
# Navega a la carpeta del frontend
cd C:\Users\admin\Desktop\Reptil\frontend

# Deploy (primera vez te hará preguntas)
vercel --prod
```

**Preguntas que te hará:**
- Set up and deploy? → **Y**
- Which scope? → Selecciona tu cuenta
- Link to existing project? → **N** (primera vez)
- What's your project's name? → `reptil-mcp-frontend` (o el que prefieras)
- In which directory is your code located? → `.` (presiona Enter)
- Want to override the settings? → **N**

**¡Listo!** Te dará una URL como: `https://reptil-mcp-frontend.vercel.app`

---

## 📋 Opción 2: Deploy desde GitHub (Recomendado para Producción)

### Paso 1: Crear repositorio en GitHub

```bash
# Si no tienes Git configurado
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Inicializar repo
cd C:\Users\admin\Desktop\Reptil
git init
git add .
git commit -m "Initial commit - Reptil MCP Platform"

# Crear repo en GitHub y luego:
git branch -M main
git remote add origin https://github.com/TU-USUARIO/reptil-mcp.git
git push -u origin main
```

### Paso 2: Importar en Vercel

1. Ve a https://vercel.com
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Selecciona tu repo `reptil-mcp`
5. Configura:
   - **Framework Preset:** Vite ✅ (auto-detectado)
   - **Root Directory:** `frontend` ⚠️ (IMPORTANTE)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click **"Deploy"**

### Paso 3: Configurar Variables de Entorno

En el proyecto de Vercel:
1. Ve a **Settings** > **Environment Variables**
2. Agrega:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_Z2VudGxlLW1pbmstODAuY2xlcmsuYWNjb3VudHMuZGV2JA` | Production, Preview |
| `VITE_API_URL` | `https://tu-backend.onrender.com/api` | Production |
| `VITE_API_URL` | `http://localhost:3001/api` | Development, Preview |

3. **Re-deploy** para que tome las variables

---

## 🔐 Configurar Clerk para Producción

### Paso 1: Obtener URL de Vercel
Después del deploy, copia tu URL: `https://reptil-mcp-frontend.vercel.app`

### Paso 2: Configurar en Clerk Dashboard

1. Ve a https://dashboard.clerk.com
2. Selecciona tu aplicación
3. Ve a **Configure** > **Paths**
4. En **Allowed Origins**, agrega:
   ```
   https://reptil-mcp-frontend.vercel.app
   https://*.vercel.app
   ```

5. En **Allowed Redirect URLs**, agrega:
   ```
   https://reptil-mcp-frontend.vercel.app/*
   https://*.vercel.app/*
   ```

6. Click **Save**

---

## ✅ Verificar Deploy

1. **Abrir la app:** https://tu-app.vercel.app
2. **Verificar que carga** la página principal
3. **Probar login** con Clerk
4. **Revisar consola** del navegador (F12) - no debe haber errores rojos
5. **Probar navegación** entre páginas

### Errores Comunes

**"Clerk publishable key not found"**
- Ve a Vercel > Settings > Environment Variables
- Verifica que `VITE_CLERK_PUBLISHABLE_KEY` esté configurada
- Re-deploya: `vercel --prod` o trigger redeploy en dashboard

**"Failed to fetch"**
- Normal si el backend aún no está desplegado
- Espera a desplegar el backend en Render
- Luego actualiza `VITE_API_URL` y re-deploya

**Clerk error en login**
- Verifica Allowed Origins en Clerk Dashboard
- Asegúrate de incluir tu dominio de Vercel
- Puede tomar unos minutos en aplicarse

---

## 🎯 Siguientes Pasos

Una vez que el frontend esté funcionando:

1. ✅ **Anotar URL de Vercel:** `_________________________`

2. ⏭️ **Desplegar Backend en Render**
   - Preparar archivos de configuración
   - Configurar variables de entorno
   - Deploy

3. 🔗 **Conectar Frontend y Backend**
   - Actualizar `VITE_API_URL` en Vercel con URL de Render
   - Configurar CORS en backend con URL de Vercel
   - Re-deploya ambos si es necesario

4. 🧪 **Testing End-to-End**
   - Login funciona
   - Dashboard carga datos
   - Crear connector
   - Ejecutar agent

---

## 📊 Monitoreo en Vercel

Vercel Dashboard te da:
- **Deployments:** Historial de todos los deploys
- **Analytics:** Visitantes, páginas más vistas
- **Logs:** Errores en tiempo real
- **Speed Insights:** Performance de la app

Accede desde: https://vercel.com/dashboard

---

## 🔄 Re-Deploy

```bash
# Deploy nueva versión
git add .
git commit -m "Update: descripción"
git push

# O con CLI
vercel --prod
```

---

## 🆘 Ayuda

- **Vercel Docs:** https://vercel.com/docs
- **Clerk Docs:** https://clerk.com/docs
- **Vite Docs:** https://vitejs.dev

**¿Problemas?** Revisa los logs:
```bash
vercel logs
```
