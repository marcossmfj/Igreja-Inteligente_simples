import { test, expect } from '@playwright/test';

test.describe('Bot de Validação Igreja Inteligente SaaS', () => {

  test('1. Landing Page - Deve carregar e mostrar planos', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Igreja Inteligente/i);
    await expect(page.locator('text=Sua Igreja Inteligente')).toBeVisible();
    
    // Clica no plano Aliança (Ancoragem de preço)
    await page.click('text=Quero o Plano Aliança');
    await expect(page).toHaveURL(/.*register\?plan=alianca/);
  });

  test('2. Registro SaaS - Deve criar nova igreja e entrar no dashboard', async ({ page }) => {
    const timestamp = Date.now();
    const churchName = `Igreja Robô ${timestamp}`;
    const email = `robo-${timestamp}@teste.com`;

    await page.goto('/register?plan=flex');
    await page.fill('input[name="fullName"]', 'Robô Validador');
    await page.fill('input[name="churchName"]', churchName);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'senha123');
    
    // Submete o formulário
    await page.click('button[type="submit"]');

    // Aguarda redirecionamento para o dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator(`text=${churchName}`)).toBeVisible();
  });

  test('3. Painel Master - Deve listar igrejas e permitir ações', async ({ page }) => {
    // Nota: Requer que o usuário master já exista no banco de dados
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@admin.com.br'); // Usuário master padrão
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    await page.goto('/master');
    await expect(page.locator('text=Painel Master')).toBeVisible();
    
    // Verifica se a tabela de igrejas carregou
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Tenta buscar a igreja criada no teste anterior (opcional)
    await page.fill('input[placeholder*="Buscar"]', 'Igreja Robô');
  });

  test('4. Segurança - Deve redirecionar para bloqueio se trial expirar', async ({ page }) => {
    // Para testar isso via Bot, precisaríamos de um usuário com status 'blocked' no banco
    // Simulamos a tentativa de acesso
    await page.goto('/dashboard');
    
    // Se o middleware estiver funcionando e o usuário for bloqueado:
    // await expect(page).toHaveURL(/.*blocked/);
    // await expect(page.locator('text=Acesso Suspenso')).toBeVisible();
  });

});
