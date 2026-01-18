// src/components/Novelties/NoveltyForm.jsx
import React, { useState } from 'react';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Button } from '../UI/Button';
import { getAllNoveltyTypes } from '../../data/novelties';

export const NoveltyForm = ({ initialData, personnel, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    personnel_id: initialData?.personnel_id || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date || new Date().toISOString().split('T')[0],
    type: initialData?.type || '',
    description: initialData?.description || ''
  });
  
  const [errors, setErrors] = useState({});
  const noveltyTypes = getAllNoveltyTypes();
  
  const selectedType = noveltyTypes.find(t => t.id === formData.type);
  
  const validate = () => {
    const newErrors = {};

    if (!formData.personnel_id) {
      newErrors.personnel_id = 'Debe seleccionar una persona';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es requerida';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'La fecha de fin es requerida';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'La fecha de fin debe ser mayor o igual a la fecha de inicio';
    }

    if (!formData.type) {
      newErrors.type = 'El tipo de novedad es requerido';
    }

    if (selectedType?.requiresDescription && !formData.description.trim()) {
      newErrors.description = 'La descripción es requerida para este tipo de novedad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
 const handleSubmit = (e) => {
  e.preventDefault();
  if (validate()) {
    // Enviar start_date y end_date en lugar de date
    const submitData = {
      ...formData,
      date: formData.start_date, // Mantener compatibilidad con campo legacy
      start_date: formData.start_date,
      end_date: formData.end_date
    };
    onSubmit(submitData);
  }
};
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Personal <span className="text-red-500">*</span>
  </label>
  <select
    value={formData.personnel_id}
    onChange={(e) => handleChange('personnel_id', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Seleccionar...</option>
    {Object.entries(
      [...personnel].sort((a, b) => {
        if (a.area < b.area) return -1;
        if (a.area > b.area) return 1;
        return a.name.localeCompare(b.name);
      }).reduce((acc, person) => {
        if (!acc[person.area]) acc[person.area] = [];
        acc[person.area].push(person);
        return acc;
      }, {})
    ).map(([area, people]) => (
      <optgroup key={area} label={area}>
        {people.map(person => (
          <option key={person.id} value={person.id}>
            {person.name} - {person.role}
          </option>
        ))}
      </optgroup>
    ))}
  </select>
  {errors.personnel_id && <p className="mt-1 text-sm text-red-500">{errors.personnel_id}</p>}
</div>
      
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Fecha de Inicio <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      value={formData.start_date}
      onChange={(e) => handleChange('start_date', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Fecha de Fin <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      value={formData.end_date}
      onChange={(e) => handleChange('end_date', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>}
  </div>
</div>
      
      <Select
        label="Tipo de Novedad"
        value={formData.type}
        onChange={(e) => handleChange('type', e.target.value)}
        error={errors.type}
        required
        options={noveltyTypes.map(type => ({
          value: type.id,
          label: `${type.icon} ${type.name}`
        }))}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción {selectedType?.requiresDescription && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          placeholder="Ingrese detalles adicionales..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>
      
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Actualizar' : 'Agregar'}
        </Button>
      </div>
    </form>
  );
};