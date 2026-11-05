import React, { useState } from 'react';
import {
  Embarcacion,
  DocumentoMaritimo,
  TipoDocumentoMaritimo,
  Mantenimiento,
  NovedadFalla,
  Tripulante,
  PerfilUsuarioAuth,
  EstadoDoc,
} from '../types/nautical';
import { QRCodeView } from './QRCodeView';
import { HorasMotorBarChart } from './HorasMotorBarChart';
import { NovedadesModule } from './NovedadesModule';
import {
  Ship,
  FileCheck,
  QrCode,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Anchor,
  Shield,
  Gauge,
  Layers,
  MapPin,
  ExternalLink,
  Plus,
  X,
  Printer,
  BarChart3,
  Flame,
  Edit,
  FilePlus,
  RefreshCw,
  Sliders,
  Check,
  Trash2,
  FileText,
  Radio,
  FileDown,
} from 'lucide-react';

interface EmbarcacionesModuleProps {
  embarcaciones: Embarcacion[];
  tripulacion: Tripulante[];
  currentUser?: PerfilUsuarioAuth;
  onAddMantenimiento: (embarcacionId: string, mnt: Omit<Mantenimiento, 'id'>) => void;
  onAddNovedad: (novedadData: Omit<NovedadFalla, 'id'>) => Promise<void>;
  onUpdateNovedad: (updateData: Partial<NovedadFalla> & { id: string; embarcacionId: string }) => Promise<void>;
  onCrearEmbarcacion?: (embData: Omit<Embarcacion, 'id'>) => Promise<void>;
  onActualizarEmbarcacion?: (embId: string, updates: Partial<Embarcacion>) => Promise<void>;
  onEliminarEmbarcacion?: (embId: string) => Promise<void>;
  onAgregarDocumento?: (embId: string, doc: DocumentoMaritimo) => Promise<void>;
  onActualizarDocumento?: (embId: string, numeroOriginal: string, docUpdates: Partial<DocumentoMaritimo>) => Promise<void>;
  onEliminarDocumento?: (embId: string, docNumero: string) => Promise<void>;
}

export const EmbarcacionesModule: React.FC<EmbarcacionesModuleProps> = ({
  embarcaciones,
  tripulacion,
  currentUser,
  onAddMantenimiento,
  onAddNovedad,
  onUpdateNovedad,
  onCrearEmbarcacion,
  onActualizarEmbarcacion,
  onEliminarEmbarcacion,
  onAgregarDocumento,
  onActualizarDocumento,
  onEliminarDocumento,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'FICHA' | 'GRAFICOS_HORAS' | 'NOVEDADES'>('FICHA');
  const [selectedEmbId, setSelectedEmbId] = useState<string>(embarcaciones[0]?.id || '');
  const [selectedCarneEmb, setSelectedCarneEmb] = useState<Embarcacion | null>(null);
  const [showAddMntModal, setShowAddMntModal] = useState(false);

  // Modals for Director de Operaciones
  const [showCreateEmbModal, setShowCreateEmbModal] = useState(false);
  const [showEditEmbModal, setShowEditEmbModal] = useState(false);
  const [showDeleteEmbConfirm, setShowDeleteEmbConfirm] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<{ doc: DocumentoMaritimo; originalNumero: string } | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentoMaritimo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New maintenance form state
  const [mntTipo, setMntTipo] = useState<Mantenimiento['tipo']>('PREVENTIVO');
  const [mntFecha, setMntFecha] = useState('2026-10-21');
  const [mntHoras, setMntHoras] = useState(1850);
  const [mntDesc, setMntDesc] = useState('');
  const [mntTecnico, setMntTecnico] = useState('');

  // Create Vessel Form State
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaMatricula, setNuevaMatricula] = useState('');
  const [nuevoCodigoRenet, setNuevoCodigoRenet] = useState('');
  const [nuevoDistintivo, setNuevoDistintivo] = useState('');
  const [nuevoOmi, setNuevoOmi] = useState('');
  const [nuevoMmsi, setNuevoMmsi] = useState('');
  const [nuevaEsloraPies, setNuevaEsloraPies] = useState(48);
  const [nuevaEsloraMetros, setNuevaEsloraMetros] = useState(14.6);
  const [nuevaManga, setNuevaManga] = useState(7.8);
  const [nuevoPuntal, setNuevoPuntal] = useState(1.8);
  const [nuevoCalado, setNuevoCalado] = useState(1.25);
  const [nuevoTrb, setNuevoTrb] = useState(12);
  const [nuevoTrn, setNuevoTrn] = useState(4);
  const [nuevaCapacidadPax, setNuevaCapacidadPax] = useState(40);
  const [nuevaDotacion, setNuevaDotacion] = useState(4);
  const [nuevaCapacidadTotal, setNuevaCapacidadTotal] = useState(44);
  const [nuevosMotores, setNuevosMotores] = useState('2x Yanmar Marine');
  const [nuevaPotenciaHp, setNuevaPotenciaHp] = useState(70);
  const [nuevaPlantaElectrica, setNuevaPlantaElectrica] = useState('');
  const [nuevoMuelle, setNuevoMuelle] = useState('Muelle de la Bodeguita - Puesto 4');
  const [nuevoArmador, setNuevoArmador] = useState('ESPTM CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S.');
  const [nuevoOperador, setNuevoOperador] = useState('CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S.');
  const [nuevoAnio, setNuevoAnio] = useState(2022);
  const [nuevasHorasMotor, setNuevasHorasMotor] = useState(0);
  const [nuevoLimiteHoras, setNuevoLimiteHoras] = useState(250);

  // Edit Vessel Form State
  const [editNombre, setEditNombre] = useState('');
  const [editMatricula, setEditMatricula] = useState('');
  const [editCodigoRenet, setEditCodigoRenet] = useState('');
  const [editDistintivo, setEditDistintivo] = useState('');
  const [editOmi, setEditOmi] = useState('');
  const [editMmsi, setEditMmsi] = useState('');
  const [editEsloraPies, setEditEsloraPies] = useState(0);
  const [editEsloraMetros, setEditEsloraMetros] = useState(0);
  const [editManga, setEditManga] = useState(0);
  const [editPuntal, setEditPuntal] = useState(0);
  const [editCalado, setEditCalado] = useState(0);
  const [editTrb, setEditTrb] = useState(0);
  const [editTrn, setEditTrn] = useState(0);
  const [editCapacidadPax, setEditCapacidadPax] = useState(0);
  const [editDotacion, setEditDotacion] = useState(4);
  const [editCapacidadTotal, setEditCapacidadTotal] = useState(0);
  const [editMotores, setEditMotores] = useState('');
  const [editPotenciaHp, setEditPotenciaHp] = useState(0);
  const [editPlantaElectrica, setEditPlantaElectrica] = useState('');
  const [editMuelle, setEditMuelle] = useState('');
  const [editArmador, setEditArmador] = useState('');
  const [editOperador, setEditOperador] = useState('');
  const [editHorasMotor, setEditHorasMotor] = useState(0);
  const [editLimiteHoras, setEditLimiteHoras] = useState(0);
  const [editEstado, setEditEstado] = useState<Embarcacion['estado']>('OPERATIVO');

  // Document Form State
  const [docTipo, setDocTipo] = useState<TipoDocumentoMaritimo>('PATENTE_NAVEGACION');
  const [docNombre, setDocNombre] = useState('');
  const [docNumero, setDocNumero] = useState('');
  const [docEmisor, setDocEmisor] = useState('Capitanía de Puerto de Cartagena (DIMAR)');
  const [docExpedicion, setDocExpedicion] = useState(new Date().toISOString().split('T')[0]);
  const [docVencimiento, setDocVencimiento] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [docEstado, setDocEstado] = useState<EstadoDoc>('VIGENTE');
  const [docObs, setDocObs] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docEsPermanente, setDocEsPermanente] = useState(false);

  const currentEmb = embarcaciones.find((e) => e.id === selectedEmbId) || embarcaciones[0];

  // Count active novedades across fleet
  const totalNovedadesPendientes = embarcaciones.flatMap((e) => e.novedades || []).filter((n) => n.estado !== 'SOLUCIONADA').length;

  // Permissions: Director de Operaciones and Gerente de Mantenimiento have authority to create/edit vessels and maritime docs
  const canManageVessels = !currentUser || currentUser.rol === 'DIRECTOR_OPERACIONES' || currentUser.rol === 'GERENTE_MANTENIMIENTO';

  const handleOpenEditVessel = (emb: Embarcacion) => {
    setEditNombre(emb.nombre);
    setEditMatricula(emb.matricula);
    setEditCodigoRenet(emb.codigoRenet || '');
    setEditDistintivo(emb.distintivoLlamada || '');
    setEditOmi(emb.numeroOmi || '');
    setEditMmsi(emb.mmsi || '');
    setEditEsloraPies(emb.esloraPies);
    setEditEsloraMetros(emb.esloraMetros);
    setEditManga(emb.mangaMetros);
    setEditPuntal(emb.puntalMetros || 1.8);
    setEditCalado(emb.caladoMetros);
    setEditTrb(emb.trb || 0);
    setEditTrn(emb.trn || 0);
    setEditCapacidadPax(emb.capacidadMaxPax);
    setEditDotacion(emb.dotacionTripulacion || 4);
    setEditCapacidadTotal(emb.capacidadTotalOcupantes || emb.capacidadMaxPax + (emb.dotacionTripulacion || 4));
    setEditMotores(emb.motores);
    setEditPotenciaHp(emb.potenciaTotalHp);
    setEditPlantaElectrica(emb.plantaElectrica || '');
    setEditMuelle(emb.muelleBase);
    setEditArmador(emb.armador);
    setEditOperador(emb.operador || '');
    setEditHorasMotor(emb.horasMotorAcumuladas);
    setEditLimiteHoras(emb.limiteHorasMantenimiento);
    setEditEstado(emb.estado);
    setShowEditEmbModal(true);
  };

  const handleSaveEditVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmb || !onActualizarEmbarcacion) return;

    setIsSubmitting(true);
    try {
      await onActualizarEmbarcacion(currentEmb.id, {
        nombre: editNombre,
        matricula: editMatricula,
        codigoRenet: editCodigoRenet || undefined,
        distintivoLlamada: editDistintivo.trim() || undefined,
        numeroOmi: editOmi.trim() || undefined,
        mmsi: editMmsi.trim() || undefined,
        esloraPies: Number(editEsloraPies),
        esloraMetros: Number(editEsloraMetros),
        mangaMetros: Number(editManga),
        puntalMetros: Number(editPuntal),
        caladoMetros: Number(editCalado),
        trb: Number(editTrb),
        trn: Number(editTrn),
        capacidadMaxPax: Number(editCapacidadPax),
        dotacionTripulacion: Number(editDotacion),
        capacidadTotalOcupantes: Number(editCapacidadTotal),
        motores: editMotores,
        potenciaTotalHp: Number(editPotenciaHp),
        plantaElectrica: editPlantaElectrica.trim() || undefined,
        muelleBase: editMuelle,
        armador: editArmador,
        operador: editOperador.trim() || undefined,
        horasMotorAcumuladas: Number(editHorasMotor),
        limiteHorasMantenimiento: Number(editLimiteHoras),
        estado: editEstado,
      });
      setShowEditEmbModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateVesselSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevaMatricula.trim() || !onCrearEmbarcacion) return;

    setIsSubmitting(true);
    try {
      await onCrearEmbarcacion({
        nombre: nuevoNombre.trim(),
        matricula: nuevaMatricula.trim(),
        codigoRenet: nuevoCodigoRenet.trim() || `RNT-BAR-${nuevaMatricula.replace(/[^0-9]/g, '')}`,
        distintivoLlamada: nuevoDistintivo.trim() || undefined,
        numeroOmi: nuevoOmi.trim() || undefined,
        mmsi: nuevoMmsi.trim() || undefined,
        esloraPies: Number(nuevaEsloraPies),
        esloraMetros: Number(nuevaEsloraMetros),
        mangaMetros: Number(nuevaManga),
        puntalMetros: Number(nuevoPuntal),
        caladoMetros: Number(nuevoCalado),
        trb: Number(nuevoTrb),
        trn: Number(nuevoTrn),
        capacidadMaxPax: Number(nuevaCapacidadPax),
        dotacionTripulacion: Number(nuevaDotacion),
        capacidadTotalOcupantes: Number(nuevaCapacidadTotal),
        motores: nuevosMotores,
        potenciaTotalHp: Number(nuevaPotenciaHp),
        plantaElectrica: nuevaPlantaElectrica.trim() || undefined,
        muelleBase: nuevoMuelle,
        armador: nuevoArmador,
        operador: nuevoOperador.trim() || undefined,
        anioConstruccion: Number(nuevoAnio),
        estado: 'OPERATIVO',
        horasMotorAcumuladas: Number(nuevasHorasMotor),
        limiteHorasMantenimiento: Number(nuevoLimiteHoras),
        intervaloServicioHoras: 250,
        documentos: [],
        mantenimientos: [],
        novedades: [],
      });
      setShowCreateEmbModal(false);
      // Reset form
      setNuevoNombre('');
      setNuevaMatricula('');
      setNuevoCodigoRenet('');
      setNuevoDistintivo('');
      setNuevoOmi('');
      setNuevoMmsi('');
      setNuevaPlantaElectrica('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVesselSubmit = async () => {
    if (!currentEmb || !onEliminarEmbarcacion) return;
    setIsSubmitting(true);
    try {
      await onEliminarEmbarcacion(currentEmb.id);
      setShowDeleteEmbConfirm(false);
      const remaining = embarcaciones.filter((e) => e.id !== currentEmb.id);
      if (remaining.length > 0) {
        setSelectedEmbId(remaining[0].id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddDoc = () => {
    setDocTipo('CERTIFICADO_SEGURIDAD');
    setDocNombre('Certificado Nacional de Seguridad de Naves de Pasaje');
    setDocNumero(`01-${currentEmb?.matricula || 'CP-05-XXXX'}-500`);
    setDocEmisor('Capitanía de Puerto de Cartagena (DIMAR)');
    setDocExpedicion(new Date().toISOString().split('T')[0]);
    setDocVencimiento(new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setDocEstado('VIGENTE');
    setDocObs('');
    setDocUrl('');
    setDocEsPermanente(false);
    setShowAddDocModal(true);
  };

  const handleAddDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmb || !docNombre.trim() || !docNumero.trim() || !onAgregarDocumento) return;

    setIsSubmitting(true);
    try {
      await onAgregarDocumento(currentEmb.id, {
        tipo: docTipo,
        nombre: docNombre.trim(),
        numero: docNumero.trim(),
        emisor: docEmisor.trim(),
        fechaExpedicion: docExpedicion,
        fechaVencimiento: docEsPermanente ? '2099-12-31' : docVencimiento,
        estado: docEsPermanente ? 'VIGENTE' : docEstado,
        observaciones: docObs.trim() || undefined,
        urlDocumento: docUrl.trim() || undefined,
        esPermanente: docEsPermanente,
      });
      setShowAddDocModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditDoc = (doc: DocumentoMaritimo) => {
    setEditingDoc({ doc, originalNumero: doc.numero });
    setDocTipo(doc.tipo);
    setDocNombre(doc.nombre);
    setDocNumero(doc.numero);
    setDocEmisor(doc.emisor);
    setDocExpedicion(doc.fechaExpedicion);
    setDocVencimiento(doc.fechaVencimiento);
    setDocEstado(doc.estado);
    setDocObs(doc.observaciones || '');
    setDocUrl(doc.urlDocumento || '');
    setDocEsPermanente(!!doc.esPermanente);
  };

  const handleSaveEditDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmb || !editingDoc || !onActualizarDocumento) return;

    setIsSubmitting(true);
    try {
      await onActualizarDocumento(currentEmb.id, editingDoc.originalNumero, {
        tipo: docTipo,
        nombre: docNombre.trim(),
        numero: docNumero.trim(),
        emisor: docEmisor.trim(),
        fechaExpedicion: docExpedicion,
        fechaVencimiento: docEsPermanente ? '2099-12-31' : docVencimiento,
        estado: docEsPermanente ? 'VIGENTE' : docEstado,
        observaciones: docObs.trim() || undefined,
        urlDocumento: docUrl.trim() || undefined,
        esPermanente: docEsPermanente,
      });
      setEditingDoc(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocSubmit = async () => {
    if (!currentEmb || !docToDelete || !onEliminarDocumento) return;
    setIsSubmitting(true);
    try {
      await onEliminarDocumento(currentEmb.id, docToDelete.numero);
      setDocToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMantenimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmb || !mntDesc.trim()) return;

    onAddMantenimiento(currentEmb.id, {
      embarcacionId: currentEmb.id,
      tipo: mntTipo,
      fecha: mntFecha,
      horasMotor: Number(mntHoras),
      descripcion: mntDesc,
      tecnicoResponsable: mntTecnico || 'Servicio Técnico Autorizado',
      estado: 'COMPLETADO',
    });

    setShowAddMntModal(false);
    setMntDesc('');
    setMntTecnico('');
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
              <Anchor className="w-3.5 h-3.5 text-cyan-400" />
              Estándar RENET • Ficha Técnica y Documental
            </span>
            <span className="text-slate-400 text-xs">DIMAR CP05</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            Gestión de Embarcaciones, Documentos y Horómetros
          </h1>
          <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
            Control de flota turística, patentes de navegación, pólizas marítimas, horas de motor acumuladas y carné digital QR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canManageVessels && (
            <button
              onClick={() => setShowCreateEmbModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/40 cursor-pointer transition-all"
              title="Registrar nueva embarcación en la plataforma"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nueva Embarcación</span>
            </button>
          )}

          <button
            onClick={() => setSelectedCarneEmb(currentEmb)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-900/40 cursor-pointer transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Carné QR ({currentEmb.nombre.split(' ')[1] || 'Nave'})</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-bold gap-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('FICHA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'FICHA'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>Ficha Técnica &amp; Pólizas DIMAR</span>
          </button>

          <button
            onClick={() => setActiveSubTab('GRAFICOS_HORAS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'GRAFICOS_HORAS'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Gráficos Horas Motor vs. Límites</span>
          </button>

          <button
            onClick={() => setActiveSubTab('NOVEDADES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'NOVEDADES'
                ? 'bg-cyan-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Novedades &amp; Averías Detectadas</span>
            {totalNovedadesPendientes > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {totalNovedadesPendientes}
              </span>
            )}
          </button>
        </div>

        {canManageVessels && activeSubTab === 'FICHA' && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Edición Autorizada (Director de Operaciones)
            </span>
          </div>
        )}
      </div>

      {/* SUB-VIEW 1: GRÁFICOS DE BARRAS DE HORAS VS LÍMITES */}
      {activeSubTab === 'GRAFICOS_HORAS' && (
        <HorasMotorBarChart
          embarcaciones={embarcaciones}
          selectedEmbId={selectedEmbId}
          onSelectEmbarcacion={(id) => setSelectedEmbId(id)}
          onProgramarMnt={(embId) => {
            setSelectedEmbId(embId);
            const emb = embarcaciones.find((e) => e.id === embId);
            setMntHoras(emb ? emb.horasMotorAcumuladas : 1850);
            setShowAddMntModal(true);
          }}
        />
      )}

      {/* SUB-VIEW 2: NOVEDADES Y AVERÍAS DETECTADAS */}
      {activeSubTab === 'NOVEDADES' && (
        <NovedadesModule
          embarcaciones={embarcaciones}
          selectedEmbId={selectedEmbId}
          tripulacion={tripulacion}
          onAddNovedad={onAddNovedad}
          onUpdateNovedad={onUpdateNovedad}
        />
      )}

      {/* SUB-VIEW 3: FICHA TÉCNICA TRADICIONAL & DOCUMENTOS */}
      {activeSubTab === 'FICHA' && (
        <div className="space-y-6">
          {/* Vessel selector tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {embarcaciones.map((emb) => {
              const isSelected = emb.id === currentEmb.id;
              const hasAlerts = emb.documentos.some((d) => d.estado === 'POR_VENCER' || d.estado === 'VENCIDO');

              return (
                <button
                  key={emb.id}
                  onClick={() => setSelectedEmbId(emb.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-900 text-white border-cyan-500 shadow-md ring-2 ring-cyan-500/30'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-500">{emb.matricula}</span>
                    {hasAlerts ? (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Documento por vencer" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Al día" />
                    )}
                  </div>
                  <div className="font-bold text-sm mt-1 truncate">{emb.nombre}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cap. {emb.capacidadMaxPax} PAX • {emb.esloraPies} ft
                  </div>
                </button>
              );
            })}

            {canManageVessels && (
              <button
                onClick={() => setShowCreateEmbModal(true)}
                className="p-3.5 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 text-left transition-all cursor-pointer flex flex-col justify-center items-center text-center group"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Nueva Nave</span>
                <span className="text-[10px] text-emerald-600">Alta RENET / DIMAR</span>
              </button>
            )}
          </div>

          {/* Main Vessel Profile Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Technical Sheet & Specs */}
            <div className="space-y-6">
              {/* Technical Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400">
                      RENET ID: {currentEmb.codigoRenet || `RNT-${currentEmb.matricula}`}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                      {currentEmb.estado}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 mt-2">
                    <div>
                      <h2 className="text-lg font-bold text-white">{currentEmb.nombre}</h2>
                      <p className="text-xs text-slate-300 font-mono">Matrícula DIMAR: {currentEmb.matricula}</p>
                    </div>
                    {canManageVessels && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditVessel(currentEmb)}
                          className="px-2 py-1 bg-slate-800 hover:bg-cyan-700 text-cyan-300 hover:text-white rounded-lg text-[11px] font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Modificar especificaciones de la embarcación"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteEmbConfirm(true)}
                          className="p-1 bg-rose-950/60 hover:bg-rose-700 text-rose-300 hover:text-white rounded-lg border border-rose-800/60 transition-colors cursor-pointer"
                          title="Eliminar embarcación de la flota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DIMAR Official Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800">
                    {currentEmb.distintivoLlamada && (
                      <span className="text-[10px] bg-slate-800 text-cyan-300 font-mono px-2 py-0.5 rounded border border-slate-700 font-bold">
                        DIST: {currentEmb.distintivoLlamada}
                      </span>
                    )}
                    {currentEmb.numeroOmi && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                        OMI: {currentEmb.numeroOmi}
                      </span>
                    )}
                    {currentEmb.mmsi && (
                      <span className="text-[10px] bg-slate-800 text-amber-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                        MMSI: {currentEmb.mmsi}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Eslora / Manga</span>
                      <strong className="text-slate-800 text-xs">
                        {currentEmb.esloraMetros}m x {currentEmb.mangaMetros}m
                      </strong>
                      <span className="text-[10px] text-slate-500 block">({currentEmb.esloraPies} pies)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Puntal / Calado</span>
                      <strong className="text-slate-800 text-xs">
                        {currentEmb.puntalMetros || '-'}m / {currentEmb.caladoMetros}m
                      </strong>
                      <span className="text-[10px] text-slate-500 block">Calado DIMAR</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacidad PAX</span>
                      <strong className="text-cyan-700 text-sm font-black">{currentEmb.capacidadMaxPax} PAX</strong>
                      <span className="text-[10px] text-slate-500 block">
                        + {currentEmb.dotacionTripulacion || 4} Tripulación = {currentEmb.capacidadTotalOcupantes || currentEmb.capacidadMaxPax + (currentEmb.dotacionTripulacion || 4)} Total
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Arqueo (TRB / TRN)</span>
                      <strong className="text-slate-800 text-xs">
                        TRB: {currentEmb.trb || '-'} | TRN: {currentEmb.trn || '-'}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">Certificado DIMAR</span>
                    </div>
                  </div>

                  <div className="pb-2.5 border-b border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Propulsión / Motores</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{currentEmb.motores}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span>Potencia: {currentEmb.potenciaTotalHp} HP</span>
                      <span>•</span>
                      <span>Horómetro: <strong>{currentEmb.horasMotorAcumuladas} hrs</strong></span>
                    </div>
                  </div>

                  {currentEmb.plantaElectrica && (
                    <div className="pb-2.5 border-b border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Planta Eléctrica Auxiliar</span>
                      <p className="font-medium text-slate-700 mt-0.5">{currentEmb.plantaElectrica}</p>
                    </div>
                  )}

                  <div className="pb-2.5 border-b border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Muelle Base en Cartagena</span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>{currentEmb.muelleBase}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Armador Registrado</span>
                      <p className="font-medium text-slate-700">{currentEmb.armador}</p>
                    </div>
                    {currentEmb.operador && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Operador Náutico</span>
                        <p className="font-medium text-slate-700">{currentEmb.operador}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedCarneEmb(currentEmb)}
                    className="w-full mt-2 py-2.5 bg-slate-100 hover:bg-cyan-50 text-slate-800 hover:text-cyan-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-cyan-600" />
                    <span>Emitir Carné Digital para Muelle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Center & Right Column: Document Control & Maintenance */}
            <div className="lg:col-span-2 space-y-6">
              {/* Document Control Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Control Documental DIMAR &amp; Pólizas de Seguro ({currentEmb.documentos.length})
                    </h3>
                  </div>

                  {canManageVessels && (
                    <button
                      onClick={handleOpenAddDoc}
                      className="flex items-center gap-1.5 px-3 py-1 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Documento</span>
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {currentEmb.documentos.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No hay documentos registrados para esta embarcación.
                    </div>
                  ) : (
                    currentEmb.documentos.map((doc, idx) => {
                      const isAlert = doc.estado === 'POR_VENCER';
                      const isExpired = doc.estado === 'VENCIDO';

                      return (
                        <div
                          key={idx}
                          className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900">{doc.nombre}</span>
                              {doc.esPermanente ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                  ♾️ PERMANENTE
                                </span>
                              ) : (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    doc.estado === 'VIGENTE'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isAlert
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {doc.estado === 'VIGENTE' && '✓ VIGENTE'}
                                  {isAlert && '⚠️ POR VENCER (< 30 DÍAS)'}
                                  {isExpired && '❌ VENCIDO'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {doc.numero} • Emisor: {doc.emisor}
                            </div>
                            {doc.observaciones && (
                              <div className="text-[11px] text-slate-600 italic">
                                {doc.observaciones}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-slate-400 text-[10px] block uppercase">Vencimiento</span>
                              <strong
                                className={`font-mono text-xs ${
                                  doc.esPermanente
                                    ? 'text-blue-700 font-semibold'
                                    : isAlert
                                    ? 'text-amber-600 font-bold'
                                    : isExpired
                                    ? 'text-rose-600 font-bold'
                                    : 'text-slate-800'
                                }`}
                              >
                                {doc.esPermanente ? 'Sin Vencimiento' : doc.fechaVencimiento}
                              </strong>
                            </div>

                            {doc.urlDocumento && (
                              <a
                                href={doc.urlDocumento}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg text-xs font-semibold border border-cyan-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                                title="Ver soporte o certificado oficial"
                              >
                                <FileText className="w-3.5 h-3.5 text-cyan-700" />
                                <span>Ver PDF</span>
                              </a>
                            )}

                            {canManageVessels && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditDoc(doc)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Renovar o editar fechas del documento"
                                >
                                  <Edit className="w-3 h-3 text-cyan-600" />
                                  <span>Renovar</span>
                                </button>
                                <button
                                  onClick={() => setDocToDelete(doc)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar documento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Maintenance Logs */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Historial de Mantenimientos Preventivos y Correctivos
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAddMntModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Registrar Mantenimiento</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {currentEmb.mantenimientos.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No hay registros de mantenimientos recientes para esta embarcación.
                    </div>
                  ) : (
                    currentEmb.mantenimientos.map((mnt) => (
                      <div key={mnt.id} className="p-4 hover:bg-slate-50/70 transition-colors text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-200">
                              {mnt.tipo.replace(/_/g, ' ')}
                            </span>
                            <span className="font-semibold text-slate-800">{mnt.fecha}</span>
                          </div>
                          <span className="text-slate-500 font-mono text-[11px]">
                            Horómetro: <strong>{mnt.horasMotor} hrs</strong>
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium">{mnt.descripcion}</p>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Técnico: {mnt.tecnicoResponsable}</span>
                          {mnt.proximaRevisionHoras && (
                            <span>• Próx. revisión: {mnt.proximaRevisionHoras} hrs</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR NUEVA EMBARCACIÓN (DIRECTOR DE OPERACIONES) */}
      {showCreateEmbModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white p-5 border-b border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Anchor className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold tracking-wider text-emerald-300 uppercase">
                    Alta de Embarcación en Flota • Estándar DIMAR CP05 / RENET
                  </span>
                </div>
                <button
                  onClick={() => setShowCreateEmbModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Registrar Nueva Embarcación</h2>
              <p className="text-xs text-slate-300">
                Crea la ficha técnica, genera el carné digital y el código de verificación QR para Capitanía de Puerto.
              </p>
            </div>

            <form onSubmit={handleCreateVesselSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre de la Embarcación *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Catamarán Sol de Cartagena"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matrícula DIMAR *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CP-05-2089"
                    value={nuevaMatricula}
                    onChange={(e) => setNuevaMatricula(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* DIMAR Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Distintivo de Llamada</label>
                  <input
                    type="text"
                    placeholder="Ej. HKKL9"
                    value={nuevoDistintivo}
                    onChange={(e) => setNuevoDistintivo(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número OMI / Matrícula Int.</label>
                  <input
                    type="text"
                    placeholder="Ej. ACV38A94Z3740"
                    value={nuevoOmi}
                    onChange={(e) => setNuevoOmi(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MMSI (Radio VHF)</label>
                  <input
                    type="text"
                    placeholder="Ej. 730001041"
                    value={nuevoMmsi}
                    onChange={(e) => setNuevoMmsi(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Eslora (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevaEsloraMetros}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setNuevaEsloraMetros(m);
                      setNuevaEsloraPies(Math.round(m / 0.3048));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manga (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevaManga}
                    onChange={(e) => setNuevaManga(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Puntal (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoPuntal}
                    onChange={(e) => setNuevoPuntal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Calado (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoCalado}
                    onChange={(e) => setNuevoCalado(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Tonnages & Capacities */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TRB (Arqueo Bruto)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoTrb}
                    onChange={(e) => setNuevoTrb(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TRN (Arqueo Neto)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoTrn}
                    onChange={(e) => setNuevoTrn(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacidad PAX *</label>
                  <input
                    type="number"
                    value={nuevaCapacidadPax}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setNuevaCapacidadPax(p);
                      setNuevaCapacidadTotal(p + nuevaDotacion);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-cyan-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dotación Tripulación</label>
                  <input
                    type="number"
                    value={nuevaDotacion}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setNuevaDotacion(d);
                      setNuevaCapacidadTotal(nuevaCapacidadPax + d);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Propulsion & Power */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Motores / Propulsión</label>
                  <input
                    type="text"
                    value={nuevosMotores}
                    onChange={(e) => setNuevosMotores(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    placeholder="Ej. Babor: YANMAR 2GM20FC | Estribor: YANMAR 2GM20FC"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Potencia Total (HP)</label>
                  <input
                    type="number"
                    value={nuevaPotenciaHp}
                    onChange={(e) => setNuevaPotenciaHp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Planta Eléctrica Auxiliar (opcional)</label>
                <input
                  type="text"
                  value={nuevaPlantaElectrica}
                  onChange={(e) => setNuevaPlantaElectrica(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="Ej. NORTHERN LIGHTS B-H3XN (7 KW) - Serial: E673L-C-8602-TD"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Muelle Base</label>
                  <input
                    type="text"
                    value={nuevoMuelle}
                    onChange={(e) => setNuevoMuelle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    placeholder="Ej. Muelle de la Bodeguita - Puesto 4"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Armador / Propietario Legal</label>
                  <input
                    type="text"
                    value={nuevoArmador}
                    onChange={(e) => setNuevoArmador(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operador Náutico</label>
                  <input
                    type="text"
                    value={nuevoOperador}
                    onChange={(e) => setNuevoOperador(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Año de Construcción</label>
                  <input
                    type="number"
                    value={nuevoAnio}
                    onChange={(e) => setNuevoAnio(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horas Motor Iniciales</label>
                  <input
                    type="number"
                    value={nuevasHorasMotor}
                    onChange={(e) => setNuevasHorasMotor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Límite Horas Servicio (Ciclo)</label>
                  <input
                    type="number"
                    value={nuevoLimiteHoras}
                    onChange={(e) => setNuevoLimiteHoras(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                <strong>Plantilla Documental Incluida:</strong> Al crear la embarcación se generarán automáticamente las plantillas para la Patente de Navegación DIMAR, Póliza P&I y Póliza Casco/Maquinaria para que pueda ingresar sus números y fechas de vencimiento.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateEmbModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registrando...' : 'Registrar Embarcación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR FICHA TÉCNICA DE EMBARCACIÓN EXISTENTE */}
      {showEditEmbModal && currentEmb && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 border-b border-cyan-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-cyan-300 uppercase">
                  Modificación de Ficha Técnica DIMAR • {currentEmb.matricula}
                </span>
                <button
                  onClick={() => setShowEditEmbModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Editar: {currentEmb.nombre}</h2>
            </div>

            <form onSubmit={handleSaveEditVessel} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matrícula DIMAR</label>
                  <input
                    type="text"
                    required
                    value={editMatricula}
                    onChange={(e) => setEditMatricula(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              {/* DIMAR Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Distintivo de Llamada</label>
                  <input
                    type="text"
                    value={editDistintivo}
                    onChange={(e) => setEditDistintivo(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número OMI</label>
                  <input
                    type="text"
                    value={editOmi}
                    onChange={(e) => setEditOmi(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MMSI (Radio VHF)</label>
                  <input
                    type="text"
                    value={editMmsi}
                    onChange={(e) => setEditMmsi(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Eslora (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editEsloraMetros}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setEditEsloraMetros(m);
                      setEditEsloraPies(Math.round(m / 0.3048));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manga (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editManga}
                    onChange={(e) => setEditManga(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Puntal (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPuntal}
                    onChange={(e) => setEditPuntal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Calado (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCalado}
                    onChange={(e) => setEditCalado(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Capacities and Tonnages */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TRB</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editTrb}
                    onChange={(e) => setEditTrb(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TRN</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editTrn}
                    onChange={(e) => setEditTrn(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacidad PAX</label>
                  <input
                    type="number"
                    value={editCapacidadPax}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setEditCapacidadPax(p);
                      setEditCapacidadTotal(p + editDotacion);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-black text-cyan-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dotación Tripulación</label>
                  <input
                    type="number"
                    value={editDotacion}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setEditDotacion(d);
                      setEditCapacidadTotal(editCapacidadPax + d);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Engines & Power */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Motores</label>
                  <input
                    type="text"
                    value={editMotores}
                    onChange={(e) => setEditMotores(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Potencia Total (HP)</label>
                  <input
                    type="number"
                    value={editPotenciaHp}
                    onChange={(e) => setEditPotenciaHp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Planta Eléctrica Auxiliar</label>
                <input
                  type="text"
                  value={editPlantaElectrica}
                  onChange={(e) => setEditPlantaElectrica(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Muelle Base</label>
                  <input
                    type="text"
                    value={editMuelle}
                    onChange={(e) => setEditMuelle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Armador / Razón Social</label>
                  <input
                    type="text"
                    value={editArmador}
                    onChange={(e) => setEditArmador(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operador Náutico</label>
                  <input
                    type="text"
                    value={editOperador}
                    onChange={(e) => setEditOperador(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado de la Nave</label>
                  <select
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                  >
                    <option value="OPERATIVO">OPERATIVO (Disponible para zarpe)</option>
                    <option value="EN_MANTENIMIENTO">EN_MANTENIMIENTO (En dique o taller)</option>
                    <option value="EN_REVISION">EN_REVISION (Inspección técnica)</option>
                    <option value="NO_DISPONIBLE">NO_DISPONIBLE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horómetro (hrs)</label>
                  <input
                    type="number"
                    value={editHorasMotor}
                    onChange={(e) => setEditHorasMotor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Límite Horas Ciclo</label>
                  <input
                    type="number"
                    value={editLimiteHoras}
                    onChange={(e) => setEditLimiteHoras(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditEmbModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Modificaciones'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AGREGAR DOCUMENTO MARÍTIMO REQUERIDO */}
      {showAddDocModal && currentEmb && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 text-white p-5 border-b border-cyan-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-cyan-300 uppercase">
                  Incorporar Documento Marítimo DIMAR / Póliza
                </span>
                <button
                  onClick={() => setShowAddDocModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Nave: {currentEmb.nombre}</h2>
            </div>

            <form onSubmit={handleAddDocSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Documento</label>
                <select
                  value={docTipo}
                  onChange={(e) => {
                    const val = e.target.value as TipoDocumentoMaritimo;
                    setDocTipo(val);
                    if (val === 'CERTIFICADO_SEGURIDAD') setDocNombre('Certificado Nacional de Seguridad de Naves de Pasaje');
                    else if (val === 'POLIZA_ACCIDENTES_COLECTIVOS') setDocNombre('Póliza Accidentes Personales Colectivos');
                    else if (val === 'POLIZA_RCE_CONTAMINACION') setDocNombre('Póliza RCE Contaminación Accidental');
                    else if (val === 'INSPECCION_CASCO') setDocNombre('Certificado Obra Viva y Mantenimiento de Casco');
                    else if (val === 'CERTIFICADO_MOTORES') setDocNombre('Certificado de Motores DIMAR');
                    else if (val === 'CERTIFICADO_FRANCOBORDO') setDocNombre('Certificado Nacional de Francobordo');
                    else if (val === 'CERTIFICADO_MAXIMO_PAX') setDocNombre('Certificado Capacidad Máxima de Pasajeros');
                    else if (val === 'CERTIFICADO_COMBUSTIBLE') setDocNombre('Certificado Capacidad Tanques de Combustible');
                    else if (val === 'PATENTE_NAVEGACION') setDocNombre('Patente de Navegación Mayor');
                    else if (val === 'POLIZA_PI') setDocNombre('Póliza P&I Responsabilidad Civil');
                    else if (val === 'POLIZA_CASCO') setDocNombre('Póliza Casco y Maquinaria');
                    else if (val === 'CERTIFICADO_ARQUEO') setDocNombre('Certificado Internacional de Arqueo');
                    else if (val === 'INSPECCION_BALSAS') setDocNombre('Certificado de Inspección de Balsas Salvavidas');
                    else if (val === 'PERMISO_ZARPE') setDocNombre('Permiso Especial de Zarpe Turístico');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                >
                  <option value="CERTIFICADO_SEGURIDAD">Certificado Nacional de Seguridad de Naves (DIMAR)</option>
                  <option value="POLIZA_ACCIDENTES_COLECTIVOS">Póliza Accidentes Personales Colectivos</option>
                  <option value="POLIZA_RCE_CONTAMINACION">Póliza RCE Contaminación Accidental</option>
                  <option value="INSPECCION_CASCO">Certificado Obra Viva y Mantenimiento Casco</option>
                  <option value="CERTIFICADO_MOTORES">Certificado de Motores (DIMAR Permanente)</option>
                  <option value="CERTIFICADO_FRANCOBORDO">Certificado de Francobordo (DIMAR Permanente)</option>
                  <option value="CERTIFICADO_MAXIMO_PAX">Certificado Capacidad Máx. Pasajeros (Permanente)</option>
                  <option value="CERTIFICADO_COMBUSTIBLE">Certificado Tanques Combustible (Permanente)</option>
                  <option value="PATENTE_NAVEGACION">Patente de Navegación Mayor (DIMAR)</option>
                  <option value="POLIZA_PI">Póliza P&I Responsabilidad Civil</option>
                  <option value="POLIZA_CASCO">Póliza Casco y Maquinaria</option>
                  <option value="CERTIFICADO_ARQUEO">Certificado Internacional de Arqueo (Permanente)</option>
                  <option value="INSPECCION_BALSAS">Inspección Balsas Salvavidas</option>
                  <option value="PERMISO_ZARPE">Permiso Especial de Zarpe</option>
                  <option value="OTRO">Otro Certificado Marítimo</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Descriptivo *</label>
                <input
                  type="text"
                  required
                  value={docNombre}
                  onChange={(e) => setDocNombre(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                  placeholder="Ej. Póliza Accidentes Personales Colectivos"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número Oficial *</label>
                  <input
                    type="text"
                    required
                    value={docNumero}
                    onChange={(e) => setDocNumero(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase"
                    placeholder="Ej. 01-CP-05-2669-B-546"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Entidad Emisora</label>
                  <input
                    type="text"
                    required
                    value={docEmisor}
                    onChange={(e) => setDocEmisor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    placeholder="Ej. Capitanía de Puerto de Cartagena (DIMAR)"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={docEsPermanente}
                    onChange={(e) => setDocEsPermanente(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Documento o Certificado Permanente</span>
                    <span className="block text-[11px] text-slate-600">
                      No expira anualmente (ej. Arqueo, Francobordo, Motores, Capacidad PAX).
                    </span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha Expedición</label>
                  <input
                    type="date"
                    required
                    value={docExpedicion}
                    onChange={(e) => setDocExpedicion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {docEsPermanente ? 'Vencimiento (No aplica)' : 'Fecha Vencimiento *'}
                  </label>
                  <input
                    type="date"
                    disabled={docEsPermanente}
                    required={!docEsPermanente}
                    value={docEsPermanente ? '' : docVencimiento}
                    onChange={(e) => {
                      setDocVencimiento(e.target.value);
                      const diffDays = (new Date(e.target.value).getTime() - Date.now()) / (1000 * 3600 * 24);
                      if (diffDays < 0) setDocEstado('VENCIDO');
                      else if (diffDays <= 30) setDocEstado('POR_VENCER');
                      else setDocEstado('VIGENTE');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {!docEsPermanente && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado del Documento</label>
                  <select
                    value={docEstado}
                    onChange={(e) => setDocEstado(e.target.value as EstadoDoc)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                  >
                    <option value="VIGENTE">VIGENTE (Al día)</option>
                    <option value="POR_VENCER">POR VENCER (&lt; 30 días)</option>
                    <option value="VENCIDO">VENCIDO</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL / Ruta PDF del Documento (opcional)</label>
                <input
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                  placeholder="Ej. /assets/aistudio/Certificado_Seguridad_ARMONIA...pdf"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observaciones / Cobertura</label>
                <input
                  type="text"
                  value={docObs}
                  onChange={(e) => setDocObs(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="Ej. Cobertura hasta 40 ocupantes por siniestro marítimo"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Agregar a la Nave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RENOVAR O EDITAR DOCUMENTO EXISTENTE */}
      {editingDoc && currentEmb && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white p-5 border-b border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
                  Renovación &amp; Modificación Documental
                </span>
                <button
                  onClick={() => setEditingDoc(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{editingDoc.doc.nombre}</h2>
              <p className="text-xs text-slate-300">Nave: {currentEmb.nombre} ({currentEmb.matricula})</p>
            </div>

            <form onSubmit={handleSaveEditDocSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Documento</label>
                <select
                  value={docTipo}
                  onChange={(e) => setDocTipo(e.target.value as TipoDocumentoMaritimo)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                >
                  <option value="CERTIFICADO_SEGURIDAD">Certificado Nacional de Seguridad de Naves (DIMAR)</option>
                  <option value="POLIZA_ACCIDENTES_COLECTIVOS">Póliza Accidentes Personales Colectivos</option>
                  <option value="POLIZA_RCE_CONTAMINACION">Póliza RCE Contaminación Accidental</option>
                  <option value="INSPECCION_CASCO">Certificado Obra Viva y Mantenimiento Casco</option>
                  <option value="CERTIFICADO_MOTORES">Certificado de Motores (DIMAR Permanente)</option>
                  <option value="CERTIFICADO_FRANCOBORDO">Certificado de Francobordo (DIMAR Permanente)</option>
                  <option value="CERTIFICADO_MAXIMO_PAX">Certificado Capacidad Máx. Pasajeros (Permanente)</option>
                  <option value="CERTIFICADO_COMBUSTIBLE">Certificado Tanques Combustible (Permanente)</option>
                  <option value="PATENTE_NAVEGACION">Patente de Navegación Mayor (DIMAR)</option>
                  <option value="POLIZA_PI">Póliza P&I Responsabilidad Civil</option>
                  <option value="POLIZA_CASCO">Póliza Casco y Maquinaria</option>
                  <option value="CERTIFICADO_ARQUEO">Certificado Internacional de Arqueo (Permanente)</option>
                  <option value="INSPECCION_BALSAS">Inspección Balsas Salvavidas</option>
                  <option value="PERMISO_ZARPE">Permiso Especial de Zarpe</option>
                  <option value="OTRO">Otro Certificado Marítimo</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  required
                  value={docNombre}
                  onChange={(e) => setDocNombre(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número de Certificado / Póliza</label>
                  <input
                    type="text"
                    required
                    value={docNumero}
                    onChange={(e) => setDocNumero(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Entidad Emisora</label>
                  <input
                    type="text"
                    required
                    value={docEmisor}
                    onChange={(e) => setDocEmisor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={docEsPermanente}
                    onChange={(e) => setDocEsPermanente(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Documento Permanente (Sin expiración periódica)</span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha Expedición</label>
                  <input
                    type="date"
                    required
                    value={docExpedicion}
                    onChange={(e) => setDocExpedicion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {docEsPermanente ? 'Vencimiento (Permanente)' : 'Nueva Fecha Vencimiento'}
                  </label>
                  <input
                    type="date"
                    disabled={docEsPermanente}
                    required={!docEsPermanente}
                    value={docEsPermanente ? '' : docVencimiento}
                    onChange={(e) => {
                      setDocVencimiento(e.target.value);
                      const diffDays = (new Date(e.target.value).getTime() - Date.now()) / (1000 * 3600 * 24);
                      if (diffDays < 0) setDocEstado('VENCIDO');
                      else if (diffDays <= 30) setDocEstado('POR_VENCER');
                      else setDocEstado('VIGENTE');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-emerald-800 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {!docEsPermanente && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado del Documento</label>
                  <select
                    value={docEstado}
                    onChange={(e) => setDocEstado(e.target.value as EstadoDoc)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                  >
                    <option value="VIGENTE">VIGENTE</option>
                    <option value="POR_VENCER">POR VENCER (&lt; 30 días)</option>
                    <option value="VENCIDO">VENCIDO</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL / Ruta PDF del Documento</label>
                <input
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                  placeholder="Ej. /assets/aistudio/Certificado_Seguridad_ARMONIA...pdf"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observaciones</label>
                <input
                  type="text"
                  value={docObs}
                  onChange={(e) => setDocObs(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="Detalles de renovación, ampliación o endoso"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Confirmar Renovación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CONFIRMACIÓN PARA ELIMINAR EMBARCACIÓN */}
      {showDeleteEmbConfirm && currentEmb && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Eliminar Embarcación</h3>
                <p className="text-xs text-slate-500">Acción exclusiva de Dirección de Operaciones</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              ¿Está seguro de que desea eliminar la embarcación <strong>{currentEmb.nombre}</strong> (Matrícula: <strong>{currentEmb.matricula}</strong>) de la flota? Todos los certificados asociados y registros se desvincularán del control de operaciones.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteEmbConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteVesselSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Eliminando...' : 'Sí, Eliminar de la Flota'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CONFIRMACIÓN PARA ELIMINAR DOCUMENTO */}
      {docToDelete && currentEmb && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Eliminar Documento Marítimo</h3>
                <p className="text-xs text-slate-500">Nave: {currentEmb.nombre}</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              ¿Desea retirar el documento <strong>{docToDelete.nombre}</strong> (No. <strong>{docToDelete.numero}</strong>)?
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteDocSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar Documento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL CARNÉ MODAL WITH QR (RENET STANDARD) */}
      {selectedCarneEmb && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Carné Header */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-5 border-b border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Anchor className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold tracking-wider text-cyan-300 uppercase">
                    RENET • Plataforma de Identificación Náutica
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCarneEmb(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-white mt-2">
                Carné Digital de Embarcación Turística
              </h2>
              <p className="text-xs text-slate-300">
                Autorizado por Capitanía de Puerto de Cartagena (DIMAR) • Vigente 2026
              </p>
            </div>

            {/* Carné Body */}
            <div className="p-6 space-y-5 bg-gradient-to-b from-white to-slate-50">
              {/* QR and Core specs */}
              <div className="flex items-center gap-5 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <QRCodeView
                  value={`https://renet.com.co/verificar-nave?matricula=${selectedCarneEmb.matricula}&id=${selectedCarneEmb.codigoRenet}&dimar=CP05`}
                  size={120}
                />
                <div className="space-y-1 text-xs">
                  <div className="font-mono text-cyan-700 font-black text-sm">
                    {selectedCarneEmb.matricula}
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedCarneEmb.nombre}</h3>
                  <div className="text-slate-600">
                    Capacidad: <strong className="text-slate-900 font-bold">{selectedCarneEmb.capacidadMaxPax} Pasajeros</strong>
                  </div>
                  <div className="text-slate-600">
                    Eslora: <strong>{selectedCarneEmb.esloraPies} ft ({selectedCarneEmb.esloraMetros} m)</strong>
                  </div>
                  <div className="text-slate-600">
                    Muelle Base: <strong>{selectedCarneEmb.muelleBase}</strong>
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ APTO PARA NAVEGACIÓN DIMAR
                  </span>
                </div>
              </div>

              {/* Verified Documents Checklist */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Documentos Registrados en Bitácora</span>
                  <span className="text-cyan-700 font-mono text-[10px]">Validado por DIMAR CP05</span>
                </div>
                {selectedCarneEmb.documentos.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-0">
                    <span className="text-slate-700 font-medium truncate max-w-[240px]">{doc.nombre}</span>
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        doc.estado === 'VIGENTE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.fechaVencimiento}
                    </span>
                  </div>
                ))}
              </div>

              {/* Carné Footer */}
              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                <span>Código de Verificación: <strong className="text-slate-800 font-mono">{selectedCarneEmb.codigoRenet}</strong></span>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Carné</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW MAINTENANCE MODAL */}
      {showAddMntModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm">Registrar Mantenimiento Técnico</h3>
              </div>
              <button
                onClick={() => setShowAddMntModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMantenimiento} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Embarcación</label>
                <div className="font-bold text-cyan-800 bg-cyan-50 p-2 rounded-lg border border-cyan-200">
                  {currentEmb.nombre} ({currentEmb.matricula})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Mantenimiento</label>
                  <select
                    value={mntTipo}
                    onChange={(e) => setMntTipo(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="PREVENTIVO">Preventivo (250h / 500h)</option>
                    <option value="CORRECTIVO">Correctivo / Reparación</option>
                    <option value="INSPECCION_CASCO">Inspección de Casco</option>
                    <option value="SISTEMA_ELECTRICO">Sistema Eléctrico</option>
                    <option value="EQUIPO_SEGURIDAD">Equipo de Seguridad</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horómetro (Horas Motor)</label>
                  <input
                    type="number"
                    value={mntHoras}
                    onChange={(e) => setMntHoras(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción del Trabajo Realizado *</label>
                <textarea
                  required
                  rows={3}
                  value={mntDesc}
                  onChange={(e) => setMntDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="Ej. Cambio de aceite 15W40, sustitución de ánodos de sacrificio y revisión de rodete de bomba de agua."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Técnico o Taller Responsable</label>
                <input
                  type="text"
                  value={mntTecnico}
                  onChange={(e) => setMntTecnico(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  placeholder="Ej. Taller Mecánico Astivik / Donaldo Cassiani"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMntModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md cursor-pointer"
                >
                  Guardar Mantenimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
