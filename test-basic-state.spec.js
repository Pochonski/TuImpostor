import { test, expect } from '@playwright/test';

test('Verificar estado básico de la aplicación', async ({ page }) => {
  // Capturar errores de consola
  const consoleErrors = [];
  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');

  console.log('🧪 Test: Verificando estado básico');

  // Debug: mostrar contenido de la página
  const pageContent = await page.content();
  console.log('📄 Contenido de la página (primeros 1000 caracteres):');
  console.log(pageContent.substring(0, 1000));

  // Debug: mostrar errores de consola
  if (consoleErrors.length > 0) {
    console.log('❌ Errores de consola encontrados:');
    consoleErrors.forEach(error => console.log(`  - ${error}`));
  }

  // Debug: verificar si bundle.js se cargó
  const bundleLoaded = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.some(script => script.src && script.src.includes('bundle.js'));
  });
  console.log(`📦 Bundle.js cargado: ${bundleLoaded}`);

  // 1. Verificar que la página carga
  const bodyVisible = await page.locator('body').isVisible();
  console.log(`👁️ Body visible: ${bodyVisible}`);

  if (!bodyVisible) {
    console.log('❌ Body no es visible, esperando...');
    await page.waitForTimeout(2000);
  }

  await expect(page.locator('body')).toBeVisible();
  console.log('✅ Página cargada correctamente');

  // 2. Esperar a que aparezca el botón "Nueva partida"
  console.log('🔄 Esperando botón "Nueva partida"...');
  const newGameButton = page.locator('button:has-text("Nueva partida")');

  try {
    await expect(newGameButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Botón "Nueva partida" encontrado');
  } catch (error) {
    console.log('❌ Botón "Nueva partida" no encontrado');

    // Debug: mostrar todos los botones disponibles
    const allButtons = await page.locator('button').allTextContents();
    console.log('🔍 Botones encontrados en la página:');
    allButtons.forEach((text, index) => console.log(`  ${index + 1}. "${text}"`));

    // Debug: mostrar HTML del body
    const bodyHtml = await page.locator('body').innerHTML();
    console.log('🔍 HTML del body:');
    console.log(bodyHtml.substring(0, 2000));

    throw error;
  }
  await page.waitForTimeout(1000);

  // 3. Verificar elementos de la vista nueva partida
  console.log('🧪 Test: Verificando vista nueva partida');
  
  // Modo de juego
  await expect(page.locator('text=🎮')).toBeVisible();
  await expect(page.locator('text=MODO DE JUEGO')).toBeVisible();
  await expect(page.locator('button:has-text("👥 Clásico")')).toBeVisible();
  await expect(page.locator('button:has-text("🌐 En línea")')).toBeVisible();
  console.log('✅ Modos de juego visibles');

  // Sección de jugadores
  await expect(page.locator('text=👋')).toBeVisible();
  await expect(page.locator('text=JUGADORES')).toBeVisible();
  await expect(page.locator('input.player-input[type="number"]')).toBeVisible();
  console.log('✅ Sección de jugadores visible');

  // Verificar campos de nombres de jugadores
  const playerInputs = page.locator('input.player-input[type="text"]');
  const inputCount = await playerInputs.count();
  console.log(`🧪 Test: Hay ${inputCount} campos de jugadores`);
  
  for (let i = 0; i < inputCount; i++) {
    const input = playerInputs.nth(i);
    await expect(input).toBeVisible();
    const placeholder = await input.getAttribute('placeholder');
    console.log(`🧪 Test: Jugador ${i + 1}: ${placeholder}`);
  }

  // 4. Probar cambiar nombres de jugadores
  console.log('🧪 Test: Probando cambiar nombres');
  await playerInputs.first().fill('Juan');
  await playerInputs.nth(1).fill('María');
  await playerInputs.nth(2).fill('Pedro');
  console.log('✅ Nombres cambiados correctamente');

  // 5. Verificar secciones
  await expect(page.locator('text=🎯')).toBeVisible();
  await expect(page.locator('text=CATEGORÍAS')).toBeVisible();
  console.log('✅ Sección de categorías visible');

  await expect(page.locator('text=🕵️')).toBeVisible();
  await expect(page.locator('text=IMPOSTORES')).toBeVisible();
  console.log('✅ Sección de impostores visible');

  console.log('✅ Test completado: Estado básico verificado');
});
