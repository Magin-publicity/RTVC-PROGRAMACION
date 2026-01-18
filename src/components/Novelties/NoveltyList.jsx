// src/components/Novelties/NoveltyList.jsx
import React, { useState } from 'react';
import { NoveltyModal } from './NoveltyModal';
import { NoveltyBadge } from './NoveltyBadge';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Plus, Search, Filter } from 'lucide-react';
import { formatDateLong, formatDateRange, isPast } from '../../utils/dateUtils';

export const NoveltyList = ({ novelties, personnel, onAdd, onUpdate, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedNovelty, setSelectedNovelty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(null);
  const [filterType, setFilterType] = useState('');
  
const filteredNovelties = novelties.filter(novelty => {
  const person = personnel.find(p => p.id === novelty.personnel_id);
  const matchesSearch = !searchTerm || person?.name.toLowerCase().includes(searchTerm.toLowerCase());

  // Usar start_date si existe, sino usar date
  const noveltyDate = novelty.start_date ? novelty.start_date.split('T')[0] : novelty.date.split('T')[0];
  const matchesDate = !filterDate || noveltyDate === filterDate;

  const matchesType = !filterType || novelty.type === filterType;
  return matchesSearch && matchesDate && matchesType;
});
  
  const handleAddNew = () => {
    setSelectedNovelty(null);
    setShowModal(true);
  };
  
  const handleEdit = (novelty) => {
    setSelectedNovelty(novelty);
    setShowModal(true);
  };
  
  const handleSave = async (data) => {
    if (selectedNovelty) {
      await onUpdate(selectedNovelty.id, data);
    } else {
      await onAdd(data);
    }
    setShowModal(false);
    setSelectedNovelty(null);
  };
  
  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta novedad?')) {
      onDelete(id);
    }
  };

  // Función para verificar si una novedad está expirada
  const isNoveltyExpired = (novelty) => {
    if (novelty.end_date) {
      return isPast(novelty.end_date);
    }
    if (novelty.date && !novelty.start_date) {
      return isPast(novelty.date);
    }
    return false;
  };
  
  // Group by start_date (o date si no existe start_date)
  const groupedByDate = filteredNovelties.reduce((acc, novelty) => {
    const groupKey = novelty.start_date || novelty.date;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(novelty);
    return acc;
  }, {});
  
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));
  
  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Novedades</h2>
          <p className="text-gray-600 mt-1">
            {novelties.length} novedad{novelties.length !== 1 ? 'es' : ''} registrada{novelties.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Button
          onClick={handleAddNew}
          icon={<Plus size={20} />}
        >
          Agregar Novedad
        </Button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={20} className="text-gray-400" />}
          />
          
         <input
  type="date"
  placeholder="Filtrar por fecha"
  value={filterDate || ''}
  onChange={(e) => setFilterDate(e.target.value || null)}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                setFilterDate(null);
                setFilterType('');
              }}
              icon={<Filter size={20} />}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>
      
      {/* Novelties List */}
      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No se encontraron novedades</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
               {formatDateLong(new Date(date))}
              </h3>
              
              <div className="space-y-3">
                {groupedByDate[date].map(novelty => {
                  const person = personnel.find(p => p.id === novelty.personnel_id);
                  const isExpired = isNoveltyExpired(novelty);

                  return (
                    <div
                      key={novelty.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        isExpired
                          ? 'bg-gray-100 opacity-60 border-2 border-gray-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <NoveltyBadge type={novelty.type} />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">
                              {person ? person.name : novelty.personnel_name || `ID: ${novelty.personnel_id} (No encontrado)`}
                            </h4>
                            {isExpired && (
                              <span className="text-xs px-2 py-0.5 bg-gray-500 text-white rounded-full font-semibold">
                                FINALIZADA
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                           {person ? person.role : novelty.personnel_role || 'Personal no encontrado en el sistema'}
                            </p>
                          {(novelty.start_date && novelty.end_date && novelty.start_date !== novelty.end_date) && (
                            <p className="text-sm text-blue-600 font-medium mt-1">
                              {formatDateRange(novelty.start_date, novelty.end_date)}
                            </p>
                          )}
                          {novelty.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {novelty.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(novelty)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(novelty.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal */}
      <NoveltyModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedNovelty(null);
        }}
        novelty={selectedNovelty}
        personnel={personnel}
        onSave={handleSave}
      />
    </div>
  );
};