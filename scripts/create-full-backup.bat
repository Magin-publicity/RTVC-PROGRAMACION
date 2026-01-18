@echo off
REM Script para crear backup completo de la base de datos RTVC
REM Fecha: 2026-01-09

SET PGPASSWORD=Padres2023
SET BACKUP_DIR=backups\database
SET TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
SET TIMESTAMP=%TIMESTAMP: =0%

echo ========================================
echo CREANDO BACKUP COMPLETO DE BASE DE DATOS
echo ========================================
echo.

REM Crear directorio si no existe
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [1/2] Creando backup SQL completo...
pg_dump -U postgres -h localhost -F c -b -v -f "%BACKUP_DIR%\rtvc_scheduling_FULL_%TIMESTAMP%.backup" rtvc_scheduling

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [2/2] Creando backup SQL en texto plano...
    pg_dump -U postgres -h localhost -f "%BACKUP_DIR%\rtvc_scheduling_FULL_%TIMESTAMP%.sql" rtvc_scheduling

    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo BACKUP COMPLETADO EXITOSAMENTE
        echo ========================================
        echo.
        echo Archivos creados:
        echo   1. %BACKUP_DIR%\rtvc_scheduling_FULL_%TIMESTAMP%.backup ^(formato comprimido^)
        echo   2. %BACKUP_DIR%\rtvc_scheduling_FULL_%TIMESTAMP%.sql ^(formato SQL^)
        echo.
        echo Para restaurar, use:
        echo   pg_restore -U postgres -d rtvc_scheduling -c "%BACKUP_DIR%\rtvc_scheduling_FULL_%TIMESTAMP%.backup"
        echo.
    ) else (
        echo ERROR: Fallo al crear backup SQL
    )
) else (
    echo ERROR: Fallo al crear backup comprimido
)

SET PGPASSWORD=
pause
