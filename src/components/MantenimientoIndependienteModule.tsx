import React, { useState, useMemo } from 'react';
import {
  Embarcacion,
  Tripulante,
  NovedadFalla,
  PerfilUsuarioAuth,
  SistemaNovedad,
  SeveridadNovedad,
  TrabajoDiarioMantenimiento,
} from '../types/nautical';
import { HorasMotorBarChart } from './HorasMotorBarChart';
import { NovedadesModule } from './NovedadesModule';
import {
  Wrench,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  DollarSign,
  Filter,
  Layers,
  Sparkles,
  Ship,
  PlusCircle,
  TrendingUp,
  Plus,
  Search,
  X,
  FileText,
  User,
  Calendar,
} from 'lucide-react';

interface MantenimientoIndependienteModuleProps {
  embarcaciones: Embarcacion[];
  tripulacion: Tripulante[];
  currentUser: PerfilUsuarioAuth;
  onAddNovedad: (novedadData: Omit<NovedadFalla, 'id'>) => Promise<void>;
  onUpdateNovedad: (updateData: Partial<NovedadFalla> & { id: string; embarcacionId: string }) => Promise<void>;
  onAddMantenimiento: (embarcacionId: string, mntData: any) => void;
  trabajosDiarios?: TrabajoDiarioMantenimiento[];
  onAddTrabajoDiario?: (trabajo: Omit<TrabajoDiarioMantenimiento, 'id'>) => Promise<void> | void;
}

export const MantenimientoIndependienteModule: React.FC<MantenimientoIndependienteModuleProps> = ({
  embarcaciones,
  tripulacion,
  currentUser,
  onAddNovedad,
  onUpdateNovedad,
  trabajosDiarios = [],
  onAddTrabajoDiario,
}) => {
  const [subTab, setSubTab] = useState<'HORAS_GRAFICO' | 'NOVEDADES' | 'TRABAJOS_DIARIOS' | 'GERENCIA_APROBACIONES'>('HORAS_GRAFICO');
  const [selectedEmbId, setSelectedEmbId] = useState<string>('TODAS');
  const [searchTrabajo, setSearchTrabajo] = useState('');
  const [showAddTrabajoModal, setShowAddTrabajoModal] = useState(false);

  // Form states for adding daily work
  const [formEmbId, setFormEmbId] = useState<string>(embarcaciones[0]?.id || 'emb-armonia');
  const [formColaboradorNombre, setFormColaboradorNombre] = useState<string>(
    tripulacion[0]?.nombreCompleto || 'Brayan Estiven Torres Palacios'
  );
  const [formColaboradorCargo, setFormColaboradorCargo] = useState<string>('Ayudante de Mantenimiento');
  const [formFecha, setFormFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formSistema, setFormSistema] = useState<string>('MOTORES');
  const [formTipoTrabajo, setFormTipoTrabajo] = useState<'PREVENTIVO' | 'CORRECTIVO' | 'RUTINA_DIARIA' | 'INSPECCION' | 'VARADA_ASTILLERO'>('PREVENTIVO');
  const [formTitulo, setFormTitulo] = useState<string>('Mantenimiento preventivo de rutina');
  const [formDescripcion, setFormDescripcion] = useState<string>(
    `En ${embarcaciones[0]?.nombre || 'Catamarán ARMONIA'} se realizó: `
  );
  const [formRepuestos, setFormRepuestos] = useState<string>('');
  const [formHoras, setFormHoras] = useState<number>(3.0);
  const [formCostoCOP, setFormCostoCOP] = useState<number>(65000);
  const [isSubmittingTrabajo, setIsSubmittingTrabajo] = useState(false);

  // Aggregated KPIs
  const allNovedades = embarcaciones.flatMap((e) =>
    (e.novedades || []).map((n) => ({
      ...n,
      embarcacionNombre: e.nombre,
      embarcacionMatricula: e.matricula,
    }))
  );

  const pendientes = allNovedades.filter((n) => n.estado === 'ABIERTA');
  const enProceso = allNovedades.filter((n) => n.estado === 'EN_PROCESO');
  const solucionadas = allNovedades.filter((n) => n.estado === 'SOLUCIONADA');
  const criticas = allNovedades.filter((n) => n.severidad === 'CRITICA' && n.estado !== 'SOLUCIONADA');

  const presupuestosPendientes = allNovedades.filter(
    (n) => n.costoEstimado && n.costoEstimado > 0 && !n.aprobadoPorGerente
  );

  const isGerente =
    currentUser.rol === 'GERENTE_MANTENIMIENTO' ||
    currentUser.rol === 'DIRECTOR_OPERACIONES' ||
    currentUser.rol === 'DIRECTOR_OPERACIONES_DPA' ||
    currentUser.permissions === 'SUPER_ADMIN';

  const formatCOP = (val?: number) => {
    if (!val) return '$0 COP';
    return `$${val.toLocaleString('es-CO')} COP`;
  };

  // Filtered daily maintenance works
  const filteredTrabajos = useMemo(() => {
    return trabajosDiarios.filter((t) => {
      if (selectedEmbId !== 'TODAS' && t.embarcacionId !== selectedEmbId) return false;
      if (searchTrabajo) {
        const query = searchTrabajo.toLowerCase();
        return (
          t.embarcacionNombre.toLowerCase().includes(query) ||
          t.colaboradorNombre.toLowerCase().includes(query) ||
          t.descripcion.toLowerCase().includes(query) ||
          t.titulo.toLowerCase().includes(query) ||
          (t.repuestosUtilizados && t.repuestosUtilizados.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [trabajosDiarios, selectedEmbId, searchTrabajo]);

  // Handle boat selection change in modal to prefill description format
  const handleModalEmbChange = (newEmbId: string) => {
    setFormEmbId(newEmbId);
    const found = embarcaciones.find((e) => e.id === newEmbId);
    const nom = found?.nombre || 'la embarcación';
    if (!formDescripcion || formDescripcion.startsWith('En ')) {
      setFormDescripcion(`En ${nom} se realizó: `);
    }
  };

  const handleModalColaboradorChange = (name: string) => {
    setFormColaboradorNombre(name);
    const found = tripulacion.find((t) => t.nombreCompleto === name);
    if (found) {
      setFormColaboradorCargo(found.cargoDescripcion || found.cargo);
    }
  };

  // Submit new daily work
  const handleSubmitTrabajo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingTrabajo(true);
      const emb = embarcaciones.find((e) => e.id === formEmbId);
      const now = new Date();
      const timestampCOT = `${now.toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })} ${now.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour12: false })}`;

      if (onAddTrabajoDiario) {
        await onAddTrabajoDiario({
          embarcacionId: formEmbId,
          embarcacionNombre: emb?.nombre || 'Embarcación General',
          fecha: formFecha,
          colaboradorNombre: formColaboradorNombre,
          colaboradorCargo: formColaboradorCargo,
          sistema: formSistema,
          tipoTrabajo: formTipoTrabajo,
          titulo: formTitulo,
          descripcion: formDescripcion,
          repuestosUtilizados: formRepuestos,
          horasInvertidas: formHoras,
          costoManoObraCOP: formCostoCOP,
          estado: 'COMPLETADO',
          timestampCOT,
          notasSupervisor: `Registrado por ${currentUser.nombre} en COT.`,
        });
      }

      setShowAddTrabajoModal(false);
      // Reset form
      setFormRepuestos('');
      setFormTitulo('Mantenimiento preventivo de rutina');
    } catch (err: any) {
      alert(`Error al registrar trabajo diario: ${err.message}`);
    } finally {
      setIsSubmittingTrabajo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                Módulo Independiente
              </span>
              <span className="text-slate-400 text-xs">RENET &amp; DIMAR Estándar Técnico</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Ingeniería &amp; Mantenimiento de Flota
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Monitoreo predictivo de horas de motor acumuladas vs. límites de servicio, registro de trabajos diarios por barco realizados por los colaboradores, bitácora de novedades y gestión presupuestal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Nivel de Autoridad</div>
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 justify-end">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {currentUser.rol.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Fleet KPI Quick Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium">Trabajos Diarios Realizados</div>
            <div className="text-xl font-bold text-cyan-400 mt-0.5 flex items-center gap-2">
              <span>{trabajosDiarios.length}</span>
              <span className="text-[10px] text-slate-400 font-normal">por colaboradores</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium">Novedades Abiertas</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5 flex items-center gap-2">
              <span>{pendientes.length}</span>
              {criticas.length > 0 && (
                <span className="text-[10px] bg-rose-900/60 text-rose-300 px-1.5 py-0.5 rounded border border-rose-700">
                  {criticas.length} Críticas
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium">Trabajos en Ejecución</div>
            <div className="text-xl font-bold text-cyan-400 mt-0.5 flex items-center gap-2">
              <span>{enProceso.length}</span>
              <span className="text-[10px] text-slate-400 font-normal">Astivik &amp; Taller</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium">Presupuestos Pendientes</div>
            <div className="text-xl font-bold text-violet-400 mt-0.5 flex items-center gap-2">
              <span>{presupuestosPendientes.length}</span>
              <span className="text-[10px] text-slate-400 font-normal">por autorizar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubTab('TRABAJOS_DIARIOS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'TRABAJOS_DIARIOS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Trabajos Diarios por Barco</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {trabajosDiarios.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('HORAS_GRAFICO')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'HORAS_GRAFICO'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Gráficos Horas Motor vs. Límites</span>
          </button>

          <button
            onClick={() => setSubTab('NOVEDADES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'NOVEDADES'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Bitácora de Novedades &amp; Fotos</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {allNovedades.length}
            </span>
          </button>

          {isGerente && (
            <button
              onClick={() => setSubTab('GERENCIA_APROBACIONES')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'GERENCIA_APROBACIONES'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Aprobaciones &amp; Presupuestos Gerencia</span>
              {presupuestosPendientes.length > 0 && (
                <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {presupuestosPendientes.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Vessel Quick Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">Filtrar Nave:</span>
          <select
            value={selectedEmbId}
            onChange={(e) => setSelectedEmbId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
          >
            <option value="TODAS">Todas las Naves</option>
            {embarcaciones.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} ({e.matricula})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* -------------------------------------------------------------
          SUB-TAB 1: TRABAJOS DIARIOS REALIZADOS POR LOS COLABORADORES POR BARCO
          ------------------------------------------------------------- */}
      {subTab === 'TRABAJOS_DIARIOS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Trabajos Diarios Realizados por Colaboradores por Barco
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bitácora de registro de mantenimiento preventivo y correctivo diario ejecutado en cada embarcación (ej. Armonía se realizó...).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleModalEmbChange(selectedEmbId !== 'TODAS' ? selectedEmbId : embarcaciones[0]?.id || 'emb-armonia');
                    setShowAddTrabajoModal(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Registrar Trabajo Diario</span>
                </button>
              </div>
            </div>

            {/* Filter Search Toolbar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por colaborador, barco, repuesto o detalle..."
                  value={searchTrabajo}
                  onChange={(e) => setSearchTrabajo(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Mostrando <span className="font-bold text-slate-800">{filteredTrabajos.length}</span> registros de trabajo
              </div>
            </div>
          </div>

          {/* Cards List of Daily Works */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrabajos.map((trabajo) => (
              <div
                key={trabajo.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold">
                      ⚓
                    </div>
                    <div>
                      <span className="text-xs font-bold text-cyan-900 block">
                        {trabajo.embarcacionNombre}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-800">
                        {trabajo.titulo}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {trabajo.tipoTrabajo}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {trabajo.fecha}
                    </div>
                  </div>
                </div>

                {/* Highlighted Execution Quote: "En [Barco] se realizó: ..." */}
                <div className="p-3.5 bg-gradient-to-r from-slate-50 to-cyan-50/40 rounded-xl border border-slate-200/80 text-xs text-slate-800 font-medium leading-relaxed">
                  <span className="font-bold text-cyan-950 block mb-1">Detalle del Trabajo Ejecutado:</span>
                  {trabajo.descripcion}
                </div>

                {/* Technical metadata */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">Colaborador / Técnico:</span>
                    <span className="text-slate-800 font-bold">{trabajo.colaboradorNombre}</span>
                    {trabajo.colaboradorCargo && (
                      <span className="text-slate-500 block text-[10px]">{trabajo.colaboradorCargo}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Sistema Intervenido:</span>
                    <span className="text-amber-800 font-semibold">{trabajo.sistema}</span>
                    {trabajo.horasInvertidas ? (
                      <span className="text-slate-500 block text-[10px]">
                        {trabajo.horasInvertidas} hrs hombre • {trabajo.costoManoObraCOP ? formatCOP(trabajo.costoManoObraCOP) : 'Mantenimiento propio'}
                      </span>
                    ) : null}
                  </div>
                </div>

                {trabajo.repuestosUtilizados && (
                  <div className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200/60 text-slate-700">
                    <span className="font-semibold text-slate-500">Repuestos & Materiales:</span>{' '}
                    <span>{trabajo.repuestosUtilizados}</span>
                  </div>
                )}

                {trabajo.timestampCOT && (
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                    <span>Sello Inmutable COT: {trabajo.timestampCOT}</span>
                    <span className="text-emerald-600 font-semibold">{trabajo.estado}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredTrabajos.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-700">No hay trabajos diarios registrados con este filtro</div>
              <p className="text-xs text-slate-400 mt-1">Haga clic en "+ Registrar Trabajo Diario" para añadir un trabajo a la bitácora.</p>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-TAB 2: HORAS MOTOR VS LÍMITES
          ------------------------------------------------------------- */}
      {subTab === 'HORAS_GRAFICO' && (
        <div className="space-y-6">
          <HorasMotorBarChart
            embarcaciones={embarcaciones}
            onSelectEmbarcacion={(embId) => {
              setSelectedEmbId(embId);
            }}
          />
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-TAB 3: NOVEDADES & FOTOS
          ------------------------------------------------------------- */}
      {subTab === 'NOVEDADES' && (
        <div className="space-y-6">
          <NovedadesModule
            embarcaciones={embarcaciones}
            selectedEmbId={selectedEmbId !== 'TODAS' ? selectedEmbId : embarcaciones[0]?.id || 'emb-armonia'}
            tripulacion={tripulacion}
            onAddNovedad={onAddNovedad}
            onUpdateNovedad={onUpdateNovedad}
          />
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-TAB 4: APROBACIONES GERENCIA
          ------------------------------------------------------------- */}
      {subTab === 'GERENCIA_APROBACIONES' && isGerente && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Validación de Presupuestos y Cierre de Órdenes de Mantenimiento
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rol exclusivo: Gerente de Mantenimiento y Director de Operaciones. Aprueba costos de repuestos y autoriza la adquisición de piezas.
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Control Financiero RENET
            </div>
          </div>

          {presupuestosPendientes.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-800">
                No hay presupuestos pendientes de autorización
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Todas las solicitudes de repuestos y cotizaciones de talleres navales han sido revisadas y aprobadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-600">
                Órdenes que requieren aprobación de costo antes de compra:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presupuestosPendientes.map((nov) => (
                  <div
                    key={nov.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {nov.embarcacionNombre} ({nov.embarcacionMatricula})
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{nov.titulo}</h4>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">
                        {nov.sistema}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{nov.descripcion}</p>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="text-xs font-semibold text-slate-700">Taller / Especialista: {nov.responsableArreglo}</div>
                      {nov.piezasRequeridas && nov.piezasRequeridas.length > 0 && (
                        <div>
                          <div className="text-slate-500 text-[11px] mt-1">Repuestos solicitados:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {nov.piezasRequeridas.map((p, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded border border-slate-200"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-700">Cotización Estimada:</span>
                        <span className="font-extrabold text-emerald-700">{formatCOP(nov.costoEstimado)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={async () => {
                          await onUpdateNovedad({
                            id: nov.id,
                            embarcacionId: nov.embarcacionId,
                            aprobadoPorGerente: true,
                            presupuestoAprobadoCOP: nov.costoEstimado,
                            estado: 'EN_PROCESO',
                            notasSolucion: `Presupuesto aprobado por ${currentUser.nombre} (${currentUser.rol}) el ${new Date().toLocaleDateString('es-CO')}. Proceder con compra y montaje.`,
                          });
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Aprobar Presupuesto ({formatCOP(nov.costoEstimado)})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: REGISTRAR TRABAJO DIARIO DE MANTENIMIENTO
          ------------------------------------------------------------- */}
      {showAddTrabajoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 to-slate-900 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Registrar Trabajo Diario por Barco</h3>
                  <p className="text-slate-400 text-xs">Bitácora de mantenimiento preventivo y técnico por colaborador</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTrabajoModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTrabajo} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Embarcación Intervenida
                  </label>
                  <select
                    value={formEmbId}
                    onChange={(e) => handleModalEmbChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  >
                    {embarcaciones.map((e) => (
                      <option key={e.id} value={e.id}>
                        ⚓ {e.nombre} ({e.matricula})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fecha de Ejecución
                  </label>
                  <input
                    type="date"
                    value={formFecha}
                    onChange={(e) => setFormFecha(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Colaborador Responsable / Técnico
                </label>
                <select
                  value={formColaboradorNombre}
                  onChange={(e) => handleModalColaboradorChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                >
                  {tripulacion.map((t) => (
                    <option key={t.id} value={t.nombreCompleto}>
                      {t.nombreCompleto} ({t.cargoDescripcion || t.cargo})
                    </option>
                  ))}
                  <option value="Taller Naval Astivik / Externo">Taller Naval Astivik / Especialista Externo</option>
                  <option value="Contratista Mecánico Independiente">Contratista Mecánico Independiente</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sistema Intervenido
                  </label>
                  <select
                    value={formSistema}
                    onChange={(e) => setFormSistema(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="MOTORES">Motores Diesel / Yanmar</option>
                    <option value="PROPULSION">Propulsión / Ejes / Saildrive</option>
                    <option value="SISTEMA_ELECTRICO">Sistema Eléctrico & Generador</option>
                    <option value="CASCO_Y_CUBIERTA">Casco, Fibra & Pintura</option>
                    <option value="BOMBAS_Y_ACHIQUE">Bombas de Achique & Sentinas</option>
                    <option value="GOBIERNO_Y_PROPULSION">Timón & Sistema Hidráulico</option>
                    <option value="CONFORT_Y_CABINA">Confort, Fontanería & Cabina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Mantenimiento
                  </label>
                  <select
                    value={formTipoTrabajo}
                    onChange={(e) => setFormTipoTrabajo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    <option value="PREVENTIVO">Preventivo de Rutina</option>
                    <option value="CORRECTIVO">Correctivo Inmediato</option>
                    <option value="RUTINA_DIARIA">Revisión Diaria / Sentinas</option>
                    <option value="INSPECCION">Inspección DIMAR / Especial</option>
                    <option value="VARADA_ASTILLERO">Varada en Astillero</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título Breve del Trabajo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cambio de aceite motor babor y ajuste prensaestopa"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Detalle de lo Realizado en la Embarcación
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Formato: "En [Barco] se realizó..."
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  placeholder="Ej: En Catamarán ARMONIA se realizó: cambio de aceite motor babor YANMAR 2GM20FC, reemplazo de filtro de combustible y ajuste de prensaestopa. Se probó en ralentí 30 minutos sin presencia de goteo ni calentamiento."
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Repuestos & Materiales Utilizados (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1 Galón 15W40 Marino, 1 Filtro combustible Yanmar, 2 Abrazaderas Inox"
                  value={formRepuestos}
                  onChange={(e) => setFormRepuestos(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Horas-Hombre Invertidas
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formHoras}
                    onChange={(e) => setFormHoras(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Costo Mano de Obra (COP)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={formCostoCOP}
                    onChange={(e) => setFormCostoCOP(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Sello COT inmutable
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTrabajoModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTrabajo}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    {isSubmittingTrabajo ? 'Guardando...' : 'Guardar en Bitácora'}
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
