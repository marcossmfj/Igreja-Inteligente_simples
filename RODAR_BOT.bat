@echo off
echo ====================================================
echo      INICIANDO BOT DE VALIDACAO SaaS
echo ====================================================
echo.
echo 1. Instalando navegadores do Playwright...
npx playwright install chromium
echo.
echo 2. Executando testes automatizados (Headless)...
npx playwright test
echo.
echo ====================================================
echo      TESTES CONCLUIDOS! Verifique o relatorio.
echo ====================================================
pause
