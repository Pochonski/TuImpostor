import { test, expect } from '@playwright/test';

test('checkbox categories state bug', async ({ page }) => {
  // Asegúrate que el servidor esté corriendo en 5173
  await page.goto('http://localhost:5173/');

  // Navegar a Nueva partida
  await page.click('button:has-text("Nueva partida")');
  await page.waitForURL('/new');

  // Esperar que carguen las categorías
  await page.waitForSelector('input[type="checkbox"]');

  // Marcar la primera categoría
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await firstCheckbox.check();

  // Esperar un poco a que se actualice el estado
  await page.waitForTimeout(200);

  // Capturar logs de la consola
  const logs = [];
  page.on('console', msg => {
    logs.push(msg.text());
  });

  // Hacer clic en Empezar partida para disparar el console.log
  await page.click('button:has-text("INICIAR JUEGO")');

  // Esperar un poco
  await page.waitForTimeout(500);

  // Mostrar logs capturados
  console.log('=== CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));

  // Verificar que categoryIds no esté vacío
  const categoryIdsLog = logs.find(l => l.includes('categoryIds:'));
  console.log('categoryIds log:', categoryIdsLog);

  // Opcional: verificar si hay alerta
  page.on('dialog', async dialog => {
    console.log('ALERT:', dialog.message());
    await dialog.dismiss();
  });

  // Esperar un poco más antes de terminar
  await page.waitForTimeout(1000);
});
