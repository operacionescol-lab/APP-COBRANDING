/**
 * ============================================================================
 * COBRANDING OPS - BASE DE DATOS OPERATIVA & CONFIGURACIÓN INICIAL
 * Alianza Náutica: "MARIA DEL PUERTO S.A.S." & "CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S."
 * ============================================================================
 */

export * from './data/initialData';
export { INITIAL_TRIPULACION } from './data/tripulacionData';
export { INITIAL_INVENTARIO, INITIAL_PROVEEDORES } from './data/inventarioData';

// Configuración Oficial de las Empresas de la Alianza
export const EMPRESAS_CONFIG = {
  empresa1: {
    id: 'maria-del-puerto',
    razonSocial: 'MARIA DEL PUERTO S.A.S.',
    nit: '901.124.944-9',
    direccion: 'Centro Calle 32 #8-33 Edificio Araujo Oficina 606',
    ciudad: 'Cartagena de Indias, Bolívar, Colombia',
    telefono: '+57 310 209 0786',
    email: 'operacionescol@mariadelpuertocartagena.com',
  },
  empresa2: {
    id: 'catamaranes-veleros',
    razonSocial: 'CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S.',
    nit: '901.159.056-4',
    direccion: 'Manga Callejón O’Leary Carrera 22 # 24-81',
    ciudad: 'Cartagena de Indias, Bolívar, Colombia',
    telefono: '+57 301 544 3453',
    email: 'operaciones@catamaranescartagena.com',
  },
} as const;

// Candado Operativo SITMAR DIMAR
export const SITMAR_CONFIG = {
  urlPortal: 'https://sitmar.dimar.mil.co/core/login',
  capitania: 'Capitanía de Puerto de Cartagena (CP05)',
  protocolo: 'MOP-CHARTER-001',
  zonaHoraria: 'America/Bogota', // Hora Oficial de Colombia (COT)
} as const;
