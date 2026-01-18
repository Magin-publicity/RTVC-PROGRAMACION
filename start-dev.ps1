# Script para abrir dos consolas y arrancar backend y frontend en desarrollo
# No modifica código, solo facilita iniciar ambos servicios.

Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit","-Command","cd 'C:/Users/JUANP/OneDrive/Desktop/RTVC PROGRAMACION/backend'; npm run dev"
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit","-Command","cd 'C:/Users/JUANP/OneDrive/Desktop/RTVC PROGRAMACION'; npm run dev"
