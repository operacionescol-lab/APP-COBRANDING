import React, { useState, useEffect } from 'react';
import {
  ChecklistPreZarpe,
  ItemChecklistPreZarpe,
  CategoriaChecklistPreZarpe,
  Embarcacion,
  Tripulante,
  Salida,
} from '../types/nautical';
import { CHECKLIST_PRE_ZARPE_TEMPLATE } from '../data/initialData';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Ship,
  Printer,
  ShieldCheck,
  Compass,
  Radio,
  Users,
  Anchor,
  PenTool,
  Save,
  Check,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ChecklistPreZarpeModalProps {
  checklist: ChecklistPreZarpe | null;
  salida?: Salida | null;
  embarcaciones: Embarcacion[];
  tripulacion: Tripulante[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (checklistData: Partial<ChecklistPreZarpe>) => Promise<void>;
}

export const ChecklistPreZarpeModal: React.FC<ChecklistPreZarpeModalProps> = ({
  checklist,
  salida,
  embarcaciones,
  tripulacion,
  isOpen,
  onClose,
  onSave,
}) => {
  const [embarcacionId, setEmbarcacionId] = useState<string>('emb-armonia');
  const [salidaId, setSalidaId] = useState<string>('');
  const [codigoSitmar, setCodigoSitmar] = useState<string>('');
  const [fecha, setFecha] = useState<string>('');
  const [horaVerificacion, setHoraVerificacion] = useState<string>('');
  const [nombrePiloto, setNombrePiloto] = useState<string>('');
  const [firmaPiloto, setFirmaPiloto] = useState<boolean>(false);
  const [nombreDpa, setNombreDpa] = useState<string>('STEVEN CARDONA RENDÓN');
  const [firmaDpa, setFirmaDpa] = useState<boolean>(false);
  const [observacionesGenerales, setObservacionesGenerales] = useState<string>('');
  const [items, setItems] = useState<ItemChecklistPreZarpe[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize modal state whenever opened or changed
  useEffect(() => {
    if (!isOpen) return;

    if (checklist) {
      setEmbarcacionId(checklist.embarcacionId);
      setSalidaId(checklist.salidaId || '');
      setCodigoSitmar(checklist.codigoSitmar || '');
      setFecha(checklist.fecha);
      setHoraVerificacion(checklist.horaVerificacion || '07:30');
      setNombrePiloto(checklist.nombrePiloto);
      setFirmaPiloto(checklist.firmaPiloto);
      setNombreDpa(checklist.nombreDpa || 'STEVEN CARDONA RENDÓN');
      setFirmaDpa(checklist.firmaDpa);
      setObservacionesGenerales(checklist.observacionesGenerales || '');
      setItems(checklist.items && checklist.items.length === 16 ? checklist.items : CHECKLIST_PRE_ZARPE_TEMPLATE.map((t) => ({ ...t, cumple: true })));
    } else if (salida) {
      setEmbarcacionId(salida.embarcacionId);
      setSalidaId(salida.id);
      setCodigoSitmar(salida.codigoSitmar || '');
      setFecha(salida.fecha);
      setHoraVerificacion(salida.horaRealZarpe || salida.horaProgramadaZarpe || '08:00');
      const pilotObj = tripulacion.find((t) => t.id === salida.pilotoId);
      setNombrePiloto(pilotObj ? pilotObj.nombreCompleto : 'Cap. Carlos Alberto Mendoza Salgado');
      setFirmaPiloto(true);
      setNombreDpa('STEVEN CARDONA RENDÓN');
      setFirmaDpa(false);
      setObservacionesGenerales('');
      setItems(CHECKLIST_PRE_ZARPE_TEMPLATE.map((t) => ({ ...t, cumple: true })));
    } else {
      setEmbarcacionId('emb-armonia');
      setSalidaId('');
      setCodigoSitmar('');
      setFecha(new Date().toISOString().split('T')[0]);
      setHoraVerificacion(new Date().toTimeString().substring(0, 5));
      setNombrePiloto('Cap. Carlos Alberto Mendoza Salgado');
      setFirmaPiloto(false);
      setNombreDpa('STEVEN CARDONA RENDÓN');
      setFirmaDpa(false);
      setObservacionesGenerales('');
      setItems(CHECKLIST_PRE_ZARPE_TEMPLATE.map((t) => ({ ...t, cumple: true })));
    }
    setErrorMsg(null);
  }, [checklist, salida, isOpen, tripulacion]);

  if (!isOpen) return null;

  const currentEmbarcacion = embarcaciones.find((e) => e.id === embarcacionId) || embarcaciones[0];

  const handleToggleItem = (numero: number, valor: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.numero === numero ? { ...item, cumple: valor } : item))
    );
  };

  const handleItemObservacionChange = (numero: number, observacion: string) => {
    setItems((prev) =>
      prev.map((item) => (item.numero === numero ? { ...item, observacion } : item))
    );
  };

  const handleMarcarTodosSi = () => {
    setItems((prev) => prev.map((item) => ({ ...item, cumple: true })));
  };

  const totalSi = items.filter((i) => i.cumple).length;
  const totalNo = items.filter((i) => !i.cumple).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const sitmar = codigoSitmar.trim();
    if (!sitmar || sitmar.length < 5) {
      setErrorMsg('El Código SITMAR es obligatorio y debe tener al menos 5 caracteres (ej. STM-202610-0101).');
      return;
    }

    if (!nombrePiloto.trim()) {
      setErrorMsg('Debe indicar el nombre del Capitán / Piloto al mando.');
      return;
    }

    if (!nombreDpa.trim()) {
      setErrorMsg('Debe indicar el nombre del D.P.A. (Designada Persona en Tierra).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        id: checklist?.id,
        salidaId: salidaId || undefined,
        embarcacionId,
        embarcacionNombre: currentEmbarcacion?.nombre || 'Embarcación',
        matricula: currentEmbarcacion?.matricula,
        codigoSitmar: sitmar.toUpperCase(),
        fecha,
        horaVerificacion,
        items,
        nombrePiloto: nombrePiloto.trim(),
        firmaPiloto,
        nombreDpa: nombreDpa.trim(),
        firmaDpa,
        observacionesGenerales: observacionesGenerales.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el checklist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category metadata helper
  const renderCategoryHeader = (categoria: CategoriaChecklistPreZarpe, titulo: string, icon: React.ReactNode) => (
    <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-lg mt-5 mb-2 text-slate-200">
      <div className="flex items-center gap-2.5 font-semibold text-sm tracking-wide text-cyan-300">
        {icon}
        <span>{titulo}</span>
      </div>
      <span className="text-xs text-slate-400 font-mono">
        {categoria === 'NAVEGACION_Y_COMUNICACIONES' && 'Puntos 1 al 8'}
        {categoria === 'GOBIERNO_Y_PROPULSION' && 'Puntos 9 y 10'}
        {categoria === 'TRIPULACION' && 'Puntos 11 al 13'}
        {categoria === 'MANIOBRA_DE_ATRAQUE' && 'Puntos 14 al 16'}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/70 p-4 sm:p-5 border-b border-slate-700/80 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 mt-0.5">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-[11px] font-black bg-cyan-950 text-cyan-200 border border-cyan-700/80 rounded tracking-wide">
                  CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 rounded">
                  NIT: 901159056-4
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 rounded">
                  Versión N° 1.1 • Fecha Rev. 20-2026
                </span>
                {checklist?.codigoChecklist && (
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-800 text-cyan-400 border border-cyan-800/60 rounded">
                    {checklist.codigoChecklist}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                MANUAL SIMPLIFICADO DE GESTION DE LA SEGURIDAD
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                <span className="text-cyan-300 font-medium">Formato de Verificación Antes de Zarpe por Parte del Capitán</span>
                <span>•</span>
                <span>Autorización: <strong className="text-white font-semibold">STEVEN CARDONA RENDÓN</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPrintView(!showPrintView)}
              className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Vista para Imprimir o Archivar"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">{showPrintView ? 'Vista Edición' : 'Vista Impresión'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Format View */}
        {showPrintView ? (
          <div className="p-6 bg-white text-slate-900 overflow-y-auto flex-1 font-sans text-xs">
            <div className="border-2 border-slate-900 p-4 rounded">
              {/* Official Header Table as in Manual */}
              <div className="border-2 border-slate-900 mb-3 text-[11px] overflow-hidden rounded-xs">
                <div className="grid grid-cols-12 border-b-2 border-slate-900">
                  <div className="col-span-8 p-2.5 border-r-2 border-slate-900 flex flex-col justify-center bg-white">
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-950 leading-tight">
                      CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S
                    </h3>
                    <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">
                      NIT: 901159056-4
                    </div>
                  </div>
                  <div className="col-span-4 p-2 bg-slate-50 flex flex-col justify-center text-[11px] space-y-1">
                    <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                      <span className="font-bold text-slate-700 uppercase text-[10px]">Versión N°:</span>
                      <span className="font-black text-slate-950 font-mono text-xs">1.1</span>
                    </div>
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="font-bold text-slate-700 uppercase text-[10px]">Fecha Rev.:</span>
                      <span className="font-black text-slate-950 font-mono text-xs">20-2026</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-300">
                  <div className="col-span-8 p-2 border-r-2 border-slate-900 flex flex-col justify-center">
                    <h4 className="font-black text-xs uppercase tracking-wide text-slate-900">
                      MANUAL SIMPLIFICADO DE GESTION DE LA SEGURIDAD
                    </h4>
                    <p className="text-[10px] text-slate-700 font-bold uppercase mt-0.5">
                      FORMATO DE VERIFICACIÓN ANTES DE ZARPE POR PARTE DEL CAPITÁN
                    </p>
                  </div>
                  <div className="col-span-4 p-2 flex flex-col justify-center text-[10px]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700 uppercase text-[10px]">Autorización:</span>
                      <span className="font-black text-slate-950 text-[11px]">STEVEN CARDONA RENDÓN</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-300 font-mono text-[10px]">
                      <span className="text-slate-600 uppercase font-sans">SITMAR:</span>
                      <span className="font-black text-slate-950">{codigoSitmar || 'STM-PENDIENTE'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vessel & Trip Data Table */}
              <div className="grid grid-cols-4 gap-2 border border-slate-300 p-2 mb-3 bg-slate-50 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Embarcación:</span>
                  <strong>{currentEmbarcacion.nombre}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Matrícula:</span>
                  <strong>{currentEmbarcacion.matricula}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Fecha Zarpe:</span>
                  <strong>{fecha}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Hora Verificación:</span>
                  <strong>{horaVerificacion} hrs</strong>
                </div>
              </div>

              {/* Checklist 16 Items Table */}
              <table className="w-full border-collapse border border-slate-800 text-[11px] mb-4">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 border-b border-slate-800">
                    <th className="p-1.5 text-center border-r border-slate-800 w-10">#</th>
                    <th className="p-1.5 text-left border-r border-slate-800">Acción de Verificación</th>
                    <th className="p-1.5 text-center border-r border-slate-800 w-12 font-bold">SI</th>
                    <th className="p-1.5 text-center border-r border-slate-800 w-12 font-bold">NO</th>
                    <th className="p-1.5 text-left w-36">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Category 1 */}
                  <tr className="bg-slate-100 font-bold border-t border-b border-slate-800">
                    <td colSpan={5} className="p-1 px-2 text-slate-900 uppercase tracking-wider text-[10px]">
                      Navegación y comunicaciones (1 al 8)
                    </td>
                  </tr>
                  {items.slice(0, 8).map((it) => (
                    <tr key={it.numero} className="border-b border-slate-300">
                      <td className="p-1.5 text-center font-bold border-r border-slate-300">{it.numero}</td>
                      <td className="p-1.5 border-r border-slate-300">{it.accion}</td>
                      <td className="p-1.5 text-center font-bold border-r border-slate-300 bg-emerald-50">
                        {it.cumple ? 'X' : ''}
                      </td>
                      <td className="p-1.5 text-center font-bold border-r border-slate-300 bg-rose-50">
                        {!it.cumple ? 'X' : ''}
                      </td>
                      <td className="p-1.5 text-[10px] text-slate-600">{it.observacion || '-'}</td>
                    </tr>
                  ))}

                  {/* Category 2 */}
                  <tr className="bg-slate-100 font-bold border-t border-b border-slate-800">
                    <td colSpan={5} className="p-1 px-2 text-slate-900 uppercase tracking-wider text-[10px]">
                      Gobierno y propulsión (9 y 10)
                    </td>
                  </tr>
                  {items.slice(8, 10).map((it) => (
                    <tr key={it.numero} className="border-b border-slate-300">
                      <td className="p-1.5 text-center font-bold border-r border-slate-300">{it.numero}</td>
                      <td className="p-1.5 border-r border-slate-300">{it.accion}</td>
                      <td className="p-1.5 text-center font-bold border-r border-slate-300 bg-emerald-50">
                        {it.cumple ? 'X' : ''}
                      </td>
                      <td className="p-1.5 text-center font-bold border-r border-slate-300 bg-rose-50">
                        {!it.cumple ? 'X' : ''}
                      </td>
                      <td className="p-1.5 text-[10px] text-slate-600">{it.observacion || '-'}</td>
                    </tr>
                  ))}

                  {/* Category 3 */}
                  <tr className="bg-slate-100 font-bold border-t border-b border-slate-800">
                    <td colSpan={5} className="p-1 px-2 text-slate-900 uppercase tracking-wider text-[10px]">
                      Tripulación (11 al 13)
                    </td>
                  </tr>
                  {items.slice(10, 13).map((it) => (
                    <tr key={it.numero} className="border-b border-slate-300">
                      <td className="p-1.5 text-center font-bold border-r border-slate-300">{it.numero}</td>
                      <td className="p-1.5 border-r border-slate-300">{it.accion}</td>
                      <td className="p-1.5 text-center font-bold border-r border-slate-300 bg-emerald-50">
                        {it.cumple ? 'X' : ''}
                      </td>
                      <td className="p-1.5 text-center font-bold border-r border-slate-300 bg-rose-50">
                        {!it.cumple ? 'X' : ''}
                      </td>
                      <td className="p-1.5 text-[10px] text-slate-600">{it.observacion || '-'}</td>
                    </tr>
                  ))}

                  {/* Category 4 */}
                  <tr className="bg-slate-100 font-bold border-t border-b border-slate-800">
                    <td colSpan={5} className="p-1 px-2 text-slate-900 uppercase tracking-wider text-[10px]">
                      Maniobra de atraque (14 al 16)
                    </td>
                  </tr>
                  {items.slice(13, 16).map((it) => (
                    <tr key={it.numero} className="border-b border-slate-300">
                      <td className="p-1.5 text-center font-bold border-r border-slate-300">{it.numero}</td>
                      <td className="p-1.5 border-r border-slate-300">{it.accion}</td>
                      <td className="p-1.5 text-center font-bold border-r border-slate-300 bg-emerald-50">
                        {it.cumple ? 'X' : ''}
                      </td>
                      <td className="p-1.5 text-center font-bold border-r border-slate-300 bg-rose-50">
                        {!it.cumple ? 'X' : ''}
                      </td>
                      <td className="p-1.5 text-[10px] text-slate-600">{it.observacion || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* General Remarks */}
              {observacionesGenerales && (
                <div className="mb-4 border border-slate-300 p-2 text-[11px] bg-slate-50">
                  <span className="font-bold block text-slate-700">Observaciones Generales de la Inspección:</span>
                  <p>{observacionesGenerales}</p>
                </div>
              )}

              {/* Signatures Block Exactly As Requested */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-800">
                <div className="border border-slate-400 p-3 rounded bg-slate-50">
                  <div className="h-14 flex items-end justify-center pb-1">
                    {firmaPiloto ? (
                      <div className="text-center">
                        <span className="font-serif italic text-blue-900 font-black text-sm">
                          {nombrePiloto}
                        </span>
                        <div className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest">
                          ✓ Firma Digital Registrada Pre-Zarpe
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">[Pendiente Firma Piloto]</span>
                    )}
                  </div>
                  <div className="border-t border-slate-600 pt-1.5">
                    <p className="font-bold text-slate-900 text-[11px]">Firma Piloto:</p>
                    <p className="text-slate-800 text-[11px] mt-0.5">
                      Nombre Piloto: <strong>{nombrePiloto}</strong>
                    </p>
                  </div>
                </div>

                <div className="border border-slate-400 p-3 rounded bg-slate-50">
                  <div className="h-14 flex items-end justify-center pb-1">
                    {firmaDpa ? (
                      <div className="text-center">
                        <span className="font-serif italic text-blue-900 font-black text-sm">
                          {nombreDpa}
                        </span>
                        <div className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest">
                          ✓ Aval D.P.A. Autorizado
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">[Pendiente Firma D.P.A.]</span>
                    )}
                  </div>
                  <div className="border-t border-slate-600 pt-1.5">
                    <p className="font-bold text-slate-900 text-[11px]">Firma D.P.A:</p>
                    <p className="text-slate-800 text-[11px] mt-0.5">
                      Nombre D.P.A: <strong>{nombreDpa}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Audit Stamp */}
              <div className="mt-3 text-[10px] text-slate-600 flex justify-between border-t border-slate-300 pt-2 font-medium">
                <span>CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S • NIT 901159056-4</span>
                <span>Código SITMAR de Zarpe DIMAR: <strong>{codigoSitmar || 'N/A'}</strong></span>
                <span>Manual Simplificado de Gestión de la Seguridad • Versión 1.1 • STEVEN CARDONA RENDÓN</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir Documento Físico
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5 text-slate-200">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-lg flex items-center gap-2 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Vessel, Departure & SITMAR Info */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-cyan-400" />
                  Datos de la Nave y Autorización DIMAR
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {currentEmbarcacion.matricula}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Embarcación:</label>
                  <select
                    value={embarcacionId}
                    onChange={(e) => setEmbarcacionId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  >
                    {embarcaciones.map((emb) => (
                      <option key={emb.id} value={emb.id}>
                        {emb.nombre} ({emb.matricula})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <span>Código SITMAR de Zarpe:</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={codigoSitmar}
                    onChange={(e) => setCodigoSitmar(e.target.value.toUpperCase())}
                    placeholder="STM-202610-XXXX"
                    className="w-full bg-slate-900 border border-amber-500/60 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono font-bold focus:ring-1 focus:ring-amber-400 focus:outline-none placeholder:text-slate-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha de Inspección:</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Hora de Verificación:</label>
                  <input
                    type="time"
                    value={horaVerificacion}
                    onChange={(e) => setHoraVerificacion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {salidaId && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-cyan-300">Salida Asociada:</span>
                  <span className="font-mono text-slate-300">{salidaId}</span>
                  <span className="text-slate-500">| Muelle: {salida?.muelle || 'Muelle Bodeguita'}</span>
                </div>
              )}
            </div>

            {/* Quick action bar */}
            <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300">
                  Cumplimiento de Puntos: <strong>{totalSi}/16</strong>
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  totalSi === 16 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {totalSi === 16 ? '✓ 100% Conforme' : `⚠ ${totalNo} Ítems NO`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleMarcarTodosSi}
                className="px-3 py-1 text-xs bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded-md font-medium flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                Marcar Todos en SI
              </button>
            </div>

            {/* 16 Items Divided in 4 Sections */}
            <div className="space-y-4">
              {/* Category 1: Navegación y comunicaciones */}
              {renderCategoryHeader(
                'NAVEGACION_Y_COMUNICACIONES',
                'Navegación y comunicaciones',
                <Radio className="w-4 h-4" />
              )}
              <div className="space-y-2">
                {items.slice(0, 8).map((item) => (
                  <div
                    key={item.numero}
                    className={`p-3 rounded-lg border transition-colors ${
                      item.cumple
                        ? 'bg-slate-950/60 border-slate-800'
                        : 'bg-rose-950/20 border-rose-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-slate-700">
                          {item.numero}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-200">
                            {item.accion}
                          </p>
                          <input
                            type="text"
                            placeholder="Observación técnica o de canal (opcional)"
                            value={item.observacion || ''}
                            onChange={(e) => handleItemObservacionChange(item.numero, e.target.value)}
                            className="mt-1 text-xs bg-slate-900/60 border border-slate-700/60 rounded px-2 py-1 text-slate-300 w-full focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.numero, true)}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            item.cumple
                              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          SI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.numero, false)}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            !item.cumple
                              ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category 2: Gobierno y propulsión */}
              {renderCategoryHeader(
                'GOBIERNO_Y_PROPULSION',
                'Gobierno y propulsión',
                <Compass className="w-4 h-4" />
              )}
              <div className="space-y-2">
                {items.slice(8, 10).map((item) => (
                  <div
                    key={item.numero}
                    className={`p-3 rounded-lg border transition-colors ${
                      item.cumple
                        ? 'bg-slate-950/60 border-slate-800'
                        : 'bg-rose-950/20 border-rose-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-slate-700">
                          {item.numero}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-200">
                            {item.accion}
                          </p>
                          <input
                            type="text"
                            placeholder="Presión hidráulica / respuesta de timones (opcional)"
                            value={item.observacion || ''}
                            onChange={(e) => handleItemObservacionChange(item.numero, e.target.value)}
                            className="mt-1 text-xs bg-slate-900/60 border border-slate-700/60 rounded px-2 py-1 text-slate-300 w-full focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.numero, true)}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            item.cumple
                              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          SI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.numero, false)}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            !item.cumple
                              ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category 3: Tripulación */}
              {renderCategoryHeader(
                'TRIPULACION',
                'Tripulación',
                <Users className="w-4 h-4" />
              )}
              <div className="space-y-2">
                {items.slice(10, 13).map((item) => (
                  <div
                    key={item.numero}
                    className={`p-3 rounded-lg border transition-colors ${
                      item.cumple
                        ? 'bg-slate-950/60 border-slate-800'
                        : 'bg-rose-950/20 border-rose-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-slate-700">
                          {item.numero}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-200">
                            {item.accion}
                          </p>
                          <input
                            type="text"
                            placeholder="Detalle charla o asignación de marinero (opcional)"
                            value={item.observacion || ''}
                            onChange={(e) => handleItemObservacionChange(item.numero, e.target.value)}
                            className="mt-1 text-xs bg-slate-900/60 border border-slate-700/60 rounded px-2 py-1 text-slate-300 w-full focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.numero, true)}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            item.cumple
                              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          SI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.numero, false)}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            !item.cumple
                              ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category 4: Maniobra de atraque */}
              {renderCategoryHeader(
                'MANIOBRA_DE_ATRAQUE',
                'Maniobra de atraque',
                <Anchor className="w-4 h-4" />
              )}
              <div className="space-y-2">
                {items.slice(13, 16).map((item) => (
                  <div
                    key={item.numero}
                    className={`p-3 rounded-lg border transition-colors ${
                      item.cumple
                        ? 'bg-slate-950/60 border-slate-800'
                        : 'bg-rose-950/20 border-rose-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-slate-700">
                          {item.numero}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-200">
                            {item.accion}
                          </p>
                          <input
                            type="text"
                            placeholder="Detalle de luces / canal / pasarela de muelle (opcional)"
                            value={item.observacion || ''}
                            onChange={(e) => handleItemObservacionChange(item.numero, e.target.value)}
                            className="mt-1 text-xs bg-slate-900/60 border border-slate-700/60 rounded px-2 py-1 text-slate-300 w-full focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.numero, true)}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            item.cumple
                              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          SI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.numero, false)}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            !item.cumple
                              ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Remarks */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observaciones Generales de la Inspección / Bitácora Pre-Zarpe:
              </label>
              <textarea
                rows={2}
                value={observacionesGenerales}
                onChange={(e) => setObservacionesGenerales(e.target.value)}
                placeholder="Novedades de muelle, condiciones oceanográficas, radio baliza EPIRB o advertencias adicionales..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
              />
            </div>

            {/* Mandatory Signatures Block (Piloto & D.P.A.) */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-cyan-400" />
                  Firmas y Responsables Reglamentarios
                </span>
                <span className="text-[11px] text-slate-400">
                  Capitán de Zarpe & Designated Person Ashore (D.P.A.)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Piloto Signature Box */}
                <div className={`p-4 rounded-xl border transition-colors ${
                  firmaPiloto ? 'bg-cyan-950/20 border-cyan-700/60' : 'bg-slate-900 border-slate-800'
                }`}>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nombre Piloto:
                  </label>
                  <input
                    type="text"
                    value={nombrePiloto}
                    onChange={(e) => setNombrePiloto(e.target.value)}
                    placeholder="Nombre completo del Capitán"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white mb-3 focus:outline-none focus:border-cyan-500"
                    required
                  />

                  <div className="pt-1 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-300 block">Firma Piloto:</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {firmaPiloto ? '✓ Certificado Digital Firmado' : 'Sin certificar'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFirmaPiloto(!firmaPiloto)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        firmaPiloto
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {firmaPiloto ? 'Firmado (SI)' : 'Firmar Ahora'}
                    </button>
                  </div>
                </div>

                {/* D.P.A. Signature Box */}
                <div className={`p-4 rounded-xl border transition-colors ${
                  firmaDpa ? 'bg-cyan-950/20 border-cyan-700/60' : 'bg-slate-900 border-slate-800'
                }`}>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nombre D.P.A:
                  </label>
                  <input
                    type="text"
                    value={nombreDpa}
                    onChange={(e) => setNombreDpa(e.target.value)}
                    placeholder="Nombre de la Persona Designada en Tierra"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white mb-3 focus:outline-none focus:border-cyan-500"
                    required
                  />

                  <div className="pt-1 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-300 block">Firma D.P.A:</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {firmaDpa ? '✓ Aval en Tierra Concedido' : 'Pendiente aval'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFirmaDpa(!firmaDpa)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        firmaDpa
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {firmaDpa ? 'Firmado (SI)' : 'Firmar Aval'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-cyan-900/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Guardando en Sistema...' : 'Guardar Checklist Pre-Zarpe'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
