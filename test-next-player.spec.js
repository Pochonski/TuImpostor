import { test, expect } from '@playwright/test';

test('Flujo completo de ronda - revelar y pasar al siguiente jugador', async ({ page }) => {
  // Ir a nueva partida
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.click('button:has-text("Nueva partida")');
  await page.waitForURL('/new');
  
  // Marcar 2 categorías
  await page.evaluate(() => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes[0].checked = true;
    checkboxes[0].dispatchEvent(new Event('change', { bubbles: true }));
    checkboxes[1].checked = true;
    checkboxes[1].dispatchEvent(new Event('change', { bubbles: true }));
  });
  
  await page.waitForTimeout(300);
  
  // Iniciar partida con 4 jugadores
  await page.click('button:has-text("INICIAR JUEGO")');
  await page.waitForURL('**/round');
  
  console.log('✅ Partida iniciada');
  
  // Verificar que estamos en el Jugador 1
  const player1Title = page.locator('h1:has-text("Jugador 1")');
  await expect(player1Title).toBeVisible();
  console.log('✅ En turno del Jugador 1');
  
  // Mantener presionado para revelar
  await page.evaluate(async () => {
    const buttons = document.querySelectorAll('button');
    const holdBtn = Array.from(buttons).find(b => b.textContent.includes('Mantener presionado'));
    
    if (holdBtn) {
      holdBtn.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1300));
      
      document.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    }
  });
  
  await page.waitForTimeout(500);
  console.log('✅ Palabra revelada para Jugador 1');
  
  // Hacer clic en "Siguiente jugador"
  await page.click('button:has-text("Siguiente jugador")');
  await page.waitForTimeout(500);
  
  console.log('✅ Clic en "Siguiente jugador"');
  
  // Debug: ver el contenido actual
  const currentContent = await page.textContent('body');
  console.log('📋 Contenido después del clic:');
  console.log(currentContent?.substring(0, 400));
  
  // Verificar que estamos en el Jugador 2
  const player2Title = page.locator('h1:has-text("Jugador 2")');
  await expect(player2Title).toBeVisible({ timeout: 2000 });
  console.log('✅ Transición correcta a Jugador 2');
  
  // Verificar que el botón "Mantener presionado" está disponible nuevamente
  const holdBtn = page.locator('button:has-text("Mantener presionado para revelar")');
  await expect(holdBtn).toBeVisible();
  console.log('✅ Botón "Mantener presionado" disponible para Jugador 2');
  
  // Revelar palabra del Jugador 2
  await page.evaluate(async () => {
    const buttons = document.querySelectorAll('button');
    const holdBtn = Array.from(buttons).find(b => b.textContent.includes('Mantener presionado'));
    
    if (holdBtn) {
      holdBtn.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1300));
      
      document.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    }
  });
  
  await page.waitForTimeout(500);
  
  // Siguiente jugador
  await page.click('button:has-text("Siguiente jugador")');
  await page.waitForTimeout(500);
  
  // Verificar que estamos en Jugador 3
  const player3Title = page.locator('h1:has-text("Jugador 3")');
  await expect(player3Title).toBeVisible({ timeout: 2000 });
  console.log('✅ Transición correcta a Jugador 3');
});
