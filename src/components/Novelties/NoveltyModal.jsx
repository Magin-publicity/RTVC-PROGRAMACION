// src/components/Novelties/NoveltyModal.jsx
import React from 'react';
import { Modal } from '../UI/Modal';
import { NoveltyForm } from './NoveltyForm';

export const NoveltyModal = ({ isOpen, onClose, novelty, personnel, onSave }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={novelty ? 'Editar Novedad' : 'Agregar Novedad'}
      size="lg"
    >
      <NoveltyForm
        initialData={novelty}
        personnel={personnel}
        onSubmit={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
};