// src/components/Personnel/PersonnelList.jsx
import React, { useState } from 'react';
import { PersonnelCard } from './PersonnelCard';
import { PersonnelModal } from './PersonnelModal';
import { AvailabilityModal } from './AvailabilityModal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Plus, Search } from 'lucide-react';
import { getAllDepartments } from '../../data/departments';

export const PersonnelList = ({ personnel, onAdd, onUpdate, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  
  const departments = getAllDepartments();
  
  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = !filterArea || person.area === filterArea;
    return matchesSearch && matchesArea;
  });
  
  const handleAddNew = () => {
    setSelectedPerson(null);
    setShowModal(true);
  };
  
  const handleEdit = (person) => {
    setSelectedPerson(person);
    setShowModal(true);
  };

  const handleManageAvailability = (person) => {
    setSelectedPerson(person);
    setShowAvailabilityModal(true);
  };

  const handleSave = async (data) => {
    if (selectedPerson) {
      await onUpdate(selectedPerson.id, data);
    } else {
      await onAdd(data);
    }
    setShowModal(false);
    setSelectedPerson(null);
  };

  const handleAvailabilitySave = () => {
    // Recargar la lista de personal después de actualizar disponibilidad
    // DESHABILITADO TEMPORALMENTE PARA EVITAR BUCLES
    // window.location.reload();
    console.log('✅ Disponibilidad actualizada (reload deshabilitado)');
  };
  
  const groupedByArea = filteredPersonnel.reduce((acc, person) => {
    if (!acc[person.area]) {
      acc[person.area] = [];
    }
    acc[person.area].push(person);
    return acc;
  }, {});
  
  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personal</h2>
          <p className="text-gray-600 mt-1">
            {personnel.length} persona{personnel.length !== 1 ? 's' : ''} registrada{personnel.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Button
          onClick={handleAddNew}
          icon={<Plus size={20} />}
          className="min-h-[44px]"
        >
          Agregar Personal
        </Button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Buscar por nombre o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={20} className="text-gray-400" />}
          />
          
          <Select
            placeholder="Filtrar por área"
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            options={departments.map(dept => ({
              value: dept.name,
              label: `${dept.icon} ${dept.name}`
            }))}
          />
        </div>
      </div>
      
      {/* Personnel List */}
      {Object.keys(groupedByArea).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No se encontró personal con los filtros seleccionados</p>
        </div>
      ) : (
        Object.keys(groupedByArea).map(area => {
          const dept = departments.find(d => d.name === area);
          
          return (
            <div key={area} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{dept?.icon || '📋'}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{area}</h3>
                  <p className="text-sm text-gray-500">
                    {groupedByArea[area].length} persona{groupedByArea[area].length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedByArea[area].map(person => (
                  <PersonnelCard
                    key={person.id}
                    person={person}
                    onEdit={handleEdit}
                    onDelete={onDelete}
                    onManageAvailability={handleManageAvailability}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
      
      {/* Modal */}
      <PersonnelModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPerson(null);
        }}
        person={selectedPerson}
        onSave={handleSave}
      />

      {/* Availability Modal */}
      {showAvailabilityModal && selectedPerson && (
        <AvailabilityModal
          person={selectedPerson}
          onClose={() => {
            setShowAvailabilityModal(false);
            setSelectedPerson(null);
          }}
          onSave={handleAvailabilitySave}
        />
      )}
    </div>
  );
};