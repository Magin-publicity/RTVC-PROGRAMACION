// src/services/personnelOrderService.js

/**
 * Obtiene la clave de semana en formato YYYY-WW
 */
function getWeekKey(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();

  // Calcular número de semana ISO
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Servicio para gestionar el orden personalizado del personal por área y fecha
 */
export const personnelOrderService = {
  /**
   * Obtiene el orden personalizado de un área específica para una fecha
   * @param {string} area - Nombre del área
   * @param {Date} date - Fecha para la cual obtener el orden (opcional)
   * @returns {Array<string>} Array de nombres en orden personalizado
   */
  getAreaOrder(area, date = null) {
    try {
      // Si se proporciona fecha, usar orden específico de esa semana
      if (date) {
        const weekKey = getWeekKey(date);
        const storageKey = `rtvc_personnel_order_${weekKey}`;
        const dateOrders = localStorage.getItem(storageKey);
        if (dateOrders) {
          const orders = JSON.parse(dateOrders);
          if (orders[area]) return orders[area];
        }
      }

      // Fallback: intentar obtener orden global (compatibilidad con versión anterior)
      const globalOrders = localStorage.getItem('rtvc_personnel_custom_order');
      if (!globalOrders) return null;

      const orders = JSON.parse(globalOrders);
      return orders[area] || null;
    } catch (error) {
      console.error('Error al obtener orden personalizado:', error);
      return null;
    }
  },

  /**
   * Guarda el orden personalizado de un área específica para una fecha
   * @param {string} area - Nombre del área
   * @param {Array<string>} personnelNames - Array de nombres en orden
   * @param {Date} date - Fecha para la cual guardar el orden (opcional)
   */
  setAreaOrder(area, personnelNames, date = null) {
    try {
      // Si se proporciona fecha, guardar orden específico para esa semana
      if (date) {
        const weekKey = getWeekKey(date);
        const storageKey = `rtvc_personnel_order_${weekKey}`;

        const dateOrders = localStorage.getItem(storageKey);
        const orders = dateOrders ? JSON.parse(dateOrders) : {};

        orders[area] = personnelNames;

        localStorage.setItem(storageKey, JSON.stringify(orders));
        console.log(`✅ Orden guardado para ${area} en semana ${weekKey}:`, personnelNames);
      } else {
        // Guardar en orden global (compatibilidad con versión anterior)
        const allOrders = localStorage.getItem('rtvc_personnel_custom_order');
        const orders = allOrders ? JSON.parse(allOrders) : {};

        orders[area] = personnelNames;

        localStorage.setItem('rtvc_personnel_custom_order', JSON.stringify(orders));
        console.log(`✅ Orden guardado globalmente para ${area}:`, personnelNames);
      }
    } catch (error) {
      console.error('Error al guardar orden personalizado:', error);
    }
  },

  /**
   * Mueve una persona hacia arriba en el orden
   * @param {string} area - Nombre del área
   * @param {Array} personnel - Array de objetos de personal
   * @param {number} currentIndex - Índice actual de la persona
   * @param {Date} date - Fecha para la cual guardar el orden (opcional)
   * @returns {Array} Nuevo array ordenado
   */
  moveUp(area, personnel, currentIndex, date = null) {
    if (currentIndex <= 0) return personnel;

    const newOrder = [...personnel];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] =
      [newOrder[currentIndex], newOrder[currentIndex - 1]];

    // Guardar el nuevo orden con la fecha
    this.setAreaOrder(area, newOrder.map(p => p.name), date);

    return newOrder;
  },

  /**
   * Mueve una persona hacia abajo en el orden
   * @param {string} area - Nombre del área
   * @param {Array} personnel - Array de objetos de personal
   * @param {number} currentIndex - Índice actual de la persona
   * @param {Date} date - Fecha para la cual guardar el orden (opcional)
   * @returns {Array} Nuevo array ordenado
   */
  moveDown(area, personnel, currentIndex, date = null) {
    if (currentIndex >= personnel.length - 1) return personnel;

    const newOrder = [...personnel];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] =
      [newOrder[currentIndex + 1], newOrder[currentIndex]];

    // Guardar el nuevo orden con la fecha
    this.setAreaOrder(area, newOrder.map(p => p.name), date);

    return newOrder;
  },

  /**
   * Resetea el orden de un área al orden por defecto del PDF
   * @param {string} area - Nombre del área
   * @param {Date} date - Fecha para la cual resetear el orden (opcional)
   */
  resetAreaOrder(area, date = null) {
    try {
      if (date) {
        const weekKey = getWeekKey(date);
        const storageKey = `rtvc_personnel_order_${weekKey}`;
        const dateOrders = localStorage.getItem(storageKey);
        if (!dateOrders) return;

        const orders = JSON.parse(dateOrders);
        delete orders[area];

        localStorage.setItem(storageKey, JSON.stringify(orders));
        console.log(`🔄 Orden reseteado para ${area} en semana ${weekKey}`);
      } else {
        const allOrders = localStorage.getItem('rtvc_personnel_custom_order');
        if (!allOrders) return;

        const orders = JSON.parse(allOrders);
        delete orders[area];

        localStorage.setItem('rtvc_personnel_custom_order', JSON.stringify(orders));
        console.log(`🔄 Orden reseteado globalmente para ${area}`);
      }
    } catch (error) {
      console.error('Error al resetear orden:', error);
    }
  },

  /**
   * Limpia todos los órdenes personalizados
   */
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Todos los órdenes personalizados eliminados');
    } catch (error) {
      console.error('Error al limpiar órdenes:', error);
    }
  }
};
