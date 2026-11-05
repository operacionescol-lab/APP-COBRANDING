import React, { useState } from 'react';
import {
  RegistroLavanderiaAseo,
  Embarcacion,
  TipoServicioAseo,
  EstadoLenceria,
  PrendaLenceria,
} from '../types/nautical';
import {
  Sparkles,
  Shirt,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Package,
  Layers,
  Ship,
  Search,
  Filter,
  Check,
  Building2,
  AlertCircle,
} from 'lucide-react';

interface LavanderiaAseoModuleProps {
  registros: RegistroLavanderiaAseo[];
  embarcaciones: Embarcacion[];
  onAddRegistro: (data: Omit<RegistroLavanderiaAseo, 'id'>) => Promise<void>;
  onUpdateEstadoLenceria: (id: string, nuevoEstado: EstadoLenceria, fechaRecepcion?: string) => Promise<void>;
}

export const LavanderiaAseoModule: React.FC<LavanderiaAseoModuleProps> = ({
  registros,
  embarcaciones,
  onAddRegistro,
  onUpdateEstadoLenceria,
}) => {
  const [activeTab, setActiveTab] = useState<'TODOS' | 'LENCERIA' | 'ASEO'>('TODOS');
  const [showModal, setShowModal] = useState(false);
  const [tipoRegistro, setTipoRegistro] = useState<'JORNADA_ASEO' | 'CONTROL_LENCERIA'>('CONTROL_LENCERIA');
  const [embarcacionId, setEmbarcacionId] = useState<string>('emb-armonia');
  const [ubicacionManual, setUbicacionManual] = useState('');
  const [responsable, setResponsable] = useState('Yolanda Murillo Valencia');
  const [tipoServicioAseo, setTipoServicioAseo] = useState<TipoServicioAseo>('POST_CHARTER');
  const [estadoLenceria, setEstadoLenceria] = useState<EstadoLenceria>('EN_LAVANDERIA');
  const [fechaEnvio, setFechaEnvio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaRecepcion, setFechaRecepcion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Linen items input
  const [prendas, setPrendas] = useState<PrendaLenceria[]>([
    { prenda: 'Toallas playeras grandes', cantidad: 45, estado: 'LAVADO' },
    { prenda: 'Manteles blancos para buffet', cantidad: 6, estado: 'LAVADO' },
    { prenda: 'Fundas de cojines de cubierta', cantidad: 18, estado: 'LAVADO' },
  ]);

  const [nuevaPrendaNombre, setNuevaPrendaNombre] = useState('');
  const [nuevaPrendaCant, setNuevaPrendaCant] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const totalLotesLenceria = registros.filter((r) => r.tipoRegistro === 'CONTROL_LENCERIA').length;
  const lenceríaEnLavado = registros.filter((r) => r.estadoLencería === 'EN_LAVANDERIA').length;
  const jornadasAseoMes = registros.filter((r) => r.tipoRegistro === 'JORNADA_ASEO').length;

  const filteredRegistros = registros.filter((r) => {
    if (activeTab === 'LENCERIA') return r.tipoRegistro === 'CONTROL_LENCERIA';
    if (activeTab === 'ASEO') return r.tipoRegistro === 'JORNADA_ASEO';
    return true;
  });

  const handleAddPrenda = () => {
    if (!nuevaPrendaNombre.trim()) return;
    setPrendas((prev) => [
      ...prev,
      { prenda: nuevaPrendaNombre.trim(), cantidad: Number(nuevaPrendaCant), estado: 'LAVADO' },
    ]);
    setNuevaPrendaNombre('');
    setNuevaPrendaCant(10);
  };

  const handleRemovePrenda = (idx: number) => {
    setPrendas((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const emb = embarcaciones.find((e) => e.id === embarcacionId);
      const nombreLugar = tipoServicioAseo === 'OFICINA' ? 'Oficinas Administrativas & Muelle' : (emb?.nombre || 'Embarcación');

      await onAddRegistro({
        tipoRegistro,
        fecha: new Date().toISOString().split('T')[0],
        embarcacionId: tipoServicioAseo !== 'OFICINA' ? embarcacionId : undefined,
        embarcacionNombre: nombreLugar,
        responsable,
        tipoServicioAseo: tipoRegistro === 'JORNADA_ASEO' ? tipoServicioAseo : undefined,
        estadoLencería: tipoRegistro === 'CONTROL_LENCERIA' ? estadoLenceria : undefined,
        itemsPrendas: tipoRegistro === 'CONTROL_LENCERIA' ? prendas : undefined,
        fechaEnvio: tipoRegistro === 'CONTROL_LENCERIA' ? fechaEnvio : undefined,
        fechaRecepcion: fechaRecepcion || undefined,
        calificacionAseo: 'EXCELENTE',
        observaciones,
      });

      setShowModal(false);
      setObservaciones('');
    } catch (err: any) {
      alert(err.message || 'Error guardando registro de lavandería');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Módulo de Lavandería y Aseo
            </span>
            <span className="text-slate-400 text-xs">Personal de Limpieza • COBRANDING OPS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Control de Aseo en Naves, Oficinas y Lencería
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Registro de jornadas de aseo post-charter, preparación VIP y trazabilidad de prendas de lavado.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Jornada de Aseo / Lencería</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Shirt className="w-3.5 h-3.5 text-cyan-600" /> Lotes de Lencería
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalLotesLenceria} Lotes</div>
          <div className="text-[10px] text-cyan-700 font-semibold mt-0.5">Toallas, manteles y fundas</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-amber-600 uppercase font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> En Lavandería Externa
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{lenceríaEnLavado} En Proceso</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Lavandería Industrial Caribe</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-emerald-600 uppercase font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Jornadas de Aseo Mes
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{jornadasAseoMes} Completadas</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Naves desinfectadas y oficinas</div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 font-bold">
          <button
            onClick={() => setActiveTab('TODOS')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'TODOS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos los Registros ({registros.length})
          </button>
          <button
            onClick={() => setActiveTab('LENCERIA')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'LENCERIA' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lencería y Toallas ({registros.filter((r) => r.tipoRegistro === 'CONTROL_LENCERIA').length})
          </button>
          <button
            onClick={() => setActiveTab('ASEO')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'ASEO' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jornadas de Aseo Naves/Oficinas ({registros.filter((r) => r.tipoRegistro === 'JORNADA_ASEO').length})
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filteredRegistros.map((reg) => {
          const isLenceria = reg.tipoRegistro === 'CONTROL_LENCERIA';

          return (
            <div
              key={reg.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isLenceria ? 'bg-indigo-100 text-indigo-800' : 'bg-cyan-100 text-cyan-800'
                    }`}
                  >
                    {isLenceria ? '🧺 CONTROL DE LENCERÍA' : '🧹 JORNADA DE ASEO'}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">
                    {reg.embarcacionNombre}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Fecha: {reg.fecha}</span>
                </div>

                <div>
                  {isLenceria ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        reg.estadoLencería === 'LISTO_A_BORDO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reg.estadoLencería === 'EN_LAVANDERIA'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {reg.estadoLencería?.replace(/_/g, ' ')}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Calidad: {reg.calificacionAseo}
                    </span>
                  )}
                </div>
              </div>

              {/* Items Table for Linen */}
              {isLenceria && reg.itemsPrendas && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    <span>Detalle de Prendas del Lote:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {reg.itemsPrendas.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="font-semibold text-slate-800 truncate">{item.prenda}</div>
                        <div className="flex justify-between items-center mt-1 text-[11px]">
                          <strong className="text-cyan-700">{item.cantidad} unidades</strong>
                          <span className="text-[9px] bg-white px-1.5 py-0.5 rounded border text-emerald-700 font-bold">
                            {item.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div>
                      Responsable de entrega/recepción: <strong>{reg.responsable}</strong>
                    </div>
                    {reg.fechaEnvio && (
                      <div>
                        Envío: <strong>{reg.fechaEnvio}</strong> • Recepción:{' '}
                        <strong>{reg.fechaRecepcion || 'En tránsito'}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cleaning Notes */}
              {!isLenceria && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <div>
                      Tipo de Aseo: <strong className="text-cyan-800 font-bold">{reg.tipoServicioAseo}</strong>
                    </div>
                    <div>
                      Responsable: <strong>{reg.responsable}</strong>
                    </div>
                  </div>
                  {reg.observaciones && (
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {reg.observaciones}
                    </p>
                  )}
                </div>
              )}

              {/* Quick Status Action for linen */}
              {isLenceria && reg.estadoLencería === 'EN_LAVANDERIA' && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() =>
                      onUpdateEstadoLenceria(
                        reg.id,
                        'LISTO_A_BORDO',
                        new Date().toISOString().split('T')[0]
                      )
                    }
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer transition-colors"
                  >
                    ✓ Marcar como Recibido y Listo a Bordo
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* NEW RECORD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-800">Lavandería &amp; Aseo</span>
                <h3 className="text-base font-bold text-slate-900">Registrar Jornada o Lote</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Registro *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoRegistro('CONTROL_LENCERIA')}
                    className={`p-2 rounded-lg border font-bold text-xs text-center transition-all cursor-pointer ${
                      tipoRegistro === 'CONTROL_LENCERIA'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-1 ring-indigo-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🧺 Control de Lencería
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoRegistro('JORNADA_ASEO')}
                    className={`p-2 rounded-lg border font-bold text-xs text-center transition-all cursor-pointer ${
                      tipoRegistro === 'JORNADA_ASEO'
                        ? 'bg-cyan-50 border-cyan-600 text-cyan-900 ring-1 ring-cyan-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    🧹 Jornada de Aseo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Embarcación / Lugar *</label>
                  <select
                    value={embarcacionId}
                    onChange={(e) => setEmbarcacionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium cursor-pointer"
                  >
                    {embarcaciones.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                    <option value="oficinas">🏢 Oficinas Administrativas &amp; Muelle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsable *</label>
                  <input
                    type="text"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              {tipoRegistro === 'CONTROL_LENCERIA' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Prendas y Ropa a Lavar:</span>
                    <span className="text-[10px] text-slate-500">{prendas.length} tipos de prenda</span>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {prendas.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-xs">
                        <span>{p.prenda}</span>
                        <div className="flex items-center gap-2">
                          <strong className="text-cyan-700">{p.cantidad} unds</strong>
                          <button
                            type="button"
                            onClick={() => handleRemovePrenda(i)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Nueva prenda (ej: Sábanas camarote)"
                      value={nuevaPrendaNombre}
                      onChange={(e) => setNuevaPrendaNombre(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      value={nuevaPrendaCant}
                      onChange={(e) => setNuevaPrendaCant(Number(e.target.value))}
                      className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleAddPrenda}
                      className="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              )}

              {tipoRegistro === 'JORNADA_ASEO' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Servicio de Aseo *</label>
                  <select
                    value={tipoServicioAseo}
                    onChange={(e) => setTipoServicioAseo(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium cursor-pointer"
                  >
                    <option value="POST_CHARTER">Aseo Preventivo Post-Charter</option>
                    <option value="ASEO_PROFUNDO">Aseo Profundo de Casco y Cabina</option>
                    <option value="PREPARACION_VIP">Preparación VIP para Evento</option>
                    <option value="OFICINA">Aseo de Oficinas Administrativas</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observaciones / Novedades de Aseo</label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalles sobre manchas tratadas, áreas priorizadas o insumos consumidos..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-600 rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
