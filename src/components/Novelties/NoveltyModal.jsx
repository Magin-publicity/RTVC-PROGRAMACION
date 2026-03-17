// src/components/Novelties/NoveltyModal.jsx
import React from 'react';
import { Modal } from '../UI/Modal';
import { NoveltyForm } from './NoveltyForm';

export const NoveltyModal = ({ isOpen, onClose, novelty, personnel, onSave, isGroupMode = false, selectedPersonnel = [], selectedDate }) => {
  // Título dinámico según el modo
  let title = 'Agregar Novedad';
  if (novelty) {
    title = 'Editar Novedad';
  } else if (isGroupMode && selectedPersonnel.length > 0) {
    title = `Novedad Grupal (${selectedPersonnel.length} personas)`;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <NoveltyForm
        initialData={novelty}
        personnel={personnel}
        onSubmit={onSave}
        onCancel={onClose}
        isGroupMode={isGroupMode}
        selectedPersonnel={selectedPersonnel}
        selectedDate={selectedDate}
      />
    </Modal>
  );
};