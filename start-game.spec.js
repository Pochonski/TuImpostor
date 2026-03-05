import { test, expect } from '@playwright/test';

test('Iniciar una partida', async ({ page, context }) => {
  // Capturar dialogs/alertas
  let dialogMessage = null;
  page.on('dialog', async dialog => {
    dialogMessage = dialog.message();
    console.log('⚠️ ALERTA/DIÁLOGO:', dialogMessage);
    await dialog.dismiss();
  });

  // Capturar logs de consola
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ level: msg.type(), text: msg.text() });
  });

  // Ir a la página principal
  await page.goto('http://localhost:5174/');
  await page.waitForLoadState('networkidle');
  console.log('✅ Página cargada');

  // Hacer clic en "Nueva partida"
  const newGameButton = page.locator('button:has-text("Nueva partida")');
  await newGameButton.click();
  await page.waitForURL('/new', { timeout: 5000 });
  console.log('✅ Navegado a Nueva partida');

  // Esperar que carguen las categorías (checkboxes)
  await page.waitForSelector('input[type="checkbox"]', { timeout: 5000 });
  console.log('✅ Categorías cargadas');

  // Marcar las primeras 2 categorías usando JavaScript directo
  const count = await page.locator('input[type="checkbox"]').count();
  console.log(`📍 Total de categorías encontradas: ${count}`);

  for (let i = 0; i < Math.min(2, count); i++) {
    // Usar JavaScript directo para marcar el checkbox y disparar el evento
    await page.evaluate((index) => {
      const checkbox = document.querySelectorAll('input[type="checkbox"]')[index];
      if (checkbox) {
        checkbox.checked = true;
        // Disparar el evento onchange
        const event = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(event);
      }
    }, i);
    await page.waitForTimeout(200);
  }
  console.log('✅ Categorías marcadas');

  // Esperar a que se actualice el estado
  await page.waitForTimeout(300);

  // Verificar los valores de los inputs antes de iniciar
  const playerInput = await page.locator('input[type="number"]').nth(0).inputValue();
  const impostorInput = await page.locator('input[type="number"]').nth(1).inputValue();
  console.log(`📍 Configuración - Jugadores: ${playerInput}, Impostores: ${impostorInput}`);

  // Hacer clic en "Empezar partida"
  const startButton = page.locator('button:has-text("Empezar partida")');
  await startButton.click();
  console.log('✅ Botón "Empezar partida" presionado');

  // Esperar a la navegación a /round o detectar error
  try {
    await page.waitForURL('**/round', { timeout: 3000 });
    console.log('✅ Navegado a la pantalla de juego (/round)');
  } catch (e) {
    console.log('⚠️ No se navigó a /round en el tiempo esperado');
    console.log('URL actual:', page.url());
  }

  // Esperar un poco más para que se renderice completamente
  await page.waitForTimeout(500);

  // Capturar el estado actual de la página
  const pageContent = await page.evaluate(() => {
    return {
      url: window.location.href,
      bodyText: document.body.innerText.substring(0, 500),
      title: document.title,
    };
  });

  console.log('\n=== ESTADO FINAL ===');
  console.log('URL:', pageContent.url);
  console.log('Título:', pageContent.title);
  console.log('Contenido (primeros 500 caracteres):');
  console.log(pageContent.bodyText);

  if (dialogMessage) {
    console.log('\n⚠️ ERRORES ENCONTRADOS:');
    console.log('- ' + dialogMessage);
  }

  if (consoleLogs.length > 0) {
    console.log('\n📋 LOGS DE CONSOLA:');
    consoleLogs.forEach(log => {
      if (log.level === 'log') {
        console.log(`[LOG] ${log.text}`);
      } else if (log.level === 'error') {
        console.log(`[ERROR] ${log.text}`);
      }
    });
  }
});

test('Marcar y desmarcar checkboxes', async ({ page }) => {
  // Ir a nueva partida
  await page.goto('http://localhost:5174/');
  await page.waitForLoadState('networkidle');
  await page.click('button:has-text("Nueva partida")');
  await page.waitForURL('/new');
  await page.waitForSelector('input[type="checkbox"]');

  console.log('🧪 Test: Marcar y desmarcar categorías');

  // Obtener los labels de las categorías
  const labels = await page.locator('label:has(input[type="checkbox"])').count();
  console.log(`📍 Total de categorías: ${labels}`);

  // Marcar la primera categoría
  const firstCheckbox = await page.locator('input[type="checkbox"]').first();
  await firstCheckbox.click();
  await page.waitForTimeout(200);

  let isChecked = await firstCheckbox.isChecked();
  console.log(`✅ Primera categoría marcada: ${isChecked}`);
  expect(isChecked).toBe(true);

  // Desmarcar la primera categoría
  await firstCheckbox.click();
  await page.waitForTimeout(200);

  isChecked = await firstCheckbox.isChecked();
  console.log(`✅ Primera categoría desmarcada: ${isChecked}`);
  expect(isChecked).toBe(false);

  // Marcar dos categorías
  await page.locator('input[type="checkbox"]').nth(0).click();
  await page.locator('input[type="checkbox"]').nth(1).click();
  await page.waitForTimeout(300);

  const checkbox1 = await page.locator('input[type="checkbox"]').nth(0).isChecked();
  const checkbox2 = await page.locator('input[type="checkbox"]').nth(1).isChecked();
  console.log(`✅ Dos categorías marcadas: [${checkbox1}, ${checkbox2}]`);
  expect(checkbox1).toBe(true);
  expect(checkbox2).toBe(true);

  // Intentar iniciar la partida
  await page.click('button:has-text("Empezar partida")');
  await page.waitForTimeout(500);

  const url = page.url();
  console.log(`✅ URL después de iniciar: ${url}`);
  expect(url).toContain('/round');
});
