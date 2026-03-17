// src/data/novelties.js

export const NOVELTY_TYPES = {
  VIAJE: {
    id: 'VIAJE',
    name: 'Viaje',
    icon: '✈️',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    requiresDescription: true,
    affectsSchedule: true,
    priority: 1
  },
  INCAPACIDAD: {
    id: 'INCAPACIDAD',
    name: 'Incapacidad',
    icon: '🏥',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    requiresDescription: true,
    affectsSchedule: true,
    priority: 1
  },
  TRAGEDIA_FAMILIAR: {
    id: 'TRAGEDIA_FAMILIAR',
    name: 'Tragedia Familiar',
    icon: '💔',
    color: '#991B1B',
    bgColor: '#FEE2E2',
    requiresDescription: true,
    affectsSchedule: true,
    priority: 1
  },
  VACACIONES: {
    id: 'VACACIONES',
    name: 'Vacaciones',
    icon: '🏖️',
    color: '#10B981',
    bgColor: '#D1FAE5',
    requiresDescription: false,
    affectsSchedule: true,
    priority: 2
  },
  SIN_CONTRATO: {
    id: 'SIN_CONTRATO',
    name: 'Sin Contrato',
    icon: '📄',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    requiresDescription: true,
    affectsSchedule: true,
    priority: 1
  },
  PERMISO: {
    id: 'PERMISO',
    name: 'Permiso',
    icon: '📋',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    requiresDescription: true,
    affectsSchedule: true,
    priority: 3
  },
  DISPONIBLE: {
    id: 'DISPONIBLE',
    name: 'Disponible',
    icon: '✅',
    color: '#10B981',
    bgColor: '#D1FAE5',
    requiresDescription: false,
    affectsSchedule: false,
    priority: 5
  },
  REDACCION: {
    id: 'REDACCION',
    name: 'Redacción',
    icon: '✍️',
    color: '#6366F1',
    bgColor: '#E0E7FF',
    requiresDescription: false,
    affectsSchedule: false,
    priority: 4
  },
  ESTUDIO_3: {
    id: 'ESTUDIO_3',
    name: 'Estudio 3',
    icon: '🎬',
    color: '#14B8A6',
    bgColor: '#CCFBF1',
    requiresDescription: false,
    affectsSchedule: false,
    priority: 4
  },
  MASTER_3: {
    id: 'MASTER_3',
    name: 'Master 3',
    icon: '🎛️',
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    requiresDescription: false,
    affectsSchedule: false,
    priority: 4
  },
  TALLER: {
    id: 'TALLER',
    name: 'Taller',
    icon: '🔧',
    color: '#84CC16',
    bgColor: '#ECFCCB',
    requiresDescription: false,
    affectsSchedule: false,
    priority: 4
  },
  DUPLA: {
    id: 'DUPLA',
    name: 'Dupla',
    icon: '👥',
    color: '#A855F7',
    bgColor: '#F3E8FF',
    requiresDescription: true,
    affectsSchedule: false,
    priority: 3
  },
  LIVE_U: {
    id: 'LIVE_U',
    name: 'Live U',
    icon: '📡',
    color: '#EC4899',
    bgColor: '#FCE7F3',
    requiresDescription: true,
    affectsSchedule: false,
    priority: 3
  },
  EVENTOS: {
    id: 'EVENTOS',
    name: 'Eventos',
    icon: '🎉',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    requiresDescription: true,
    affectsSchedule: false,
    priority: 3
  },
  MOVIL: {
    id: 'MOVIL',
    name: 'Móvil',
    icon: '🚐',
    color: '#10B981',
    bgColor: '#D1FAE5',
    requiresDescription: true,
    affectsSchedule: true,
    priority: 1
  },
  PUESTO_FIJO: {
    id: 'PUESTO_FIJO',
    name: 'Puesto Fijo',
    icon: '📍',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    requiresDescription: true,
    affectsSchedule: true,
    priority: 1
  }
};

export const getNoveltyIcon = (type) => {
  return NOVELTY_TYPES[type]?.icon || '📌';
};

export const getNoveltyColor = (type) => {
  return NOVELTY_TYPES[type]?.color || '#6B7280';
};

export const getNoveltyBgColor = (type) => {
  return NOVELTY_TYPES[type]?.bgColor || '#F3F4F6';
};

export const getNoveltyName = (type) => {
  return NOVELTY_TYPES[type]?.name || type;
};

export const noveltyAffectsSchedule = (type) => {
  return NOVELTY_TYPES[type]?.affectsSchedule || false;
};

export const getNoveltyPriority = (type) => {
  return NOVELTY_TYPES[type]?.priority || 5;
};

export const getAllNoveltyTypes = () => {
  return Object.values(NOVELTY_TYPES);
};

export const getHighPriorityNovelties = () => {
  return Object.values(NOVELTY_TYPES).filter(n => n.priority <= 2);
};