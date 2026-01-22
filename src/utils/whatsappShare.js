// src/utils/whatsappShare.js
// Utilidades para compartir información por WhatsApp

/**
 * Genera mensaje formateado para despacho de vehículo
 */
export const generateVehicleDispatchMessage = (dispatch) => {
  const {
    date,
    shift,
    vehiclePlate,
    driverName,
    routeNumber,
    zone,
    passengersCount,
    program,
    destinations = []
  } = dispatch;

  const formattedDate = new Date(date).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let message = `📝 *DESPACHO RTVC*\n\n`;
  message += `📅 Fecha: ${formattedDate}\n`;
  message += `⏰ Turno: ${shift}\n`;
  message += `📺 Programa: ${program}\n\n`;
  message += `🚗 *Vehículo:* ${vehiclePlate}\n`;
  message += `👤 *Conductor:* ${driverName}\n`;
  message += `📍 *Ruta #${routeNumber}* - Zona: ${zone}\n`;
  message += `👥 Pasajeros: ${passengersCount}\n\n`;

  if (destinations && destinations.length > 0) {
    message += `📍 *Destinos:*\n`;
    destinations.forEach((dest, idx) => {
      message += `${idx + 1}. ${dest.address} - ${dest.neighborhood}\n`;
      if (dest.passengerName) {
        message += `   👤 ${dest.passengerName}\n`;
      }
    });
    message += `\n`;
  }

  message += `⏱️ Hora de despacho: ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}\n\n`;
  message += `_Enviado desde RTVC Programación_`;

  return message;
};

/**
 * Genera mensaje formateado para solicitud de alimentación
 */
export const generateMealRequestMessage = (meal) => {
  const {
    date,
    mealType,
    personnelName,
    cargo,
    program,
    quantity = 1,
    specialRequirements
  } = meal;

  const formattedDate = new Date(date).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mealTypeEmoji = {
    'DESAYUNO': '☕',
    'ALMUERZO': '🍱',
    'CENA': '🌙'
  };

  let message = `${mealTypeEmoji[mealType] || '🍽️'} *SOLICITUD DE ALIMENTACIÓN - ${mealType}*\n\n`;
  message += `📅 Fecha: ${formattedDate}\n`;
  message += `📺 Programa: ${program}\n\n`;
  message += `👤 *Personal:* ${personnelName}\n`;
  message += `💼 *Cargo:* ${cargo}\n`;
  message += `#️⃣ *Cantidad:* ${quantity}\n\n`;

  if (specialRequirements) {
    message += `📝 *Requerimientos especiales:*\n${specialRequirements}\n\n`;
  }

  message += `⏱️ Hora de solicitud: ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}\n\n`;
  message += `_Enviado desde RTVC Programación_`;

  return message;
};

/**
 * Comparte mensaje por WhatsApp usando la API nativa del navegador
 */
export const shareViaWhatsApp = async (message, phoneNumber = null) => {
  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(message);

  // Si hay un número específico, usar wa.me
  if (phoneNumber) {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
    return;
  }

  // Intentar usar la API de compartir nativa primero (mejor para móviles)
  if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    try {
      await navigator.share({
        title: 'Despacho RTVC',
        text: message
      });
      return;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('Error compartiendo:', error);
      }
      // Si falla, continuar con whatsapp:// protocol
    }
  }

  // Usar whatsapp:// protocol (funciona en móviles con WhatsApp instalado)
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = `whatsapp://send?text=${encodedMessage}`;
  } else {
    // En desktop, abrir WhatsApp Web
    window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
  }
};

/**
 * Genera mensaje formateado para despacho de flota (estilo nuevo)
 */
export const generateFleetDispatchMessage = (dispatch) => {
  const {
    destination,
    journalist,
    cameraman,
    assistant,
    director,
    liveu_unit,
    vehicle_plate,
    driver_name,
    departure_time,
    program_name,
    notes
  } = dispatch;

  let message = `🚀 *NUEVO DESPACHO RTVC*\n\n`;

  // Destino
  if (destination) {
    message += `📍 *Destino:* ${destination}\n`;
  }

  // Equipo (solo agregar si existe)
  const team = [];
  if (journalist) team.push(`Periodista: ${journalist}`);
  if (cameraman) team.push(`Camarógrafo: ${cameraman}`);
  if (assistant) team.push(`Asistente: ${assistant}`);
  if (director) team.push(`Realizador: ${director}`);

  if (team.length > 0) {
    message += `🎥 *Equipo:*\n`;
    team.forEach(member => {
      message += `   • ${member}\n`;
    });
  }

  // Transmisión LiveU
  if (liveu_unit !== undefined && liveu_unit !== null) {
    const liveuStatus = liveu_unit ? `Sí - Unidad #${liveu_unit}` : 'No';
    message += `📡 *Transmisión:* ${liveuStatus}\n`;
  }

  // Vehículo y conductor
  if (vehicle_plate || driver_name) {
    message += `🚗 *Vehículo:* `;
    if (vehicle_plate) message += `${vehicle_plate}`;
    if (driver_name) message += ` - Conductor: ${driver_name}`;
    message += `\n`;
  }

  // Hora de salida
  if (departure_time) {
    message += `⏰ *Salida:* ${departure_time}\n`;
  }

  // Programa
  if (program_name) {
    message += `📺 *Programa:* ${program_name}\n`;
  }

  // Notas adicionales
  if (notes) {
    message += `\n📝 *Notas:* ${notes}\n`;
  }

  message += `\n_Enviado desde RTVC Programación_`;

  return message;
};

/**
 * Copia el mensaje al portapapeles
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};
