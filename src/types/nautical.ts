export type EstadoSalida =
  | 'PROGRAMADA'
  | 'RECONFIRMADA'
  | 'EN_CURSO'
  | 'EJECUTADA'
  | 'CANCELADA_CLIMA'
  | 'CANCELADA_CLIENTE'
  | 'REPROGRAMADA';

export type TipoServicio =
  | 'FULL_DAY'
  | 'SUNSET'
  | 'CHARTER'
  | 'CHARTER_PRIVADO'
  | 'TRASLADO_ISLAS'
  | 'MADRUGADA'
  | 'NOCHE';

export type EstadoDoc = 'VIGENTE' | 'POR_VENCER' | 'VENCIDO';

export type TipoDocumentoMaritimo =
  | 'PATENTE_NAVEGACION'
  | 'POLIZA_PI'
  | 'POLIZA_CASCO'
  | 'POLIZA_ACCIDENTES_COLECTIVOS'
  | 'POLIZA_RCE_CONTAMINACION'
  | 'CERTIFICADO_SEGURIDAD'
  | 'CERTIFICADO_NAVES'
  | 'CERTIFICADO_ARQUEO'
  | 'CERTIFICADO_MOTORES'
  | 'CERTIFICADO_FRANCOBORDO'
  | 'CERTIFICADO_MAXIMO_PAX'
  | 'CERTIFICADO_COMBUSTIBLE'
  | 'INSPECCION_CASCO'
  | 'PERMISO_ZARPE'
  | 'INSPECCION_BALSAS'
  | 'OTRO';

export interface DocumentoMaritimo {
  tipo: TipoDocumentoMaritimo;
  nombre: string;
  numero: string;
  emisor: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  estado: EstadoDoc;
  urlDocumento?: string;
  observaciones?: string;
  esPermanente?: boolean;
}

export interface Mantenimiento {
  id: string;
  embarcacionId: string;
  tipo: 'PREVENTIVO' | 'CORRECTIVO' | 'INSPECCION_CASCO' | 'SISTEMA_ELECTRICO' | 'EQUIPO_SEGURIDAD';
  fecha: string;
  horasMotor: number;
  descripcion: string;
  tecnicoResponsable: string;
  proximaRevisionHoras?: number;
  estado: 'COMPLETADO' | 'PROGRAMADO' | 'EN_PROCESO';
}

export interface TrabajoDiarioMantenimiento {
  id: string;
  embarcacionId: string;
  embarcacionNombre: string;
  fecha: string; // YYYY-MM-DD
  colaboradorId?: string;
  colaboradorNombre: string;
  colaboradorCargo?: string;
  sistema: string; // Motores, Propulsión, Eléctrico, Casco/Fibra, etc.
  tipoTrabajo: 'PREVENTIVO' | 'CORRECTIVO' | 'RUTINA_DIARIA' | 'INSPECCION' | 'VARADA_ASTILLERO';
  titulo: string;
  descripcion: string; // Ej: "En Catamarán ARMONIA se realizó: cambio de aceite motor babor..."
  repuestosUtilizados?: string;
  horasInvertidas?: number;
  costoManoObraCOP?: number;
  estado: 'COMPLETADO' | 'EN_CURSO' | 'EN_OBSERVACION';
  timestampCOT?: string;
  notasSupervisor?: string;
}

export type SistemaNovedad =
  | 'MOTORES'
  | 'PROPULSION'
  | 'SISTEMA_ELECTRICO'
  | 'CASCO_Y_CUBIERTA'
  | 'BOMBAS_Y_ACHIQUE'
  | 'EQUIPO_SALVAMENTO'
  | 'CONFORT_Y_CABINA';

export type SeveridadNovedad = 'CRITICA' | 'MEDIA' | 'LEVE';
export type EstadoNovedad = 'ABIERTA' | 'EN_PROCESO' | 'EN_REPARACION' | 'SOLUCIONADA';

export type RolUsuario =
  | 'DIRECTOR_OPERACIONES_DPA'
  | 'SUPER_ADMIN'
  | 'DIRECTOR_OPERACIONES'
  | 'GERENTE_MANTENIMIENTO'
  | 'PILOTO'
  | 'PILOTO_MECANICO'
  | 'CARPINTERO'
  | 'AYUDANTE_MARINERO'
  | 'HOST_ANFITRIONA'
  | 'PERSONAL_LIMPIEZA'
  | 'PERSONAL_EXTRA'
  | 'MESERO'
  | 'BARMAN';

export interface PerfilUsuarioAuth {
  id: string;
  nombre: string;
  rol: RolUsuario;
  cargoLabel: string;
  fotoUrl: string;
  documento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  permisos?: 'SUPER_ADMIN' | 'STANDARD' | 'OPERATIONS' | string;
  permissions?: 'SUPER_ADMIN' | 'STANDARD' | 'OPERATIONS' | string;
}

export type MotivoJornada = 'SALIDA_REGISTRADA' | 'MANTENIMIENTO' | 'LOGISTICA_ASEO';

// Tarifas de contrato oficiales acordadas para la alianza náutica
export const TARIFAS_CONTRATO = {
  PILOTO_FULL_DAY: 200000,
  PILOTO_SUNSET: 150000,
  AYUDANTE_FULL_DAY: 90000,
  AYUDANTE_MANTENIMIENTO: 65000,
  AYUDANTE_SUNSET: 75000,
  HOST_SUNSET: 75000,
  HOST_FULL_DAY: 90000,
  LAVANDERIA: 30000,
  LIMPIEZA_OFICINA: 70000,
  LIMPIEZA_BARCO: 60000,
  LIMPIEZA_CHARTER: 80000,
  MESERO_MANUAL: 80000,
  BARMAN_MANUAL: 100000,
} as const;

export interface RegistroAsistencia {
  id: string;
  usuarioNombre: string;
  colaboradorDocumento?: string;
  colaboradorCargo?: string;
  colaboradorEmpresaId?: string;
  colaboradorFotoUrl?: string;
  rol: RolUsuario;
  rolDesempenado?: string; // Rotación dinámica: Piloto, Marinero, Mantenimiento, Host, etc.
  tipoSalidaActividad?: string; // Piloto Full Day, Piloto Sunset, Ayudante Full Day, etc.
  fecha: string; // YYYY-MM-DD
  horaEntrada: string; // HH:mm
  horaSalida?: string; // HH:mm
  horasTrabajadas?: number;
  estado: 'EN_TURNO' | 'FINALIZADO';
  motivoJornada?: MotivoJornada;
  motivo?: MotivoJornada;
  embarcacionId?: string;
  embarcacionNombre?: string;
  salidaId?: string;
  tipoServicioSalida?: TipoServicio;
  tarifaLiquidadaCOP?: number;
  tarifaSesionCOP?: number; // Tarifa diaria personalizada para la sesión
  tarifaVisibleSoloDirector?: boolean;
  esContratoLaboralFijo?: boolean;
  cubiertoPorSueldoFijo?: boolean;
  ubicacion: string;
  observaciones?: string;
  timestampCOT?: string; // Registro inmutable en hora de Colombia
}

export interface LiquidacionNominaItem {
  tripulanteId: string;
  nombreCompleto: string;
  rol: RolUsuario;
  tipoContrato: 'CONTRATO_LABORAL' | 'PRESTACION_SERVICIOS';
  salidasFullDayCount: number;
  salidasFullDayTotalCOP: number;
  salidasSunsetCount: number;
  salidasSunsetTotalCOP: number;
  mantenimientoCount: number;
  mantenimientoTotalCOP: number;
  mantenimientoCubiertoPorContrato: boolean;
  lavanderiaCount: number;
  lavanderiaTotalCOP: number;
  limpiezaOficinaCount: number;
  limpiezaOficinaTotalCOP: number;
  limpiezaBarcoCount: number;
  limpiezaBarcoTotalCOP: number;
  totalLiquidacionCOP: number;
  totalTurnosEjecutados: number;
}

export type TipoServicioAseo = 'POST_CHARTER' | 'ASEO_PROFUNDO' | 'OFICINA' | 'PREPARACION_VIP';
export type EstadoLenceria = 'EN_LAVANDERIA' | 'EN_TRANSITO' | 'LISTO_A_BORDO' | 'EN_ALMACEN';

export interface PrendaLenceria {
  prenda: string; // Toallas, Sábanas, Manteles, Cojines, Fundas, Uniformes
  cantidad: number;
  estado: 'LAVADO' | 'PENDIENTE' | 'REEMPLAZO';
}

export interface RegistroLavanderiaAseo {
  id: string;
  tipoRegistro: 'JORNADA_ASEO' | 'CONTROL_LENCERIA';
  fecha: string;
  embarcacionId?: string;
  embarcacionNombre?: string; // o "Oficinas Administrativas"
  ubicacionManual?: string;
  responsable: string;
  tipoServicioAseo?: TipoServicioAseo;
  estadoLencería?: EstadoLenceria;
  estadoLenceria?: EstadoLenceria;
  prendas?: PrendaLenceria[];
  itemsPrendas?: PrendaLenceria[];
  fechaEnvio?: string;
  fechaRecepcion?: string;
  calificacionAseo?: 'EXCELENTE' | 'BUENO' | 'CON_OBSERVACIONES';
  observaciones?: string;
}

export interface NovedadFalla {
  id: string;
  embarcacionId: string;
  titulo: string;
  descripcion: string;
  sistema: SistemaNovedad;
  severidad: SeveridadNovedad;
  estado: EstadoNovedad;
  reportadoPor: string;
  fechaReporte: string;
  responsableArreglo: string;
  tipoEspecialidad?: 'MECANICO' | 'CARPINTERO' | 'ELECTRICO' | 'FIBRA_PINTURA';
  piezasRequeridas: string[];
  costoEstimado?: number;
  presupuestoAprobadoCOP?: number;
  aprobadoPorGerente?: boolean;
  fotoFallaUrl?: string;
  fotoArregloUrl?: string;
  fechaSolucion?: string;
  notasSolucion?: string;
}

export interface Embarcacion {
  id: string;
  nombre: string;
  matricula: string;
  esloraPies: number;
  esloraMetros: number;
  mangaMetros: number;
  puntalMetros?: number;
  caladoMetros: number;
  trb?: number;
  trn?: number;
  capacidadMaxPax: number;
  dotacionTripulacion?: number;
  capacidadTotalOcupantes?: number;
  motores: string;
  potenciaTotalHp: number;
  plantaElectrica?: string;
  muelleBase: string;
  armador: string;
  operador?: string;
  distintivoLlamada?: string;
  numeroOmi?: string;
  mmsi?: string;
  anioConstruccion: number;
  estado: 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'INSPECCION_PENDIENTE';
  horasMotorAcumuladas: number;
  limiteHorasMantenimiento: number; // Límite del próximo mantenimiento programado
  intervaloServicioHoras: number; // Intervalo de horas de servicio (ej: 250h o 500h)
  codigoRenet: string;
  fotoUrl?: string;
  documentos: DocumentoMaritimo[];
  mantenimientos: Mantenimiento[];
  novedades: NovedadFalla[];
}

export interface CursoOMI {
  codigo: string;
  nombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  institucion: string;
  vigente: boolean;
}

export interface DatosBancarios {
  banco: 'BANCOLOMBIA' | 'NEQUI' | 'DAVIPLATA' | 'BANCO_BOGOTA' | 'OTRO' | string;
  tipoCuenta?: 'Ahorros' | 'Corriente' | 'Nequi / Depósito de Bajo Monto' | string;
  numeroCuenta: string;
  titular?: string;
  documentoTitular?: string;
}

export interface EmpresaPagadora {
  id: 'maria-del-puerto' | 'catamaranes-veleros' | string;
  razonSocial: string;
  nit: string;
  direccion: string;
  ciudad: string;
  telefono?: string;
}

export const EMPRESAS_PAGADORAS: Record<string, EmpresaPagadora> = {
  'maria-del-puerto': {
    id: 'maria-del-puerto',
    razonSocial: 'MARIA DEL PUERTO S.A.S.',
    nit: '901.124.944-9',
    direccion: 'Centro Calle 32 #8-33 Edificio Araujo Oficina 606',
    ciudad: 'Cartagena de Indias, Bolívar',
    telefono: '+57 (605) 664-0000',
  },
  'catamaranes-veleros': {
    id: 'catamaranes-veleros',
    razonSocial: 'CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S.',
    nit: '901.159.056-4',
    direccion: 'Manga / Bahía de Cartagena',
    ciudad: 'Cartagena de Indias, Bolívar',
    telefono: '+57 (605) 665-0000',
  },
};

export interface Tripulante {
  id: string;
  nombreCompleto: string;
  cargo:
    | 'PILOTO_CAPITAN'
    | 'AYUDANTE_MARINERO'
    | 'PILOTO_Y_MARINERO'
    | 'MULTI_ROL'
    | 'HOST_ANFITRIONA'
    | 'EJECUTIVA_COMERCIAL'
    | 'BARMAN'
    | 'MESERO'
    | 'LIMPIEZA_BUCEO'
    | 'ADMINISTRATIVO'
    | string;
  cargoDescripcion?: string;
  documentoIdentidad: string;
  telefono: string;
  email: string;
  direccion?: string;
  eps?: string;
  arl?: string;
  tipoRh?: string;
  contactoEmergencia?: string;
  fotoUrl: string;
  empresaContratanteId: 'maria-del-puerto' | 'catamaranes-veleros' | string;
  empresaContratanteNombre: string;
  empresaContratanteNit: string;
  datosBancarios?: DatosBancarios;
  tarifasReferencia?: Record<string, number | string>;
  licencia?: {
    categoria: string;
    numero: string;
    fechaExpedicion: string;
    fechaVencimiento: string;
    estado: EstadoDoc;
    capitaniaExpedicion?: string;
  };
  cendiatraExp?: string; // Certificado médico de aptitud psicofísica Cendiatra
  cendiatraEstado?: EstadoDoc;
  vhfExp?: string; // Certificado Operador Radio VHF Marino
  vhfEstado?: EstadoDoc;
  rolesHabilitados?: string[]; // ej: ['Piloto', 'Marinero', 'Mantenimiento', 'Host', 'Admin']
  documentoIdentidadUrl?: string; // URL documento WebP
  licenciaUrl?: string; // URL soporte licencia WebP
  cendiatraUrl?: string; // URL certificado Cendiatra WebP
  vhfUrl?: string; // URL certificado VHF WebP
  otrosSoportesUrls?: Array<{ nombre: string; url: string; fecha?: string }>;
  tarifaDefaultCOP?: number; // Tarifa diaria de referencia
  libretaEmbarco?: {
    numero: string;
    fechaExpedicion: string;
  };
  cursosOMI?: CursoOMI[];
  historialSalidasMes?: number;
  horasNavegadasMes?: number;
  salidasTotalesHistorico?: number;
  tipoContrato?: 'CONTRATO_LABORAL' | 'PRESTACION_SERVICIOS';
  mantenimientoIncluidoEnContrato?: boolean;
  estado: 'ACTIVO' | 'EN_VACACIONES' | 'REPOSO' | 'NO_DISPONIBLE';
}

export interface Salida {
  id: string;
  fecha: string; // YYYY-MM-DD
  diaMes: number;
  quincena: 1 | 2;
  embarcacionId: string;
  tipoServicio: TipoServicio;
  muelle: string;
  paxProgramados: number;
  paxReales: number;
  horaProgramadaZarpe: string;
  horaProgramadaRetorno: string;
  horaRealZarpe?: string;
  horaRealRetorno?: string;
  estado: EstadoSalida;
  codigoSitmar?: string;
  sitmarVerificado: boolean;
  sitmarFechaHora?: string;
  candadoOperativoAutorizado?: boolean; // Candado Operativo DIMAR / Despacho
  candadoFechaHoraCOT?: string; // Sello de tiempo inmutable en hora de Colombia (COT)
  firmaPilotoDigital?: string; // Firma digital del capitán (Base64 o token autenticado)
  firmaPilotoNombre?: string;
  firmaPilotoTimestampCOT?: string;
  auditoriaZarpe?: {
    timestampCOT: string;
    autorizadoPor: string;
    codigoSitmar: string;
    pilotoFirma: string;
  };
  pilotoId: string;
  pilotoConfirmado: boolean;
  marineroId: string;
  marineroConfirmado: boolean;
  segundoMarineroId?: string;
  segundoMarineroConfirmado?: boolean;
  observaciones?: string;
  novedadesMuelle?: string;
  condicionMeteo?: string;
  servicioDetalleId?: string;
  checklistPreZarpeId?: string;
}

export interface ServicioDetalle {
  id: string;
  codigoPlanilla: string; // ej: MOP-CHARTER-2026-10-019
  fecha: string;
  salidaId?: string;
  embarcacionId: string;
  ejecutivoComercial: string;
  clienteEmpresa: string;
  contactoCliente: string;
  telefonoCliente: string;
  paxConfirmados: number;
  tipoServicio: TipoServicio;
  itinerarioDestino: string;
  alimentos: string;
  bebidas: string;
  requerimientosEspeciales: string;
  notasSeguridad: string;
  estadoPago: 'PAGO_TOTAL' | 'ANTICIPO_50' | 'PENDIENTE_MUELLE';
  firmaCapitan?: boolean;
  firmaCoordinador?: boolean;
  equipamientoAbordo: string[];
}

export interface ReporteMetricasMes {
  mesNombre: string;
  anio: number;
  salidasTotales: number;
  salidasEjecutadas: number;
  salidasProgramadas: number;
  salidasCanceladas: number;
  tasaEfectividad: number;
  totalPaxTransportados: number;
  totalConSitmar: number;
  porcentajeSitmar: number;
  horasNavegadasFlota: number;
  metricasPorPiloto: Array<{
    tripulanteId: string;
    nombre: string;
    cargo: string;
    salidasConfirmadas: number;
    horasNavegadas: number;
  }>;
  metricasPorEmbarcacion: Array<{
    embarcacionId: string;
    nombre: string;
    salidasEjecutadas: number;
    paxTransportados: number;
    horasAcumuladas: number;
  }>;
}

export type CategoriaGasto =
  | 'ALIMENTOS'
  | 'BEBIDAS'
  | 'ALIMENTOS_Y_BEBIDAS'
  | 'DESECHABLES'
  | 'DECORACION_Y_AMBIENTACION'
  | 'LIMPIEZA_Y_ASEO'
  | 'MANTENIMIENTO_Y_REPUESTOS'
  | 'COMBUSTIBLE'
  | 'COMBUSTIBLE_Y_MARINA'
  | 'LOGISTICA_Y_EXTRAS';

export type MetodoPago =
  | 'EFECTIVO_CAJA_MENOR'
  | 'TRANSFERENCIA_BANCARIA'
  | 'TARJETA_CORPORATIVA'
  | 'CREDITO_PROVEEDOR';

export type EstadoPagoGasto =
  | 'PAGADO'
  | 'PENDIENTE_PAGO'
  | 'REEMBOLSO_PENDIENTE';

export interface ItemGasto {
  id: string;
  descripcion: string;
  cantidad: number;
  unidad: string; // ej: 'Unidades', 'Botellas', 'Kg', 'Galones', 'Bolsas', 'Paquetes'
  precioUnitarioCOP: number;
  subtotalCOP: number;
}

export interface GastoCompra {
  id: string;
  codigoGasto: string; // ej: CMP-2026-10-041
  fecha: string;
  categoria: CategoriaGasto;
  proveedor: string; // ej: Makro Cartagena, Éxito Express Manga, Químicos del Caribe
  nitProveedor?: string;
  numeroFactura: string;
  embarcacionId?: string; // id de la nave o undefined si aplica a oficina/muelle general
  embarcacionNombre?: string;
  salidaId?: string; // opcional: ID de salida o charter vinculado
  solicitadoPor: string;
  montoTotalCOP: number;
  metodoPago: MetodoPago;
  estadoPago: EstadoPagoGasto;
  facturaUrl?: string; // Data URL o URL del soporte escaneado / foto
  facturaNombreArchivo?: string;
  items: ItemGasto[];
  notas?: string;
  fechaCreacion?: string;
}

export type DestinoFondoRecarga =
  | 'CAJA_MENOR_OPERATIVA'
  | 'ANTICIPO_CHARTERS_CATERING'
  | 'MANTENIMIENTO_Y_REPUESTOS'
  | 'COMBUSTIBLE_FLOTA'
  | 'FONDO_GENERAL_OPERACIONES';

export interface RecargaFondo {
  id: string;
  codigoRecarga: string; // ej: REC-2026-10-001
  fecha: string;
  montoCOP: number;
  entidadBancaria: string; // ej: Bancolombia - María del Puerto S.A.S.
  numeroAprobacion: string; // ej: TRX-992182
  recibidoPor: string;
  destinoFondo: DestinoFondoRecarga;
  soporteConsignacionUrl?: string;
  soporteNombreArchivo?: string;
  observaciones?: string;
  fechaCreacion?: string;
}

export type CategoriaChecklistPreZarpe =
  | 'NAVEGACION_Y_COMUNICACIONES'
  | 'GOBIERNO_Y_PROPULSION'
  | 'TRIPULACION'
  | 'MANIOBRA_DE_ATRAQUE';

export interface ItemChecklistPreZarpe {
  numero: number;
  categoria: CategoriaChecklistPreZarpe;
  accion: string;
  cumple: boolean; // SI = true, NO = false
  observacion?: string;
}

export interface ChecklistPreZarpe {
  id: string;
  codigoChecklist: string; // ej: CKZ-2026-10-001
  salidaId?: string;
  embarcacionId: string;
  embarcacionNombre: string;
  matricula?: string;
  codigoSitmar: string; // Código SITMAR de autorización de zarpe DIMAR
  fecha: string;
  horaVerificacion: string;
  items: ItemChecklistPreZarpe[];
  nombrePiloto: string;
  firmaPiloto: boolean;
  fechaFirmaPiloto?: string;
  nombreDpa: string;
  firmaDpa: boolean;
  fechaFirmaDpa?: string;
  observacionesGenerales?: string;
  estado: 'APROBADO_PARA_ZARPE' | 'PENDIENTE_FIRMAS' | 'NO_CONFORME';
  fechaCreacion?: string;
}

// Items & Inventory Management (Repuestos, Consumibles, Combustibles)
export interface ItemInventario {
  id: string;
  codigo: string; // ej: REP-YAN-01
  nombre: string;
  tipo: 'REPUESTO' | 'CONSUMIBLE' | 'COMBUSTIBLE' | 'SEGURIDAD';
  categoria: string; // Filtros, Aceites, Correas, Baterías, Diésel, Chalecos, etc.
  embarcacionId?: string; // id de nave específica o 'FLOTA_GENERAL'
  embarcacionNombre?: string;
  stockActual: number;
  stockMinimo: number;
  unidadMedida: string; // Galones, Unidades, Litros, Kilos, Paquetes
  costoUnitarioCOP: number;
  proveedorPreferidoId?: string;
  proveedorNombre?: string;
  ubicacionAlmacen: string; // ej: Bodega Manga, Taller El Bosque, A bordo Catamarán
  ultimaActualizacionCOT?: string;
  notas?: string;
}

// Vendors & External Nautical Workshops Management
export interface ProveedorTaller {
  id: string;
  razonSocial: string;
  nombre?: string;
  nombreComercial?: string;
  nit: string;
  contactoNombre: string;
  telefono: string;
  email: string;
  tipoServicio:
    | 'TALLER_MECANICO'
    | 'TORNERIA'
    | 'ELECTRICIDAD_MARINA'
    | 'FIBRA_Y_PINTURA'
    | 'COMBUSTIBLE_MARINA'
    | 'REPUESTOS_IMPORTADOS'
    | 'PROVEEDURIA_GENERAL';
  direccion: string;
  ciudad: string;
  calificacion?: number; // 1-5 estrellas
  serviciosOfrecidos: string[];
  notas?: string;
}

