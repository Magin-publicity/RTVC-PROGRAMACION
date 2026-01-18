// backend/routes/contracts.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * GET /api/contracts/expiring-soon
 * Obtiene contratos que vencen en los próximos N días
 */
router.get('/expiring-soon', async (req, res) => {
  try {
    const { days = 30 } = req.query; // Por defecto 30 días

    const result = await pool.query(`
      SELECT
        id,
        name,
        role,
        area,
        email,
        phone,
        contract_start,
        contract_end,
        CASE
          WHEN contract_end < CURRENT_DATE THEN 'expired'
          WHEN contract_end <= CURRENT_DATE + INTERVAL '${parseInt(days)} days' THEN 'expiring_soon'
          ELSE 'active'
        END as status,
        (contract_end - CURRENT_DATE) as days_until_expiry
      FROM personnel
      WHERE contract_end IS NOT NULL
        AND contract_end <= CURRENT_DATE + INTERVAL '${parseInt(days)} days'
      ORDER BY contract_end ASC
    `);

    const expired = result.rows.filter(p => p.status === 'expired');
    const expiringSoon = result.rows.filter(p => p.status === 'expiring_soon');

    res.json({
      success: true,
      data: {
        expired,
        expiringSoon,
        all: result.rows,
        totalExpired: expired.length,
        totalExpiringSoon: expiringSoon.length
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener contratos próximos a vencer:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener contratos',
      details: error.message
    });
  }
});

/**
 * GET /api/contracts/report
 * Genera reporte de vencimientos en formato estructurado para PDF/Excel
 */
router.get('/report', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await pool.query(`
      SELECT
        id,
        name,
        role,
        area,
        email,
        phone,
        TO_CHAR(contract_start, 'DD/MM/YYYY') as fecha_inicio,
        TO_CHAR(contract_end, 'DD/MM/YYYY') as fecha_vencimiento,
        contract_end,
        CASE
          WHEN contract_end < CURRENT_DATE THEN 'VENCIDO'
          WHEN contract_end <= CURRENT_DATE + INTERVAL '8 days' THEN 'URGENTE'
          WHEN contract_end <= CURRENT_DATE + INTERVAL '${parseInt(days)} days' THEN 'PRÓXIMO'
          ELSE 'VIGENTE'
        END as prioridad,
        (contract_end - CURRENT_DATE) as dias_restantes
      FROM personnel
      WHERE contract_end IS NOT NULL
        AND contract_end <= CURRENT_DATE + INTERVAL '${parseInt(days)} days'
      ORDER BY
        CASE
          WHEN contract_end < CURRENT_DATE THEN 1
          WHEN contract_end <= CURRENT_DATE + INTERVAL '8 days' THEN 2
          ELSE 3
        END,
        contract_end ASC
    `);

    res.json({
      success: true,
      reportDate: new Date().toISOString(),
      daysRange: parseInt(days),
      totalContracts: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error al generar reporte:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar reporte',
      details: error.message
    });
  }
});

/**
 * GET /api/contracts/validate/:personnelId
 * Valida el estado del contrato de un empleado específico
 */
router.get('/validate/:personnelId', async (req, res) => {
  try {
    const { personnelId } = req.params;
    const { date } = req.query; // Fecha a validar (opcional, por defecto hoy)

    const checkDate = date || new Date().toISOString().split('T')[0];

    const result = await pool.query(`
      SELECT
        id,
        name,
        role,
        contract_end,
        CASE
          WHEN contract_end IS NULL THEN TRUE
          WHEN contract_end::date >= $2::date THEN TRUE
          ELSE FALSE
        END as is_valid,
        CASE
          WHEN contract_end IS NULL THEN NULL
          WHEN contract_end < CURRENT_DATE THEN 'expired'
          WHEN contract_end <= CURRENT_DATE + INTERVAL '8 days' THEN 'warning'
          ELSE 'active'
        END as status,
        (contract_end::date - $2::date) as days_until_expiry
      FROM personnel
      WHERE id = $1
    `, [personnelId, checkDate]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Empleado no encontrado'
      });
    }

    const employee = result.rows[0];

    res.json({
      success: true,
      data: {
        ...employee,
        canAutoAssign: employee.is_valid,
        requiresManualConfirmation: !employee.is_valid || employee.status === 'warning'
      }
    });

  } catch (error) {
    console.error('❌ Error al validar contrato:', error);
    res.status(500).json({
      success: false,
      error: 'Error al validar contrato',
      details: error.message
    });
  }
});

module.exports = router;
