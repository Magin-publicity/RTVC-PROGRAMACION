// src/components/TravelEvents/TravelEventModal.jsx
import React from 'react';
import { Modal } from '../UI/Modal';
import TravelEventForm from './TravelEventForm';

const TravelEventModal = ({ isOpen, onClose, event, personnel, liveUEquipment, onSave }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? '✏️ Editar Comisión' : '➕ Nueva Comisión de Viaje/Evento'}
      size="2xl"
    >
      <TravelEventForm
        initialData={event}
        personnel={personnel}
        liveUEquipment={liveUEquipment}
        onSubmit={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default TravelEventModal;
