// src/data/programs.js

export const WEEKDAY_PROGRAMS = [
  {
    id: 1,
    name: 'EL CALENTAO',
    time: '6:00-10:00',
    location: 'REDACCIÓN Y ESTUDIO 5 MÁSTER 5',
    type: 'regular',
    color: '#F59E0B'
  },
  {
    id: 2,
    name: 'AVANCE INFORMATIVO',
    time: '10:55-11:00',
    location: 'REDACCIÓN O ESTUDIO 5 - MÁSTER 5',
    type: 'informative',
    color: '#3B82F6'
  },
  {
    id: 3,
    name: 'EMISIÓN RTVC NOTICIAS',
    time: '12:00-14:00',
    location: 'MÁSTER 5 ESTUDIO 5',
    type: 'news',
    color: '#EF4444'
  },
  {
    id: 4,
    name: 'AVANCE INFORMATIVO',
    time: '15:25-15:30',
    location: 'REDACCIÓN O ESTUDIO 5 - MÁSTER 5',
    type: 'informative',
    color: '#3B82F6'
  },
  {
    id: 5,
    name: 'AVANCE INFORMATIVO',
    time: '16:55-17:00',
    location: 'REDACCIÓN O ESTUDIO 5 - MÁSTER 5',
    type: 'informative',
    color: '#3B82F6'
  },
  {
    id: 6,
    name: 'SEÑAL INVESTIGATIVA',
    time: '17:00',
    location: 'ESTUDIO 3 MASTER 3',
    type: 'special',
    color: '#8B5CF6'
  },
  {
    id: 7,
    name: 'AVANCE INFORMATIVO',
    time: '18:00-18:05',
    location: 'REDACCIÓN O ESTUDIO 5 - MÁSTER 5',
    type: 'informative',
    color: '#3B82F6'
  },
  {
    id: 8,
    name: 'EMISIÓN RTVC NOTICIAS',
    time: '19:00-20:00',
    location: 'ESTUDIO 5',
    type: 'news',
    color: '#EF4444'
  },
  {
    id: 9,
    name: 'NOCHES DE OPINIÓN',
    time: '20:00-21:00',
    location: 'MÁSTER 5 ESTUDIO 5',
    type: 'opinion',
    color: '#10B981'
  },
  {
    id: 10,
    name: 'EMISIÓN RTVC NOTICIAS',
    time: '21:30-22:00',
    location: 'ESTUDIO 5 MÁSTER 5',
    type: 'news',
    color: '#EF4444'
  }
];

export const WEEKEND_PROGRAMS = [
  {
    id: 1,
    name: 'AVANCE INFORMATIVO',
    time: '9:00-9:05',
    location: 'REDACCIÓN',
    type: 'informative',
    color: '#3B82F6'
  },
  {
    id: 2,
    name: 'ESPECIAL CULTURA',
    time: '12:00',
    location: 'ESTUDIO 5',
    type: 'cultural',
    color: '#EC4899'
  },
  {
    id: 3,
    name: 'EMISIÓN RTVC NOTICIAS',
    time: '12:30-13:30',
    location: 'ESTUDIO 5',
    type: 'news',
    color: '#EF4444'
  },
  {
    id: 4,
    name: 'ESPECIAL CULTURA',
    time: '15:00',
    location: 'ESTUDIO 5',
    type: 'cultural',
    color: '#EC4899'
  },
  {
    id: 5,
    name: 'AVANCE INFORMATIVO',
    time: '17:55-18:00',
    location: 'REDACCIÓN',
    type: 'informative',
    color: '#3B82F6'
  },
  {
    id: 6,
    name: 'ESPECIAL CULTURAL CONVERSATORIO',
    time: '18:00',
    location: 'CINEMA PARAISO',
    type: 'cultural',
    color: '#EC4899'
  },
  {
    id: 7,
    name: 'EMISIÓN RTVC NOTICIAS',
    time: '19:00-20:00',
    location: 'ESTUDIO 5',
    type: 'news',
    color: '#EF4444'
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