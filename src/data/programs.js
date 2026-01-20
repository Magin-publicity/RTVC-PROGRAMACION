// src/data/programs.js

export const WEEKDAY_PROGRAMS = [
  {
    id: 1,
    name: 'Calentado',
    time: '06:00-10:00',
    location: 'REDACCIÓN Y ESTUDIO 5 MÁSTER 5',
    type: 'regular',
    color: '#4CAF50'
  },
  {
    id: 2,
    name: 'Avance Informativo',
    time: '10:55-11:00',
    location: 'REDACCIÓN O ESTUDIO 5 - MÁSTER 5',
    type: 'informative',
    color: '#2196F3'
  },
  {
    id: 3,
    name: 'Emisión RTVC Noticias',
    time: '12:00-14:00',
    location: 'MÁSTER 5 ESTUDIO 5',
    type: 'news',
    color: '#FF9800'
  },
  {
    id: 4,
    name: 'Avance Informativo',
    time: '14:55-15:00',
    location: 'REDACCIÓN O ESTUDIO 5 - MÁSTER 5',
    type: 'informative',
    color: '#2196F3'
  },
  {
    id: 5,
    name: 'Avance Informativo',
    time: '16:55-17:00',
    location: 'REDACCIÓN O ESTUDIO 5 - MÁSTER 5',
    type: 'informative',
    color: '#2196F3'
  },
  {
    id: 7,
    name: 'Avance Informativo',
    time: '18:00-18:05',
    location: 'REDACCIÓN O ESTUDIO 5 - MÁSTER 5',
    type: 'informative',
    color: '#2196F3'
  },
  {
    id: 8,
    name: 'Emisión Central',
    time: '19:00-20:00',
    location: 'ESTUDIO 5 MÁSTER 5',
    type: 'news',
    color: '#FF9800'
  },
  {
    id: 9,
    name: 'Noches de Opinión',
    time: '20:00-21:00',
    location: 'MÁSTER 5 ESTUDIO 5',
    type: 'opinion',
    color: '#9C27B0'
  },
  {
    id: 10,
    name: 'Última Emisión',
    time: '21:30-22:00',
    location: 'ESTUDIO 5 MÁSTER 5',
    type: 'news',
    color: '#FF9800'
  }
];

export const WEEKEND_PROGRAMS = [
  {
    id: 1,
    name: 'Avance Informativo',
    time: '09:00-09:05',
    location: 'REDACCIÓN',
    type: 'informative',
    color: '#2196F3'
  },
  {
    id: 3,
    name: 'Emisión RTVC Noticias',
    time: '12:30-13:30',
    location: 'ESTUDIO 5',
    type: 'news',
    color: '#FF9800'
  },
  {
    id: 5,
    name: 'Avance Informativo',
    time: '13:30-13:35',
    location: 'REDACCIÓN',
    type: 'informative',
    color: '#2196F3'
  },
  {
    id: 7,
    name: 'Emisión RTVC Noticias',
    time: '19:00-20:00',
    location: 'ESTUDIO 5',
    type: 'news',
    color: '#FF9800'
  }
];

export const SPECIAL_PROGRAMS = {
  'SOLDADO_PAZ': {
    name: 'SOLDADO PAZ PELICULA',
    time: '7:00-16:00',
    location: 'ESTUDIO 3',
    type: 'production',
    color: '#A855F7'
  },
  'MUESTRA_BINACIONAL': {
    name: 'MUESTRA BINACIONAL DE CINE',
    time: '11:00',
    location: 'CINEMA PARAISO',
    type: 'cultural',
    color: '#EC4899'
  },
  'DEPORTES_PUTUMAYO': {
    name: 'DEPORTES VUELTA AL PUTUMAYO',
    time: '10:00',
    location: 'ESTUDIO 3 MASTER 3',
    type: 'sports',
    color: '#10B981'
  },
  'SEÑAL_LITERARIA': {
    name: 'SEÑAL LITERARIA',
    time: '10:00',
    location: 'EXTERIORES',
    type: 'cultural',
    color: '#F59E0B'
  }
};

export const getProgramsByDayType = (isWeekend) => {
  return isWeekend ? WEEKEND_PROGRAMS : WEEKDAY_PROGRAMS;
};

export const getProgramColor = (programType) => {
  const colors = {
    regular: '#F59E0B',
    informative: '#3B82F6',
    news: '#EF4444',
    special: '#8B5CF6',
    cultural: '#EC4899',
    opinion: '#10B981',
    sports: '#10B981',
    production: '#A855F7'
  };
  return colors[programType] || '#6B7280';
};