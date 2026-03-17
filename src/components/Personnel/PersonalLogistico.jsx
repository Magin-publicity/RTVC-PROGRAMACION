// src/components/Personnel/PersonalLogistico.jsx
import React, { useState, useEffect } from 'react';
import { PersonnelModal } from './PersonnelModal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, Download } from 'lucide-react';

const API_URL = '/api';

// Áreas logísticas disponibles
const LOGISTICS_AREAS = [
  { value: 'PERIODISTAS', label: '📰 Periodistas', icon: '📰' },
  { value: 'PRESENTADORES', label: '🎤 Presentadores', icon: '🎤' },
  { value: 'INGENIEROS', label: '🔧 Ingenieros', icon: '🔧' },
  { value: 'INGENIEROS EMISION', label: '📡 Ingenieros Emisión', icon: '📡' },
  { value: 'INGENIEROS MASTER', label: '🎛️ Ingenieros Master', icon: '🎛️' },
  { value: 'ALMACEN', label: '📦 Almacén', icon: '📦' },
  { value: 'PRODUCTORES', label: '🎬 Productores', icon: '🎬' },
  { value: 'DIRECTORES', label: '👔 Directores', icon: '👔' },
  { value: 'ARCHIVO', label: '🗄️ Archivo', icon: '🗄️' },
  { value: 'GRAFICADOR', label: '🎨 Graficador', icon: '🎨' },
  { value: 'EDITOR', label: '✂️ Editor', icon: '✂️' }
];

// Componente de tarjeta para personal logístico (idéntico a PersonnelCard pero sin turno)
const PersonalLogisticoCard = ({ person, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`¿Está seguro de eliminar a ${person.name}?`)) {
      onDelete(person.id);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      {/* Badge identificador de personal logístico */}
      <div className="mb-2 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 bg-orange-100 text-orange-800 border border-orange-200">
        🚚 Logístico
      </div>

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{person.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{person.role}</p>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(person)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {person.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} />
            <span className="truncate">{person.email}</span>
          </div>
        )}

        {person.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} />
            <span>{person.phone}</span>
          </div>
        )}

        {person.direccion && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} />
            <span className="truncate">{person.direccion}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const PersonalLogistico = () => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');

  useEffect(() => {
    loadPersonal();
  }, []);

  const loadPersonal = async () => {
    try {
      console.log('🔄 Cargando personal logístico desde API...');
      const response = await fetch(`${API_URL}/personnel?tipo=LOGISTICO`);
      const data = await response.json();
      console.log(`✅ Personal logístico cargado: ${data.length} personas`, data);
      setPersonal(data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error cargando personal logístico:', error);
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedPerson(null);
    setShowModal(true);
  };

  const handleEdit = (person) => {
    setSelectedPerson(person);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    try {
      console.log('💾 Guardando personal logístico:', data);

      // Limpiar campos de contrato para personal logístico (no los necesitan)
      const { contract_start, contract_end, current_shift, ...logisticsData } = data;

      // Asegurar que siempre sea LOGISTICO y limpiar campos innecesarios
      const payload = {
        ...logisticsData,
        tipo_personal: 'LOGISTICO',
        active: true,
        contract_start: null,
        contract_end: null,
        current_shift: null
      };

      console.log('📤 Payload a enviar:', payload);

      if (selectedPerson) {
        // Actualizar
        const response = await fetch(`${API_URL}/personnel/${selectedPerson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        console.log('📥 Respuesta actualizar:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Error al actualizar:', errorData);
          throw new Error(`Error al actualizar: ${response.status} ${response.statusText}`);
        }

        const updated = await response.json();
        console.log('✅ Personal actualizado:', updated);
        alert(`✅ Personal "${updated.name}" actualizado correctamente`);
      } else {
        // Crear
        const response = await fetch(`${API_URL}/personnel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        console.log('📥 Respuesta crear:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Error al crear:', errorData);
          throw new Error(`Error al crear: ${response.status} ${response.statusText}`);
        }

        const newPerson = await response.json();
        console.log('✅ Personal creado:', newPerson);
        alert(`✅ Personal "${newPerson.name}" creado correctamente con ID ${newPerson.id}`);
      }

      // Recargar la lista completa desde el servidor para asegurar sincronización
      console.log('🔄 Recargando lista de personal desde servidor...');
      await loadPersonal();

      setShowModal(false);
      setSelectedPerson(null);
    } catch (error) {
      console.error('❌ Error guardando personal:', error);
      alert(`❌ Error al guardar el personal:\n\n${error.message}\n\nRevisa la consola (F12) para más detalles.`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/personnel/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setPersonal(personal.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error eliminando personal:', error);
      alert('Error al eliminar el personal');
    }
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Cargo', 'Área', 'Dirección', 'Celular', 'Email'];
    const rows = filteredPersonnel.map(p => [
      p.name,
      p.role || '',
      p.area,
      p.direccion || '',
      p.phone || '',
      p.email || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `personal_logistico_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filtrado (idéntico a PersonnelList)
  const filteredPersonnel = personal.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.role && person.role.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesArea = !filterArea || person.area === filterArea;
    return matchesSearch && matchesArea;
  });

  // Agrupación por área (idéntico a PersonnelList)
  const groupedByArea = filteredPersonnel.reduce((acc, person) => {
    if (!acc[person.area]) {
      acc[person.area] = [];
    }
    acc[person.area].push(person);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando personal logístico...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions - Idéntico a PersonnelList */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personal Logístico</h2>
          <p className="text-gray-600 mt-1">
            {personal.length} persona{personal.length !== 1 ? 's' : ''} registrada{personal.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleAddNew}
            icon={<Plus size={20} />}
          >
            Agregar Personal
          </Button>

          <Button
            onClick={exportToCSV}
            variant="success"
            icon={<Download size={20} />}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters - Idéntico a PersonnelList */}
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
            options={LOGISTICS_AREAS}
          />
        </div>
      </div>

      {/* Personnel List - Idéntico a PersonnelList */}
      {Object.keys(groupedByArea).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No se encontró personal con los filtros seleccionados</p>
        </div>
      ) : (
        Object.keys(groupedByArea).map(area => {
          const areaInfo = LOGISTICS_AREAS.find(a => a.value === area);

          return (
            <div key={area} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{areaInfo?.icon || '📋'}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{area}</h3>
                  <p className="text-sm text-gray-500">
                    {groupedByArea[area].length} persona{groupedByArea[area].length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedByArea[area].map(person => (
                  <PersonalLogisticoCard
                    key={person.id}
                    person={person}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Modal - Reutilizando PersonnelModal */}
      <PersonnelModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPerson(null);
        }}
        person={selectedPerson}
        onSave={handleSave}
        isLogistics={true}
      />
    </div>
  );
};
