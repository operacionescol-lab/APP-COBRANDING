import React, { useState } from 'react';
import { NovedadFalla, Embarcacion, Tripulante, SistemaNovedad, SeveridadNovedad, EstadoNovedad } from '../types/nautical';
import { compressImageToWebP, uploadWebPToGoogleDrive, CompressionResult } from '../utils/imageCompression';
import {
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Plus,
  X,
  Clock,
  User,
  Package,
  Layers,
  Ship,
  ExternalLink,
  Filter,
  Eye,
  Check,
  CloudUpload,
} from 'lucide-react';

interface NovedadesModuleProps {
  embarcaciones: Embarcacion[];
  selectedEmbId: string;
  tripulacion: Tripulante[];
  onAddNovedad: (novedadData: Omit<NovedadFalla, 'id'>) => Promise<void>;
  onUpdateNovedad: (updateData: Partial<NovedadFalla> & { id: string; embarcacionId: string }) => Promise<void>;
}

export const NovedadesModule: React.FC<NovedadesModuleProps> = ({
  embarcaciones,
  selectedEmbId,
  tripulacion,
  onAddNovedad,
  onUpdateNovedad,
}) => {
  const [filterEstado, setFilterEstado] = useState<'TODAS' | EstadoNovedad>('TODAS');
  const [filterSistema, setFilterSistema] = useState<'TODOS' | SistemaNovedad>('TODOS');
  const [filterEmb, setFilterEmb] = useState<string>(selectedEmbId || 'TODAS');

  // New Novedad Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetEmbId, setTargetEmbId] = useState(selectedEmbId);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sistema, setSistema] = useState<SistemaNovedad>('MOTORES');
  const [severidad, setSeveridad] = useState<SeveridadNovedad>('MEDIA');
  const [reportadoPor, setReportadoPor] = useState('Cap. Carlos Alberto Mendoza Salgado');
  const [responsableArreglo, setResponsableArreglo] = useState('Varadero Náutico Astivik');
  const [piezasTexto, setPiezasTexto] = useState('');
  const [costoEstimado, setCostoEstimado] = useState('');
  const [fotoFallaUrl, setFotoFallaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionMsg, setCompressionMsg] = useState<string | null>(null);

  // Solve Novedad Modal
  const [solvingNovedad, setSolvingNovedad] = useState<NovedadFalla | null>(null);
  const [fotoArregloUrl, setFotoArregloUrl] = useState('');
  const [notasSolucion, setNotasSolucion] = useState('');
  const [fechaSolucion, setFechaSolucion] = useState('2026-10-21');

  // Photo Lightbox Modal
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string; tipo: 'FALLA' | 'ARREGLO' } | null>(null);

  // Gather all novedades
  const allNovedades = embarcaciones.flatMap((e) =>
    (e.novedades || []).map((n) => ({
      ...n,
      embarcacionNombre: e.nombre,
      embarcacionMatricula: e.matricula,
    }))
  );

  // Filtered novedades
  const filteredNovedades = allNovedades.filter((n) => {
    if (filterEmb !== 'TODAS' && n.embarcacionId !== filterEmb) return false;
    if (filterEstado !== 'TODAS' && n.estado !== filterEstado) return false;
    if (filterSistema !== 'TODOS' && n.sistema !== filterSistema) return false;
    return true;
  });

  // Photo file upload helper with automatic WebP compression (max 1080px) and Google Drive dispatch
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'falla' | 'arreglo') => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsCompressing(true);
  setCompressionMsg(`Comprimiendo "${file.name}" a formato WebP (máx. 1080px)...`);

  try {
    // 1. Compresión en el navegador a formato WebP (máximo 1080px)
    const result: CompressionResult = await compressImageToWebP(file, 1080, 0.82);

    // 2. Envío a la carpeta empresarial de Google Drive
    setCompressionMsg(`Subiendo a Google Drive empresarial (${result.width}x${result.height}px WebP -${result.reductionPercentage}%)...`);
    const driveUpload = await uploadWebPToGoogleDrive(result.file, 'MANTENIMIENTO_NOVEDADES', {
      titulo: titulo || (solvingNovedad ? solvingNovedad.titulo : 'Novedad Técnica'),
    });

    // 3. Almacenar en base de datos ÚNICAMENTE el enlace de la imagen
    if (target === 'falla') {
      setFotoFallaUrl(driveUpload.driveUrl);
    } else {
      setFotoArregloUrl(driveUpload.driveUrl);
    }

    setCompressionMsg(`✓ Foto comprimida a WebP (1080px) y guardada en Google Drive: -${result.reductionPercentage}% de peso.`);
    setTimeout(() => setCompressionMsg(null), 5000);
  } catch (err: any) {
    console.error('Error en compresión / upload:', err);
    // Fallback: leer en memoria
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (target === 'falla') setFotoFallaUrl(reader.result);
        else setFotoArregloUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    setCompressionMsg('Foto cargada en memoria.');
    setTimeout(() => setCompressionMsg(null), 4000);
  } finally {
    setIsCompressing(false);
  }
};

  // Submit new novedad
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) return;

    try {
      setIsSubmitting(true);
      const piezas = piezasTexto
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      await onAddNovedad({
        embarcacionId: targetEmbId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        sistema,
        severidad,
        estado: 'ABIERTA',
        reportadoPor,
        fechaReporte: new Date().toISOString().split('T')[0],
        responsableArreglo: responsableArreglo.trim(),
        piezasRequeridas: piezas.length > 0 ? piezas : ['Repuestos según diagnóstico'],
        costoEstimado: costoEstimado ? Number(costoEstimado) : undefined,
        fotoFallaUrl: fotoFallaUrl.trim() || undefined,
      });

      setShowAddModal(false);
      setTitulo('');
      setDescripcion('');
      setPiezasTexto('');
      setCostoEstimado('');
      setFotoFallaUrl('');
    } catch (err: any) {
      alert(err.message || 'Error registrando novedad');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit solve
  const handleSolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solvingNovedad) return;

    try {
      setIsSubmitting(true);
      await onUpdateNovedad({
        id: solvingNovedad.id,
        embarcacionId: solvingNovedad.embarcacionId,
        estado: 'SOLUCIONADA',
        fotoArregloUrl: fotoArregloUrl.trim() || undefined,
        fechaSolucion,
        notasSolucion: notasSolucion.trim() || 'Reparación técnica concluida satisfactoriamente y pruebas de mar aprobadas.',
      });

      setSolvingNovedad(null);
      setFotoArregloUrl('');
      setNotasSolucion('');
    } catch (err: any) {
      alert(err.message || 'Error actualizando novedad');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-6">
      {/* Header & New Novedad Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Bitácora de Novedades y Averías
            </span>
            <span className="text-xs text-slate-400 font-medium">Control DIMAR / RENET</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            Registro de Novedades Técnicas y Fallas Detectadas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Reporte de averías con técnico asignado, piezas requeridas y evidencia fotográfica del antes y después.
          </p>
        </div>

        <button
          onClick={() => {
            setTargetEmbId(selectedEmbId || embarcaciones[0]?.id);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Reportar Nueva Novedad / Falla</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        {/* State filters */}
        <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 font-bold">
          <button
            onClick={() => setFilterEstado('TODAS')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterEstado === 'TODAS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({allNovedades.length})
          </button>
          <button
            onClick={() => setFilterEstado('ABIERTA')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterEstado === 'ABIERTA' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Abiertas ({allNovedades.filter((n) => n.estado === 'ABIERTA').length})
          </button>
          <button
            onClick={() => setFilterEstado('EN_REPARACION')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterEstado === 'EN_REPARACION' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En Reparación ({allNovedades.filter((n) => n.estado === 'EN_REPARACION').length})
          </button>
          <button
            onClick={() => setFilterEstado('SOLUCIONADA')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filterEstado === 'SOLUCIONADA' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Solucionadas ({allNovedades.filter((n) => n.estado === 'SOLUCIONADA').length})
          </button>
        </div>

        {/* Dropdown filters */}
        <div className="flex items-center gap-2">
          {/* Embarcacion Filter */}
          <select
            value={filterEmb}
            onChange={(e) => setFilterEmb(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer"
          >
            <option value="TODAS">⚓ Toda la Flota</option>
            {embarcaciones.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>

          {/* Sistema Filter */}
          <select
            value={filterSistema}
            onChange={(e) => setFilterSistema(e.target.value as any)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer"
          >
            <option value="TODOS">Todos los Sistemas</option>
            <option value="MOTORES">Motores / Diésel</option>
            <option value="PROPULSION">Propulsión / Ejes / Ánodos</option>
            <option value="SISTEMA_ELECTRICO">Sistema Eléctrico</option>
            <option value="CASCO_Y_CUBIERTA">Casco y Cubierta</option>
            <option value="BOMBAS_Y_ACHIQUE">Bombas y Achique</option>
            <option value="EQUIPO_SALVAMENTO">Equipo de Salvamento</option>
          </select>
        </div>
      </div>

      {/* Novedades Cards List */}
      <div className="space-y-4">
        {filteredNovedades.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No hay novedades registradas con los filtros seleccionados.
          </div>
        ) : (
          filteredNovedades.map((nov) => {
            const isSolved = nov.estado === 'SOLUCIONADA';
            const isCritical = nov.severidad === 'CRITICA';

            return (
              <div
                key={nov.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      ⚓ {nov.embarcacionNombre} ({nov.embarcacionMatricula})
                    </span>
                    <span className="text-[10px] bg-cyan-50 text-cyan-800 font-bold px-2 py-0.5 rounded border border-cyan-200 uppercase">
                      {nov.sistema.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          : nov.severidad === 'MEDIA'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      Severidad: {nov.severidad}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isSolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : nov.estado === 'EN_REPARACION'
                          ? 'bg-cyan-100 text-cyan-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isSolved && '✓ SOLUCIONADA'}
                      {nov.estado === 'EN_REPARACION' && '⚙️ EN REPARACIÓN'}
                      {nov.estado === 'ABIERTA' && '⚠️ PENDIENTE'}
                    </span>

                    {!isSolved && (
                      <button
                        onClick={() => {
                          setSolvingNovedad(nov);
                          setFotoArregloUrl('');
                          setNotasSolucion('');
                        }}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer transition-colors"
                      >
                        Asentar Arreglo
                      </button>
                    )}
                  </div>
                </div>

                {/* Body: Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{nov.titulo}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{nov.descripcion}</p>
                </div>

                {/* Evidence Photos: Side by Side (Foto de la Falla vs Foto del Arreglo) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Foto de la Falla */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-rose-600" />
                        <span>Foto de la Falla Detectada</span>
                      </span>
                      {nov.fotoFallaUrl && (
                        <button
                          onClick={() =>
                            setViewingPhoto({
                              url: nov.fotoFallaUrl!,
                              title: nov.titulo,
                              tipo: 'FALLA',
                            })
                          }
                          className="text-[10px] text-cyan-700 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                        >
                          <Eye className="w-3 h-3" /> Ampliar
                        </button>
                      )}
                    </div>

                    {nov.fotoFallaUrl ? (
                      <div
                        onClick={() =>
                          setViewingPhoto({
                            url: nov.fotoFallaUrl!,
                            title: nov.titulo,
                            tipo: 'FALLA',
                          })
                        }
                        className="h-36 rounded-lg overflow-hidden border border-slate-300 relative group cursor-pointer"
                      >
                        <img
                          src={nov.fotoFallaUrl}
                          alt="Foto de la falla"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded">
                            Ver Evidencia
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                        <span>Sin registro fotográfico</span>
                      </div>
                    )}
                  </div>

                  {/* Foto del Arreglo */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Foto del Arreglo / Solución</span>
                      </span>
                      {nov.fotoArregloUrl && (
                        <button
                          onClick={() =>
                            setViewingPhoto({
                              url: nov.fotoArregloUrl!,
                              title: nov.titulo,
                              tipo: 'ARREGLO',
                            })
                          }
                          className="text-[10px] text-cyan-700 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                        >
                          <Eye className="w-3 h-3" /> Ampliar
                        </button>
                      )}
                    </div>

                    {nov.fotoArregloUrl ? (
                      <div
                        onClick={() =>
                          setViewingPhoto({
                            url: nov.fotoArregloUrl!,
                            title: nov.titulo,
                            tipo: 'ARREGLO',
                          })
                        }
                        className="h-36 rounded-lg overflow-hidden border border-emerald-300 relative group cursor-pointer"
                      >
                        <img
                          src={nov.fotoArregloUrl}
                          alt="Foto del arreglo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded">
                            Ver Arreglo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs">
                        <Clock className="w-6 h-6 mb-1 opacity-50" />
                        <span>Pendiente de arreglo y foto</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Strip: Who reports, who fixes & required parts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>Reportado por: </span>
                      <strong className="text-slate-900">{nov.reportadoPor}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono pl-5">
                      Fecha: {nov.fechaReporte}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Encargado del Arreglo: </span>
                      <strong className="text-slate-900">{nov.responsableArreglo}</strong>
                    </div>
                    {nov.fechaSolucion && (
                      <div className="text-[10px] text-emerald-600 font-semibold pl-5">
                        Solucionado el: {nov.fechaSolucion}
                      </div>
                    )}
                  </div>
                </div>

                {/* Required Parts (Piezas o Elementos Requeridos) */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    <span>Piezas o Elementos Requeridos para el Arreglo:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {nov.piezasRequeridas.map((pieza, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-800 text-[11px] font-medium px-2.5 py-0.5 rounded-lg border border-slate-200"
                      >
                        ⚙️ {pieza}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Solved notes if any */}
                {nov.notasSolucion && (
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    <strong className="font-bold block text-emerald-800">Notas de Reparación y Prueba Técnica:</strong>
                    <p className="mt-0.5">{nov.notasSolucion}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE NEW NOVEDAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700">Bitácora Técnica</span>
                <h3 className="text-base font-bold text-slate-900">Reportar Nueva Novedad o Falla</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Embarcación Afectada *</label>
                  <select
                    value={targetEmbId}
                    onChange={(e) => setTargetEmbId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    {embarcaciones.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre} ({e.matricula})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sistema Afectado *</label>
                  <select
                    value={sistema}
                    onChange={(e) => setSistema(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="MOTORES">Motores / Diésel Marino</option>
                    <option value="PROPULSION">Propulsión / Ejes / Ánodos de Zinc</option>
                    <option value="SISTEMA_ELECTRICO">Sistema Eléctrico y Baterías</option>
                    <option value="CASCO_Y_CUBIERTA">Casco, Cubierta y Candelero</option>
                    <option value="BOMBAS_Y_ACHIQUE">Bombas de Sentina y Achique</option>
                    <option value="EQUIPO_SALVAMENTO">Equipo de Salvamento / Balsas</option>
                    <option value="CONFORT_Y_CABINA">Confort y Cabina</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título de la Novedad / Avería *</label>
                <input
                  type="text"
                  placeholder="Ej: Fuga de refrigerante en rodete de bomba agua salada estribor"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción Detallada de la Falla *</label>
                <textarea
                  rows={2}
                  placeholder="Describa el comportamiento anómalo, temperatura, lecturas de manómetros o síntomas observados..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severidad *</label>
                  <select
                    value={severidad}
                    onChange={(e) => setSeveridad(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="CRITICA">🔴 Crítica (Impide zarpe inmediato)</option>
                    <option value="MEDIA">🟡 Media (Reparar antes de 48 hrs)</option>
                    <option value="LEVE">🔵 Leve (Mantenimiento rutinario)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quién la Reporta *</label>
                  <input
                    type="text"
                    value={reportadoPor}
                    onChange={(e) => setReportadoPor(e.target.value)}
                    placeholder="Capitán, marinero o inspector"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quién se Encarga del Arreglo *</label>
                  <input
                    type="text"
                    value={responsableArreglo}
                    onChange={(e) => setResponsableArreglo(e.target.value)}
                    placeholder="Técnico marino o taller (ej: Todomar, Astivik)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Costo Estimado (COP)</label>
                  <input
                    type="number"
                    value={costoEstimado}
                    onChange={(e) => setCostoEstimado(e.target.value)}
                    placeholder="Ej: 450000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Piezas o Elementos Requeridos para el Arreglo (Separados por coma) *
                </label>
                <input
                  type="text"
                  value={piezasTexto}
                  onChange={(e) => setPiezasTexto(e.target.value)}
                  placeholder="Ej: Rodete Jabsco 12 hojas, Empaque o-ring vitón, Manguera marina 1 pulgada"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  required
                />
              </div>

              {/* Foto de la Falla upload / URL con compresión WebP y Google Drive */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Foto de la Falla (Evidencia Visual)</label>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full border border-cyan-200 flex items-center gap-1">
                    <CloudUpload className="w-3 h-3 text-cyan-600" />
                    WebP (máx. 1080px) • Google Drive
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fotoFallaUrl}
                    onChange={(e) => setFotoFallaUrl(e.target.value)}
                    placeholder="Enlace de imagen o subir archivo local..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono text-[11px]"
                  />
                  <label className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isCompressing ? 'Procesando...' : 'Subir y Comprimir'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isCompressing}
                      onChange={(e) => handleFileUpload(e, 'falla')}
                      className="hidden"
                    />
                  </label>
                </div>

                {compressionMsg && (
                  <div className="text-[11px] p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-medium animate-in fade-in flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{compressionMsg}</span>
                  </div>
                )}

                {fotoFallaUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-20 w-32 rounded-lg overflow-hidden border border-slate-300 shadow-xs bg-slate-100">
                      <img src={fotoFallaUrl} alt="Vista previa falla" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-800 block">Enlace almacenado en base de datos:</span>
                      <a
                        href={fotoFallaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-700 hover:text-cyan-800 underline truncate block max-w-xs font-mono"
                      >
                        {fotoFallaUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registrando...' : 'Asentar Novedad en Bitácora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOLVE NOVEDAD MODAL (SUBIR FOTO DEL ARREGLO) */}
      {solvingNovedad && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700">Solución Técnica</span>
                <h3 className="text-base font-bold text-slate-900">Asentar Arreglo / Solución de Falla</h3>
              </div>
              <button
                onClick={() => setSolvingNovedad(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSolveSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 text-xs">{solvingNovedad.titulo}</span>
                <p className="text-[11px] text-slate-500">Técnico: {solvingNovedad.responsableArreglo}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha de Conclusión del Arreglo *</label>
                <input
                  type="date"
                  value={fechaSolucion}
                  onChange={(e) => setFechaSolucion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notas de Reparación y Pruebas Realizadas *
                </label>
                <textarea
                  rows={3}
                  value={notasSolucion}
                  onChange={(e) => setNotasSolucion(e.target.value)}
                  placeholder="Detalle los trabajos realizados, repuestos montados y pruebas en marcha bajo carga..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  required
                />
              </div>

              {/* Foto del Arreglo upload / URL con compresión WebP y Google Drive */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Foto del Arreglo Terminado (Evidencia de Solución)</label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CloudUpload className="w-3 h-3 text-emerald-600" />
                    WebP (máx. 1080px) • Google Drive
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fotoArregloUrl}
                    onChange={(e) => setFotoArregloUrl(e.target.value)}
                    placeholder="Enlace de imagen o subir archivo local..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono text-[11px]"
                  />
                  <label className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isCompressing ? 'Procesando...' : 'Subir y Comprimir'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isCompressing}
                      onChange={(e) => handleFileUpload(e, 'arreglo')}
                      className="hidden"
                    />
                  </label>
                </div>

                {compressionMsg && (
                  <div className="text-[11px] p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-medium animate-in fade-in flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{compressionMsg}</span>
                  </div>
                )}

                {fotoArregloUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-20 w-32 rounded-lg overflow-hidden border border-emerald-300 shadow-xs bg-slate-100">
                      <img src={fotoArregloUrl} alt="Vista previa arreglo" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-800 block">Enlace almacenado en base de datos:</span>
                      <a
                        href={fotoArregloUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 underline truncate block max-w-xs font-mono"
                      >
                        {fotoArregloUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSolvingNovedad(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Marcar como Solucionada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {viewingPhoto && (
        <div
          onClick={() => setViewingPhoto(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-2xl max-w-2xl w-full overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95"
          >
            <div className="p-3 bg-slate-950 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    viewingPhoto.tipo === 'FALLA' ? 'bg-rose-900 text-rose-300' : 'bg-emerald-900 text-emerald-300'
                  }`}
                >
                  {viewingPhoto.tipo === 'FALLA' ? 'EVIDENCIA DE FALLA' : 'EVIDENCIA DE ARREGLO CONCLUIDO'}
                </span>
                <span className="text-xs font-medium text-slate-300 truncate max-w-sm">{viewingPhoto.title}</span>
              </div>
              <button
                onClick={() => setViewingPhoto(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 max-h-[75vh] flex items-center justify-center bg-black/40">
              <img
                src={viewingPhoto.url}
                alt={viewingPhoto.title}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
