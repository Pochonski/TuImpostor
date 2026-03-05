import { test, expect } from '@playwright/test';

test('Verificar estado básico de la aplicación', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');

  console.log('🧪 Test: Verificando estado básico');

  // 1. Verificar que la página carga
  await expect(page.locator('body')).toBeVisible();
  console.log('✅ Página cargada correctamente');

  // 2. Navegar a Nueva partida
  await page.click('button:has-text("Nueva partida")');
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
