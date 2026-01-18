// src/components/Personnel/PersonnelModal.jsx
import React from 'react';
import { Modal } from '../UI/Modal';
import { PersonnelForm } from './PersonnelForm';

export const PersonnelModal = ({ isOpen, onClose, person, onSave, isLogistics = false }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={person ? (isLogistics ? 'Editar Personal Logístico' : 'Editar Personal') : (isLogistics ? 'Agregar Personal Logístico' : 'Agregar Personal')}
      size="lg"
    >
      <PersonnelForm
        initialData={person}
        onSubmit={onSave}
        onCancel={onClose}
        isLogistics={isLogistics}
      />
    </Modal>
  );
};