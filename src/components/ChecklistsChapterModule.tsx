import React, { useState, useMemo } from 'react';
import {
  ChecklistPreZarpe,
  Embarcacion,
  Tripulante,
  Salida,
  PerfilUsuarioAuth,
} from '../types/nautical';
import { ChecklistPreZarpeModal } from './ChecklistPreZarpeModal';
import {
  FileCheck,
  Ship,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Compass,
  Radio,
  Users,
  Anchor,
  PenTool,
  ShieldCheck,
  Calendar,
  Trash2,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

interface ChecklistsChapterModuleProps {
  checklists: ChecklistPreZarpe[];
  salidas: Salida[];
  embarcaciones: Embarcacion[];
  tripulacion: Tripulante[];
  currentUser: PerfilUsuarioAuth;
  onSaveChecklist: (checklistData: Partial<ChecklistPreZarpe>) => Promise<void>;
  onDeleteChecklist: (id: string) => Promise<void>;
}

export const ChecklistsChapterModule: React.FC<ChecklistsChapterModuleProps> = ({
  checklists,
  salidas,
  embarcaciones,
  tripulacion,
  currentUser,
  onSaveChecklist,
  onDeleteChecklist,
}) => {
  const [selectedVessel, setSelectedVessel] = useState<string>('TODAS');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal states
  const [activeChecklist, setActiveChecklist] = useState<ChecklistPreZarpe | null>(null);
  const [selectedSalidaForNew, setSelectedSalidaForNew] = useState<Salida | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered checklists
  const filteredChecklists = useMemo(() => {
    return checklists.filter((item) => {
      if (selectedVessel !== 'TODAS' && item.embarcacionId !== selectedVessel) {
        return false;
      }
      if (selectedEstado !== 'TODOS' && item.estado !== selectedEstado) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const sitmar = (item.codigoSitmar || '').toLowerCase();
        const code = (item.codigoChecklist || '').toLowerCase();
        const vessel = (item.embarcacionNombre || '').toLowerCase();
        const pilot = (item.nombrePiloto || '').toLowerCase();
        const date = (item.fecha || '').toLowerCase();
        if (
          !sitmar.includes(term) &&
          !code.includes(term) &&
          !vessel.includes(term) &&
          !pilot.includes(term) &&
          !date.includes(term)
        ) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [checklists, selectedVessel, selectedEstado, searchTerm]);

  // Departures without checklist
  const salidasSinChecklist = useMemo(() => {
    return salidas.filter(
      (s) => !checklists.some((c) => c.salidaId === s.id || (s.checklistPreZarpeId && c.id === s.checklistPreZarpeId))
    );
  }, [salidas, checklists]);

  // Metrics
  const stats = useMemo(() => {
    const total = checklists.length;
    const aprobados = checklists.filter((c) => c.estado === 'APROBADO_PARA_ZARPE').length;
    const pendientesFirmas = checklists.filter((c) => c.estado === 'PENDIENTE_FIRMAS').length;
    const noConformes = checklists.filter((c) => c.estado === 'NO_CONFORME').length;
    const conSitmar = checklists.filter((c) => c.codigoSitmar && c.codigoSitmar.length >= 5).length;
    const porcentajeSitmar = total > 0 ? Math.round((conSitmar / total) * 100) : 100;

    return {
      total,
      aprobados,
      pendientesFirmas,
      noConformes,
      conSitmar,
      porcentajeSitmar,
    };
  }, [checklists]);

  const handleOpenNewChecklist = (salida?: Salida) => {
    setActiveChecklist(null);
    setSelectedSalidaForNew(salida || null);
    setIsModalOpen(true);
  };

  const handleOpenEditChecklist = (chk: ChecklistPreZarpe) => {
    setActiveChecklist(chk);
    const relatedSalida = chk.salidaId ? salidas.find((s) => s.id === chk.salidaId) : null;
    setSelectedSalidaForNew(relatedSalida || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Chapter Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <FileCheck className="w-64 h-64 text-cyan-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 text-xs font-black bg-cyan-950 text-cyan-200 border border-cyan-700/80 rounded-full flex items-center gap-1.5 shadow-sm tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S
              </span>
              <span className="px-3 py-1 text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 rounded-full">
                NIT: 901159056-4
              </span>
              <span className="px-3 py-1 text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 rounded-full">
                Versión N° 1.1 • Fecha Rev. 20-2026
              </span>
              <span className="px-3 py-1 text-xs font-semibold bg-slate-800 text-cyan-300 border border-slate-700 rounded-full">
                Autorización: STEVEN CARDONA RENDÓN
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5">
              MANUAL SIMPLIFICADO DE GESTION DE LA SEGURIDAD
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-cyan-300 mt-1">
              Capítulo: Formatos de Verificación Antes de Zarpe por Parte del Capitán (16 Puntos)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-1.5 leading-relaxed">
              Registro oficial y archivo auditable de inspección pre-zarpe con Código SITMAR de autorización de zarpe registrado en cada embarcación, avalado con firma del Capitán y autorización de la Dirección Operativa.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleOpenNewChecklist()}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Formato Pre-Zarpe
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              Imprimir Archivo
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Total Checklists
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{stats.total}</span>
              <span className="text-xs text-slate-500">verificaciones</span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aprobados para Zarpe
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{stats.aprobados}</span>
              <span className="text-xs text-emerald-500/80">16/16 cumplidos</span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Pendientes de Firma
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{stats.pendientesFirmas}</span>
              <span className="text-xs text-amber-500/80">requieren aval DPA</span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 block">
              Códigos SITMAR Registrados
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-300">{stats.porcentajeSitmar}%</span>
              <span className="text-xs text-cyan-500/80">{stats.conSitmar} con código</span>
            </div>
          </div>
        </div>
      </div>

      {/* Departures needing pre-departure verification */}
      {salidasSinChecklist.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-600/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Salidas Pendientes de Registro de Formato Pre-Zarpe ({salidasSinChecklist.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-400/80">
              Obligatorio antes de autorizar zarpe
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {salidasSinChecklist.slice(0, 3).map((sal) => {
              const emb = embarcaciones.find((e) => e.id === sal.embarcacionId);
              const piloto = tripulacion.find((t) => t.id === sal.pilotoId);
              return (
                <div
                  key={sal.id}
                  className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{emb?.nombre}</span>
                      <span className="font-mono text-[10px] text-slate-400">{sal.fecha}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      SITMAR: <span className="text-amber-300 font-mono font-bold">{sal.codigoSitmar || 'Sin asignar'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenNewChecklist(sal)}
                    className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear Pre-Zarpe
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Código SITMAR, N° Checklist, Embarcación o Capitán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Nave:</span>
            <select
              value={selectedVessel}
              onChange={(e) => setSelectedVessel(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="TODAS">Todas las Naves</option>
              {embarcaciones.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Estado:</span>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="APROBADO_PARA_ZARPE">Aprobado para Zarpe</option>
              <option value="PENDIENTE_FIRMAS">Pendiente Firmas</option>
              <option value="NO_CONFORME">No Conforme</option>
            </select>
          </div>
        </div>
      </div>

      {/* Checklists List Table / Cards */}
      {filteredChecklists.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No se encontraron formatos de pre-zarpe</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No hay registros con los filtros seleccionados o aún no se han registrado checklists para estas salidas.
          </p>
          <button
            onClick={() => handleOpenNewChecklist()}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            Crear Primer Formato
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChecklists.map((chk) => {
            const totalItems = chk.items?.length || 16;
            const itemsCumplidos = chk.items?.filter((i) => i.cumple).length || 0;
            const isFullyApproved = chk.estado === 'APROBADO_PARA_ZARPE';

            return (
              <div
                key={chk.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-all shadow-md group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Block: Identity, Boat & SITMAR */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl border mt-0.5 flex-shrink-0 ${
                      isFullyApproved
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : chk.estado === 'PENDIENTE_FIRMAS'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                      <Ship className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                          {chk.codigoChecklist}
                        </span>

                        {/* SITMAR CODE BADGE AS REQUIRED */}
                        <div className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/40 rounded text-amber-300 font-mono text-xs font-black shadow-sm">
                          <span className="text-[10px] text-amber-500 font-sans uppercase">SITMAR:</span>
                          <span>{chk.codigoSitmar}</span>
                        </div>

                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                          isFullyApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : chk.estado === 'PENDIENTE_FIRMAS'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {isFullyApproved
                            ? '✓ APROBADO PARA ZARPE'
                            : chk.estado === 'PENDIENTE_FIRMAS'
                            ? '⏳ PENDIENTE FIRMAS'
                            : '⚠ NO CONFORME'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <h3 className="text-base font-bold text-white">
                          {chk.embarcacionNombre}
                        </h3>
                        <span className="text-xs text-slate-500 font-mono">
                          ({chk.matricula || 'CP-05'})
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {chk.fecha} a las {chk.horaVerificacion} hrs
                        </span>
                      </div>

                      {chk.salidaId && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Despacho vinculado: <span className="font-mono text-slate-400">{chk.salidaId}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle Block: 16 Items & Signatures */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs">
                    {/* Compliance */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        Puntos Evaluados
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-black text-sm text-white">
                          {itemsCumplidos}/{totalItems}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-medium">SI</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${(itemsCumplidos / totalItems) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Captain Signature */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        Firma Piloto
                      </span>
                      <p className="font-semibold text-slate-200 truncate mt-0.5" title={chk.nombrePiloto}>
                        {chk.nombrePiloto}
                      </p>
                      <span className={`text-[10px] font-bold inline-flex items-center gap-1 mt-0.5 ${
                        chk.firmaPiloto ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {chk.firmaPiloto ? '✓ Firmado' : '✗ Sin firmar'}
                      </span>
                    </div>

                    {/* D.P.A. Signature */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        Firma D.P.A.
                      </span>
                      <p className="font-semibold text-slate-200 truncate mt-0.5" title={chk.nombreDpa}>
                        {chk.nombreDpa}
                      </p>
                      <span className={`text-[10px] font-bold inline-flex items-center gap-1 mt-0.5 ${
                        chk.firmaDpa ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {chk.firmaDpa ? '✓ Aval Concedido' : '⏳ Pendiente Aval'}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <button
                      onClick={() => handleOpenEditChecklist(chk)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Ver formato completo y firmas"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                      Ver / Firmar
                    </button>

                    <button
                      onClick={() => {
                        handleOpenEditChecklist(chk);
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors"
                      title="Imprimir formato oficial"
                    >
                      <Printer className="w-4 h-4 text-cyan-400" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el formato de verificación pre-zarpe ${chk.codigoChecklist}?`)) {
                          onDeleteChecklist(chk.id);
                        }
                      }}
                      className="p-2 bg-slate-800/80 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-800/60 rounded-lg transition-colors"
                      title="Eliminar formato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Optional General Remarks note */}
                {chk.observacionesGenerales && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-xs text-slate-400 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300">Observaciones:</strong> {chk.observacionesGenerales}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Official Guidelines Info Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <span>
            Los formatos de pre-zarpe son de obligatorio cumplimiento según el Convenio SOLAS y la Dirección General Marítima (DIMAR). El código SITMAR ampara la autorización del zarpe en aguas colombianas.
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400 font-semibold flex-shrink-0">
          CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S • NIT 901159056-4
        </div>
      </div>

      {/* Checklist Interactive Modal */}
      {isModalOpen && (
        <ChecklistPreZarpeModal
          checklist={activeChecklist}
          salida={selectedSalidaForNew}
          embarcaciones={embarcaciones}
          tripulacion={tripulacion}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={onSaveChecklist}
        />
      )}
    </div>
  );
};
