// src/hooks/useContractValidation.js
import { useMemo } from 'react';

/**
 * Hook para validación de contratos
 * Actúa como capa de validación externa sin modificar la lógica de programación existente
 */
export const useContractValidation = (personnel = []) => {

  const contractStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche

    const statusMap = {};
    const expiringSoon = [];
    const expired = [];

    personnel.forEach(person => {
      if (!person.contract_end) {
        // Sin fecha de fin = contrato indefinido o no especificado
        statusMap[person.id] = {
          status: 'active',
          daysUntilExpiry: null,
          isExpired: false,
          isExpiringSoon: false,
          canAutoAssign: true
        };
        return;
      }

      // Parsear fecha de fin de contrato (sin timezone para evitar problemas)
      const [year, month, day] = person.contract_end.split('T')[0].split('-');
      const contractEndDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      contractEndDate.setHours(0, 0, 0, 0);

      // Calcular días hasta el vencimiento
      const diffTime = contractEndDate - today;
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isExpired = daysUntilExpiry < 0;
      const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 8;

      const status = {
        status: isExpired ? 'expired' : isExpiringSoon ? 'warning' : 'active',
        daysUntilExpiry,
        isExpired,
        isExpiringSoon,
        canAutoAssign: !isExpired, // No asignar automáticamente si está vencido
        contractEndDate: person.contract_end
      };

      statusMap[person.id] = status;

      if (isExpired) {
        expired.push({ ...person, ...status });
      } else if (isExpiringSoon) {
        expiringSoon.push({ ...person, ...status });
      }
    });

    return {
      statusMap,
      expiringSoon: expiringSoon.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
      expired: expired.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
      totalExpiringSoon: expiringSoon.length,
      totalExpired: expired.length
    };
  }, [personnel]);

  /**
   * Obtiene el estado del contrato de una persona
   */
  const getContractStatus = (personId) => {
    return contractStatus.statusMap[personId] || {
      status: 'active',
      daysUntilExpiry: null,
      isExpired: false,
      isExpiringSoon: false,
      canAutoAssign: true
    };
  };

  /**
   * Verifica si una persona puede ser asignada automáticamente
   */
  const canAutoAssign = (personId) => {
    const status = getContractStatus(personId);
    return status.canAutoAssign;
  };

  /**
   * Filtra personal que puede ser asignado automáticamente
   * (excluye a los que tienen contrato vencido)
   */
  const filterAssignable = (personnelList) => {
    return personnelList.filter(person => canAutoAssign(person.id));
  };

  /**
   * Obtiene mensaje de advertencia para asignación manual
   */
  const getManualAssignmentWarning = (personId) => {
    const status = getContractStatus(personId);

    if (status.isExpired) {
      return {
        show: true,
        type: 'error',
        message: `Este empleado tiene el contrato vencido desde hace ${Math.abs(status.daysUntilExpiry)} día(s). ¿Desea asignarlo de todas formas?`
      };
    }

    if (status.isExpiringSoon) {
      return {
        show: true,
        type: 'warning',
        message: `El contrato de este empleado vence en ${status.daysUntilExpiry} día(s). ¿Desea continuar con la asignación?`
      };
    }

    return { show: false };
  };

  /**
   * Obtiene CSS classes para resaltar en UI según estado del contrato
   */
  const getStatusClasses = (personId) => {
    const status = getContractStatus(personId);

    if (status.isExpired) {
      return {
        border: 'border-red-500 border-2',
        bg: 'bg-red-50',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-800'
      };
    }

    if (status.isExpiringSoon) {
      return {
        border: 'border-yellow-500 border-2',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        badge: 'bg-yellow-100 text-yellow-800'
      };
    }

    return {
      border: '',
      bg: '',
      text: '',
      badge: ''
    };
  };

  /**
   * Obtiene el texto del badge de estado del contrato
   */
  const getStatusBadge = (personId) => {
    const status = getContractStatus(personId);

    if (status.isExpired) {
      return {
        text: '⚠️ Contrato Vencido',
        show: true
      };
    }

    if (status.isExpiringSoon) {
      return {
        text: `⚠️ Vence en ${status.daysUntilExpiry} día${status.daysUntilExpiry !== 1 ? 's' : ''}`,
        show: true
      };
    }

    return { show: false };
  };

  return {
    contractStatus,
    getContractStatus,
    canAutoAssign,
    filterAssignable,
    getManualAssignmentWarning,
    getStatusClasses,
    getStatusBadge
  };
};
