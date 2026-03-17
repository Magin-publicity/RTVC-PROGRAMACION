// src/services/personnelOrderService.js

const STORAGE_KEY = 'rtvc_personnel_custom_order';

/**
 * Servicio para gestionar el orden personalizado del personal por área
 */
export const personnelOrderService = {
  /**
   * Obtiene el orden personalizado de un área específica
   * @param {string} area - Nombre del área
   * @returns {Array<string>} Array de nombres en orden personalizado
   */
  getAreaOrder(area) {
    try {
      const allOrders = localStorage.getItem(STORAGE_KEY);
      if (!allOrders) return null;

      const orders = JSON.parse(allOrders);
      return orders[area] || null;
    } catch (error) {
      console.error('Error al obtener orden personalizado:', error);
      return null;
    }
  },

  /**
   * Guarda el orden personalizado de un área específica
   * @param {string} area - Nombre del área
   * @param {Array<string>} personnelNames - Array de nombres en orden
   */
  setAreaOrder(area, personnelNames) {
    try {
      const allOrders = localStorage.getItem(STORAGE_KEY);
      const orders = allOrders ? JSON.parse(allOrders) : {};

      orders[area] = personnelNames;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      console.log(`✅ Orden guardado para ${area}:`, personnelNames);
    } catch (error) {
      console.error('Error al guardar orden personalizado:', error);
    }
  },

  /**
   * Mueve una persona hacia arriba en el orden
   * @param {string} area - Nombre del área
   * @param {Array} personnel - Array de objetos de personal
   * @param {number} currentIndex - Índice actual de la persona
   * @returns {Array} Nuevo array ordenado
   */
  moveUp(area, personnel, currentIndex) {
    if (currentIndex <= 0) return personnel;

    const newOrder = [...personnel];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] =
      [newOrder[currentIndex], newOrder[currentIndex - 1]];

    // Guardar el nuevo orden
    this.setAreaOrder(area, newOrder.map(p => p.name));

    return newOrder;
  },

  /**
   * Mueve una persona hacia abajo en el orden
   * @param {string} area - Nombre del área
   * @param {Array} personnel - Array de objetos de personal
   * @param {number} currentIndex - Índice actual de la persona
   * @returns {Array} Nuevo array ordenado
   */
  moveDown(area, personnel, currentIndex) {
    if (currentIndex >= personnel.length - 1) return personnel;

    const newOrder = [...personnel];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] =
      [newOrder[currentIndex + 1], newOrder[currentIndex]];

    // Guardar el nuevo orden
    this.setAreaOrder(area, newOrder.map(p => p.name));

    return newOrder;
  },

  /**
   * Resetea el orden de un área al orden por defecto del PDF
   * @param {string} area - Nombre del área
   */
  resetAreaOrder(area) {
    try {
      const allOrders = localStorage.getItem(STORAGE_KEY);
      if (!allOrders) return;

      const orders = JSON.parse(allOrders);
      delete orders[area];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      console.log(`🔄 Orden reseteado para ${area}`);
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
