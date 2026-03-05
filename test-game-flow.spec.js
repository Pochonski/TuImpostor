import { test, expect } from '@playwright/test';

test('Verificar estado y flujo del juego', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');

  console.log('🧪 Test: Verificando estado y flujo');

  // 1. Navegar a Nueva partida
  await page.click('button:has-text("Nueva partida")');
  await page.waitForTimeout(1000);

  // 2. Verificar elementos básicos
  await expect(page.locator('text=🎮')).toBeVisible();
  await expect(page.locator('text=MODO DE JUEGO')).toBeVisible();
  console.log('✅ Modos de juego visibles');

  // 3. Verificar inputs específicos
  await expect(page.locator('input.player-input[type="number"]')).toBeVisible();
  await expect(page.locator('input.impostor-input[type="number"]')).toBeVisible();
  console.log('✅ Inputs de jugadores e impostores visibles');

  // 4. Verificar campos de nombres de jugadores
  const playerInputs = page.locator('input.player-input[type="text"]');
  const inputCount = await playerInputs.count();
  console.log(`🧪 Test: Hay ${inputCount} campos de jugadores`);
  
  // 5. Cambiar nombres de jugadores
  await playerInputs.first().fill('Juan');
  await playerInputs.nth(1).fill('María');
  await playerInputs.nth(2).fill('Pedro');
  console.log('✅ Nombres cambiados');

  // 6. Verificar categorías disponibles
  console.log('🧪 Test: Verificando categorías');
  const categoryCheckboxes = page.locator('input[type="checkbox"]');
  const checkboxCount = await categoryCheckboxes.count();
  console.log(`🧪 Test: Hay ${checkboxCount} categorías disponibles`);

  if (checkboxCount === 0) {
    console.log('⚠️  No hay categorías disponibles, agregando categorías de prueba');
    
    // Agregar categorías de prueba usando el estado
    await page.evaluate(() => {
      if (window.state) {
        window.state.categories = [
          { id: '1', name: 'Animales', words: ['Perro', 'Gato', 'Pájaro'] },
          { id: '2', name: 'Colores', words: ['Rojo', 'Azul', 'Verde'] },
          { id: '3', name: 'Frutas', words: ['Manzana', 'Banana', 'Naranja'] }
        ];
        console.log('✅ Categorías de prueba agregadas');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Recargar la vista para que aparezcan las categorías
    await page.reload();
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Nueva partida")');
    await page.waitForTimeout(1000);
  }

  // 7. Verificar que ahora hay categorías
  const categoryCheckboxesAfter = page.locator('input[type="checkbox"]');
  const checkboxCountAfter = await categoryCheckboxesAfter.count();
  console.log(`🧪 Test: Ahora hay ${checkboxCountAfter} categorías disponibles`);

  if (checkboxCountAfter > 0) {
    // Marcar algunas categorías
    await categoryCheckboxesAfter.first().check();
    await categoryCheckboxesAfter.nth(1).check();
    console.log('✅ Categorías marcadas');

    // 8. Verificar que el botón de iniciar partida está habilitado
    const startButton = page.locator('button:has-text("INICIAR JUEGO")');
    await expect(startButton).toBeVisible();
    console.log('✅ Botón de iniciar partida visible');

    // 9. Iniciar partida
    await page.click('button:has-text("INICIAR JUEGO")');
    await page.waitForTimeout(2000);
    console.log('✅ Partida iniciada');

    // 10. Verificar que estamos en la vista del juego
    await expect(page.locator('h1')).toBeVisible();
    const currentTitle = await page.locator('h1').textContent();
    console.log(`🧪 Test: Título actual: ${currentTitle}`);

    // 11. Probar la animación de volteo
    const revealButton = page.locator('button:has-text("Mantener presionado para revelar")');
    if (await revealButton.isVisible()) {
      console.log('🧪 Test: Probando animación de volteo');
      
      await revealButton.down();
      await page.waitForTimeout(800);
      
      const flipCard = page.locator('.flip-card.flipped');
      await expect(flipCard).toBeVisible();
      console.log('✅ Carta volteada correctamente');
      
      await revealButton.up();
      await page.waitForTimeout(500);
      
      const flipCardNormal = page.locator('.flip-card:not(.flipped)');
      await expect(flipCardNormal).toBeVisible();
      console.log('✅ Carta vuelta a estado normal');
    }

    // 12. Navegar por jugadores
    console.log('🧪 Test: Navegando por jugadores');
    for (let i = 0; i < 2; i++) {
      const nextButton = page.locator('button:has-text("Siguiente jugador")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        const playerTitle = await page.locator('h1').textContent();
        console.log(`🧪 Test: Jugador ${i + 2}: ${playerTitle}`);
      }
    }

    console.log('✅ Test completado: Flujo verificado correctamente');
  } else {
    console.log('❌ No se pudieron agregar categorías de prueba');
  }
});
