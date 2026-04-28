import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verificando configuración para deploy...\n');

let errors = 0;
let warnings = 0;

// 1. Verificar package.json
console.log('📦 Verificando package.json...');
try {
  const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
  if (!pkg.scripts?.build) {
    console.error('  ❌ No se encontró script "build"');
    errors++;
  } else {
    console.log('  ✅ Script "build" encontrado');
  }
  if (!pkg.dependencies?.['@clerk/clerk-react']) {
    console.error('  ❌ Clerk no está instalado');
    errors++;
  } else {
    console.log('  ✅ Clerk instalado');
  }
} catch (error) {
  console.error('  ❌ Error leyendo package.json:', error.message);
  errors++;
}

// 2. Verificar vercel.json
console.log('\n⚙️  Verificando vercel.json...');
if (existsSync(join(__dirname, 'vercel.json'))) {
  try {
    const vercelConfig = JSON.parse(readFileSync(join(__dirname, 'vercel.json'), 'utf-8'));
    console.log('  ✅ vercel.json existe');
    if (vercelConfig.rewrites?.find(r => r.destination === '/index.html')) {
      console.log('  ✅ Rewrites configurados para SPA');
    } else {
      console.warn('  ⚠️  No se encontraron rewrites para SPA');
      warnings++;
    }
  } catch (error) {
    console.error('  ❌ Error leyendo vercel.json:', error.message);
    errors++;
  }
} else {
  console.error('  ❌ vercel.json no existe');
  errors++;
}

// 3. Verificar .env.example
console.log('\n📝 Verificando .env.example...');
if (existsSync(join(__dirname, '.env.example'))) {
  const envExample = readFileSync(join(__dirname, '.env.example'), 'utf-8');
  console.log('  ✅ .env.example existe');
  if (envExample.includes('VITE_CLERK_PUBLISHABLE_KEY')) {
    console.log('  ✅ VITE_CLERK_PUBLISHABLE_KEY documentado');
  } else {
    console.error('  ❌ Falta VITE_CLERK_PUBLISHABLE_KEY');
    errors++;
  }
  if (envExample.includes('VITE_API_URL')) {
    console.log('  ✅ VITE_API_URL documentado');
  } else {
    console.error('  ❌ Falta VITE_API_URL');
    errors++;
  }
} else {
  console.warn('  ⚠️  .env.example no existe');
  warnings++;
}

// 4. Verificar .env local
console.log('\n🔐 Verificando variables de entorno locales...');
if (existsSync(join(__dirname, '.env'))) {
  const env = readFileSync(join(__dirname, '.env'), 'utf-8');
  console.log('  ✅ .env existe');
  if (env.includes('VITE_CLERK_PUBLISHABLE_KEY=pk_')) {
    console.log('  ✅ VITE_CLERK_PUBLISHABLE_KEY configurado');
  } else {
    console.error('  ❌ VITE_CLERK_PUBLISHABLE_KEY no configurado');
    errors++;
  }
  if (env.includes('VITE_API_URL=')) {
    console.log('  ✅ VITE_API_URL configurado');
  } else {
    console.error('  ❌ VITE_API_URL no configurado');
    errors++;
  }
} else {
  console.error('  ❌ .env no existe');
  errors++;
}

// 5. Verificar .gitignore
console.log('\n🚫 Verificando .gitignore...');
if (existsSync(join(__dirname, '.gitignore'))) {
  const gitignore = readFileSync(join(__dirname, '.gitignore'), 'utf-8');
  console.log('  ✅ .gitignore existe');
  if (gitignore.includes('.env')) {
    console.log('  ✅ .env está en .gitignore');
  } else {
    console.error('  ❌ .env NO está en .gitignore (¡PELIGRO!)');
    errors++;
  }
  if (gitignore.includes('node_modules')) {
    console.log('  ✅ node_modules está en .gitignore');
  } else {
    console.warn('  ⚠️  node_modules no está en .gitignore');
    warnings++;
  }
} else {
  console.error('  ❌ .gitignore no existe');
  errors++;
}

// 6. Verificar estructura de archivos importantes
console.log('\n📁 Verificando archivos importantes...');
const requiredFiles = [
  'index.html',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'src/main.jsx',
  'src/App.jsx',
];

requiredFiles.forEach(file => {
  if (existsSync(join(__dirname, file))) {
    console.log(`  ✅ ${file}`);
  } else {
    console.error(`  ❌ ${file} no encontrado`);
    errors++;
  }
});

// Resumen
console.log('\n' + '='.repeat(50));
console.log('📊 Resumen de Verificación\n');
console.log(`✅ Checks pasados`);
console.log(`❌ Errores: ${errors}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log('='.repeat(50));

if (errors > 0) {
  console.log('\n❌ Hay errores que deben corregirse antes de desplegar\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n⚠️  Hay warnings, pero puedes continuar con el deploy\n');
  process.exit(0);
} else {
  console.log('\n✅ Todo listo para desplegar!\n');
  console.log('📝 Siguiente paso:');
  console.log('   1. Revisa CHECKLIST_DEPLOY.md');
  console.log('   2. Ejecuta: npm run build');
  console.log('   3. Ejecuta: vercel --prod\n');
  process.exit(0);
}
