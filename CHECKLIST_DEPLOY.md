# ✅ Checklist Pre-Deploy - Frontend

## 🔍 Verificación Local

- [x] Build exitoso (`npm run build`)
- [ ] Preview funciona (`npm run preview`)
- [ ] No hay errores en consola
- [ ] Login funciona en desarrollo
- [ ] Todas las rutas cargan correctamente
- [ ] Variables de entorno están en `.env.example`

## 📦 Archivos de Configuración

- [x] `vercel.json` creado
- [x] `.gitignore` actualizado
- [x] `.env.example` creado
- [x] `DEPLOY.md` con instrucciones

## 🔐 Clerk Configuration

- [ ] Obtener Clerk Publishable Key de producción
- [ ] Anotar URL del dominio de Vercel después del deploy
- [ ] Agregar dominio de Vercel a Clerk Allowed Origins
- [ ] Agregar dominio de Vercel a Clerk Redirect URLs

## 🌐 Vercel Setup

### Variables de Entorno a Configurar:

1. **VITE_CLERK_PUBLISHABLE_KEY**
   - Desarrollo: `pk_test_Z2VudGxlLW1pbmstODAuY2xlcmsuYWNjb3VudHMuZGV2JA`
   - Producción: Obtener de Clerk (puede ser la misma o `pk_live_...`)

2. **VITE_API_URL**
   - Desarrollo: `http://localhost:3001/api`
   - Producción: `https://[tu-app].onrender.com/api` (después de deploy backend)

## 🚀 Pasos de Deploy

### Opción 1: Vercel CLI

```bash
# 1. Instalar CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy a preview
cd C:\Users\admin\Desktop\Reptil\frontend
vercel

# 4. Deploy a producción
vercel --prod
```

### Opción 2: GitHub + Vercel (Recomendado)

```bash
# 1. Crear repositorio en GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/reptil-mcp.git
git push -u origin main

# 2. Importar en Vercel
# - Ve a vercel.com
# - Click "Add New Project"
# - Importa tu repo
# - Vercel detectará Vite automáticamente
```

## 📝 Post-Deploy

- [ ] Abrir URL de Vercel
- [ ] Verificar que la app carga
- [ ] Probar login
- [ ] Verificar consola de errores
- [ ] Probar navegación entre páginas
- [ ] Verificar que las llamadas al backend funcionan (cuando esté desplegado)

## 🔗 URLs para Guardar

- Vercel App URL: `_______________________`
- Clerk Dashboard: https://dashboard.clerk.com
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: `_______________________`

## ⚠️ Notas Importantes

1. **Variables VITE_* deben configurarse ANTES del build**
   - Vercel las inyecta en build time
   - Si las cambias, necesitas re-deployar

2. **CORS en Backend**
   - Cuando despliegues el backend, agrega el dominio de Vercel a las allowed origins

3. **Clerk Redirect URLs**
   - Incluye `https://*.vercel.app/*` para preview deployments
   - Incluye tu dominio personalizado si lo tienes

4. **Preview Deployments**
   - Cada PR en GitHub crea un preview deployment automático
   - Útil para testing antes de merge

## 🎯 Siguiente Paso

Una vez que el frontend esté desplegado:
1. ✅ Anotar la URL de Vercel
2. ⏭️ Preparar backend para Render
3. 🔗 Configurar VITE_API_URL con la URL del backend
4. 🔧 Configurar CORS en backend con URL de frontend
