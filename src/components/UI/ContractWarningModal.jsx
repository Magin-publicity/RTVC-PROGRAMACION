// src/components/UI/ContractWarningModal.jsx
import React from 'react';
import { AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

/**
 * Modal de confirmación para asignaciones manuales de personal con contratos vencidos o próximos a vencer
 * Componente reutilizable que actúa como capa de validación sin modificar la lógica existente
 */
export const ContractWarningModal = ({ isOpen, onClose, onConfirm, warning, personName }) => {
  if (!isOpen || !warning.show) return null;

  const isError = warning.type === 'error';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className={`p-6 rounded-t-lg ${isError ? 'bg-red-50 border-b-2 border-red-200' : 'bg-yellow-50 border-b-2 border-yellow-200'}`}>
          <div className="flex items-start gap-3">
            {isError ? (
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle size={28} className="text-red-600" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle size={28} className="text-yellow-600" />
              </div>
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${isError ? 'text-red-900' : 'text-yellow-900'}`}>
                {isError ? '⚠️ Contrato Vencido' : '⚠️ Contrato Próximo a Vencer'}
              </h3>
              <p className={`text-sm mt-1 ${isError ? 'text-red-700' : 'text-yellow-700'}`}>
                Asignación Manual Requiere Confirmación
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className={`mb-4 p-4 rounded-lg ${isError ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className="font-semibold text-gray-900 mb-2">
              Empleado: <span className={isError ? 'text-red-700' : 'text-yellow-700'}>{personName}</span>
            </p>
            <p className="text-sm text-gray-700">
              {warning.message}
            </p>
          </div>

          {isError && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-300 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  <strong>Importante:</strong> Este empleado no será incluido en asignaciones automáticas.
                  Solo puede ser asignado manualmente en caso de emergencia.
                </p>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium mb-2">¿Desea continuar con la asignación?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>La asignación se realizará bajo su responsabilidad</li>
              <li>Se recomienda contactar a Recursos Humanos</li>
              {isError && <li className="text-red-600 font-medium">El contrato está VENCIDO</li>}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isError
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {isError ? 'Asignar de todas formas' : 'Continuar con la asignación'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook helper para usar el modal fácilmente
 * Ejemplo de uso:
 *
 * const { showContractWarning } = useContractWarning();
 *
 * const handleAssign = async (personId) => {
 *   const confirmed = await showContractWarning(personId, personName);
 *   if (confirmed) {
 *     // Realizar asignación
 *   }
 * };
 */
export const useContractWarning = () => {
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    warning: { show: false },
    personName: '',
    resolve: null
  });

  const showContractWarning = (warning, personName) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        warning,
        personName,
        resolve
      });
    });
  };

  const handleConfirm = () => {
    modalState.resolve?.(true);
    setModalState({ isOpen: false, warning: { show: false }, personName: '', resolve: null });
  };

  const handleClose = () => {
    modalState.resolve?.(false);
    setModalState({ isOpen: false, warning: { show: false }, personName: '', resolve: null });
  };

  const WarningModal = () => (
    <ContractWarningModal
      isOpen={modalState.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      warning={modalState.warning}
      personName={modalState.personName}
    />
  );

  return {
    showContractWarning,
    WarningModal
  };
};
