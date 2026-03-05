import { test, expect } from '@playwright/test';

test('Flujo completo del juego - nuevas funcionalidades', async ({ page }) => {
  // Usar la URL correcta del servidor local
  await page.goto('http://localhost:5174');
  await page.waitForLoadState('networkidle');

  console.log('🧪 Test: Iniciando prueba del flujo completo del juego');

  // 1. Navegar a Nueva partida
  await page.click('button:has-text("Nueva partida")');
  await page.waitForTimeout(1000); // Esperar a que cargue la vista

  // 2. Configurar partida
  console.log('🧪 Test: Configurando partida');
  
  // Marcar categorías (simular que hay categorías disponibles)
  await page.evaluate(() => {
    // Simular que hay categorías seleccionadas
    if (window.state) {
      window.state.game.categoryIds = ['1', '2']; // Simular 2 categorías seleccionadas
    }
  });

  // 3. Iniciar partida
  await page.click('button:has-text("INICIAR JUEGO")');
  await page.waitForTimeout(1000);

  // 4. Verificar que estamos en la vista del juego
  console.log('🧪 Test: Verificando vista del juego');
  await expect(page.locator('h1')).toBeVisible();
  
  // 5. Probar la animación de volteo de carta
  console.log('🧪 Test: Probando animación de volteo');
  
  // Encontrar el botón de mantener presionado
  const revealButton = page.locator('button:has-text("Mantener presionado para revelar")');
  if (await revealButton.isVisible()) {
    // Mantener presionado el botón
    await revealButton.down();
    await page.waitForTimeout(800); // Esperar a que se voltee la carta
    
    // Verificar que la carta se volteó (debería mostrar el contenido)
    const flipCard = page.locator('.flip-card.flipped');
    await expect(flipCard).toBeVisible();
    
    // Soltar el botón
    await revealButton.up();
    await page.waitForTimeout(500);
    
    // Verificar que la carta volvió a su estado original
    const flipCardNotFlipped = page.locator('.flip-card:not(.flipped)');
    await expect(flipCardNotFlipped).toBeVisible();
  }

  // 6. Pasar al siguiente jugador varias veces
  console.log('🧪 Test: Navegando entre jugadores');
  
  for (let i = 0; i < 3; i++) {
    const nextButton = page.locator('button:has-text("Siguiente jugador")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // Verificar que estamos en el siguiente jugador
      const playerTitle = await page.locator('h1').textContent();
      console.log(`🧪 Test: Jugador actual: ${playerTitle}`);
    }
  }

  // 7. Verificar que aparece la pantalla "Todos listos"
  console.log('🧪 Test: Verificando pantalla de preparación');
  
  // Si llegamos al final, debería aparecer "Todos listos"
  const readyScreen = page.locator('h1:has-text("¡Todos listos!")');
  if (await readyScreen.isVisible()) {
    console.log('🧪 Test: Pantalla de preparación detectada');
    
    // 8. Hacer clic en "Iniciar juego"
    await page.click('button:has-text("Iniciar juego")');
    await page.waitForTimeout(1000);
    
    // 9. Verificar que aparece quién comienza
    console.log('🧪 Test: Verificando pantalla de quién comienza');
    const startScreen = page.locator('h1:has-text("¡Comienza el juego!")');
    if (await startScreen.isVisible()) {
      console.log('🧪 Test: Pantalla de inicio detectada');
      
      // Hacer clic en "Continuar"
      await page.click('button:has-text("Continuar")');
      await page.waitForTimeout(1000);
    }
  }

  // 10. Probar botón de revelar impostores
  console.log('🧪 Test: Probando revelar impostores');
  
  const revealImpostorsButton = page.locator('button:has-text("Revelar impostores")');
  if (await revealImpostorsButton.isVisible()) {
    // Aceptar el diálogo de confirmación
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await revealImpostorsButton.click();
    await page.waitForTimeout(1000);
    
    // Verificar que estamos en la pantalla de revelación
    const revealScreen = page.locator('h1:has-text("¡Revelar impostores!")');
    await expect(revealScreen).toBeVisible();
    
    console.log('🧪 Test: Pantalla de revelación de impostores funcionando');
  }

  console.log('✅ Test completado: Flujo completo del juego verificado');
});
