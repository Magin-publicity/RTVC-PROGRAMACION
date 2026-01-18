// scripts/backup-db.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, '../backups');
const date = new Date().toISOString().split('T')[0];
const filename = `backup_${date}.sql`;
const filepath = path.join(backupDir, filename);

// Crear directorio si no existe
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const command = `pg_dump -U postgres rtvc_scheduling > ${filepath}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error al crear backup:', error);
    return;
  }
  console.log('✅ Backup creado exitosamente:', filename);
});