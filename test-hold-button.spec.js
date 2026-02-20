import { test, expect } from '@playwright/test';

test('Hold button funciona correctamente', async ({ page }) => {
  // Ir a nueva partida
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.click('button:has-text("Nueva partida")');
  await page.waitForURL('/new');
  
  // Marcar categorías
  await page.evaluate(() => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes[0].checked = true;
    checkboxes[0].dispatchEvent(new Event('change', { bubbles: true }));
  });
  
  await page.waitForTimeout(300);
  
  // Iniciar partida
  await page.click('button:has-text("INICIAR JUEGO")');
  await page.waitForURL('**/round');
  
  console.log('✅ Partida iniciada');
  
  // Simular mantener presionado durante 1.3 segundos
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
  
  // Verificar que la palabra se reveló
  await expect(page.locator('button:has-text("Siguiente jugador")')).toBeVisible({ timeout: 2000 });
  console.log('✅ Hold button reveló la palabra correctamente');
});
