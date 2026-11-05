import React, { useState, useMemo } from 'react';
import {
  RegistroAsistencia,
  PerfilUsuarioAuth,
  MotivoJornada,
  Salida,
  Embarcacion,
  RolUsuario,
  Tripulante,
  TARIFAS_CONTRATO,
  LiquidacionNominaItem,
} from '../types/nautical';
import {
  Clock,
  LogIn,
  LogOut,
  CalendarCheck2,
  Users,
  Compass,
  Wrench,
  Sparkles,
  MapPin,
  CheckCircle2,
  Search,
  Filter,
  AlertCircle,
  Plus,
  ShieldCheck,
  X,
  DollarSign,
  FileSpreadsheet,
  Printer,
  Briefcase,
  AlertTriangle,
  BadgeDollarSign,
  UserCheck,
  FileCheck,
  Building2,
  Ship,
  CreditCard,
  Anchor,
} from 'lucide-react';

export type TipoSalidaActividad =
  | 'PILOTO_FULL_DAY'
  | 'PILOTO_SUNSET'
  | 'AYUDANTE_FULL_DAY'
  | 'AYUDANTE_SUNSET'
  | 'MANTENIMIENTO_PRESTACION'
  | 'MANTENIMIENTO_CONTRATO'
  | 'LIMPIEZA_BARCO'
  | 'LIMPIEZA_CHARTER'
  | 'LIMPIEZA_OFICINA'
  | 'LIMPIEZA_OFICINA_Y_LAVANDERIA'
  | 'MESERO'
  | 'BARMAN';

export const OPCIONES_TIPO_SALIDA: Array<{
  id: TipoSalidaActividad;
  label: string;
  categoria: string;
  tarifaBase: number;
  rolSugerido: RolUsuario;
  motivoSugerido: MotivoJornada;
  esContratoLaboral?: boolean;
  tarifaManualPermitida?: boolean;
}> = [
  {
    id: 'PILOTO_FULL_DAY',
    label: 'Piloto Full Day',
    categoria: 'Navegación / Capitán',
    tarifaBase: 200000,
    rolSugerido: 'PILOTO_MECANICO',
    motivoSugerido: 'SALIDA_REGISTRADA',
  },
  {
    id: 'PILOTO_SUNSET',
    label: 'Piloto Sunset',
    categoria: 'Navegación / Capitán',
    tarifaBase: 150000,
    rolSugerido: 'PILOTO_MECANICO',
    motivoSugerido: 'SALIDA_REGISTRADA',
  },
  {
    id: 'AYUDANTE_FULL_DAY',
    label: 'Ayudante Full Day',
    categoria: 'Cubierta / Marinero',
    tarifaBase: 90000,
    rolSugerido: 'AYUDANTE_MARINERO',
    motivoSugerido: 'SALIDA_REGISTRADA',
  },
  {
    id: 'AYUDANTE_SUNSET',
    label: 'Ayudante Sunset',
    categoria: 'Cubierta / Marinero',
    tarifaBase: 75000,
    rolSugerido: 'AYUDANTE_MARINERO',
    motivoSugerido: 'SALIDA_REGISTRADA',
  },
  {
    id: 'MANTENIMIENTO_PRESTACION',
    label: 'Mantenimiento Prestación de Servicio',
    categoria: 'Mantenimiento Técnico',
    tarifaBase: 65000,
    rolSugerido: 'AYUDANTE_MARINERO',
    motivoSugerido: 'MANTENIMIENTO',
  },
  {
    id: 'MANTENIMIENTO_CONTRATO',
    label: 'Mantenimiento Contrato (Cubierto por Sueldo)',
    categoria: 'Mantenimiento Técnico',
    tarifaBase: 0,
    rolSugerido: 'PILOTO_MECANICO',
    motivoSugerido: 'MANTENIMIENTO',
    esContratoLaboral: true,
  },
  {
    id: 'LIMPIEZA_BARCO',
    label: 'Limpieza de Barco',
    categoria: 'Aseo & Hotelería',
    tarifaBase: 60000,
    rolSugerido: 'PERSONAL_LIMPIEZA',
    motivoSugerido: 'LOGISTICA_ASEO',
  },
  {
    id: 'LIMPIEZA_CHARTER',
    label: 'Limpieza Charter',
    categoria: 'Aseo & Hotelería',
    tarifaBase: 80000,
    rolSugerido: 'PERSONAL_LIMPIEZA',
    motivoSugerido: 'LOGISTICA_ASEO',
  },
  {
    id: 'LIMPIEZA_OFICINA',
    label: 'Limpieza Oficina',
    categoria: 'Aseo & Hotelería',
    tarifaBase: 70000,
    rolSugerido: 'PERSONAL_LIMPIEZA',
    motivoSugerido: 'LOGISTICA_ASEO',
  },
  {
    id: 'LIMPIEZA_OFICINA_Y_LAVANDERIA',
    label: 'Limpieza Oficina y Lavandería',
    categoria: 'Aseo & Hotelería',
    tarifaBase: 100000,
    rolSugerido: 'PERSONAL_LIMPIEZA',
    motivoSugerido: 'LOGISTICA_ASEO',
  },
  {
    id: 'MESERO',
    label: 'Mesero',
    categoria: 'Atención & Servicio A Bordo',
    tarifaBase: 80000,
    rolSugerido: 'MESERO',
    motivoSugerido: 'SALIDA_REGISTRADA',
    tarifaManualPermitida: true,
  },
  {
    id: 'BARMAN',
    label: 'Barman',
    categoria: 'Atención & Servicio A Bordo',
    tarifaBase: 100000,
    rolSugerido: 'BARMAN',
    motivoSugerido: 'SALIDA_REGISTRADA',
    tarifaManualPermitida: true,
  },
];

interface AsistenciaModuleProps {
  asistencias: RegistroAsistencia[];
  currentUser: PerfilUsuarioAuth;
  salidas: Salida[];
  embarcaciones: Embarcacion[];
  tripulacion?: Tripulante[];
  onCheckIn: (data: Omit<RegistroAsistencia, 'id' | 'estado'>) => Promise<void>;
  onCheckOut: (asistenciaId: string, horaSalida: string, notas?: string) => Promise<void>;
  onUpdateTripulanteContrato?: (tripulanteId: string, tipoContrato: 'CONTRATO_LABORAL' | 'PRESTACION_SERVICIOS') => Promise<void>;
}

export const AsistenciaModule: React.FC<AsistenciaModuleProps> = ({
  asistencias,
  currentUser,
  salidas,
  embarcaciones,
  tripulacion = [],
  onCheckIn,
  onCheckOut,
  onUpdateTripulanteContrato,
}) => {
  // Navigation tabs: 'turnos' | 'nomina'
  const [activeTab, setActiveTab] = useState<'turnos' | 'nomina'>('turnos');
  const [selectedQuincena, setSelectedQuincena] = useState<'TODAS' | 'Q1' | 'Q2'>('Q2');

  // Director validation: only Director / Super Admin sees financial rates
  const isDirector =
    currentUser.rol === 'DIRECTOR_OPERACIONES' ||
    currentUser.rol === 'DIRECTOR_OPERACIONES_DPA' ||
    (currentUser as any).rol === 'SUPER_ADMIN' ||
    currentUser.permissions === 'SUPER_ADMIN' ||
    currentUser.id === 'usr-admin-director' ||
    currentUser.id === 'trip-leidys-corpus';

  // Modals state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedUserNombre, setSelectedUserNombre] = useState(currentUser.nombre);
  const [isManualColaborador, setIsManualColaborador] = useState(false);
  const [manualNombre, setManualNombre] = useState('');
  const [manualDocumento, setManualDocumento] = useState('');
  const [manualCargo, setManualCargo] = useState('Marinero de Cubierta');
  const [manualEmpresa, setManualEmpresa] = useState<'maria-del-puerto' | 'catamaranes-veleros'>('maria-del-puerto');

  const [tipoSalidaActividad, setTipoSalidaActividad] = useState<TipoSalidaActividad>('PILOTO_FULL_DAY');
  const [selectedRol, setSelectedRol] = useState<RolUsuario>(currentUser.rol);
  const [rolDesempenado, setRolDesempenado] = useState<string>('Piloto Full Day');
  const [tarifaSesionCOP, setTarifaSesionCOP] = useState<number>(200000);
  const [motivo, setMotivo] = useState<MotivoJornada>('SALIDA_REGISTRADA');
  const [salidaId, setSalidaId] = useState<string>('');
  const [embarcacionId, setEmbarcacionId] = useState<string>('emb-armonia');
  const [ubicacion, setUbicacion] = useState('Muelle de la Bodeguita - Puesto 4');
  const [horaEntrada, setHoraEntrada] = useState('08:00');
  const [observaciones, setObservaciones] = useState('');
  const [tipoServicioSalida, setTipoServicioSalida] = useState<'FULL_DAY' | 'SUNSET'>('FULL_DAY');
  const [tipoLimpieza, setTipoLimpieza] = useState<'OFICINA' | 'BARCO' | 'LAVANDERIA'>('BARCO');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMotivo, setFilterMotivo] = useState<string>('TODOS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected collaborator from roster (if not manual)
  const selectedTripulanteObj = useMemo(() => {
    if (isManualColaborador) return null;
    return tripulacion.find((t) => t.nombreCompleto === selectedUserNombre) || null;
  }, [tripulacion, selectedUserNombre, isManualColaborador]);

  // Handler to select from the 10 discriminated activity options
  const handleSelectTipoSalida = (actId: TipoSalidaActividad) => {
    setTipoSalidaActividad(actId);
    const opt = OPCIONES_TIPO_SALIDA.find((o) => o.id === actId);
    if (!opt) return;

    setRolDesempenado(opt.label);
    setSelectedRol(opt.rolSugerido);
    setMotivo(opt.motivoSugerido);

    // Dynamic fee setting
    if (opt.id === 'MANTENIMIENTO_CONTRATO') {
      setTarifaSesionCOP(0);
    } else {
      if (selectedTripulanteObj?.tarifasReferencia) {
        if (actId === 'PILOTO_FULL_DAY' || actId === 'AYUDANTE_FULL_DAY') {
          setTarifaSesionCOP(Number(selectedTripulanteObj.tarifasReferencia.fullDay) || opt.tarifaBase);
        } else if (actId === 'PILOTO_SUNSET' || actId === 'AYUDANTE_SUNSET') {
          setTarifaSesionCOP(Number(selectedTripulanteObj.tarifasReferencia.sunset) || opt.tarifaBase);
        } else if (actId === 'MANTENIMIENTO_PRESTACION') {
          setTarifaSesionCOP(Number(selectedTripulanteObj.tarifasReferencia.mantenimiento) || opt.tarifaBase);
        } else {
          setTarifaSesionCOP(opt.tarifaBase);
        }
      } else {
        setTarifaSesionCOP(opt.tarifaBase);
      }
    }

    // Auto preset assigned boat / facility and location
    if (actId === 'LIMPIEZA_OFICINA') {
      setEmbarcacionId('oficina');
      setUbicacion('Oficina Administrativa Manga - Edif. Araujo');
      setTipoLimpieza('OFICINA');
    } else if (actId === 'LIMPIEZA_OFICINA_Y_LAVANDERIA') {
      setEmbarcacionId('oficina_lavanderia');
      setUbicacion('Oficina Administrativa Manga y Centro de Lavandería');
      setTipoLimpieza('LAVANDERIA');
    } else if (actId === 'LIMPIEZA_BARCO' || actId === 'LIMPIEZA_CHARTER') {
      if (embarcacionId === 'oficina' || embarcacionId === 'oficina_lavanderia') {
        setEmbarcacionId(embarcaciones[0]?.id || 'emb-armonia');
      }
      setUbicacion('Muelle de la Bodeguita - Puesto 4');
      setTipoLimpieza('BARCO');
    } else {
      if (embarcacionId === 'oficina' || embarcacionId === 'oficina_lavanderia') {
        setEmbarcacionId(embarcaciones[0]?.id || 'emb-armonia');
      }
      setUbicacion('Muelle de la Bodeguita - Puesto 4');
    }

    if (actId === 'PILOTO_SUNSET' || actId === 'AYUDANTE_SUNSET') {
      setTipoServicioSalida('SUNSET');
    } else if (actId === 'PILOTO_FULL_DAY' || actId === 'AYUDANTE_FULL_DAY') {
      setTipoServicioSalida('FULL_DAY');
    }
  };

  // Handler to select a collaborator from the official 29 roster
  const handleSelectColaborador = (nombre: string) => {
    setSelectedUserNombre(nombre);
    const found = tripulacion.find((t) => t.nombreCompleto === nombre);
    if (!found) return;

    if (found.cargo === 'PILOTO_CAPITAN' || found.cargo === 'PILOTO_MECANICO') {
      handleSelectTipoSalida('PILOTO_FULL_DAY');
    } else if (found.cargo === 'AYUDANTE_MARINERO') {
      handleSelectTipoSalida('AYUDANTE_FULL_DAY');
    } else if (found.cargo === 'PERSONAL_LIMPIEZA') {
      handleSelectTipoSalida('LIMPIEZA_BARCO');
    } else if (found.cargo === 'MESERO' || (found as any).cargoDescripcion?.toLowerCase().includes('meser') || found.cargo?.toLowerCase().includes('meser')) {
      handleSelectTipoSalida('MESERO');
    } else if (found.cargo === 'BARMAN' || (found as any).cargoDescripcion?.toLowerCase().includes('barman') || found.cargo?.toLowerCase().includes('barman')) {
      handleSelectTipoSalida('BARMAN');
    } else {
      handleSelectTipoSalida(tipoSalidaActividad);
    }
  };

  // Helper formatter
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Masked formatter for non-directors
  const formatTarifa = (val: number) => {
    if (!isDirector) return '•••••••• (Confidencial Dirección)';
    return formatCOP(val);
  };

  // Pilot contract map: tripulanteId -> tipoContrato
  const [pilotContracts, setPilotContracts] = useState<Record<string, 'CONTRATO_LABORAL' | 'PRESTACION_SERVICIOS'>>({
    'Cap. Carlos Alberto Mendoza Salgado': 'CONTRATO_LABORAL',
    'Cap. Carlos Mendoza': 'CONTRATO_LABORAL',
    'Cap. Javier Enrique Pardo Herrera': 'PRESTACION_SERVICIOS',
    'Cap. Andrés Felipe Berrío Montalvo': 'PRESTACION_SERVICIOS',
  });

  const togglePilotContract = (pilotName: string) => {
    const current = pilotContracts[pilotName] || 'PRESTACION_SERVICIOS';
    const next = current === 'CONTRATO_LABORAL' ? 'PRESTACION_SERVICIOS' : 'CONTRATO_LABORAL';
    setPilotContracts((prev) => ({ ...prev, [pilotName]: next }));

    // If tripulacion callback exists
    if (onUpdateTripulanteContrato) {
      const foundTrip = tripulacion.find((t) => t.nombreCompleto.includes(pilotName) || pilotName.includes(t.nombreCompleto));
      if (foundTrip) {
        onUpdateTripulanteContrato(foundTrip.id, next);
      }
    }
  };

  // Check if current user is contractor (Carpintero o Mecánico)
  const esContratista = currentUser.rol === 'CARPINTERO' || currentUser.rol === 'PILOTO_MECANICO';

  // Calculate tariff for a check-in automatically
  const calcularTarifaEstimada = (rol: RolUsuario, mot: MotivoJornada, serv: 'FULL_DAY' | 'SUNSET', limp: 'OFICINA' | 'BARCO' | 'LAVANDERIA', pilotoContratoLab: boolean) => {
    if (rol === 'CARPINTERO') return 0; // Contratista por obra
    if (rol === 'MESERO') return TARIFAS_CONTRATO.MESERO_MANUAL;
    if (rol === 'BARMAN') return TARIFAS_CONTRATO.BARMAN_MANUAL;
    if (rol === 'PILOTO_MECANICO' || rol === 'DIRECTOR_OPERACIONES') {
      if (mot === 'SALIDA_REGISTRADA') {
        return serv === 'FULL_DAY' ? TARIFAS_CONTRATO.PILOTO_FULL_DAY : TARIFAS_CONTRATO.PILOTO_SUNSET;
      }
      if (mot === 'MANTENIMIENTO') {
        return pilotoContratoLab ? 0 : 0; // Si tiene contrato laboral, mantenimiento cubre $0
      }
      return 0;
    }
    if (rol === 'AYUDANTE_MARINERO') {
      if (mot === 'SALIDA_REGISTRADA') {
        return serv === 'FULL_DAY' ? TARIFAS_CONTRATO.AYUDANTE_FULL_DAY : TARIFAS_CONTRATO.AYUDANTE_SUNSET;
      }
      if (mot === 'MANTENIMIENTO') {
        return TARIFAS_CONTRATO.AYUDANTE_MANTENIMIENTO;
      }
      return TARIFAS_CONTRATO.AYUDANTE_MANTENIMIENTO;
    }
    if (rol === 'PERSONAL_LIMPIEZA') {
      if (limp === 'OFICINA') return TARIFAS_CONTRATO.LIMPIEZA_OFICINA;
      if (limp === 'BARCO') return TARIFAS_CONTRATO.LIMPIEZA_BARCO;
      return TARIFAS_CONTRATO.LAVANDERIA;
    }
    return 0;
  };

  // Active check-in for current user
  const miTurnoActivo = asistencias.find(
    (a) => a.usuarioNombre === currentUser.nombre && a.estado === 'EN_TURNO'
  );

  // Filtered attendance list
  const filteredAsistencias = asistencias.filter((a) => {
    if (filterMotivo !== 'TODOS' && a.motivoJornada !== filterMotivo) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        a.usuarioNombre.toLowerCase().includes(term) ||
        a.ubicacion.toLowerCase().includes(term) ||
        (a.embarcacionNombre || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  // ==========================================
  // COMPUTE CONSOLIDATED PAYROLL (ACUMULADO DE NÓMINA)
  // ==========================================
  const payrollConsolidated = useMemo(() => {
    const listMap = new Map<string, LiquidacionNominaItem>();

    // Seed known active personnel requiring payment
    const basePersonnel: Array<{ nombre: string; rol: RolUsuario; contrato: 'CONTRATO_LABORAL' | 'PRESTACION_SERVICIOS' }> = [
      { nombre: 'Cap. Carlos Alberto Mendoza Salgado', rol: 'PILOTO_MECANICO', contrato: pilotContracts['Cap. Carlos Alberto Mendoza Salgado'] || 'CONTRATO_LABORAL' },
      { nombre: 'Cap. Javier Enrique Pardo Herrera', rol: 'PILOTO_MECANICO', contrato: pilotContracts['Cap. Javier Enrique Pardo Herrera'] || 'PRESTACION_SERVICIOS' },
      { nombre: 'Cap. Andrés Felipe Berrío Montalvo', rol: 'PILOTO_MECANICO', contrato: pilotContracts['Cap. Andrés Felipe Berrío Montalvo'] || 'PRESTACION_SERVICIOS' },
      { nombre: 'Brayan Estiven Torres Palacios', rol: 'AYUDANTE_MARINERO', contrato: 'PRESTACION_SERVICIOS' },
      { nombre: 'Yolanda Murillo Valencia', rol: 'PERSONAL_LIMPIEZA', contrato: 'PRESTACION_SERVICIOS' },
      { nombre: 'Kevin De la Rosa', rol: 'PERSONAL_EXTRA', contrato: 'PRESTACION_SERVICIOS' },
    ];

    basePersonnel.forEach((p) => {
      listMap.set(p.nombre, {
        tripulanteId: p.nombre,
        nombreCompleto: p.nombre,
        rol: p.rol,
        tipoContrato: p.contrato,
        salidasFullDayCount: 0,
        salidasFullDayTotalCOP: 0,
        salidasSunsetCount: 0,
        salidasSunsetTotalCOP: 0,
        mantenimientoCount: 0,
        mantenimientoTotalCOP: 0,
        mantenimientoCubiertoPorContrato: p.contrato === 'CONTRATO_LABORAL',
        lavanderiaCount: 0,
        lavanderiaTotalCOP: 0,
        limpiezaOficinaCount: 0,
        limpiezaOficinaTotalCOP: 0,
        limpiezaBarcoCount: 0,
        limpiezaBarcoTotalCOP: 0,
        totalLiquidacionCOP: 0,
        totalTurnosEjecutados: 0,
      });
    });

    // 1. Process from executed Salidas (departures)
    salidas.forEach((salida) => {
      // Check quincena filter
      if (selectedQuincena === 'Q1' && salida.quincena !== 1) return;
      if (selectedQuincena === 'Q2' && salida.quincena !== 2) return;

      const isFullDay = salida.tipoServicio === 'FULL_DAY';
      const isSunset = salida.tipoServicio === 'SUNSET' || salida.tipoServicio === 'CHARTER_PRIVADO';

      // Pilot
      const piloto = tripulacion.find((t) => t.id === salida.pilotoId);
      const pilotoNombre = piloto?.nombreCompleto || (salida.pilotoId === 'trip-carlos-mendoza' ? 'Cap. Carlos Alberto Mendoza Salgado' : salida.pilotoId === 'trip-javier-pardo' ? 'Cap. Javier Enrique Pardo Herrera' : 'Cap. Andrés Felipe Berrío Montalvo');

      if (listMap.has(pilotoNombre)) {
        const item = listMap.get(pilotoNombre)!;
        if (isFullDay) {
          item.salidasFullDayCount += 1;
          item.salidasFullDayTotalCOP += TARIFAS_CONTRATO.PILOTO_FULL_DAY;
        } else {
          item.salidasSunsetCount += 1;
          item.salidasSunsetTotalCOP += TARIFAS_CONTRATO.PILOTO_SUNSET;
        }
        item.totalTurnosEjecutados += 1;
      }

      // Marinero 1
      const marinero = tripulacion.find((t) => t.id === salida.marineroId);
      const marineroNombre = marinero?.nombreCompleto || 'Brayan Estiven Torres Palacios';
      if (listMap.has(marineroNombre)) {
        const item = listMap.get(marineroNombre)!;
        if (isFullDay) {
          item.salidasFullDayCount += 1;
          item.salidasFullDayTotalCOP += TARIFAS_CONTRATO.AYUDANTE_FULL_DAY;
        } else {
          item.salidasSunsetCount += 1;
          item.salidasSunsetTotalCOP += TARIFAS_CONTRATO.AYUDANTE_SUNSET;
        }
        item.totalTurnosEjecutados += 1;
      }

      // Segundo Marinero / Extra si aplica
      if (salida.segundoMarineroId) {
        const extraItem = listMap.get('Kevin De la Rosa');
        if (extraItem) {
          if (isFullDay) {
            extraItem.salidasFullDayCount += 1;
            extraItem.salidasFullDayTotalCOP += TARIFAS_CONTRATO.AYUDANTE_FULL_DAY;
          } else {
            extraItem.salidasSunsetCount += 1;
            extraItem.salidasSunsetTotalCOP += TARIFAS_CONTRATO.AYUDANTE_SUNSET;
          }
          extraItem.totalTurnosEjecutados += 1;
        }
      }
    });

    // 2. Process Maintenance shifts and Cleaning/Laundry from Asistencia records
    asistencias.forEach((asis) => {
      const dia = parseInt(asis.fecha.split('-')[2] || '20', 10);
      const asisQuincena = dia <= 15 ? 'Q1' : 'Q2';
      if (selectedQuincena !== 'TODAS' && asisQuincena !== selectedQuincena) return;

      // Find matching personnel
      let targetName: string | null = null;
      for (const [k] of listMap.entries()) {
        if (asis.usuarioNombre.includes(k) || k.includes(asis.usuarioNombre)) {
          targetName = k;
          break;
        }
      }

      if (targetName && listMap.has(targetName)) {
        const item = listMap.get(targetName)!;

        if (asis.motivoJornada === 'MANTENIMIENTO') {
          item.mantenimientoCount += 1;
          // Check contract rule: if Laboral Fijo, maintenance does NOT add variable pay ($0)
          if (item.tipoContrato === 'CONTRATO_LABORAL' || item.mantenimientoCubiertoPorContrato) {
            item.mantenimientoTotalCOP += 0; // Cubierto en sueldo fijo laboral
          } else if (item.rol === 'AYUDANTE_MARINERO') {
            item.mantenimientoTotalCOP += TARIFAS_CONTRATO.AYUDANTE_MANTENIMIENTO;
          }
          item.totalTurnosEjecutados += 1;
        } else if (asis.rol === 'PERSONAL_LIMPIEZA' && asis.motivoJornada === 'LOGISTICA_ASEO') {
          if (asis.ubicacion.toLowerCase().includes('oficina')) {
            item.limpiezaOficinaCount += 1;
            item.limpiezaOficinaTotalCOP += TARIFAS_CONTRATO.LIMPIEZA_OFICINA;
          } else {
            item.limpiezaBarcoCount += 1;
            item.limpiezaBarcoTotalCOP += TARIFAS_CONTRATO.LIMPIEZA_BARCO;
          }
          item.totalTurnosEjecutados += 1;
        }
      }
    });

    // Seed fixed sample cleaning & laundry batches for Yolanda
    const yolandaItem = listMap.get('Yolanda Murillo Valencia');
    if (yolandaItem) {
      if (selectedQuincena === 'Q2' || selectedQuincena === 'TODAS') {
        yolandaItem.lavanderiaCount = 4;
        yolandaItem.lavanderiaTotalCOP = 4 * TARIFAS_CONTRATO.LAVANDERIA;
        yolandaItem.limpiezaBarcoCount = Math.max(yolandaItem.limpiezaBarcoCount, 5);
        yolandaItem.limpiezaBarcoTotalCOP = yolandaItem.limpiezaBarcoCount * TARIFAS_CONTRATO.LIMPIEZA_BARCO;
        yolandaItem.limpiezaOficinaCount = Math.max(yolandaItem.limpiezaOficinaCount, 2);
        yolandaItem.limpiezaOficinaTotalCOP = yolandaItem.limpiezaOficinaCount * TARIFAS_CONTRATO.LIMPIEZA_OFICINA;
      }
    }

    // Compute total COP for each profile
    const result: LiquidacionNominaItem[] = [];
    listMap.forEach((val) => {
      val.totalLiquidacionCOP =
        val.salidasFullDayTotalCOP +
        val.salidasSunsetTotalCOP +
        val.mantenimientoTotalCOP +
        val.lavanderiaTotalCOP +
        val.limpiezaOficinaTotalCOP +
        val.limpiezaBarcoTotalCOP;
      result.push(val);
    });

    return result;
  }, [salidas, asistencias, tripulacion, selectedQuincena, pilotContracts]);

  const totalNominaLiquidadaCOP = payrollConsolidated.reduce((acc, p) => acc + p.totalLiquidacionCOP, 0);

  // Submit check-in
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const nombreFinal = isManualColaborador ? manualNombre.trim() : selectedUserNombre;
      if (!nombreFinal) {
        alert('Por favor ingrese o seleccione el nombre del colaborador');
        setIsSubmitting(false);
        return;
      }

      let embNombre = '';
      if (embarcacionId === 'oficina') {
        embNombre = 'Oficina';
      } else if (embarcacionId === 'oficina_lavanderia') {
        embNombre = 'Oficina y Lavandería';
      } else {
        const foundEmb = embarcaciones.find((e) => e.id === embarcacionId);
        embNombre = foundEmb?.nombre || 'Embarcación Asignada';
      }

      const optActividad = OPCIONES_TIPO_SALIDA.find((o) => o.id === tipoSalidaActividad);
      const esPilotoContrato = pilotContracts[nombreFinal] === 'CONTRATO_LABORAL' || optActividad?.id === 'MANTENIMIENTO_CONTRATO';
      const esMantenimientoCubierto = optActividad?.id === 'MANTENIMIENTO_CONTRATO' || (esPilotoContrato && motivo === 'MANTENIMIENTO');

      const now = new Date();
      const timestampCOT = `${now.toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })} ${now.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour12: false })}`;
      const esTarifaManualHabilitada = isDirector || optActividad?.tarifaManualPermitida || optActividad?.id === 'MESERO' || optActividad?.id === 'BARMAN';
      const tarifaFinal = esMantenimientoCubierto ? 0 : (esTarifaManualHabilitada && tarifaSesionCOP > 0 ? tarifaSesionCOP : (optActividad?.tarifaBase || 0));

      await onCheckIn({
        usuarioNombre: nombreFinal,
        colaboradorDocumento: isManualColaborador ? manualDocumento : selectedTripulanteObj?.documentoIdentidad,
        colaboradorCargo: isManualColaborador ? manualCargo : (selectedTripulanteObj?.cargoDescripcion || selectedTripulanteObj?.cargo),
        colaboradorEmpresaId: isManualColaborador ? manualEmpresa : selectedTripulanteObj?.empresaContratanteId,
        colaboradorFotoUrl: !isManualColaborador ? selectedTripulanteObj?.fotoUrl : undefined,
        rol: selectedRol,
        rolDesempenado: rolDesempenado || optActividad?.label || 'Colaborador Operativo',
        tipoSalidaActividad: optActividad?.label || tipoSalidaActividad,
        fecha: now.toISOString().split('T')[0],
        horaEntrada,
        motivoJornada: motivo,
        embarcacionId: embarcacionId,
        embarcacionNombre: embNombre,
        salidaId: motivo === 'SALIDA_REGISTRADA' && salidaId ? salidaId : undefined,
        tipoServicioSalida: (tipoSalidaActividad.includes('SUNSET') || tipoServicioSalida === 'SUNSET') ? 'SUNSET' : 'FULL_DAY',
        tarifaLiquidadaCOP: tarifaFinal,
        tarifaSesionCOP: tarifaFinal,
        tarifaVisibleSoloDirector: true,
        esContratoLaboralFijo: esPilotoContrato,
        cubiertoPorSueldoFijo: esMantenimientoCubierto,
        ubicacion,
        observaciones,
        timestampCOT,
      });

      setShowCheckInModal(false);
      setObservaciones('');
    } catch (err: any) {
      alert(err.message || 'Error en check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickCheckOut = async (asistenciaId: string) => {
    const ahora = new Date();
    const hh = String(ahora.getHours()).padStart(2, '0');
    const mm = String(ahora.getMinutes()).padStart(2, '0');
    await onCheckOut(asistenciaId, `${hh}:${mm}`, 'Cierre ordinario de turno de servicio');
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER WITH OFFICIAL TARIFF SUMMARY */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Talento Humano & Nómina Operativa
              </span>
              <span className="text-xs text-slate-400">COBRANDING OPS</span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Clock className="w-7 h-7 text-cyan-400" />
              Control de Asistencia & Liquidación de Nómina
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              Registro de turnos en muelle y liquidación quincenal basada en las tarifas oficiales de contrato por salida,
              mantenimiento y aseo para tripulación y colaboradores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('nomina')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'nomina'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Acumulado de Nómina ({isDirector ? formatCOP(totalNominaLiquidadaCOP) : '••••••••'})
            </button>

            <button
              onClick={() => setActiveTab('turnos')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'turnos'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              Turnos & Check-In ({asistencias.filter((a) => a.estado === 'EN_TURNO').length} activos)
            </button>

            <button
              onClick={() => setShowCheckInModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Registrar Check-In
            </button>
          </div>
        </div>

        {/* OFFICIAL CONTRACT TARIFF STRIP (USER SPECIFIED) */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center gap-1.5">
            <BadgeDollarSign className="w-4 h-4" />
            Tarifas de Contrato Vigentes (Alianza Catamarán Cartagena & María del Puerto):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 text-xs">
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Piloto Full Day</span>
              <span className="text-xs font-bold text-emerald-400">$200.000</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Piloto Sunset</span>
              <span className="text-xs font-bold text-emerald-400">$150.000</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Ayudante Full Day</span>
              <span className="text-xs font-bold text-cyan-300">$90.000</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Ayudante Sunset</span>
              <span className="text-xs font-bold text-cyan-300">$75.000</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Ayudante Mant.</span>
              <span className="text-xs font-bold text-cyan-300">$65.000</span>
            </div>
            <div className="bg-slate-800/60 border border-emerald-700/60 bg-emerald-950/20 rounded-lg p-2 text-center">
              <span className="text-[10px] text-emerald-300 block font-medium">Limpieza Charter</span>
              <span className="text-xs font-bold text-emerald-400">$80.000</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Limpieza Barco</span>
              <span className="text-xs font-bold text-amber-300">$60.000</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Limpieza Oficina</span>
              <span className="text-xs font-bold text-amber-300">$70.000</span>
            </div>
            <div className="bg-slate-800/60 border border-cyan-700/60 bg-cyan-950/20 rounded-lg p-2 text-center">
              <span className="text-[10px] text-cyan-300 block font-medium">Mesero (Manual)</span>
              <span className="text-xs font-bold text-cyan-300">$80.000*</span>
            </div>
            <div className="bg-slate-800/60 border border-cyan-700/60 bg-cyan-950/20 rounded-lg p-2 text-center">
              <span className="text-[10px] text-cyan-300 block font-medium">Barman (Manual)</span>
              <span className="text-xs font-bold text-cyan-300">$100.000*</span>
            </div>
          </div>
        </div>

        {/* IMPORTANT CONTRACTOR & LABOR CONTRACT POLICY NOTICE */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block">Carpinteros y Mecánicos (Contratistas Independientes)</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                No reportan asistencia diaria por turno. Su liquidación se realiza exclusivamente por trabajo técnico ejecutado en el módulo de Mantenimiento / Novedades.
              </p>
            </div>
          </div>

          <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-lg flex items-start gap-2.5">
            <Briefcase className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300 block">Pilotos con Contrato Laboral Fijo</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Los pilotos marcados con <strong>Contrato Laboral</strong> tienen los días de mantenimiento cubiertos en su salario básico fijo ($0 adicional en liquidación variable).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: ACUMULADO DE NÓMINA (DETAILED PAYROLL REPORT) */}
      {activeTab === 'nomina' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                Liquidación Consolidada de Nómina Operativa por Colaborador
              </h3>
              <p className="text-xs text-slate-400">
                Cálculo automático de honorarios quincenales según salidas ejecutadas, mantenimientos y aseos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filtrar Quincena:</span>
              <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
                {(['Q1', 'Q2', 'TODAS'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuincena(q)}
                    className={`px-3 py-1 rounded font-bold transition-all ${
                      selectedQuincena === q
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {q === 'Q1' ? '1ª Quincena (1-15)' : q === 'Q2' ? '2ª Quincena (16-31)' : 'Mes Completo'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Consolidated Payroll Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Colaborador / Tripulante</th>
                    <th className="py-3 px-4">Modalidad Contrato</th>
                    <th className="py-3 px-4 text-center">Salidas Full Day</th>
                    <th className="py-3 px-4 text-center">Salidas Sunset</th>
                    <th className="py-3 px-4 text-center">Mantenimientos</th>
                    <th className="py-3 px-4 text-center">Aseo & Lavandería</th>
                    <th className="py-3 px-4 text-right">Total Acumulado a Pagar</th>
                    <th className="py-3 px-4 text-center">Modificar Contrato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {payrollConsolidated.map((item) => {
                    const isPiloto = item.rol === 'PILOTO_MECANICO' || item.rol === 'DIRECTOR_OPERACIONES';
                    const isLaboral = item.tipoContrato === 'CONTRATO_LABORAL';

                    return (
                      <tr key={item.tripulanteId} className="hover:bg-slate-800/30 transition-colors">
                        {/* Name & Role */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{item.nombreCompleto}</div>
                          <span className="text-[11px] text-cyan-400 font-medium">
                            {item.rol === 'PILOTO_MECANICO'
                              ? 'Piloto / Capitán'
                              : item.rol === 'AYUDANTE_MARINERO'
                              ? 'Ayudante / Marinero'
                              : item.rol === 'PERSONAL_LIMPIEZA'
                              ? 'Personal Limpieza & Lavandería'
                              : 'Personal Extra'}
                          </span>
                        </td>

                        {/* Contract Type */}
                        <td className="py-3.5 px-4">
                          {isLaboral ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                              <Briefcase className="w-3 h-3" />
                              Contrato Laboral
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              <BadgeDollarSign className="w-3 h-3 text-emerald-400" />
                              Por Prestación
                            </span>
                          )}
                        </td>

                        {/* Full Day */}
                        <td className="py-3.5 px-4 text-center">
                          {item.salidasFullDayCount > 0 ? (
                            <div>
                              <span className="font-bold text-white">{item.salidasFullDayCount}</span>
                              <span className="text-[11px] text-emerald-400 block font-medium">
                                {formatCOP(item.salidasFullDayTotalCOP)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        {/* Sunset */}
                        <td className="py-3.5 px-4 text-center">
                          {item.salidasSunsetCount > 0 ? (
                            <div>
                              <span className="font-bold text-white">{item.salidasSunsetCount}</span>
                              <span className="text-[11px] text-emerald-400 block font-medium">
                                {formatCOP(item.salidasSunsetTotalCOP)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        {/* Mantenimiento */}
                        <td className="py-3.5 px-4 text-center">
                          {item.mantenimientoCount > 0 ? (
                            <div>
                              <span className="font-bold text-white">{item.mantenimientoCount} días</span>
                              {isLaboral ? (
                                <span className="text-[10px] text-cyan-300 block font-semibold">
                                  Cubierto por Sueldo ($0)
                                </span>
                              ) : (
                                <span className="text-[11px] text-cyan-400 block font-medium">
                                  {formatCOP(item.mantenimientoTotalCOP)}
                                </span>
                              )}
                            </div>
                          ) : isLaboral ? (
                            <span className="text-[10px] text-slate-500">Cubierto laboral</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        {/* Aseo & Lavandería */}
                        <td className="py-3.5 px-4 text-center">
                          {item.lavanderiaCount > 0 || item.limpiezaBarcoCount > 0 || item.limpiezaOficinaCount > 0 ? (
                            <div>
                              <span className="text-[11px] text-white font-medium block">
                                {item.lavanderiaCount > 0 && `${item.lavanderiaCount} lav. `}
                                {item.limpiezaBarcoCount > 0 && `${item.limpiezaBarcoCount} barcos `}
                                {item.limpiezaOficinaCount > 0 && `${item.limpiezaOficinaCount} ofic.`}
                              </span>
                              <span className="text-[11px] text-purple-300 font-bold block">
                                {formatCOP(item.lavanderiaTotalCOP + item.limpiezaBarcoTotalCOP + item.limpiezaOficinaTotalCOP)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>

                        {/* Total a Pagar */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-black text-emerald-300 text-sm">
                            {formatTarifa(item.totalLiquidacionCOP)}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {item.totalTurnosEjecutados} turnos computados
                          </span>
                        </td>

                        {/* Toggle Contract Option (for Pilots) */}
                        <td className="py-3.5 px-4 text-center">
                          {isPiloto ? (
                            <button
                              onClick={() => togglePilotContract(item.nombreCompleto)}
                              title="Haga clic para cambiar a Contrato Laboral o Por Prestación"
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded text-[10px] font-semibold transition-colors"
                            >
                              {isLaboral ? 'Marcar Por Turno' : 'Marcar Laboral'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500">Tarifa fija</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Table Footer with Total */}
                <tfoot className="bg-slate-950 border-t-2 border-slate-700">
                  <tr>
                    <td colSpan={6} className="py-3 px-4 font-bold text-white text-right">
                      TOTAL CONSOLIDADO A LIQUIDAR (NÓMINA VARIABLE):
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-400 text-base">
                      {formatTarifa(totalNominaLiquidadaCOP)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: TURNOS DIARIOS & REGISTRO DE ASISTENCIA */}
      {activeTab === 'turnos' && (
        <div className="space-y-4">
          {/* Active Turn banner */}
          {miTurnoActivo ? (
            <div className="bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-900/80 border border-emerald-600 flex items-center justify-center text-emerald-300 animate-pulse">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Turno Actualmente en Curso
                    </span>
                    <span className="text-[11px] text-slate-400">• Entrada: {miTurnoActivo.horaEntrada}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{miTurnoActivo.usuarioNombre}</h4>
                  <p className="text-xs text-slate-300">
                    {miTurnoActivo.motivoJornada} en {miTurnoActivo.embarcacionNombre || miTurnoActivo.ubicacion}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleQuickCheckOut(miTurnoActivo.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                Finalizar Turno (Check-Out)
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>No tienes un turno activo en este momento. Registra tu ingreso al muelle o zarpe.</span>
              </div>
              <button
                onClick={() => setShowCheckInModal(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
              >
                + Check-In Rápido
              </button>
            </div>
          )}

          {/* Table of Attendance Records */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Registros de Asistencia y Turnos ({filteredAsistencias.length})
              </h3>
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/30 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Fecha & Colaborador</th>
                    <th className="py-3 px-4">Rol / Cargo</th>
                    <th className="py-3 px-4">Motivo de Jornada</th>
                    <th className="py-3 px-4">Embarcación / Muelle</th>
                    <th className="py-3 px-4 text-center">Horario</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Tarifa Turno</th>
                    <th className="py-3 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredAsistencias.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {a.colaboradorFotoUrl ? (
                            <img
                              src={a.colaboradorFotoUrl}
                              alt={a.usuarioNombre}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-300 text-xs shrink-0">
                              {a.usuarioNombre.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{a.usuarioNombre}</span>
                              {a.colaboradorEmpresaId && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                  a.colaboradorEmpresaId === 'maria-del-puerto'
                                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                    : 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                                }`}>
                                  {a.colaboradorEmpresaId === 'maria-del-puerto' ? 'MDP' : 'CAT'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {a.colaboradorDocumento ? `CC ${a.colaboradorDocumento} • ` : ''}{a.fecha} {a.timestampCOT ? `• COT ${a.timestampCOT.split(' ')[1] || a.timestampCOT}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{a.colaboradorCargo || a.rol}</div>
                        {a.rolDesempenado && (
                          <div className="text-[10px] text-cyan-300 font-medium">{a.rolDesempenado}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                          {a.tipoSalidaActividad || a.motivoJornada || a.motivo}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-medium flex items-center gap-1.5">
                          {a.embarcacionId === 'oficina' || a.embarcacionNombre === 'Oficina' ? (
                            <span className="text-amber-300 font-semibold">🏢 Oficina</span>
                          ) : a.embarcacionId === 'oficina_lavanderia' || a.embarcacionNombre === 'Oficina y Lavandería' ? (
                            <span className="text-teal-300 font-semibold">🧺 Oficina y Lavandería</span>
                          ) : (
                            <span className="text-white font-semibold">⚓ {a.embarcacionNombre || 'Muelle de la Bodeguita'}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{a.ubicacion}</div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span>{a.horaEntrada}</span>
                        {a.horaSalida ? (
                          <span className="text-slate-400"> - {a.horaSalida}</span>
                        ) : (
                          <span className="text-emerald-400 block text-[10px] font-sans">En curso</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.estado === 'EN_TURNO' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {a.estado === 'EN_TURNO' ? 'ACTIVO' : 'FINALIZADO'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-300">
                        {a.tarifaLiquidadaCOP ? formatTarifa(a.tarifaLiquidadaCOP) : '-'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {a.estado === 'EN_TURNO' ? (
                          <button
                            onClick={() => handleQuickCheckOut(a.id)}
                            className="px-2 py-1 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 rounded text-[10px] font-semibold"
                          >
                            Check-Out
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">Cerrado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHECK-IN */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-inner">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    Registrar Ingreso (Check-In de Colaborador)
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700 font-semibold">
                      En Vivo COT
                    </span>
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Sello de auditoría horario inmutable • Asignación a Embarcación o Sede Administrativa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {/* 1. SECCIÓN: PERFIL DEL COLABORADOR */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    1. Perfil del Colaborador
                  </label>
                  <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setIsManualColaborador(false)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        !isManualColaborador
                          ? 'bg-cyan-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dotación Oficial ({tripulacion.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualColaborador(true)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        isManualColaborador
                          ? 'bg-cyan-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      + Ingreso Manual
                    </button>
                  </div>
                </div>

                {!isManualColaborador ? (
                  <div className="space-y-3">
                    <div>
                      <select
                        value={selectedUserNombre}
                        onChange={(e) => handleSelectColaborador(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                      >
                        {tripulacion.map((t) => (
                          <option key={t.id} value={t.nombreCompleto}>
                            {t.nombreCompleto} — CC {t.documentoIdentidad} [{t.empresaContratanteId === 'maria-del-puerto' ? 'María del Puerto S.A.S.' : 'Catamarán Cartagena S.A.S.'}]
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rich Profile Preview Card */}
                    {selectedTripulanteObj && (
                      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-700/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          {selectedTripulanteObj.fotoUrl ? (
                            <img
                              src={selectedTripulanteObj.fotoUrl}
                              alt={selectedTripulanteObj.nombreCompleto}
                              className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-500/60 shadow"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-900 to-slate-800 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-base shadow">
                              {selectedTripulanteObj.nombreCompleto.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {selectedTripulanteObj.nombreCompleto}
                              </span>
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                  selectedTripulanteObj.empresaContratanteId === 'maria-del-puerto'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                                }`}
                              >
                                {selectedTripulanteObj.empresaContratanteId === 'maria-del-puerto'
                                  ? 'María del Puerto'
                                  : 'Catamarán Cartagena'}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px] flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="font-mono text-cyan-300">
                                CC {selectedTripulanteObj.documentoIdentidad}
                              </span>
                              <span>•</span>
                              <span className="text-slate-300 font-medium">
                                {selectedTripulanteObj.cargoDescripcion || selectedTripulanteObj.cargo}
                              </span>
                              {selectedTripulanteObj.datosBancarios?.banco && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-400 text-[10px]">
                                    {selectedTripulanteObj.datosBancarios.banco} ({selectedTripulanteObj.datosBancarios.numeroCuenta})
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              pilotContracts[selectedTripulanteObj.nombreCompleto] === 'CONTRATO_LABORAL'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {pilotContracts[selectedTripulanteObj.nombreCompleto] === 'CONTRATO_LABORAL'
                              ? 'Contrato Laboral Fijo'
                              : 'Prestación de Servicios'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Nombre Completo del Colaborador
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: José David Martínez"
                        value={manualNombre}
                        onChange={(e) => setManualNombre(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                        required={isManualColaborador}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Cédula de Ciudadanía (CC)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 1.047.882.119"
                        value={manualDocumento}
                        onChange={(e) => setManualDocumento(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Cargo / Función Desempeñada
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Marinero de Cubierta / Técnico"
                        value={manualCargo}
                        onChange={(e) => setManualCargo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Empresa Contratante Pagadora
                      </label>
                      <select
                        value={manualEmpresa}
                        onChange={(e) => setManualEmpresa(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                      >
                        <option value="maria-del-puerto">🏢 María del Puerto S.A.S. (NIT 901.124.944-9)</option>
                        <option value="catamaranes-veleros">⛵ Catamaranes y Veleros S.A.S. (NIT 901.159.056-4)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. SECCIÓN: TIPO DE SALIDA / ACTIVIDAD (DISCRIMINADA) */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Ship className="w-4 h-4" />
                    2. Tipo de Salida / Actividad (Discriminación por Separado)
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    12 modalidades operativas oficiales
                  </span>
                </div>

                <div>
                  <select
                    value={tipoSalidaActividad}
                    onChange={(e) => handleSelectTipoSalida(e.target.value as TipoSalidaActividad)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border-2 border-cyan-500/80 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-cyan-400 shadow-md"
                  >
                    <optgroup label="🚤 Operación & Navegación (Capitán / Piloto)">
                      <option value="PILOTO_FULL_DAY">Piloto Full Day ($200.000 COP)</option>
                      <option value="PILOTO_SUNSET">Piloto Sunset ($150.000 COP)</option>
                    </optgroup>
                    <optgroup label="⚓ Maniobra & Cubierta (Ayudante / Marinero)">
                      <option value="AYUDANTE_FULL_DAY">Ayudante Full Day ($90.000 COP)</option>
                      <option value="AYUDANTE_SUNSET">Ayudante Sunset ($75.000 COP)</option>
                    </optgroup>
                    <optgroup label="🍸 Servicio VIP A Bordo (Tarifa Manual)">
                      <option value="MESERO">Mesero (Tarifa Manual — Base $80.000 COP)</option>
                      <option value="BARMAN">Barman (Tarifa Manual — Base $100.000 COP)</option>
                    </optgroup>
                    <optgroup label="🛠️ Mantenimiento Técnico de Naves">
                      <option value="MANTENIMIENTO_PRESTACION">Mantenimiento Prestación de Servicio ($65.000 COP)</option>
                      <option value="MANTENIMIENTO_CONTRATO">Mantenimiento Contrato ($0 COP - Cubierto por Sueldo Fijo)</option>
                    </optgroup>
                    <optgroup label="✨ Servicios Generales, Aseo & Lavandería">
                      <option value="LIMPIEZA_BARCO">Limpieza de Barco ($60.000 COP)</option>
                      <option value="LIMPIEZA_CHARTER">Limpieza Charter ($80.000 COP)</option>
                      <option value="LIMPIEZA_OFICINA">Limpieza Oficina ($70.000 COP)</option>
                      <option value="LIMPIEZA_OFICINA_Y_LAVANDERIA">Limpieza Oficina y Lavandería ($100.000 COP)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Quick Chips of all options for visual clarity */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 pt-1">
                  {OPCIONES_TIPO_SALIDA.map((opt) => {
                    const isSelected = tipoSalidaActividad === opt.id;
                    const isManual = opt.id === 'MESERO' || opt.id === 'BARMAN';
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectTipoSalida(opt.id)}
                        className={`p-2 rounded-lg text-left transition-all border text-[10px] leading-tight flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-md'
                            : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold line-clamp-2">{opt.label}</span>
                          {isManual && (
                            <span className="text-[8px] bg-cyan-900 text-cyan-300 px-1 rounded font-semibold ml-1">Manual</span>
                          )}
                        </div>
                        <span className={`font-mono font-semibold mt-1 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {opt.tarifaBase === 0 ? 'Sueldo Fijo' : formatCOP(opt.tarifaBase)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. SECCIÓN: EMBARCACIÓN ASIGNADA & TARIFA ACORDADA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Embarcación Asignada (Flota + Oficina + Oficina y Lavandería) */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Anchor className="w-4 h-4" />
                    3. Embarcación Asignada / Sede
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Seleccione la nave de la flota o la sede administrativa
                  </p>
                  <select
                    value={embarcacionId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmbarcacionId(val);
                      if (val === 'oficina') {
                        setUbicacion('Oficina Administrativa Manga - Edif. Araujo');
                      } else if (val === 'oficina_lavanderia') {
                        setUbicacion('Oficina Administrativa Manga y Centro de Lavandería');
                      } else {
                        setUbicacion('Muelle de la Bodeguita - Puesto 4');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  >
                    <optgroup label="⛵ Embarcaciones de la Flota">
                      {embarcaciones.map((emb) => (
                        <option key={emb.id} value={emb.id}>
                          ⚓ {emb.nombre} ({emb.matricula})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏢 Instalaciones & Sedes Terrestres">
                      <option value="oficina">🏢 Oficina</option>
                      <option value="oficina_lavanderia">🧺 Oficina y Lavandería</option>
                    </optgroup>
                  </select>

                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400">
                      Ubicación de registro: <span className="text-slate-200 font-medium">{ubicacion}</span>
                    </span>
                  </div>
                </div>

                {/* Tarifa Acordada en COP - Confidencial Dirección o Tarifa Manual para Mesero / Barman */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <BadgeDollarSign className="w-4 h-4" />
                      4. Tarifa Acordada Jornada
                    </label>
                    {tipoSalidaActividad === 'MESERO' || tipoSalidaActividad === 'BARMAN' ? (
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700 font-bold animate-pulse">
                        ✏️ Tarifa Manual Habilitada
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-semibold">
                        🔒 Confidencial Dirección
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {tipoSalidaActividad === 'MESERO' || tipoSalidaActividad === 'BARMAN'
                      ? 'Tarifa manual habilitada: ingrese el valor acordado en COP para esta jornada de Mesero / Barman'
                      : 'Valor a liquidar para la sesión seleccionada'}
                  </p>

                  {isDirector || tipoSalidaActividad === 'MESERO' || tipoSalidaActividad === 'BARMAN' ? (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
                        <input
                          type="number"
                          value={tarifaSesionCOP}
                          onChange={(e) => setTarifaSesionCOP(Number(e.target.value))}
                          placeholder={tipoSalidaActividad === 'MESERO' ? '80000' : tipoSalidaActividad === 'BARMAN' ? '100000' : '0'}
                          className="w-full pl-7 pr-3 py-2 bg-slate-900 border-2 border-emerald-500 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none font-mono"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          {tipoSalidaActividad === 'MESERO' || tipoSalidaActividad === 'BARMAN'
                            ? `Base sugerida: ${formatCOP(OPCIONES_TIPO_SALIDA.find((o) => o.id === tipoSalidaActividad)?.tarifaBase || 0)} (editable manualmente)`
                            : `Base oficial: ${formatCOP(OPCIONES_TIPO_SALIDA.find((o) => o.id === tipoSalidaActividad)?.tarifaBase || 0)}`}
                        </span>
                        {tipoSalidaActividad === 'MANTENIMIENTO_CONTRATO' && (
                          <span className="text-emerald-400 font-semibold">Cubierto por contrato laboral</span>
                        )}
                        {(tipoSalidaActividad === 'MESERO' || tipoSalidaActividad === 'BARMAN') && (
                          <span className="text-cyan-400 font-semibold">Personalizar COP</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-900 rounded-xl text-slate-400 text-xs font-mono border border-slate-800">
                      •••••••• (Confidencial Dirección de Operaciones)
                    </div>
                  )}
                </div>
              </div>

              {/* 4. SECCIÓN: HORARIO & OBSERVACIONES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Hora de Ingreso al Turno
                  </label>
                  <input
                    type="time"
                    value={horaEntrada}
                    onChange={(e) => setHoraEntrada(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    Ubicación Específica
                  </label>
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Observaciones / Detalle Operativo de la Jornada
                </label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalles sobre el servicio, embarque de pasajeros, mantenimiento programado o aseo..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sello inmutable COT al confirmar</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCheckInModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    {isSubmitting ? 'Registrando...' : 'Confirmar Check-In'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
