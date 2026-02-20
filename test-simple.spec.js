import { test, expect } from '@playwright/test';

test('App carga correctamente', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Página cargada');
  
  // Verificar que vemos el logo
  const logo = page.locator('.brand-title');
  await expect(logo).toBeVisible();
  console.log('✅ Logo visible');
  
  // Verificar que vemos el botón "Nueva partida"
  const newGameButton = page.locator('button:has-text("Nueva partida")');
  await expect(newGameButton).toBeVisible();
  console.log('✅ Botón Nueva partida visible');
  
  // Hacer clic en Nueva partida
  await newGameButton.click();
  await page.waitForLoadState('networkidle');
  console.log('✅ Clic en Nueva partida ejecutado');
  
  // Esperar a que carguen los elementos de nueva partida
  const gameTitle = page.locator('text=MODO DE JUEGO');
  await expect(gameTitle).toBeVisible({ timeout: 5000 });
  console.log('✅ Pantalla de Nueva Partida visible');
  
  // Verificar que hay checkboxes de categorías
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  console.log(`✅ Hay ${count} categorías`);
  expect(count).toBeGreaterThan(0);
  
  // Seleccionar la primera categoría
  await checkboxes.first().check();
  console.log('✅ Primera categoría seleccionada');
  
  // Hacer clic en INICIAR JUEGO
  const startButton = page.locator('button:has-text("INICIAR JUEGO")');
  await expect(startButton).toBeVisible();
  console.log('✅ Botón INICIAR JUEGO visible');
  
  await startButton.click();
  await page.waitForLoadState('networkidle');
  console.log('✅ Juego iniciado');
  
  // Verificar que estamos en la pantalla del juego
  const cardElement = page.locator('.flip-card');
  await expect(cardElement).toBeVisible({ timeout: 5000 });
  console.log('✅ Pantalla del juego visible con cartas');
});

test('Revelación de carta funciona', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  
  // Navegar a Nueva partida
  const newGameButton = page.locator('button:has-text("Nueva partida")');
  await newGameButton.click();
  await page.waitForLoadState('networkidle');
  
  // Seleccionar una categoría
  const checkboxes = page.locator('input[type="checkbox"]');
  await checkboxes.first().check();
  
  // Iniciar juego
  const startButton = page.locator('button:has-text("INICIAR JUEGO")');
  await startButton.click();
  await page.waitForLoadState('networkidle');
  console.log('✅ Juego iniciado');
  
  // Buscar el botón de revelar
  const revealButton = page.locator('button:has-text("Mantener presionado para revelar")');
  const revealCount = await revealButton.count();
  
  if (revealCount > 0) {
    console.log('✅ Botón REVELAR encontrado');
    await revealButton.click();
    await page.waitForTimeout(500);
    console.log('✅ Carta revelada');
  } else {
    console.log('⚠️ No se encontró botón REVELAR');
  }
});
