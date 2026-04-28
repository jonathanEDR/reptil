# 🚀 Despliegue Frontend - Vercel

## Preparación

### 1. Verificar que el proyecto compila
```bash
npm run build
```

### 2. Probar el build localmente
```bash
npm run preview
```

---

## 📦 Desplegar en Vercel

### Opción A: Desde la CLI de Vercel

1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

2. **Login en Vercel**
```bash
vercel login
```

3. **Desplegar**
```bash
# Desarrollo
vercel

# Producción
vercel --prod
```

### Opción B: Desde el Dashboard de Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Add New Project"**
3. Importa tu repositorio de GitHub
4. Configura las siguientes opciones:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

---

## ⚙️ Variables de Entorno en Vercel

Configura estas variables en: **Project Settings > Environment Variables**

### Variables Requeridas:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_...` o `pk_live_...` | Tu Clerk Publishable Key |
| `VITE_API_URL` | `https://tu-backend.onrender.com/api` | URL de tu backend en Render |

### Pasos:

1. En el dashboard de Vercel, ve a tu proyecto
2. Click en **Settings** > **Environment Variables**
3. Agrega cada variable:
   - Name: `VITE_CLERK_PUBLISHABLE_KEY`
   - Value: Tu key de Clerk
   - Environment: Production, Preview, Development
4. Agrega la segunda variable:
   - Name: `VITE_API_URL`
   - Value: URL de tu backend (cuando esté desplegado en Render)
   - Environment: Production, Preview, Development

---

## 🔧 Configuración de Clerk

### 1. Actualizar URLs permitidas

En [Clerk Dashboard](https://dashboard.clerk.com):

1. Ve a **API Keys** > **Settings**
2. En **Allowed Origins**, agrega:
   - `https://tu-dominio.vercel.app`
   - `https://*.vercel.app` (para preview deployments)

3. En **Allowed Redirect URLs**, agrega:
   - `https://tu-dominio.vercel.app/*`
   - `https://*.vercel.app/*`

### 2. Configurar dominio personalizado (Opcional)

En Vercel:
1. Ve a **Settings** > **Domains**
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones

---

## ✅ Post-Deploy Checklist

- [ ] El build se completó sin errores
- [ ] Las variables de entorno están configuradas
- [ ] Clerk permite tu dominio de Vercel
- [ ] La aplicación carga correctamente
- [ ] El login funciona
- [ ] Las llamadas al backend funcionan (una vez desplegado)
- [ ] No hay errores en la consola del navegador

---

## 🐛 Troubleshooting

### Error: "Clerk publishable key not found"
- Verifica que `VITE_CLERK_PUBLISHABLE_KEY` esté configurada en Vercel
- Las variables con prefijo `VITE_` deben estar disponibles en build time

### Error: "Failed to fetch"
- Verifica que `VITE_API_URL` apunte al backend correcto
- Asegúrate de que el backend esté desplegado y funcionando
- Verifica CORS en el backend

### Error: "Invalid redirect URL"
- Agrega el dominio de Vercel a las URLs permitidas en Clerk
- Incluye `https://*.vercel.app` para preview deployments

---

## 📱 Comandos Útiles

```bash
# Ver logs del deployment
vercel logs

# Ver lista de deployments
vercel ls

# Promover un deployment a producción
vercel promote <deployment-url>

# Rollback a un deployment anterior
vercel rollback

# Ver variables de entorno
vercel env ls
```

---

## 🔗 URLs Importantes

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Documentación Vercel:** https://vercel.com/docs
- **Documentación Clerk:** https://clerk.com/docs

---

## 📊 Monitoreo

Vercel proporciona automáticamente:
- ✅ Analytics de visitantes
- ✅ Web Vitals (Core Web Vitals)
- ✅ Logs de errores
- ✅ Deploy previews para cada PR

Accede desde: **Project > Analytics**
