// src/components/Personnel/PersonnelForm.jsx
import React, { useState } from 'react';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Button } from '../UI/Button';
import { getAllDepartments } from '../../data/departments';
import { SHIFTS } from '../../data/shifts';

// Áreas logísticas
const LOGISTICS_AREAS = [
  { value: 'PERIODISTAS', label: '📰 Periodistas', icon: '📰', roles: ['Periodista', 'Corresponsal', 'Editor'] },
  { value: 'PRESENTADORES', label: '🎤 Presentadores', icon: '🎤', roles: ['Presentador', 'Conductor'] },
  { value: 'INGENIEROS', label: '🔧 Ingenieros', icon: '🔧', roles: ['Ingeniero', 'Técnico'] },
  { value: 'INGENIEROS EMISION', label: '📡 Ingenieros Emisión', icon: '📡', roles: ['Ingeniero Emisión', 'Técnico Emisión'] },
  { value: 'INGENIEROS MASTER', label: '🎛️ Ingenieros Master', icon: '🎛️', roles: ['Ingeniero Master', 'Control Master'] },
  { value: 'ALMACEN', label: '📦 Almacén', icon: '📦', roles: ['Almacenista', 'Auxiliar Almacén'] },
  { value: 'PRODUCTORES', label: '🎬 Productores', icon: '🎬', roles: ['Productor', 'Productor General', 'Productor Logistico', 'Asistente Producción', 'Productora'] },
  { value: 'DIRECTORES', label: '👔 Directores', icon: '👔', roles: ['Director', 'Subdirector', 'director Señal Colombia'] }
];

export const PersonnelForm = ({ initialData, onSubmit, onCancel, isLogistics = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    area: initialData?.area || '',
    role: initialData?.role || '',
    current_shift: initialData?.current_shift || '5:00',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    direccion: initialData?.direccion || '',
    barrio: initialData?.barrio || '',
    localidad: initialData?.localidad || '',
    contract_start: initialData?.contract_start ? initialData.contract_start.split('T')[0] : '',
    contract_end: initialData?.contract_end ? initialData.contract_end.split('T')[0] : ''
  });
  
  const [errors, setErrors] = useState({});

  // Usar áreas logísticas o departamentos técnicos según el modo
  const departments = isLogistics ? LOGISTICS_AREAS : getAllDepartments();

  const selectedDept = departments.find(d => d.name === formData.area || d.value === formData.area);
  const roleOptions = selectedDept
    ? selectedDept.roles.map(role => ({ value: role, label: role }))
    : [];
  
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.area) {
      newErrors.area = 'El área es requerida';
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Reset role when area changes
    if (field === 'area') {
      setFormData(prev => ({
        ...prev,
        role: ''
      }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre Completo"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
        placeholder="Ej: Juan Pérez"
      />
      
      <Select
        label="Área"
        value={formData.area}
        onChange={(e) => handleChange('area', e.target.value)}
        error={errors.area}
        required
        options={departments.map(dept => ({
          value: isLogistics ? dept.value : dept.name,
          label: isLogistics ? dept.label : `${dept.icon} ${dept.name}`
        }))}
      />
      
      <Select
        label="Rol"
        value={formData.role}
        onChange={(e) => handleChange('role', e.target.value)}
        error={errors.role}
        required
        disabled={!formData.area}
        options={roleOptions}
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        placeholder="correo@rtvc.gov.co"
      />
      
      <Input
        label="Teléfono"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        placeholder="3001234567"
      />

      <Input
        label="Dirección"
        value={formData.direccion}
        onChange={(e) => handleChange('direccion', e.target.value)}
        placeholder="Ej: Calle 123 # 45-67"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Barrio"
          value={formData.barrio}
          onChange={(e) => handleChange('barrio', e.target.value)}
          placeholder="Ej: Chapinero"
        />

        <Input
          label="Localidad"
          value={formData.localidad}
          onChange={(e) => handleChange('localidad', e.target.value)}
          placeholder="Ej: Usaquén"
        />
      </div>

      {!isLogistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Inicio de Contrato"
            type="date"
            value={formData.contract_start}
            onChange={(e) => handleChange('contract_start', e.target.value)}
          />

          <Input
            label="Fin de Contrato"
            type="date"
            value={formData.contract_end}
            onChange={(e) => handleChange('contract_end', e.target.value)}
          />
        </div>
      )}

      {isLogistics && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Este personal es logístico y NO aparecerá en la programación técnica ni en los turnos operativos.
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {initialData ? 'Actualizar' : 'Agregar'}
        </Button>
      </div>
    </form>
  );
};