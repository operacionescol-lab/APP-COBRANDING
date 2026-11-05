import React, { useState } from 'react';
import { Tripulante, EMPRESAS_PAGADORAS, EstadoDoc } from '../types/nautical';
import { QRCodeView } from './QRCodeView';
import { compressImageToWebP, uploadWebPToGoogleDrive } from '../utils/imageCompression';
import {
  Users,
  Compass,
  FileCheck2,
  Award,
  AlertCircle,
  Phone,
  Mail,
  HeartPulse,
  Clock,
  ShieldCheck,
  Calendar,
  X,
  Printer,
  QrCode,
  Ship,
  Plus,
  CreditCard,
  Building2,
  UploadCloud,
  FileText,
  DollarSign,
  CheckCircle2,
  Edit2,
  Radio,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface TripulacionModuleProps {
  tripulacion: Tripulante[];
  onSaveTripulante?: (trip: Tripulante) => Promise<void> | void;
  isDirector?: boolean;
}

export const TripulacionModule: React.FC<TripulacionModuleProps> = ({
  tripulacion,
  onSaveTripulante,
  isDirector = true,
}) => {
  const [selectedRole, setSelectedRole] = useState<'TODOS' | 'PILOTO' | 'MARINERO' | 'ADMIN_HOST'>('TODOS');
  const [filterEmpresa, setFilterEmpresa] = useState<'TODAS' | 'maria-del-puerto' | 'catamaranes-veleros'>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<Tripulante | null>(null);
  const [showIdCard, setShowIdCard] = useState<Tripulante | null>(null);

  // Modal create/edit collaborator
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Tripulante | null>(null);

  // Form states
  const [formNombre, setFormNombre] = useState('');
  const [formDocumento, setFormDocumento] = useState('');
  const [formCargo, setFormCargo] = useState('PILOTO_CAPITAN');
  const [formEmpresaId, setFormEmpresaId] = useState<'maria-del-puerto' | 'catamaranes-veleros'>('catamaranes-veleros');
  const [formTelefono, setFormTelefono] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDireccion, setFormDireccion] = useState('Cartagena de Indias');
  const [formEps, setFormEps] = useState('NUEVA EPS');
  const [formArl, setFormArl] = useState('POSITIVA');
  const [formRh, setFormRh] = useState('O+');
  const [formFotoUrl, setFormFotoUrl] = useState('');
  const [formBanco, setFormBanco] = useState('BANCOLOMBIA');
  const [formTipoCuenta, setFormTipoCuenta] = useState<'Ahorros' | 'Corriente'>('Ahorros');
  const [formNumeroCuenta, setFormNumeroCuenta] = useState('');
  const [formTitular, setFormTitular] = useState('');

  // Licencias & Certificados
  const [formLicNumero, setFormLicNumero] = useState('');
  const [formLicCategoria, setFormLicCategoria] = useState('Patrón de Nave Menor');
  const [formLicVence, setFormLicVence] = useState('2027-12-31');
  const [formLicEstado, setFormLicEstado] = useState<EstadoDoc>('VIGENTE');
  const [formCendiatraVence, setFormCendiatraVence] = useState('2027-06-30');
  const [formCendiatraEstado, setFormCendiatraEstado] = useState<EstadoDoc>('VIGENTE');
  const [formVhfVence, setFormVhfVence] = useState('2027-12-31');
  const [formVhfEstado, setFormVhfEstado] = useState<EstadoDoc>('VIGENTE');

  // Tarifas de referencia
  const [formTarifaFullDay, setFormTarifaFullDay] = useState('180000');
  const [formTarifaSunset, setFormTarifaSunset] = useState('120000');
  const [formTarifaMantenimiento, setFormTarifaMantenimiento] = useState('65000');

  // Soportes URLs
  const [formDocIdUrl, setFormDocIdUrl] = useState('');
  const [formLicenciaUrl, setFormLicenciaUrl] = useState('');
  const [formCendiatraUrl, setFormCendiatraUrl] = useState('');
  const [formVhfUrl, setFormVhfUrl] = useState('');

  // Compression loading indicators
  const [compressingField, setCompressingField] = useState<string | null>(null);

  const resetForm = () => {
    setEditingTrip(null);
    setFormNombre('');
    setFormDocumento('');
    setFormCargo('PILOTO_CAPITAN');
    setFormEmpresaId('catamaranes-veleros');
    setFormTelefono('');
    setFormEmail('');
    setFormDireccion('Cartagena de Indias');
    setFormEps('NUEVA EPS');
    setFormArl('POSITIVA');
    setFormRh('O+');
    setFormFotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setFormBanco('BANCOLOMBIA');
    setFormTipoCuenta('Ahorros');
    setFormNumeroCuenta('');
    setFormTitular('');
    setFormLicNumero('');
    setFormLicCategoria('Patrón de Nave Menor');
    setFormLicVence('2027-12-31');
    setFormLicEstado('VIGENTE');
    setFormCendiatraVence('2027-06-30');
    setFormCendiatraEstado('VIGENTE');
    setFormVhfVence('2027-12-31');
    setFormVhfEstado('VIGENTE');
    setFormTarifaFullDay('180000');
    setFormTarifaSunset('120000');
    setFormTarifaMantenimiento('65000');
    setFormDocIdUrl('');
    setFormLicenciaUrl('');
    setFormCendiatraUrl('');
    setFormVhfUrl('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (crew: Tripulante) => {
    setEditingTrip(crew);
    setFormNombre(crew.nombreCompleto);
    setFormDocumento(crew.documentoIdentidad);
    setFormCargo(crew.cargo);
    setFormEmpresaId((crew.empresaContratanteId as any) || 'catamaranes-veleros');
    setFormTelefono(crew.telefono || '');
    setFormEmail(crew.email || '');
    setFormDireccion(crew.direccion || 'Cartagena de Indias');
    setFormEps(crew.eps || 'NUEVA EPS');
    setFormArl(crew.arl || 'POSITIVA');
    setFormRh(crew.tipoRh || 'O+');
    setFormFotoUrl(crew.fotoUrl);
    setFormBanco(crew.datosBancarios?.banco || 'BANCOLOMBIA');
    setFormTipoCuenta(crew.datosBancarios?.tipoCuenta === 'Corriente' ? 'Corriente' : 'Ahorros');
    setFormNumeroCuenta(crew.datosBancarios?.numeroCuenta || '');
    setFormTitular(crew.datosBancarios?.titular || crew.nombreCompleto);

    setFormLicNumero(crew.licencia?.numero || '');
    setFormLicCategoria(crew.licencia?.categoria || 'Patrón de Nave Menor');
    setFormLicVence(crew.licencia?.fechaVencimiento || '2027-12-31');
    setFormLicEstado(crew.licencia?.estado || 'VIGENTE');

    setFormCendiatraVence(crew.cendiatraExp || '2027-06-30');
    setFormCendiatraEstado(crew.cendiatraEstado || 'VIGENTE');

    setFormVhfVence(crew.vhfExp || '2027-12-31');
    setFormVhfEstado(crew.vhfEstado || 'VIGENTE');

    setFormTarifaFullDay(String(crew.tarifasReferencia?.fullDay || '180000'));
    setFormTarifaSunset(String(crew.tarifasReferencia?.sunset || '120000'));
    setFormTarifaMantenimiento(String(crew.tarifasReferencia?.mantenimiento || '65000'));

    setFormDocIdUrl(crew.documentoIdentidadUrl || '');
    setFormLicenciaUrl(crew.licenciaUrl || '');
    setFormCendiatraUrl(crew.cendiatraUrl || '');
    setFormVhfUrl(crew.vhfUrl || '');

    setShowModal(true);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'foto' | 'cc' | 'licencia' | 'cendiatra' | 'vhf'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressingField(fieldKey);
      // Client-side WebP compression (max 1080px resolution)
      const compressed = await compressImageToWebP(file, 1080, 0.85);

      // Upload to Google Drive API
      let driveUrl = compressed.dataUrl;
      try {
        const uploaded = await uploadWebPToGoogleDrive(compressed.file, 'EXPEDIENTES_NAVES', {
          titulo: `${fieldKey.toUpperCase()}_${formNombre.replace(/\s+/g, '_')}`,
        });
        driveUrl = uploaded.driveUrl;
      } catch {
        // Fallback to compressed Data URL
        driveUrl = compressed.dataUrl;
      }

      if (fieldKey === 'foto') setFormFotoUrl(driveUrl);
      if (fieldKey === 'cc') setFormDocIdUrl(driveUrl);
      if (fieldKey === 'licencia') setFormLicenciaUrl(driveUrl);
      if (fieldKey === 'cendiatra') setFormCendiatraUrl(driveUrl);
      if (fieldKey === 'vhf') setFormVhfUrl(driveUrl);
    } catch (err: any) {
      alert(`Error al comprimir archivo: ${err.message || 'Error desconocido'}`);
    } finally {
      setCompressingField(null);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) {
      alert('Ingrese el nombre completo');
      return;
    }

    const empresaMeta = EMPRESAS_PAGADORAS[formEmpresaId] || EMPRESAS_PAGADORAS['catamaranes-veleros'];

    const newTripulante: Tripulante = {
      id: editingTrip?.id || `trip-${Date.now().toString(36)}`,
      nombreCompleto: formNombre.trim(),
      cargo: formCargo,
      documentoIdentidad: formDocumento.trim() || 'CC S/N',
      telefono: formTelefono.trim() || '3000000000',
      email: formEmail.trim() || 'operaciones@catamaranescartagena.com',
      direccion: formDireccion.trim(),
      eps: formEps,
      arl: formArl,
      tipoRh: formRh,
      fotoUrl: formFotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      empresaContratanteId: formEmpresaId,
      empresaContratanteNombre: empresaMeta.razonSocial,
      empresaContratanteNit: empresaMeta.nit,
      datosBancarios: {
        banco: formBanco,
        tipoCuenta: formTipoCuenta,
        numeroCuenta: formNumeroCuenta.trim(),
        titular: formTitular.trim() || formNombre.trim(),
      },
      tarifasReferencia: {
        fullDay: Number(formTarifaFullDay) || 180000,
        sunset: Number(formTarifaSunset) || 120000,
        mantenimiento: Number(formTarifaMantenimiento) || 65000,
      },
      licencia: formLicNumero
        ? {
            categoria: formLicCategoria,
            numero: formLicNumero,
            fechaExpedicion: editingTrip?.licencia?.fechaExpedicion || '2024-01-01',
            fechaVencimiento: formLicVence,
            estado: formLicEstado,
          }
        : editingTrip?.licencia || {
            categoria: 'Personal de Apoyo Náutico',
            numero: 'S/N',
            fechaExpedicion: '2024-01-01',
            fechaVencimiento: '2027-12-31',
            estado: 'VIGENTE',
          },
      cendiatraExp: formCendiatraVence,
      cendiatraEstado: formCendiatraEstado,
      vhfExp: formVhfVence,
      vhfEstado: formVhfEstado,
      documentoIdentidadUrl: formDocIdUrl,
      licenciaUrl: formLicenciaUrl,
      cendiatraUrl: formCendiatraUrl,
      vhfUrl: formVhfUrl,
      libretaEmbarco: editingTrip?.libretaEmbarco || {
        numero: 'LE-CARTAGENA',
        fechaExpedicion: '2024-01-01',
      },
      cursosOMI: editingTrip?.cursosOMI || [
        { codigo: 'VI/1-1', nombre: 'Técnicas de Supervivencia Personal', fechaEmision: '2022-06-30', fechaVencimiento: '2027-06-30', institucion: 'DIMAR', vigente: true },
        { codigo: 'VI/1-2', nombre: 'Prevención y Lucha Contra Incendios', fechaEmision: '2022-06-30', fechaVencimiento: '2027-06-30', institucion: 'DIMAR', vigente: true },
      ],
      historialSalidasMes: editingTrip?.historialSalidasMes || 0,
      horasNavegadasMes: editingTrip?.horasNavegadasMes || 0,
      tipoContrato: editingTrip?.tipoContrato || 'PRESTACION_SERVICIOS',
      estado: editingTrip?.estado || 'ACTIVO',
    };

    if (onSaveTripulante) {
      await onSaveTripulante(newTripulante);
    }
    setShowModal(false);
  };

  const filteredCrew = tripulacion.filter((t) => {
    // Role filter
    if (selectedRole === 'PILOTO' && !t.cargo.includes('PILOTO') && !t.cargo.includes('CAPITAN')) {
      return false;
    }
    if (selectedRole === 'MARINERO' && !t.cargo.includes('MARINERO') && !t.cargo.includes('AYUDANTE')) {
      return false;
    }
    if (selectedRole === 'ADMIN_HOST' && (t.cargo.includes('PILOTO') || t.cargo === 'AYUDANTE_MARINERO')) {
      return false;
    }

    // Company filter
    if (filterEmpresa !== 'TODAS' && t.empresaContratanteId !== filterEmpresa) {
      return false;
    }

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        t.nombreCompleto.toLowerCase().includes(term) ||
        t.documentoIdentidad.toLowerCase().includes(term) ||
        (t.licencia?.numero || '').toLowerCase().includes(term) ||
        (t.datosBancarios?.banco || '').toLowerCase().includes(term)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-500/30">
              Nómina &amp; Dotación Operacional • 29 Colaboradores Oficiales
            </span>
            <span className="text-slate-400 text-xs">Capitanía de Puerto CP05 • DIMAR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Gestión de Personal, Tripulación y Soportes Documentales
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Perfiles con empresa pagadora contratante fija, cuentas bancarias, licencias DIMAR, certificados Cendiatra y compresión WebP.
          </p>
        </div>

        {/* Action Button: Register New Crew */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Colaborador</span>
          </button>
        </div>
      </div>

      {/* Filters and search strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Buscar por nombre, cédula, licencia o banco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Empresa filter */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setFilterEmpresa('TODAS')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                filterEmpresa === 'TODAS'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas las Empresas ({tripulacion.length})
            </button>
            <button
              onClick={() => setFilterEmpresa('maria-del-puerto')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                filterEmpresa === 'maria-del-puerto'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              María del Puerto (4)
            </button>
            <button
              onClick={() => setFilterEmpresa('catamaranes-veleros')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                filterEmpresa === 'catamaranes-veleros'
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catamaranes y Veleros (25)
            </button>
          </div>
        </div>

        {/* Role filter buttons */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSelectedRole('TODOS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedRole === 'TODOS'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedRole('PILOTO')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedRole === 'PILOTO'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pilotos / Capitanes
          </button>
          <button
            onClick={() => setSelectedRole('MARINERO')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedRole === 'MARINERO'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Marineros
          </button>
          <button
            onClick={() => setSelectedRole('ADMIN_HOST')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedRole === 'ADMIN_HOST'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Staff / Host / Admin
          </button>
        </div>
      </div>

      {/* Crew Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCrew.map((crew) => {
          const isPilot = crew.cargo.includes('PILOTO') || crew.cargo.includes('CAPITAN');
          const isMariaDelPuerto = crew.empresaContratanteId === 'maria-del-puerto';
          const isLicenseExpiring = crew.licencia?.estado === 'POR_VENCER';

          return (
            <div
              key={crew.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              {/* Header card */}
              <div className="p-5 pb-4 space-y-4">
                {/* Paying Company Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                      isMariaDelPuerto
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                    {isMariaDelPuerto ? 'MARIA DEL PUERTO S.A.S.' : 'CATAMARANES Y VELEROS S.A.S.'}
                  </span>

                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    {crew.estado}
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  <img
                    src={crew.fotoUrl}
                    alt={crew.nombreCompleto}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPilot
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                      }`}
                    >
                      {crew.cargo.replace(/_/g, ' ')}
                    </span>

                    <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">
                      {crew.nombreCompleto}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {crew.documentoIdentidad}
                    </p>
                  </div>
                </div>

                {/* Bank Account Info Box */}
                {crew.datosBancarios && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">
                          {crew.datosBancarios.banco} ({crew.datosBancarios.tipoCuenta})
                        </span>
                        <span className="font-mono text-slate-600 text-[10px]">
                          No. {crew.datosBancarios.numeroCuenta || 'S/N'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                      Pago Quincenal
                    </span>
                  </div>
                )}

                {/* License Card */}
                {crew.licencia && crew.licencia.numero !== 'S/N' && (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      isLicenseExpiring
                        ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        Licencia DIMAR
                      </span>
                      {isLicenseExpiring ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded animate-pulse">
                          ⚠️ Por Vencer
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          ✓ {crew.licencia.estado}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-900">{crew.licencia.categoria}</div>
                    <div className="font-mono text-[11px] text-slate-600 flex items-center justify-between">
                      <span>No. {crew.licencia.numero}</span>
                      <span>Vence: <strong>{crew.licencia.fechaVencimiento}</strong></span>
                    </div>
                  </div>
                )}

                {/* Cendiatra & VHF Badges */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cendiatra</span>
                    <span className="font-bold text-slate-800">{crew.cendiatraExp || '2027-06-30'}</span>
                    <span className="text-[9px] text-emerald-700 block font-semibold">✓ Vigente</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Radio VHF</span>
                    <span className="font-bold text-slate-800">{crew.vhfExp || '2027-12-31'}</span>
                    <span className="text-[9px] text-blue-700 block font-semibold">✓ Operador</span>
                  </div>
                </div>

                {/* Soportes cargados (CC, Licencia, Cendiatra) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {crew.documentoIdentidadUrl && (
                    <a
                      href={crew.documentoIdentidadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1"
                    >
                      <FileText className="w-2.5 h-2.5" />
                      CC WebP
                    </a>
                  )}
                  {crew.licenciaUrl && (
                    <a
                      href={crew.licenciaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Licencia DIMAR
                    </a>
                  )}
                  {crew.cendiatraUrl && (
                    <a
                      href={crew.cendiatraUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 flex items-center gap-1"
                    >
                      <HeartPulse className="w-2.5 h-2.5" />
                      Cendiatra
                    </a>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowIdCard(crew)}
                    className="flex items-center gap-1 text-cyan-700 hover:text-cyan-900 font-bold cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Carné</span>
                  </button>
                  <button
                    onClick={() => setSelectedCrew(crew)}
                    className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    Detalles
                  </button>
                </div>

                <button
                  onClick={() => openEditModal(crew)}
                  className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Modificar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT COLLABORATOR MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingTrip ? 'Modificar Perfil de Colaborador' : 'Registrar Nuevo Colaborador en Nómina'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Alianza COBRANDING OPS • Almacenamiento y compresión WebP en Google Drive
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="mt-4 space-y-5 text-xs">
              {/* Sección 1: Datos Personales */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1 text-cyan-800">
                  <Users className="w-3.5 h-3.5" /> 1. Información Personal y Empresa Contratante
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={formNombre}
                      onChange={(e) => setFormNombre(e.target.value)}
                      placeholder="Ej: Gloria Patricia Amaris Madrid"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Cédula / Documento *</label>
                    <input
                      type="text"
                      required
                      value={formDocumento}
                      onChange={(e) => setFormDocumento(e.target.value)}
                      placeholder="Ej: CC 1.047.456.789"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Empresa Contratante Fija *</label>
                    <select
                      value={formEmpresaId}
                      onChange={(e) => setFormEmpresaId(e.target.value as any)}
                      className="w-full p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-bold"
                    >
                      <option value="catamaranes-veleros">CATAMARANES Y VELEROS S.A.S. (NIT 901.159.056-4)</option>
                      <option value="maria-del-puerto">MARIA DEL PUERTO S.A.S. (NIT 901.124.944-9)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Cargo Principal *</label>
                    <select
                      value={formCargo}
                      onChange={(e) => setFormCargo(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold"
                    >
                      <option value="PILOTO_CAPITAN">Piloto / Capitán</option>
                      <option value="AYUDANTE_MARINERO">Ayudante / Marinero</option>
                      <option value="PILOTO_Y_MARINERO">Multi-Rol (Piloto &amp; Marinero)</option>
                      <option value="HOST_ANFITRIONA">Host / Anfitriona</option>
                      <option value="DIRECTOR_OPERACIONES_DPA">Director de Operaciones / DPA</option>
                      <option value="EJECUTIVA_COMERCIAL">Ejecutiva Comercial</option>
                      <option value="BARMAN">Barman / Mesero</option>
                      <option value="ADMINISTRATIVO">Administrativo / Logística</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Teléfono Móvil</label>
                    <input
                      type="text"
                      value={formTelefono}
                      onChange={(e) => setFormTelefono(e.target.value)}
                      placeholder="Ej: 300 123 4567"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">EPS</label>
                    <input
                      type="text"
                      value={formEps}
                      onChange={(e) => setFormEps(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">ARL</label>
                    <input
                      type="text"
                      value={formArl}
                      onChange={(e) => setFormArl(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Datos Bancarios y Liquidación */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1 text-emerald-800">
                  <CreditCard className="w-3.5 h-3.5" /> 2. Datos Bancarios para Pago Quincenal de Servicios
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Entidad Bancaria</label>
                    <select
                      value={formBanco}
                      onChange={(e) => setFormBanco(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                    >
                      <option value="BANCOLOMBIA">BANCOLOMBIA</option>
                      <option value="NEQUI">NEQUI</option>
                      <option value="DAVIPLATA">DAVIPLATA</option>
                      <option value="DAVIVIENDA">DAVIVIENDA</option>
                      <option value="BANCO DE BOGOTA">BANCO DE BOGOTA</option>
                      <option value="BBVA">BBVA COLOMBIA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tipo de Cuenta</label>
                    <select
                      value={formTipoCuenta}
                      onChange={(e) => setFormTipoCuenta(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                    >
                      <option value="Ahorros">Cuenta de Ahorros</option>
                      <option value="Corriente">Cuenta Corriente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Número de Cuenta</label>
                    <input
                      type="text"
                      value={formNumeroCuenta}
                      onChange={(e) => setFormNumeroCuenta(e.target.value)}
                      placeholder="Ej: 67848616084"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Titular de Cuenta</label>
                    <input
                      type="text"
                      value={formTitular}
                      onChange={(e) => setFormTitular(e.target.value)}
                      placeholder={formNombre || 'Titular de la cuenta'}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Tarifas de Referencia */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1 text-blue-800">
                  <DollarSign className="w-3.5 h-3.5" /> 3. Tarifas de Referencia COP (Acuerdo Operativo)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-blue-50/40 p-3.5 rounded-xl border border-blue-200">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tarifa Full Day (COP)</label>
                    <input
                      type="number"
                      value={formTarifaFullDay}
                      onChange={(e) => setFormTarifaFullDay(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tarifa Sunset (COP)</label>
                    <input
                      type="number"
                      value={formTarifaSunset}
                      onChange={(e) => setFormTarifaSunset(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tarifa Mantenimiento (COP)</label>
                    <input
                      type="number"
                      value={formTarifaMantenimiento}
                      onChange={(e) => setFormTarifaMantenimiento(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 4: Licencias y Certificados */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1 text-indigo-800">
                  <Award className="w-3.5 h-3.5" /> 4. Licencia DIMAR, Certificado Cendiatra y Operador VHF
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">No. Licencia DIMAR</label>
                    <input
                      type="text"
                      value={formLicNumero}
                      onChange={(e) => setFormLicNumero(e.target.value)}
                      placeholder="Ej: 01-CP-05-XXXX"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Categoría DIMAR</label>
                    <input
                      type="text"
                      value={formLicCategoria}
                      onChange={(e) => setFormLicCategoria(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Vencimiento Licencia</label>
                    <input
                      type="date"
                      value={formLicVence}
                      onChange={(e) => setFormLicVence(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Vencimiento Cendiatra (Médico)</label>
                    <input
                      type="date"
                      value={formCendiatraVence}
                      onChange={(e) => setFormCendiatraVence(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Vencimiento Radio VHF</label>
                    <input
                      type="date"
                      value={formVhfVence}
                      onChange={(e) => setFormVhfVence(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 5: Subida de Archivos con Compresión WebP (Max 1080px) */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between text-cyan-800">
                  <span className="flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" /> 5. Cargar Soportes (Compresión Automática WebP 1080px)
                  </span>
                  <span className="text-[10px] bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded font-mono">
                    Google Drive Empresarial
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Foto Perfil */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <label className="block text-slate-700 font-bold text-[11px]">Foto del Colaborador</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'foto')}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                    />
                    {compressingField === 'foto' && (
                      <span className="text-[10px] text-cyan-700 font-semibold animate-pulse">Comprimiendo a WebP...</span>
                    )}
                    {formFotoUrl && (
                      <span className="text-[10px] text-emerald-700 font-semibold block truncate">✓ Foto cargada</span>
                    )}
                  </div>

                  {/* Documento Identidad CC */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <label className="block text-slate-700 font-bold text-[11px]">Cédula de Ciudadanía (CC)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'cc')}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                    />
                    {compressingField === 'cc' && (
                      <span className="text-[10px] text-cyan-700 font-semibold animate-pulse">Comprimiendo a WebP...</span>
                    )}
                    {formDocIdUrl && (
                      <span className="text-[10px] text-emerald-700 font-semibold block truncate">✓ Soporte CC listo</span>
                    )}
                  </div>

                  {/* Licencia DIMAR */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <label className="block text-slate-700 font-bold text-[11px]">Soporte Licencia DIMAR</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'licencia')}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                    />
                    {compressingField === 'licencia' && (
                      <span className="text-[10px] text-cyan-700 font-semibold animate-pulse">Comprimiendo a WebP...</span>
                    )}
                    {formLicenciaUrl && (
                      <span className="text-[10px] text-emerald-700 font-semibold block truncate">✓ Licencia lista</span>
                    )}
                  </div>

                  {/* Cendiatra */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <label className="block text-slate-700 font-bold text-[11px]">Certificado Médico Cendiatra</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'cendiatra')}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                    />
                    {compressingField === 'cendiatra' && (
                      <span className="text-[10px] text-cyan-700 font-semibold animate-pulse">Comprimiendo a WebP...</span>
                    )}
                    {formCendiatraUrl && (
                      <span className="text-[10px] text-emerald-700 font-semibold block truncate">✓ Cendiatra listo</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl shadow cursor-pointer transition-all active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingTrip ? 'Actualizar Colaborador' : 'Guardar Nuevo Colaborador'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedCrew && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCrew.fotoUrl}
                  alt={selectedCrew.nombreCompleto}
                  className="w-14 h-14 rounded-2xl object-cover border"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedCrew.nombreCompleto}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedCrew.cargo.replace(/_/g, ' ')} • Empresa: <strong>{selectedCrew.empresaContratanteNombre}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCrew(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Documento</span>
                  <strong className="text-slate-800">{selectedCrew.documentoIdentidad}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Teléfono</span>
                  <strong className="text-slate-800">{selectedCrew.telefono}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Empresa Contratante</span>
                  <strong className="text-slate-800">{selectedCrew.empresaContratanteNombre}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Banco</span>
                  <strong className="text-slate-800">{selectedCrew.datosBancarios?.banco} - {selectedCrew.datosBancarios?.tipoCuenta}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">No. de Cuenta</span>
                  <strong className="text-slate-800 font-mono">{selectedCrew.datosBancarios?.numeroCuenta}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Titular</span>
                  <strong className="text-slate-800">{selectedCrew.datosBancarios?.titular || selectedCrew.nombreCompleto}</strong>
                </div>
              </div>

              {/* Licencias & Cendiatra */}
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-blue-900 block text-[10px] uppercase font-semibold">Licencia DIMAR</span>
                  <strong className="text-slate-900">{selectedCrew.licencia?.numero || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-blue-900 block text-[10px] uppercase font-semibold">Categoría</span>
                  <strong className="text-slate-900">{selectedCrew.licencia?.categoria || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-blue-900 block text-[10px] uppercase font-semibold">Vencimiento Licencia</span>
                  <strong className="text-slate-900">{selectedCrew.licencia?.fechaVencimiento || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-blue-900 block text-[10px] uppercase font-semibold">Vence Cendiatra</span>
                  <strong className="text-slate-900">{selectedCrew.cendiatraExp || '2027-06-30'}</strong>
                </div>
                <div>
                  <span className="text-blue-900 block text-[10px] uppercase font-semibold">Vence VHF</span>
                  <strong className="text-slate-900">{selectedCrew.vhfExp || '2027-12-31'}</strong>
                </div>
                <div>
                  <span className="text-blue-900 block text-[10px] uppercase font-semibold">Tipo de Contrato</span>
                  <strong className="text-slate-900">{selectedCrew.tipoContrato?.replace(/_/g, ' ') || 'PRESTACION SERVICIOS'}</strong>
                </div>
              </div>

              {/* Tarifas de referencia */}
              {selectedCrew.tarifasReferencia && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">
                    Tarifas Acordadas por Sesión:
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Full Day</span>
                      <strong className="text-emerald-700">${Number(selectedCrew.tarifasReferencia.fullDay || 0).toLocaleString('es-CO')} COP</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Sunset</span>
                      <strong className="text-emerald-700">${Number(selectedCrew.tarifasReferencia.sunset || 0).toLocaleString('es-CO')} COP</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Mantenimiento</span>
                      <strong className="text-emerald-700">${Number(selectedCrew.tarifasReferencia.mantenimiento || 0).toLocaleString('es-CO')} COP</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedCrew(null);
                  openEditModal(selectedCrew);
                }}
                className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modificar Datos</span>
              </button>
              <button
                onClick={() => setSelectedCrew(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL CREW ID CARD MODAL */}
      {showIdCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 border-b border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                  RENET • Carné de Tripulación
                </span>
                <h3 className="font-bold text-sm text-white">Credencial de Seguridad Náutica</h3>
              </div>
              <button
                onClick={() => setShowIdCard(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-center space-y-3 bg-gradient-to-b from-white to-slate-50">
              <img
                src={showIdCard.fotoUrl}
                alt={showIdCard.nombreCompleto}
                className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-cyan-500 shadow-md"
              />
              <div>
                <h4 className="font-extrabold text-base text-slate-900">{showIdCard.nombreCompleto}</h4>
                <p className="text-xs font-semibold text-cyan-700 uppercase">{showIdCard.cargo.replace(/_/g, ' ')}</p>
                <p className="text-[11px] font-mono text-slate-500">{showIdCard.documentoIdentidad}</p>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border mt-1 inline-block">
                  {showIdCard.empresaContratanteNombre}
                </span>
              </div>

              <div className="pt-1">
                <QRCodeView
                  value={`https://renet.com.co/verificar-tripulante?lic=${showIdCard.licencia?.numero || 'SN'}&doc=${showIdCard.documentoIdentidad}&dimar=CP05`}
                  size={120}
                  className="mx-auto"
                />
              </div>

              <div className="text-[10px] text-slate-500">
                Licencia: <strong>{showIdCard.licencia?.numero || 'S/N'}</strong> (Vence: {showIdCard.licencia?.fechaVencimiento || 'N/A'})
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Credencial</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
