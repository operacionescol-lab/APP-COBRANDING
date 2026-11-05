import React, { useState, useMemo } from 'react';
import {
  Salida,
  Embarcacion,
  Tripulante,
  TipoServicio,
  EstadoSalida,
  ChecklistPreZarpe,
} from '../types/nautical';
import { ChecklistPreZarpeModal } from './ChecklistPreZarpeModal';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  Ship,
  Users,
  Search,
  Plus,
  Filter,
  Check,
  X,
  FileText,
  AlertCircle,
  Wind,
  MapPin,
  Calendar,
  FileCheck,
  Lock,
  Unlock,
  ExternalLink,
} from 'lucide-react';

interface SalidasModuleProps {
  salidas: Salida[];
  embarcaciones: Embarcacion[];
  tripulacion: Tripulante[];
  checklists?: ChecklistPreZarpe[];
  onReconfirmSalida: (updatedData: Partial<Salida> & { id: string }) => Promise<void>;
  onCrearSalida: (salidaData: Partial<Salida>) => Promise<void>;
  onVerPlanilla: (salida: Salida) => void;
  onSaveChecklist?: (checklistData: Partial<ChecklistPreZarpe>) => Promise<void>;
  onGoToChecklists?: () => void;
}

export const SalidasModule: React.FC<SalidasModuleProps> = ({
  salidas,
  embarcaciones,
  tripulacion,
  checklists = [],
  onReconfirmSalida,
  onCrearSalida,
  onVerPlanilla,
  onSaveChecklist,
  onGoToChecklists,
}) => {
  const [selectedVessel, setSelectedVessel] = useState<string>('TODAS');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');
  const [selectedQuincena, setSelectedQuincena] = useState<'TODAS' | 'Q1' | 'Q2'>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChecklistModal, setActiveChecklistModal] = useState<{ checklist: ChecklistPreZarpe | null; salida: Salida | null } | null>(null);

  // Reconfirmation modal state
  const [reconfirmingSalida, setReconfirmingSalida] = useState<Salida | null>(null);
  const [editEstado, setEditEstado] = useState<EstadoSalida>('PROGRAMADA');
  const [editSitmar, setEditSitmar] = useState('');
  const [editPilotoId, setEditPilotoId] = useState('');
  const [editPilotoConfirmado, setEditPilotoConfirmado] = useState(false);
  const [editMarineroId, setEditMarineroId] = useState('');
  const [editMarineroConfirmado, setEditMarineroConfirmado] = useState(false);
  const [editSegundoMarineroId, setEditSegundoMarineroId] = useState('');
  const [editSegundoMarineroConfirmado, setEditSegundoMarineroConfirmado] = useState(false);
  const [editPaxReales, setEditPaxReales] = useState<number>(0);
  const [editHoraZarpe, setEditHoraZarpe] = useState('');
  const [editHoraRetorno, setEditHoraRetorno] = useState('');
  const [editObservaciones, setEditObservaciones] = useState('');
  const [editMeteo, setEditMeteo] = useState('');
  const [editFirmaDigital, setEditFirmaDigital] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New departure modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newFecha, setNewFecha] = useState('2026-10-22');
  const [newEmbarcacionId, setNewEmbarcacionId] = useState('emb-armonia');
  const [newTipoServicio, setNewTipoServicio] = useState<TipoServicio>('FULL_DAY');
  const [newMuelle, setNewMuelle] = useState('Muelle de la Bodeguita - Puesto 4');
  const [newPax, setNewPax] = useState(40);
  const [newPilotoId, setNewPilotoId] = useState('trip-carlos-mendoza');
  const [newMarineroId, setNewMarineroId] = useState('trip-brayan-torres');
  const [newSitmar, setNewSitmar] = useState('');

  // Filtered departures
  const filteredSalidas = useMemo(() => {
    return salidas
      .filter((s) => {
        if (selectedVessel !== 'TODAS' && s.embarcacionId !== selectedVessel) return false;
        if (selectedEstado !== 'TODOS' && s.estado !== selectedEstado) return false;
        if (selectedQuincena === 'Q1' && s.quincena !== 1) return false;
        if (selectedQuincena === 'Q2' && s.quincena !== 2) return false;
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const emb = embarcaciones.find((e) => e.id === s.embarcacionId)?.nombre.toLowerCase() || '';
          const sitmar = (s.codigoSitmar || '').toLowerCase();
          const piloto = tripulacion.find((t) => t.id === s.pilotoId)?.nombreCompleto.toLowerCase() || '';
          if (!emb.includes(term) && !sitmar.includes(term) && !piloto.includes(term) && !s.fecha.includes(term)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => a.diaMes - b.diaMes);
  }, [salidas, selectedVessel, selectedEstado, selectedQuincena, searchTerm, embarcaciones, tripulacion]);

  // Operational Metrics
  const metrics = useMemo(() => {
    const total = salidas.length;
    const ejecutadas = salidas.filter((s) => s.estado === 'EJECUTADA').length;
    const programadas = salidas.filter((s) => s.estado === 'PROGRAMADA' || s.estado === 'RECONFIRMADA').length;
    const enCurso = salidas.filter((s) => s.estado === 'EN_CURSO').length;
    const canceladas = salidas.filter((s) => s.estado.startsWith('CANCELADA')).length;

    const ejecutadasConSitmar = salidas.filter((s) => s.estado === 'EJECUTADA' && s.codigoSitmar && s.codigoSitmar.length >= 5).length;
    const tasaSitmar = ejecutadas > 0 ? Math.round((ejecutadasConSitmar / ejecutadas) * 100) : 100;

    const totalPax = salidas
      .filter((s) => s.estado === 'EJECUTADA' || s.estado === 'EN_CURSO')
      .reduce((sum, s) => sum + (s.paxReales || s.paxProgramados), 0);

    // Pilot breakdown
    const pilotosStats = tripulacion
      .filter((t) => t.cargo === 'PILOTO_CAPITAN')
      .map((p) => {
        const confirmadas = salidas.filter(
          (s) => s.pilotoId === p.id && (s.estado === 'EJECUTADA' || s.estado === 'EN_CURSO')
        ).length;
        return {
          id: p.id,
          nombre: p.nombreCompleto,
          salidas: confirmadas,
          horasAprox: confirmadas * 7,
        };
      });

    // Marinero breakdown
    const marinerosStats = tripulacion
      .filter((t) => t.cargo === 'AYUDANTE_MARINERO')
      .map((m) => {
        const confirmadas = salidas.filter(
          (s) => (s.marineroId === m.id || s.segundoMarineroId === m.id) &&
            (s.estado === 'EJECUTADA' || s.estado === 'EN_CURSO')
        ).length;
        return {
          id: m.id,
          nombre: m.nombreCompleto,
          salidas: confirmadas,
          horasAprox: confirmadas * 7,
        };
      });

    return {
      total,
      ejecutadas,
      programadas,
      enCurso,
      canceladas,
      ejecutadasConSitmar,
      tasaSitmar,
      totalPax,
      efectividad: Math.round(((ejecutadas + enCurso) / (total - canceladas || 1)) * 100),
      pilotosStats,
      marinerosStats,
    };
  }, [salidas, tripulacion]);

  // Open reconfirm modal
  const handleOpenReconfirm = (salida: Salida) => {
    setReconfirmingSalida(salida);
    setEditEstado(salida.estado);
    setEditSitmar(salida.codigoSitmar || '');
    setEditPilotoId(salida.pilotoId);
    setEditPilotoConfirmado(salida.pilotoConfirmado);
    setEditMarineroId(salida.marineroId);
    setEditMarineroConfirmado(salida.marineroConfirmado);
    setEditSegundoMarineroId(salida.segundoMarineroId || '');
    setEditSegundoMarineroConfirmado(salida.segundoMarineroConfirmado || false);
    setEditPaxReales(salida.paxReales || salida.paxProgramados);
    setEditHoraZarpe(salida.horaRealZarpe || salida.horaProgramadaZarpe);
    setEditHoraRetorno(salida.horaRealRetorno || salida.horaProgramadaRetorno);
    setEditObservaciones(salida.observaciones || '');
    setEditMeteo(salida.condicionMeteo || 'Mar 1, viento suave, óptimas condiciones.');
    setEditFirmaDigital(Boolean(salida.candadoOperativoAutorizado || salida.firmaPilotoDigital));
    setValidationError(null);
  };

  // Submit reconfirm with Candado Operativo DIMAR enforcement
  const handleSaveReconfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconfirmingSalida) return;

    // MANDATORY DIMAR RULE & OPERATIONAL LOCK:
    // No departure can be marked EJECUTADA or EN_CURSO without valid SITMAR code AND digital pilot signature
    if (editEstado === 'EJECUTADA' || editEstado === 'EN_CURSO') {
      if (!editSitmar || editSitmar.trim().length < 5) {
        setValidationError(
          '❌ CANDADO OPERATIVO BLOQUEADO: Para autorizar el zarpe es OBLIGATORIO ingresar el CÓDIGO SITMAR oficial expedido por la Capitanía de Puerto (DIMAR).'
        );
        return;
      }
      if (!editFirmaDigital) {
        setValidationError(
          '❌ CANDADO OPERATIVO BLOQUEADO: Se requiere obligatoriamente la FIRMA DIGITAL del Capitán / Piloto responsable para desbloquear y habilitar el zarpe.'
        );
        return;
      }
      if (!editPilotoConfirmado) {
        setValidationError('⚠️ Debe confirmar la presencia del Capitán / Piloto a bordo para autorizar el despacho.');
        return;
      }
      if (!editMarineroConfirmado) {
        setValidationError('⚠️ La dotación mínima DIMAR exige al menos un Ayudante / Marinero confirmado a bordo.');
        return;
      }
    }

    // Capacity check
    const emb = embarcaciones.find((e) => e.id === reconfirmingSalida.embarcacionId);
    if (emb && editPaxReales > emb.capacidadMaxPax) {
      setValidationError(
        `⚠️ SOBRECUPO: La capacidad máxima certificada para ${emb.nombre} es de ${emb.capacidadMaxPax} PAX. Se ingresaron ${editPaxReales} PAX.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const cotTimestamp = new Date().toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' COT';

      const pilotoObj = tripulacion.find((t) => t.id === editPilotoId);
      const pilotoNombre = pilotoObj?.nombreCompleto || 'Capitán de Yate';
      const isCandadoUnlocked = Boolean(editSitmar.trim().length >= 5 && editFirmaDigital);

      await onReconfirmSalida({
        id: reconfirmingSalida.id,
        estado: editEstado,
        codigoSitmar: editSitmar.trim(),
        sitmarVerificado: Boolean(editSitmar.trim().length >= 5),
        sitmarFechaHora: isCandadoUnlocked ? cotTimestamp : reconfirmingSalida.sitmarFechaHora,
        candadoOperativoAutorizado: isCandadoUnlocked,
        candadoFechaHoraCOT: isCandadoUnlocked ? cotTimestamp : undefined,
        firmaPilotoDigital: editFirmaDigital
          ? (reconfirmingSalida.firmaPilotoDigital || `SIG-DIMAR-${editPilotoId}-${Date.now().toString(36).toUpperCase()}`)
          : undefined,
        firmaPilotoNombre: pilotoNombre,
        firmaPilotoTimestampCOT: isCandadoUnlocked ? cotTimestamp : undefined,
        auditoriaZarpe: isCandadoUnlocked
          ? {
              timestampCOT: cotTimestamp,
              autorizadoPor: 'Leidys Tatiana Corpus (Directora de Operaciones / DPA)',
              codigoSitmar: editSitmar.trim(),
              pilotoFirma: pilotoNombre,
            }
          : undefined,
        pilotoId: editPilotoId,
        pilotoConfirmado: editPilotoConfirmado,
        marineroId: editMarineroId,
        marineroConfirmado: editMarineroConfirmado,
        segundoMarineroId: editSegundoMarineroId || undefined,
        segundoMarineroConfirmado: editSegundoMarineroConfirmado,
        paxReales: Number(editPaxReales),
        horaRealZarpe: editHoraZarpe,
        horaRealRetorno: editHoraRetorno,
        observaciones: editObservaciones,
        condicionMeteo: editMeteo,
      });
      setReconfirmingSalida(null);
    } catch (err: any) {
      setValidationError(err.message || 'Error al reconfirmar salida.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create new departure submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const dia = parseInt(newFecha.split('-')[2], 10) || 1;
      const quincena = dia <= 15 ? 1 : 2;
      await onCrearSalida({
        fecha: newFecha,
        diaMes: dia,
        quincena: quincena,
        embarcacionId: newEmbarcacionId,
        tipoServicio: newTipoServicio,
        muelle: newMuelle,
        paxProgramados: Number(newPax),
        paxReales: 0,
        horaProgramadaZarpe: '08:30',
        horaProgramadaRetorno: '16:30',
        estado: 'PROGRAMADA',
        codigoSitmar: newSitmar ? newSitmar.trim() : undefined,
        pilotoId: newPilotoId,
        pilotoConfirmado: true,
        marineroId: newMarineroId,
        marineroConfirmado: true,
      });
      setShowNewModal(false);
      setNewSitmar('');
    } catch (err: any) {
      alert(err.message || 'Error al crear salida');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Fleet and DIMAR SITMAR Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-sky-500/20 text-sky-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-sky-500/30">
                DIMAR - Capitanía de Puerto CP05
              </span>
              <span className="text-slate-400 text-xs">MOP-CHARTER-001</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Control de Salidas y Reconfirmación Mensual
            </h1>
            <p className="text-sm text-slate-300 mt-0.5">
              Registro obligatorio de <span className="text-cyan-400 font-semibold">Código SITMAR</span>, tripulación confirmada y zarpes reales vs. programados (Octubre 2026).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://sitmar.dimar.mil.co/core/login"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer border border-blue-500/40"
              title="Abrir plataforma oficial DIMAR SITMAR en nueva pestaña para generar y consultar radicados de zarpe"
            >
              <ExternalLink className="w-4 h-4 text-cyan-300" />
              <span>Portal SITMAR DIMAR</span>
            </a>
            {onGoToChecklists && (
              <button
                onClick={onGoToChecklists}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-800/80 font-semibold text-xs transition-all cursor-pointer shadow-sm"
              >
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>Capítulo: Checklists Pre-Zarpe</span>
              </button>
            )}
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Programar Nueva Salida</span>
            </button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Salidas Mes</div>
            <div className="text-xl font-bold text-white mt-0.5">{metrics.total}</div>
            <div className="text-[10px] text-slate-400 mt-1">Días 1 al 31 Octubre</div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] text-emerald-400 uppercase font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ejecutadas
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{metrics.ejecutadas}</div>
            <div className="text-[10px] text-slate-400 mt-1">{metrics.enCurso} en curso hoy</div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] text-amber-400 uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" /> Programadas
            </div>
            <div className="text-xl font-bold text-amber-300 mt-0.5">{metrics.programadas}</div>
            <div className="text-[10px] text-slate-400 mt-1">Por zarpar / confirmar</div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-cyan-800/60 bg-gradient-to-b from-cyan-950/40 to-slate-800/60">
            <div className="text-[11px] text-cyan-300 uppercase font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> SITMAR DIMAR
            </div>
            <div className="text-xl font-bold text-cyan-400 mt-0.5">{metrics.tasaSitmar}%</div>
            <div className="text-[10px] text-cyan-200/80 mt-1">
              {metrics.ejecutadasConSitmar}/{metrics.ejecutadas} auditadas
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] text-indigo-300 uppercase font-semibold">Total PAX Reales</div>
            <div className="text-xl font-bold text-indigo-300 mt-0.5">{metrics.totalPax}</div>
            <div className="text-[10px] text-slate-400 mt-1">Pasajeros transportados</div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="text-[11px] text-rose-400 uppercase font-semibold">Canceladas</div>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{metrics.canceladas}</div>
            <div className="text-[10px] text-slate-400 mt-1">Seguridad / Clima</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Quincena Selector */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setSelectedQuincena('TODAS')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                selectedQuincena === 'TODAS'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mes Completo (1-31)
            </button>
            <button
              onClick={() => setSelectedQuincena('Q1')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                selectedQuincena === 'Q1'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1ª Quincena (1-15)
            </button>
            <button
              onClick={() => setSelectedQuincena('Q2')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                selectedQuincena === 'Q2'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2ª Quincena (16-31)
            </button>
          </div>

          {/* Embarcacion Filter */}
          <select
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="TODAS">⚓ Todas las Embarcaciones</option>
            {embarcaciones.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} ({e.matricula})
              </option>
            ))}
          </select>

          {/* Estado Filter */}
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="EJECUTADA">✅ Salida Ejecutada</option>
            <option value="EN_CURSO">🌊 En Curso Hoy</option>
            <option value="RECONFIRMADA">📋 Reconfirmada</option>
            <option value="PROGRAMADA">⏳ Programada</option>
            <option value="CANCELADA_CLIMA">🌧️ Cancelada Clima</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por barco, SITMAR, piloto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Main Departures Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Registro Oficial de Despachos Marítimos ({filteredSalidas.length} Salidas)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Capitanía de Puerto de Cartagena • Validación SITMAR
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">Día / Fecha</th>
                <th className="py-3 px-3.5">Embarcación &amp; Matrícula</th>
                <th className="py-3 px-3.5">Servicio</th>
                <th className="py-3 px-3.5">Código SITMAR (DIMAR)</th>
                <th className="py-3 px-3.5">Pre-Zarpe (16 pts)</th>
                <th className="py-3 px-3.5">Tripulación Confirmada</th>
                <th className="py-3 px-3.5">PAX</th>
                <th className="py-3 px-3.5">Horarios</th>
                <th className="py-3 px-3.5">Candado Operativo</th>
                <th className="py-3 px-3.5">Estado</th>
                <th className="py-3 px-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSalidas.map((salida) => {
                const emb = embarcaciones.find((e) => e.id === salida.embarcacionId);
                const piloto = tripulacion.find((t) => t.id === salida.pilotoId);
                const marinero = tripulacion.find((t) => t.id === salida.marineroId);
                const hasSitmar = Boolean(salida.codigoSitmar && salida.codigoSitmar.length >= 5);

                const isToday = salida.diaMes === 21;

                return (
                  <tr
                    key={salida.id}
                    className={`hover:bg-slate-50/90 transition-colors ${
                      isToday ? 'bg-cyan-50/50 font-medium' : ''
                    }`}
                  >
                    {/* Fecha */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isToday
                              ? 'bg-cyan-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {salida.diaMes}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{salida.fecha}</div>
                          <div className="text-[10px] text-slate-400">
                            Q{salida.quincena} {isToday ? '• HOY' : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Embarcacion */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <span>{emb?.nombre || 'Embarcación'}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 pl-5">
                        {emb?.matricula} • Máx {emb?.capacidadMaxPax} PAX
                      </div>
                    </td>

                    {/* Servicio */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          salida.tipoServicio === 'FULL_DAY'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : salida.tipoServicio === 'SUNSET'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : salida.tipoServicio === 'CHARTER_PRIVADO'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {salida.tipoServicio.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                        {salida.muelle.split('-')[0]}
                      </div>
                    </td>

                    {/* Código SITMAR */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {hasSitmar ? (
                        <div className="flex items-center gap-1.5" title="Validado en DIMAR SITMAR">
                          <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                            {salida.codigoSitmar}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5" title="Obligatorio para ejecutar salida">
                          <span className="font-mono text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            SIN SITMAR
                          </span>
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        </div>
                      )}
                    </td>

                    {/* Pre-Zarpe (16 Puntos) */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {(() => {
                        const chk = checklists.find(
                          (c) => c.salidaId === salida.id || (salida.checklistPreZarpeId && c.id === salida.checklistPreZarpeId)
                        );
                        if (chk) {
                          const isOk = chk.estado === 'APROBADO_PARA_ZARPE';
                          return (
                            <button
                              onClick={() => setActiveChecklistModal({ checklist: chk, salida })}
                              className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                isOk
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              }`}
                              title={`Formato ${chk.codigoChecklist} - SITMAR: ${chk.codigoSitmar} (Clic para ver/imprimir)`}
                            >
                              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isOk ? '✓ 16/16 Aprobado' : '⏳ Pendiente'}</span>
                            </button>
                          );
                        }
                        return (
                          <button
                            onClick={() => setActiveChecklistModal({ checklist: null, salida })}
                            className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-300 flex items-center gap-1 transition-all cursor-pointer"
                            title="Diligenciar formato de 16 puntos antes del zarpe"
                          >
                            <Plus className="w-3 h-3 text-cyan-600" />
                            <span>+ Pre-Zarpe</span>
                          </button>
                        );
                      })()}
                    </td>

                    {/* Tripulación Confirmada */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-500 font-semibold">P:</span>
                          <span className="font-medium text-slate-800">
                            {piloto?.nombreCompleto.split(' ')[1] || 'Sin Piloto'}
                          </span>
                          {salida.pilotoConfirmado ? (
                            <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-bold">?</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-500 font-semibold">M:</span>
                          <span className="text-slate-600">
                            {marinero?.nombreCompleto.split(' ')[0] || 'Sin Marinero'}
                          </span>
                          {salida.marineroConfirmado ? (
                            <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-bold">?</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* PAX */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {salida.paxReales > 0 ? salida.paxReales : salida.paxProgramados} PAX
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Prog: {salida.paxProgramados}
                      </div>
                    </td>

                    {/* Horarios */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                      <div>
                        {salida.horaRealZarpe || salida.horaProgramadaZarpe} -{' '}
                        {salida.horaRealRetorno || salida.horaProgramadaRetorno}
                      </div>
                      {salida.horaRealZarpe && (
                        <span className="text-[10px] text-emerald-600 font-medium">Despachado</span>
                      )}
                    </td>

                    {/* Candado Operativo DIMAR */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {salida.candadoOperativoAutorizado || (salida.codigoSitmar && salida.codigoSitmar.length >= 5 && (salida.estado === 'EJECUTADA' || salida.estado === 'EN_CURSO')) ? (
                        <div
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold"
                          title={`Zarpe Autorizado con SITMAR y Firma Digital - Sello: ${salida.candadoFechaHoraCOT || 'DIMAR OK'}`}
                        >
                          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AUTORIZADO</span>
                        </div>
                      ) : (
                        <div
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold"
                          title="Bloqueado por Candado Operativo: Requiere Código SITMAR oficial y firma digital del Capitán."
                        >
                          <Lock className="w-3.5 h-3.5 text-rose-600" />
                          <span>BLOQUEADO</span>
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          salida.estado === 'EJECUTADA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : salida.estado === 'EN_CURSO'
                            ? 'bg-cyan-100 text-cyan-800 animate-pulse'
                            : salida.estado === 'RECONFIRMADA'
                            ? 'bg-sky-100 text-sky-800'
                            : salida.estado.startsWith('CANCELADA')
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {salida.estado === 'EJECUTADA' && '✓ EJECUTADA'}
                        {salida.estado === 'EN_CURSO' && '🌊 EN CURSO'}
                        {salida.estado === 'RECONFIRMADA' && '📋 RECONFIRMADA'}
                        {salida.estado === 'PROGRAMADA' && '⏳ PROGRAMADA'}
                        {salida.estado === 'CANCELADA_CLIMA' && '🌧️ CANCELADA CLIMA'}
                        {salida.estado === 'CANCELADA_CLIENTE' && '🚫 CANCELADA CLIENTE'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReconfirm(salida)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-cyan-600 hover:text-white text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer border border-slate-300"
                          title="Reconfirmar estado real, tripulación y Código SITMAR"
                        >
                          Reconfirmar
                        </button>
                        <button
                          onClick={() => onVerPlanilla(salida)}
                          className="p-1 rounded text-slate-400 hover:text-cyan-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Ver Planilla de Servicio MOP-CHARTER-001"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECONFIRMATION MODAL */}
      {reconfirmingSalida && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-900 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Protocolo DIMAR SITMAR
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">Salida ID: {reconfirmingSalida.id}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Reconfirmación de Salida y Despacho Marítimo
                </h3>
              </div>
              <button
                onClick={() => setReconfirmingSalida(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSaveReconfirm} className="mt-4 space-y-4">
              {/* Departure Info Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block">Fecha:</span>
                  <strong className="text-slate-800">{reconfirmingSalida.fecha} (Día {reconfirmingSalida.diaMes})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Embarcación:</span>
                  <strong className="text-slate-800">
                    {embarcaciones.find((e) => e.id === reconfirmingSalida.embarcacionId)?.nombre}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Servicio:</span>
                  <strong className="text-slate-800">{reconfirmingSalida.tipoServicio}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Muelle Base:</span>
                  <strong className="text-slate-800 truncate block">{reconfirmingSalida.muelle}</strong>
                </div>
              </div>

              {/* Status and SITMAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado Real de Salida *
                  </label>
                  <select
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value as EstadoSalida)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="PROGRAMADA">⏳ Salida Programada</option>
                    <option value="RECONFIRMADA">📋 Reconfirmada Previa</option>
                    <option value="EN_CURSO">🌊 En Curso (Zarpó Hoy)</option>
                    <option value="EJECUTADA">✅ Salida Ejecutada / Concluida</option>
                    <option value="CANCELADA_CLIMA">🌧️ Cancelada por Clima (DIMAR)</option>
                    <option value="CANCELADA_CLIENTE">🚫 Cancelada por Cliente</option>
                    <option value="REPROGRAMADA">🔄 Reprogramada</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Para marcar EJECUTADA, es requisito legal el Código SITMAR.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Código SITMAR (DIMAR) *</span>
                    <a
                      href="https://sitmar.dimar.mil.co/core/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-600 hover:text-cyan-800 font-semibold flex items-center gap-1 underline"
                      title="Abrir plataforma oficial DIMAR SITMAR"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Abrir SITMAR Oficial
                    </a>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ej: STM-202610-0982"
                      value={editSitmar}
                      onChange={(e) => {
                        setEditSitmar(e.target.value);
                        setValidationError(null);
                      }}
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-cyan-500"
                    />
                    {editSitmar.length >= 5 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Código de radicación oficial expedido por Capitanía de Puerto.
                  </span>
                </div>
              </div>

              {/* Tripulación Reconfirmada */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Dotación de Tripulación Reconfirmada (Obligatorio)</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Verificación Muelle</span>
                </div>

                {/* Piloto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Piloto / Capitán Asignado
                    </label>
                    <select
                      value={editPilotoId}
                      onChange={(e) => setEditPilotoId(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      {tripulacion
                        .filter((t) => t.cargo === 'PILOTO_CAPITAN')
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombreCompleto} ({p.licencia?.categoria || 'Patrón'})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="checkPiloto"
                      checked={editPilotoConfirmado}
                      onChange={(e) => setEditPilotoConfirmado(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                    <label htmlFor="checkPiloto" className="text-xs text-slate-700 font-medium cursor-pointer">
                      Capitán / Piloto a bordo y reconfirmado
                    </label>
                  </div>
                </div>

                {/* Marinero Principal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Ayudante / Marinero Principal
                    </label>
                    <select
                      value={editMarineroId}
                      onChange={(e) => setEditMarineroId(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      {tripulacion
                        .filter((t) => t.cargo === 'AYUDANTE_MARINERO')
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nombreCompleto} (Lic. {m.licencia?.numero || 'S/N'})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="checkMarinero"
                      checked={editMarineroConfirmado}
                      onChange={(e) => setEditMarineroConfirmado(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                    <label htmlFor="checkMarinero" className="text-xs text-slate-700 font-medium cursor-pointer">
                      Ayudante / Marinero reconfirmado
                    </label>
                  </div>
                </div>
              </div>

              {/* Candado Operativo DIMAR & Firma Digital del Piloto */}
              <div className={`p-4 rounded-xl border transition-all ${editFirmaDigital && editSitmar.trim().length >= 5 ? 'bg-emerald-50/90 border-emerald-300' : 'bg-amber-50/90 border-amber-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {editFirmaDigital && editSitmar.trim().length >= 5 ? (
                      <Unlock className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Candado Operativo DIMAR</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${editFirmaDigital && editSitmar.trim().length >= 5 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                          {editFirmaDigital && editSitmar.trim().length >= 5 ? '🔓 HABILITADO (ZARPE AUTORIZADO)' : '🔒 BLOQUEADO'}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Exige obligatoriamente el Código SITMAR oficial expedido por Capitanía de Puerto y la confirmación de firma digital del Capitán responsable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="checkFirmaDigital"
                      checked={editFirmaDigital}
                      onChange={(e) => {
                        setEditFirmaDigital(e.target.checked);
                        setValidationError(null);
                      }}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="checkFirmaDigital" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Firma Digital del Capitán: {tripulacion.find((t) => t.id === editPilotoId)?.nombreCompleto || 'Capitán Asignado'}
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Auditado por DPA • Sello COT Inmutable
                  </span>
                </div>
              </div>

              {/* Real PAX and Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PAX Reales en Muelle *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editPaxReales}
                    onChange={(e) => setEditPaxReales(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Conteo final según molinete / manifiesto
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hora Real Zarpe
                  </label>
                  <input
                    type="time"
                    value={editHoraZarpe}
                    onChange={(e) => setEditHoraZarpe(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hora Real Retorno
                  </label>
                  <input
                    type="time"
                    value={editHoraRetorno}
                    onChange={(e) => setEditHoraRetorno(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Weather and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Condición Meteo-Marina (Bocachica / Bahía)
                  </label>
                  <input
                    type="text"
                    value={editMeteo}
                    onChange={(e) => setEditMeteo(e.target.value)}
                    placeholder="Ej: Mar 1, viento 9 nudos NE, visibilidad 10 NM"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Observaciones y Novedades de Muelle
                  </label>
                  <input
                    type="text"
                    value={editObservaciones}
                    onChange={(e) => setEditObservaciones(e.target.value)}
                    placeholder="Ej: Zarpe autorizado sin novedad, chalecos revisados"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReconfirmingSalida(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md shadow-cyan-900/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando en DIMAR...' : 'Confirmar y Guardar Despacho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW DEPARTURE MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Programar Nueva Salida de Flota
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Salida</label>
                  <input
                    type="date"
                    value={newFecha}
                    onChange={(e) => setNewFecha(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Servicio</label>
                  <select
                    value={newTipoServicio}
                    onChange={(e) => setNewTipoServicio(e.target.value as TipoServicio)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="FULL_DAY">FULL DAY (Rosario &amp; Cholón)</option>
                    <option value="SUNSET">SUNSET (Bahía Cartagena)</option>
                    <option value="CHARTER_PRIVADO">CHARTER PRIVADO VIP</option>
                    <option value="TRASLADO_ISLAS">TRASLADO ISLAS PRIVADO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Embarcación Asignada</label>
                <select
                  value={newEmbarcacionId}
                  onChange={(e) => setNewEmbarcacionId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  {embarcaciones.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} - Cap. {e.capacidadMaxPax} PAX ({e.muelleBase.split('-')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PAX Programados</label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={newPax}
                    onChange={(e) => setNewPax(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Muelle de Zarpe</label>
                  <select
                    value={newMuelle}
                    onChange={(e) => setNewMuelle(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="Muelle de la Bodeguita - Puesto 4">Muelle de la Bodeguita - Puesto 4</option>
                    <option value="Marina Santa Cruz - Muelle Norte">Marina Santa Cruz - Muelle Norte</option>
                    <option value="Club Náutico Cartagena - Muelle Alfa">Club Náutico Cartagena - Muelle Alfa</option>
                    <option value="Marina Todomar - Bocagrande">Marina Todomar - Bocagrande</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Piloto / Capitán</label>
                  <select
                    value={newPilotoId}
                    onChange={(e) => setNewPilotoId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    {tripulacion
                      .filter((t) => t.cargo === 'PILOTO_CAPITAN')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombreCompleto}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ayudante / Marinero</label>
                  <select
                    value={newMarineroId}
                    onChange={(e) => setNewMarineroId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    {tripulacion
                      .filter((t) => t.cargo === 'AYUDANTE_MARINERO')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombreCompleto}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código SITMAR Pre-radicado (Opcional en programación)
                </label>
                <input
                  type="text"
                  placeholder="Ej: STM-202610-XXXX"
                  value={newSitmar}
                  onChange={(e) => setNewSitmar(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md cursor-pointer"
                >
                  Programar Salida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pilot and Deckhand monthly performance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pilotos */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Despachos del Mes por Capitán / Piloto
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Liquidación Operativa</span>
          </div>
          <div className="mt-3 space-y-2">
            {metrics.pilotosStats.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <div className="font-semibold text-slate-800">{p.nombre}</div>
                  <div className="text-[10px] text-slate-500">~{p.horasAprox} horas de navegación marítima</div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-cyan-100 text-cyan-900 font-bold px-2 py-0.5 rounded text-xs">
                    {p.salidas} salidas
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marineros */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Despachos del Mes por Ayudante / Marinero
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Cubierta &amp; Maniobra</span>
          </div>
          <div className="mt-3 space-y-2">
            {metrics.marinerosStats.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <div className="font-semibold text-slate-800">{m.nombre}</div>
                  <div className="text-[10px] text-slate-500">~{m.horasAprox} horas de navegación marítima</div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded text-xs">
                    {m.salidas} salidas
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist Pre-Zarpe Modal */}
      {activeChecklistModal && onSaveChecklist && (
        <ChecklistPreZarpeModal
          checklist={activeChecklistModal.checklist}
          salida={activeChecklistModal.salida}
          embarcaciones={embarcaciones}
          tripulacion={tripulacion}
          isOpen={true}
          onClose={() => setActiveChecklistModal(null)}
          onSave={onSaveChecklist}
        />
      )}
    </div>
  );
};
