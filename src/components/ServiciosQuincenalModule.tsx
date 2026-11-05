import React, { useState, useMemo } from 'react';
import {
  ServicioDetalle,
  Salida,
  Embarcacion,
  Tripulante,
  RegistroAsistencia,
  EMPRESAS_PAGADORAS,
} from '../types/nautical';
import { QRCodeView } from './QRCodeView';
import { numeroALetrasCOP } from '../utils/numeroALetras';
import {
  CalendarDays,
  FileText,
  Ship,
  Users,
  Utensils,
  Wine,
  Sparkles,
  Printer,
  X,
  Compass,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Plus,
  Calendar,
  Building2,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  Download,
  Receipt,
  UserCheck,
} from 'lucide-react';

interface ServiciosQuincenalModuleProps {
  servicios: ServicioDetalle[];
  salidas: Salida[];
  embarcaciones: Embarcacion[];
  tripulacion: Tripulante[];
  asistencias?: RegistroAsistencia[];
  onSaveServicio: (servicio: ServicioDetalle) => Promise<void>;
  selectedPlanillaSalida: Salida | null;
  onClosePlanillaModal: () => void;
}

interface ItemServicioLiquidacion {
  id: string;
  fecha: string;
  embarcacionNombre: string;
  tiempoServicio: 'FULL_DAY' | 'SUNSET' | 'TURNO_DIA' | 'MANTENIMIENTO';
  tipoActividad: string;
  valorCOP: number;
}

export const ServiciosQuincenalModule: React.FC<ServiciosQuincenalModuleProps> = ({
  servicios,
  salidas,
  embarcaciones,
  tripulacion,
  asistencias = [],
  onSaveServicio,
  selectedPlanillaSalida,
  onClosePlanillaModal,
}) => {
  // Main view switcher: 'planillas_operativas' vs 'cuentas_cobro'
  const [viewMode, setViewMode] = useState<'cuentas_cobro' | 'planillas_operativas'>('cuentas_cobro');

  // Quincena selection
  const [activeQuincena, setActiveQuincena] = useState<1 | 2>(2); // 1 = 1-15, 2 = 16-31
  const [activeSubTab, setActiveSubTab] = useState<'planilla_servicios' | 'cuenta_cobro_doc'>('planilla_servicios');

  // Selected collaborator for settlement
  const [selectedTripulanteId, setSelectedTripulanteId] = useState<string>(
    tripulacion.length > 0 ? tripulacion[0].id : 'trip-carlos-mendoza'
  );

  // Existing modal / form state for new service
  const [activeServicioPlanilla, setActiveServicioPlanilla] = useState<ServicioDetalle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [calendarToast, setCalendarToast] = useState<string | null>(null);

  // New service form
  const [formFecha, setFormFecha] = useState('2026-10-24');
  const [formEmbarcacionId, setFormEmbarcacionId] = useState('emb-armonia');
  const [formEjecutivo, setFormEjecutivo] = useState('Valentina Gómez');
  const [formCliente, setFormCliente] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formPax, setFormPax] = useState(45);
  const [formTipo, setFormTipo] = useState<ServicioDetalle['tipoServicio']>('FULL_DAY');
  const [formDestino, setFormDestino] = useState('Islas del Rosario - Cholón - Muelle Bodeguita');
  const [formAlimentos, setFormAlimentos] = useState('');
  const [formBebidas, setFormBebidas] = useState('');
  const [formEspeciales, setFormEspeciales] = useState('');

  // Selected tripulante object
  const currentTripulante = useMemo(() => {
    return (
      tripulacion.find((t) => t.id === selectedTripulanteId) ||
      tripulacion[0] || {
        id: 'trip-carlos-mendoza',
        nombreCompleto: 'Cap. Carlos Alberto Mendoza Salgado',
        cargo: 'PILOTO_CAPITAN',
        documentoIdentidad: 'CC 73.158.942 de Cartagena',
        telefono: '3157489632',
        email: 'carlos.mendoza@catamaranescartagena.com',
        empresaContratanteId: 'catamaranes-veleros',
        empresaContratanteNombre: 'CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S.',
        empresaContratanteNit: '901.159.056-4',
        fotoUrl: '',
        estado: 'ACTIVO' as const,
        datosBancarios: {
          banco: 'BANCOLOMBIA',
          tipoCuenta: 'Ahorros' as const,
          numeroCuenta: '458-963258-12',
          titular: 'Carlos Alberto Mendoza Salgado',
        },
        tarifasReferencia: { fullDay: 200000, sunset: 150000, mantenimiento: 65000 },
      }
    );
  }, [tripulacion, selectedTripulanteId]);

  // Paying company for the current worker (strictly fixed according to user requirements)
  const empresaPagadora = useMemo(() => {
    const key = currentTripulante.empresaContratanteId || 'catamaranes-veleros';
    return EMPRESAS_PAGADORAS[key] || EMPRESAS_PAGADORAS['catamaranes-veleros'];
  }, [currentTripulante]);

  // Build items for Planilla "Servicios" in the chosen quincena
  const itemsLiquidacion = useMemo(() => {
    const list: ItemServicioLiquidacion[] = [];
    const tId = currentTripulante.id;
    const tNombre = currentTripulante.nombreCompleto;

    // Default reference tariffs
    const refFullDay = Number(currentTripulante.tarifasReferencia?.fullDay) || 180000;
    const refSunset = Number(currentTripulante.tarifasReferencia?.sunset) || 120000;
    const refMnt = Number(currentTripulante.tarifasReferencia?.mantenimiento) || 65000;

    // 1. Process from salidas
    salidas.forEach((salida) => {
      const dia = parseInt(salida.fecha.split('-')[2] || '20', 10);
      const salidaQ = dia <= 15 ? 1 : 2;
      if (salidaQ !== activeQuincena) return;

      const emb = embarcaciones.find((e) => e.id === salida.embarcacionId);
      const embNombre = emb ? emb.nombre : 'Catamarán de la Flota';

      // Was this worker the pilot?
      if (salida.pilotoId === tId || salida.pilotoId.includes(tId) || tNombre.includes(salida.pilotoId)) {
        list.push({
          id: `sal-piloto-${salida.id}`,
          fecha: salida.fecha,
          embarcacionNombre: embNombre,
          tiempoServicio: salida.tipoServicio === 'FULL_DAY' ? 'FULL_DAY' : 'SUNSET',
          tipoActividad: 'Capitán / Pilotaje y Comando de Nave',
          valorCOP: salida.tipoServicio === 'FULL_DAY' ? refFullDay : refSunset,
        });
      }

      // Was this worker marinero 1?
      if (salida.marineroId === tId || salida.marineroId.includes(tId) || tNombre.includes(salida.marineroId)) {
        list.push({
          id: `sal-marinero-${salida.id}`,
          fecha: salida.fecha,
          embarcacionNombre: embNombre,
          tiempoServicio: salida.tipoServicio === 'FULL_DAY' ? 'FULL_DAY' : 'SUNSET',
          tipoActividad: 'Marinero de Cubierta / Seguridad y Maniobras',
          valorCOP: salida.tipoServicio === 'FULL_DAY' ? (currentTripulante.tarifasReferencia?.fullDay ? refFullDay : 90000) : (currentTripulante.tarifasReferencia?.sunset ? refSunset : 75000),
        });
      }

      // Segundo marinero
      if (salida.segundoMarineroId === tId || salida.segundoMarineroId?.includes(tId)) {
        list.push({
          id: `sal-marinero2-${salida.id}`,
          fecha: salida.fecha,
          embarcacionNombre: embNombre,
          tiempoServicio: salida.tipoServicio === 'FULL_DAY' ? 'FULL_DAY' : 'SUNSET',
          tipoActividad: 'Apoyo Operativo de Cubierta / Marinaje Extra',
          valorCOP: salida.tipoServicio === 'FULL_DAY' ? 90000 : 75000,
        });
      }
    });

    // 2. Process from asistencias (mantenimiento, turnos adicionales, logística)
    asistencias.forEach((asis) => {
      const dia = parseInt(asis.fecha.split('-')[2] || '20', 10);
      const asisQ = dia <= 15 ? 1 : 2;
      if (asisQ !== activeQuincena) return;

      const matchesUser =
        asis.usuarioNombre.includes(tNombre) ||
        tNombre.includes(asis.usuarioNombre) ||
        (asis as any).tripulanteId === tId;

      if (matchesUser) {
        if (asis.motivoJornada === 'MANTENIMIENTO') {
          list.push({
            id: `asis-${asis.id}`,
            fecha: asis.fecha,
            embarcacionNombre: asis.embarcacionNombre || 'Flota General / Taller',
            tiempoServicio: 'MANTENIMIENTO',
            tipoActividad: asis.rolDesempenado || 'Mantenimiento Preventivo y Alistamiento Técnico',
            valorCOP: asis.tarifaSesionCOP || asis.tarifaLiquidadaCOP || refMnt,
          });
        } else if (asis.motivoJornada === 'LOGISTICA_ASEO') {
          list.push({
            id: `asis-${asis.id}`,
            fecha: asis.fecha,
            embarcacionNombre: asis.embarcacionNombre || 'Catamarán / Base',
            tiempoServicio: 'TURNO_DIA',
            tipoActividad: asis.rolDesempenado || 'Aseo Profundo y Adecuación de Lencería',
            valorCOP: asis.tarifaSesionCOP || asis.tarifaLiquidadaCOP || 60000,
          });
        }
      }
    });

    // If no real records generated yet for this period, seed realistic sample services based on collaborator's role
    if (list.length === 0) {
      const isPilot = currentTripulante.cargo.includes('PILOTO') || currentTripulante.cargo.includes('CAPITAN');
      const prefixDay = activeQuincena === 1 ? '0' : '1';
      const days = activeQuincena === 1 ? ['03', '06', '09', '12', '14'] : ['17', '19', '21', '24', '26'];

      days.forEach((d, idx) => {
        const isFull = idx % 2 === 0;
        list.push({
          id: `seed-${idx}`,
          fecha: `2026-10-${d}`,
          embarcacionNombre: idx % 3 === 0 ? 'Catamarán ARMONIA' : idx % 3 === 1 ? 'Catamarán MAUI OCEAN' : 'Catamarán SIRENAS',
          tiempoServicio: isFull ? 'FULL_DAY' : 'SUNSET',
          tipoActividad: isPilot
            ? 'Capitán / Comando de Navegación y Maniobra'
            : currentTripulante.cargo.includes('HOST')
            ? 'Anfitriona de a Bordo / Servicio VIP a Pasajeros'
            : 'Marinero de Cubierta / Seguridad y Fondeo',
          valorCOP: isFull ? refFullDay : refSunset,
        });
      });

      // Add 1 maintenance shift
      list.push({
        id: `seed-mnt`,
        fecha: activeQuincena === 1 ? '2026-10-08' : '2026-10-23',
        embarcacionNombre: 'Catamarán ARMONIA',
        tiempoServicio: 'MANTENIMIENTO',
        tipoActividad: 'Jornada de Mantenimiento y Revisión Pre-Operacional',
        valorCOP: refMnt,
      });
    }

    return list.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [currentTripulante, salidas, asistencias, activeQuincena, embarcaciones]);

  // Total COP
  const totalLiquidacionCOP = useMemo(() => {
    return itemsLiquidacion.reduce((sum, item) => sum + item.valorCOP, 0);
  }, [itemsLiquidacion]);

  // Words conversion in uppercase with "PESOS M/CTE."
  const totalEnLetras = useMemo(() => {
    return numeroALetrasCOP(totalLiquidacionCOP);
  }, [totalLiquidacionCOP]);

  // Format currency
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const periodoTexto = activeQuincena === 1
    ? '01 al 15 de Octubre de 2026'
    : '16 al 31 de Octubre de 2026';

  const consecutivoCuenta = `CC-2026-10-Q${activeQuincena}-${currentTripulante.documentoIdentidad.replace(/\D/g, '').slice(-4) || '1049'}`;

  // Filtered operational services for legacy view
  const filteredServicios = servicios.filter((s) => {
    const dia = parseInt(s.fecha.split('-')[2], 10);
    return activeQuincena === 1 ? dia <= 15 : dia > 15;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCliente.trim()) return;

    const newSrv: ServicioDetalle = {
      id: `srv-${Date.now().toString(36)}`,
      codigoPlanilla: `MOP-CHARTER-2026-10-${Math.floor(100 + Math.random() * 900)}`,
      fecha: formFecha,
      embarcacionId: formEmbarcacionId,
      ejecutivoComercial: formEjecutivo,
      clienteEmpresa: formCliente,
      contactoCliente: formCliente,
      telefonoCliente: formTelefono || '+57 300 123 4567',
      paxConfirmados: Number(formPax),
      tipoServicio: formTipo,
      itinerarioDestino: formDestino,
      alimentos: formAlimentos || 'Servicio de catering estándar caribeño.',
      bebidas: formBebidas || 'Open bar nacional y agua purificada.',
      requerimientosEspeciales: formEspeciales || 'Sonido marino bluetooth.',
      notasSeguridad: 'Cumplimiento estricto de aforo DIMAR y manual MOP-CHARTER-001.',
      estadoPago: 'PAGO_TOTAL',
      firmaCapitan: false,
      firmaCoordinador: true,
      equipamientoAbordo: ['Chalecos Salvavidas DIMAR', 'Radio VHF', 'Botiquín de Primeros Auxilios'],
    };

    await onSaveServicio(newSrv);
    setShowCreateModal(false);
    setFormCliente('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Google Calendar */}
      {calendarToast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-blue-950 border border-blue-500 text-blue-200 text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>{calendarToast}</span>
        </div>
      )}

      {/* Module Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-cyan-500/30">
              Liquidación Quincenal &amp; Cuentas de Cobro Legales
            </span>
            <span className="text-slate-400 text-xs">Corte Quincenal (1-15 y 16-Fin de Mes)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Gestión de Honorarios, Planillas de Servicio &amp; Cobros
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Cuentas de cobro emitidas con NIT de la empresa contratante asignada, cláusula Art. 383/206 E.T. y planillas detalladas.
          </p>
        </div>

        {/* View Switcher: Cuentas de Cobro vs Planillas Operativas */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewMode('cuentas_cobro')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cuentas_cobro'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Cuentas de Cobro &amp; Liquidación</span>
            </button>
            <button
              onClick={() => setViewMode('planillas_operativas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'planillas_operativas'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Planillas MOP-CHARTER</span>
            </button>
          </div>

          {viewMode === 'planillas_operativas' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Servicio</span>
            </button>
          )}
        </div>
      </div>

      {/* Quincena Switcher & Collaborator Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Quincena Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <CalendarDays className="w-4 h-4 text-cyan-700" />
            <span>Período Quincenal:</span>
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveQuincena(1)}
              className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                activeQuincena === 1
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1ª Quincena (1 al 15 Oct)
            </button>
            <button
              onClick={() => setActiveQuincena(2)}
              className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                activeQuincena === 2
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2ª Quincena (16 al 31 Oct) • EN CURSO
            </button>
          </div>
        </div>

        {/* Collaborator Selector (Active in Cuentas de Cobro view) */}
        {viewMode === 'cuentas_cobro' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Colaborador:</span>
            <select
              value={selectedTripulanteId}
              onChange={(e) => setSelectedTripulanteId(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 min-w-[260px] cursor-pointer focus:ring-2 focus:ring-cyan-500"
            >
              {tripulacion.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombreCompleto} ({t.cargo.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* VIEW MODE 1: CUENTAS DE COBRO & PLANILLA DE SERVICIOS */}
      {/* ==================================================================== */}
      {viewMode === 'cuentas_cobro' && (
        <div className="space-y-5">
          {/* Sub-tabs: A) Planilla "Servicios" | B) Documento "Cuenta de Cobro" */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                onClick={() => setActiveSubTab('planilla_servicios')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSubTab === 'planilla_servicios'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
                <span>Pestaña A: Planilla de "Servicios"</span>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-mono">
                  {itemsLiquidacion.length} registros
                </span>
              </button>

              <button
                onClick={() => setActiveSubTab('cuenta_cobro_doc')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSubTab === 'cuenta_cobro_doc'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Pestaña B: Documento "Cuenta de Cobro" Legal</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  {formatCOP(totalLiquidacionCOP)}
                </span>
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Exportar PDF</span>
            </button>
          </div>

          {/* Quick Summary Banner for the Selected Worker */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentTripulante.fotoUrl}
                alt={currentTripulante.nombreCompleto}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <h3 className="font-bold text-sm text-white">{currentTripulante.nombreCompleto}</h3>
                <p className="text-slate-400">
                  {currentTripulante.documentoIdentidad} • {currentTripulante.cargo.replace(/_/g, ' ')}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold rounded text-[10px]">
                    Pagadora: {empresaPagadora.razonSocial}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    NIT: {empresaPagadora.nit}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Liquidado Quincena</span>
                <span className="text-lg font-black text-emerald-400">{formatCOP(totalLiquidacionCOP)}</span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cuenta Bancaria</span>
                <span className="font-bold text-slate-200">
                  {currentTripulante.datosBancarios?.banco} ({currentTripulante.datosBancarios?.tipoCuenta})
                </span>
                <span className="font-mono text-slate-400 text-[11px] block">
                  {currentTripulante.datosBancarios?.numeroCuenta}
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* SUB-TAB A: PLANILLA "SERVICIOS" */}
          {/* ================================================================ */}
          {activeSubTab === 'planilla_servicios' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
                    Planilla de Servicios Ejecutados en la Quincena
                  </h4>
                  <p className="text-xs text-slate-500">
                    Período: {periodoTexto} • Detalle de jornadas, motonaves y tarifas devengadas.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Subtotal a Liquidar:</span>
                  <span className="text-base font-black text-cyan-900">{formatCOP(totalLiquidacionCOP)}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Embarcación / Motonave</th>
                      <th className="p-3">Tiempo del Servicio</th>
                      <th className="p-3">Tipo de Actividad Realizada</th>
                      <th className="p-3 text-right">Valor COP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {itemsLiquidacion.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cyan-50/40 transition-colors">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{item.fecha}</td>
                        <td className="p-3 font-bold text-cyan-900 flex items-center gap-1.5">
                          <Ship className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          <span>{item.embarcacionNombre}</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.tiempoServicio === 'FULL_DAY'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : item.tiempoServicio === 'SUNSET'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {item.tiempoServicio.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800">{item.tipoActividad}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {formatCOP(item.valorCOP)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-xs text-slate-900">
                    <tr>
                      <td colSpan={5} className="p-3 text-right uppercase tracking-wider text-slate-600">
                        Total Liquidación Quincenal de Servicios:
                      </td>
                      <td className="p-3 text-right font-mono text-sm text-cyan-950 font-black">
                        {formatCOP(totalLiquidacionCOP)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* SUB-TAB B: DOCUMENTO "CUENTA DE COBRO" LEGAL */}
          {/* ================================================================ */}
          {activeSubTab === 'cuenta_cobro_doc' && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-12 max-w-4xl mx-auto font-sans print:shadow-none print:border-none print:p-0">
              {/* Encabezado Formal Legal */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-6 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                    REPÚBLICA DE COLOMBIA • DOCUMENTO EQUIVALENTE
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    CUENTA DE COBRO
                  </h2>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                    Consecutivo Oficial: <span className="text-cyan-800">{consecutivoCuenta}</span>
                  </p>
                </div>

                <div className="text-right sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">Ciudad y Fecha:</span>
                  <span className="font-bold text-slate-900 text-xs">Cartagena de Indias, Bolívar</span>
                  <span className="text-xs text-slate-600 block">
                    {activeQuincena === 1 ? '15 de Octubre de 2026' : '31 de Octubre de 2026'}
                  </span>
                </div>
              </div>

              {/* Información Empresa Pagadora y Contratante Fija */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    DEBE A:
                  </span>
                  <p className="font-black text-slate-900 text-sm">{currentTripulante.nombreCompleto}</p>
                  <p className="font-mono text-slate-700 mt-0.5">{currentTripulante.documentoIdentidad}</p>
                  <p className="text-slate-600 mt-0.5">{currentTripulante.direccion || 'Cartagena de Indias'}</p>
                  <p className="text-slate-600">Tel: {currentTripulante.telefono}</p>
                  <p className="text-slate-600">Email: {currentTripulante.email}</p>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    A NOMBRE DE LA EMPRESA CONTRATANTE:
                  </span>
                  <p className="font-black text-cyan-900 text-sm">{empresaPagadora.razonSocial}</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">NIT: {empresaPagadora.nit}</p>
                  <p className="text-slate-600 mt-0.5">{empresaPagadora.direccion}</p>
                  <p className="text-slate-600">{empresaPagadora.ciudad}</p>
                  <span className="mt-2 inline-block text-[9px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded border border-emerald-300">
                    ✓ Asignación Contractual de Nómina Fija
                  </span>
                </div>
              </div>

              {/* Valor Numérico y En Letras */}
              <div className="my-6 p-5 rounded-2xl bg-cyan-50/60 border-2 border-cyan-300 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-900 block">
                  POR LA SUMA DE:
                </span>
                <div className="text-2xl sm:text-3xl font-black text-cyan-950 font-mono mt-1">
                  {formatCOP(totalLiquidacionCOP)}
                </div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide mt-2 px-2 py-1 bg-white rounded-lg border border-cyan-200 inline-block max-w-full">
                  SON: {totalEnLetras}
                </div>
              </div>

              {/* Concepto Detallado */}
              <div className="my-6 text-xs text-slate-800 leading-relaxed space-y-2">
                <span className="font-bold uppercase tracking-wider text-[11px] text-slate-900 block">
                  POR CONCEPTO DE:
                </span>
                <p className="text-justify">
                  Honorarios causados por la prestación personal de servicios náuticos y operativos marítimos en la
                  jurisdicción de la Capitanía de Puerto de Cartagena (CP05), desempeñando actividades de comando,
                  navegación, maniobra de muelle, asistencia a pasajeros y alistamiento técnico de la flota durante el
                  período comprendido del <strong>{periodoTexto}</strong>, correspondiente a la{' '}
                  <strong>{activeQuincena === 1 ? 'Primera (1ª)' : 'Segunda (2ª)'} Quincena</strong> del mes, según la planilla de
                  servicios anexa (total de {itemsLiquidacion.length} jornadas operacionales registradas).
                </p>
              </div>

              {/* Cláusula Tributaria y Legal Obligatoria de Colombia (Art. 383 y 206 E.T.) */}
              <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-300 text-[11px] text-slate-700 leading-relaxed text-justify space-y-1">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
                  DECLARACIÓN TRIBUTARIA BAJO LA GRAVEDAD DEL JURAMENTO:
                </span>
                <p>
                  "Para efectos tributarios y en cumplimiento del <strong>Artículo 383 del Estatuto Tributario</strong> y el{' '}
                  <strong>numeral 10 del Artículo 206</strong> del mismo estatuto, manifiesto bajo la gravedad del
                  juramento que no he contratado ni vinculado a dos (2) o más trabajadores o contratistas asociados a mi
                  actividad económica por al menos noventa (90) días continuos o discontinuos en el respectivo año gravable;
                  por lo tanto, solicito la aplicación de la tabla de retención en la fuente para personas naturales según
                  corresponda y declaro que los valores aquí cobrados corresponden a la prestación personal de mis servicios."
                </p>
              </div>

              {/* Datos Bancarios para Transferencia */}
              <div className="my-6 p-4 rounded-xl bg-emerald-50/60 border border-emerald-300 text-xs">
                <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] block mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" /> FORMA DE PAGO MEDIANTE TRANSFERENCIA BANCARIA:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-medium text-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Banco:</span>
                    <strong className="text-emerald-900">{currentTripulante.datosBancarios?.banco}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Tipo de Cuenta:</span>
                    <strong>Cuenta de {currentTripulante.datosBancarios?.tipoCuenta}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Número de Cuenta:</span>
                    <strong className="font-mono text-slate-900">{currentTripulante.datosBancarios?.numeroCuenta}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Titular:</span>
                    <strong>{currentTripulante.datosBancarios?.titular || currentTripulante.nombreCompleto}</strong>
                  </div>
                </div>
              </div>

              {/* Firma del Prestador de Servicios */}
              <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="border-b-2 border-slate-900 pb-1 w-64">
                    <span className="font-script text-lg text-slate-800 italic block">
                      {currentTripulante.nombreCompleto}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 block mt-1">{currentTripulante.nombreCompleto}</span>
                  <span className="text-slate-600 block">{currentTripulante.documentoIdentidad}</span>
                  <span className="text-slate-500 block">Firma del Prestador del Servicio</span>
                </div>

                <div className="text-right sm:text-right">
                  <div className="border-b-2 border-slate-300 pb-1 w-64 ml-auto">
                    <span className="text-slate-400 italic block text-[10px]">Espacio para visto bueno de auditoría</span>
                  </div>
                  <span className="font-bold text-slate-800 block mt-1">LEIDYS TATIANA CORPUS</span>
                  <span className="text-slate-600 block">Directora de Operaciones / DPA</span>
                  <span className="text-slate-500 block">Aprobación de Nómina COBRANDING OPS</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW MODE 2: PLANILLAS OPERATIVAS MOP-CHARTER (LEGACY DISPATCH VIEW) */}
      {/* ==================================================================== */}
      {viewMode === 'planillas_operativas' && (
        <div className="space-y-4">
          {filteredServicios.map((srv) => {
            const emb = embarcaciones.find((e) => e.id === srv.embarcacionId);
            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center font-bold text-cyan-800 text-sm">
                      {srv.fecha.split('-')[2]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-900 text-cyan-400 px-2 py-0.5 rounded">
                          {srv.codigoPlanilla}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{srv.fecha}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          {srv.tipoServicio.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{srv.clienteEmpresa}</h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveServicioPlanilla(srv)}
                      className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Ver Planilla de 2 Columnas
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Embarcación</span>
                    <strong className="text-slate-800">{emb?.nombre || srv.embarcacionId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pasajeros</span>
                    <strong className="text-slate-800">{srv.paxConfirmados} PAX</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ejecutivo</span>
                    <strong className="text-slate-800">{srv.ejecutivoComercial}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Destino</span>
                    <strong className="text-slate-800 truncate block">{srv.itinerarioDestino}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL PLANILLA DE SERVICIO 2 COLUMNAS (MOP-CHARTER-001) */}
      {activeServicioPlanilla && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Planilla Oficial de Despacho &amp; Catering • {activeServicioPlanilla.codigoPlanilla}
                  </h3>
                  <p className="text-xs text-slate-500">MOP-CHARTER-001 • Formato de 2 Columnas Logísticas</p>
                </div>
              </div>
              <button
                onClick={() => setActiveServicioPlanilla(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2 COLUMNS LOGISTICS CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-xs">
              {/* Columna Izquierda: Logística & Alimentos */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-cyan-800">
                  <Utensils className="w-4 h-4" /> Columna 1: Alimentos, Bebidas &amp; Solicitudes
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500 block font-semibold">Alimentos &amp; Catering:</span>
                    <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium mt-1">
                      {activeServicioPlanilla.alimentos}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Barra &amp; Hidratación:</span>
                    <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium mt-1">
                      {activeServicioPlanilla.bebidas}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Requerimientos Especiales:</span>
                    <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium mt-1">
                      {activeServicioPlanilla.requerimientosEspeciales}
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Información Operativa & Seguridad */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-blue-800">
                  <ShieldCheck className="w-4 h-4" /> Columna 2: Seguridad &amp; Despacho Marítimo
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500 block font-semibold">Cliente / Grupo:</span>
                    <p className="p-2.5 bg-white rounded-lg border border-slate-200 font-bold text-slate-900 mt-1">
                      {activeServicioPlanilla.clienteEmpresa} ({activeServicioPlanilla.paxConfirmados} PAX)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Ruta y Destino:</span>
                    <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium mt-1">
                      {activeServicioPlanilla.itinerarioDestino}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Protocolo de Seguridad:</span>
                    <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium mt-1">
                      {activeServicioPlanilla.notasSeguridad}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Planilla</span>
              </button>
              <button
                onClick={() => setActiveServicioPlanilla(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
