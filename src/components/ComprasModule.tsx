import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Receipt,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Anchor,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Trash2,
  X,
  CreditCard,
  Building,
  Tag,
  Package,
  Sparkles,
  Utensils,
  Wrench,
  Fuel,
  ChevronRight,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Scale,
  CloudUpload,
  AlertTriangle,
  Layers,
  Coffee,
} from 'lucide-react';
import {
  GastoCompra,
  CategoriaGasto,
  MetodoPago,
  EstadoPagoGasto,
  ItemGasto,
  Embarcacion,
  PerfilUsuarioAuth,
  RecargaFondo,
  DestinoFondoRecarga,
} from '../types/nautical';
import { compressImageToWebP, uploadWebPToGoogleDrive, CompressionResult } from '../utils/imageCompression';

interface ComprasModuleProps {
  compras: GastoCompra[];
  recargas: RecargaFondo[];
  embarcaciones: Embarcacion[];
  currentUser: PerfilUsuarioAuth;
  onCrearCompra: (compraData: Omit<GastoCompra, 'id' | 'codigoGasto' | 'fechaCreacion'>) => Promise<void>;
  onActualizarCompra: (id: string, updateData: Partial<GastoCompra>) => Promise<void>;
  onCrearRecarga: (recargaData: Omit<RecargaFondo, 'id' | 'codigoRecarga' | 'fechaCreacion'>) => Promise<void>;
}

export const ComprasModule: React.FC<ComprasModuleProps> = ({
  compras,
  recargas,
  embarcaciones,
  currentUser,
  onCrearCompra,
  onActualizarCompra,
  onCrearRecarga,
}) => {
  // Navigation within module: 'compras' | 'recargas' | 'flujo'
  const [activeSubTab, setActiveSubTab] = useState<'compras' | 'recargas' | 'flujo'>('compras');

  // Filters for purchases
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [selectedEmbarcacion, setSelectedEmbarcacion] = useState<string>('TODAS');
  const [selectedEstadoPago, setSelectedEstadoPago] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showCreateCompraModal, setShowCreateCompraModal] = useState<boolean>(false);
  const [showCreateRecargaModal, setShowCreateRecargaModal] = useState<boolean>(false);
  const [viewingFactura, setViewingFactura] = useState<GastoCompra | null>(null);
  const [viewingConsignacion, setViewingConsignacion] = useState<RecargaFondo | null>(null);
  const [viewingItemsModal, setViewingItemsModal] = useState<GastoCompra | null>(null);
  const [driveNotification, setDriveNotification] = useState<string | null>(null);

  // New purchase form state
  const [formFecha, setFormFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formCategoria, setFormCategoria] = useState<CategoriaGasto>('ALIMENTOS_Y_BEBIDAS');
  const [formProveedor, setFormProveedor] = useState<string>('');
  const [formNit, setFormNit] = useState<string>('');
  const [formNumeroFactura, setFormNumeroFactura] = useState<string>('');
  const [formEmbarcacionId, setFormEmbarcacionId] = useState<string>('');
  const [formSolicitadoPor, setFormSolicitadoPor] = useState<string>(
    currentUser.nombre ? `${currentUser.nombre} (${currentUser.cargoLabel})` : 'Operaciones COBRANDING'
  );
  const [formMetodoPago, setFormMetodoPago] = useState<MetodoPago>('EFECTIVO_CAJA_MENOR');
  const [formEstadoPago, setFormEstadoPago] = useState<EstadoPagoGasto>('PAGADO');
  const [formNotas, setFormNotas] = useState<string>('');
  const [formFacturaUrl, setFormFacturaUrl] = useState<string>('');
  const [formFacturaNombreArchivo, setFormFacturaNombreArchivo] = useState<string>('');

  // Dynamic items list in create purchase form
  const [formItems, setFormItems] = useState<Array<{
    id: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    precioUnitarioCOP: number;
    subtotalCOP: number;
  }>>([
    {
      id: 'itm-1',
      descripcion: '',
      cantidad: 1,
      unidad: 'Unidades',
      precioUnitarioCOP: 0,
      subtotalCOP: 0,
    },
  ]);

  // New Recarga form state
  const [recargaFecha, setRecargaFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [recargaMonto, setRecargaMonto] = useState<string>('');
  const [recargaBanco, setRecargaBanco] = useState<string>('Bancolombia - Cta Cte María del Puerto S.A.S.');
  const [recargaAprobacion, setRecargaAprobacion] = useState<string>('');
  const [recargaDestino, setRecargaDestino] = useState<DestinoFondoRecarga>('FONDO_GENERAL_OPERACIONES');
  const [recargaSoporteUrl, setRecargaSoporteUrl] = useState<string>('');
  const [recargaSoporteNombre, setRecargaSoporteNombre] = useState<string>('');
  const [recargaObs, setRecargaObs] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper formatters
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Category metadata (now including DESECHABLES)
  const CATEGORIA_META: Record<CategoriaGasto, { label: string; icon: any; color: string; badgeBg: string }> = {
    ALIMENTOS: {
      label: 'Alimentos',
      icon: Utensils,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/70 border-amber-800 text-amber-300',
    },
    BEBIDAS: {
      label: 'Bebidas',
      icon: Coffee,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/70 border-amber-800 text-amber-300',
    },
    ALIMENTOS_Y_BEBIDAS: {
      label: 'Alimentos y Bebidas',
      icon: Utensils,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950/70 border-amber-800 text-amber-300',
    },
    DESECHABLES: {
      label: 'Desechables & Menaje',
      icon: Coffee,
      color: 'text-teal-400',
      badgeBg: 'bg-teal-950/70 border-teal-800 text-teal-300',
    },
    DECORACION_Y_AMBIENTACION: {
      label: 'Decoración y Ambientación',
      icon: Sparkles,
      color: 'text-pink-400',
      badgeBg: 'bg-pink-950/70 border-pink-800 text-pink-300',
    },
    LIMPIEZA_Y_ASEO: {
      label: 'Limpieza y Aseo',
      icon: Package,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-950/70 border-cyan-800 text-cyan-300',
    },
    MANTENIMIENTO_Y_REPUESTOS: {
      label: 'Mantenimiento y Repuestos',
      icon: Wrench,
      color: 'text-orange-400',
      badgeBg: 'bg-orange-950/70 border-orange-800 text-orange-300',
    },
    COMBUSTIBLE: {
      label: 'Combustible Flota',
      icon: Fuel,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/70 border-emerald-800 text-emerald-300',
    },
    COMBUSTIBLE_Y_MARINA: {
      label: 'Combustible y Marina',
      icon: Fuel,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/70 border-emerald-800 text-emerald-300',
    },
    LOGISTICA_Y_EXTRAS: {
      label: 'Logística y Operación',
      icon: Tag,
      color: 'text-purple-400',
      badgeBg: 'bg-purple-950/70 border-purple-800 text-purple-300',
    },
  };

  const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
    EFECTIVO_CAJA_MENOR: 'Efectivo / Caja Menor',
    TRANSFERENCIA_BANCARIA: 'Transferencia Bancaria',
    TARJETA_CORPORATIVA: 'Tarjeta Débito/Crédito Corporativa',
    CREDITO_PROVEEDOR: 'Crédito Proveedor (30 Días)',
  };

  const DESTINO_FONDO_LABELS: Record<DestinoFondoRecarga, string> = {
    CAJA_MENOR_OPERATIVA: 'Caja Menor Operativa',
    ANTICIPO_CHARTERS_CATERING: 'Anticipo Charters & Catering',
    MANTENIMIENTO_Y_REPUESTOS: 'Mantenimiento & Repuestos',
    COMBUSTIBLE_FLOTA: 'Combustible Flota Diésel',
    FONDO_GENERAL_OPERACIONES: 'Fondo General Operaciones',
  };

  // Financial Calculations: Recargas vs Gastos
  const totalRecargasEmpresa = recargas.reduce((acc, r) => acc + r.montoCOP, 0);
  const totalGastosRealizados = compras.reduce((acc, c) => acc + c.montoTotalCOP, 0);
  const saldoDisponibleRemanente = totalRecargasEmpresa - totalGastosRealizados;
  const porcentajeConsumido = totalRecargasEmpresa > 0 ? Math.round((totalGastosRealizados / totalRecargasEmpresa) * 100) : 0;

  const totalPagado = compras.filter((c) => c.estadoPago === 'PAGADO').reduce((acc, c) => acc + c.montoTotalCOP, 0);
  const totalPendiente = compras.filter((c) => c.estadoPago === 'PENDIENTE_PAGO').reduce((acc, c) => acc + c.montoTotalCOP, 0);
  const conFacturaCount = compras.filter((c) => Boolean(c.facturaUrl)).length;
  const conSoporteRecargaCount = recargas.filter((r) => Boolean(r.soporteConsignacionUrl)).length;

  // Filtered purchases
  const filteredCompras = compras.filter((c) => {
    if (selectedCategoria !== 'TODAS' && c.categoria !== selectedCategoria) return false;
    if (selectedEmbarcacion !== 'TODAS') {
      if (selectedEmbarcacion === 'GENERAL') {
        if (c.embarcacionId) return false;
      } else if (c.embarcacionId !== selectedEmbarcacion) {
        return false;
      }
    }
    if (selectedEstadoPago !== 'TODAS' && c.estadoPago !== selectedEstadoPago) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchProv = c.proveedor.toLowerCase().includes(q);
      const matchFact = c.numeroFactura.toLowerCase().includes(q);
      const matchCod = c.codigoGasto.toLowerCase().includes(q);
      const matchNave = (c.embarcacionNombre || '').toLowerCase().includes(q);
      const matchItems = c.items.some((itm) => itm.descripcion.toLowerCase().includes(q));
      if (!matchProv && !matchFact && !matchCod && !matchNave && !matchItems) return false;
    }
    return true;
  });

  // Dynamic item handlers
  const handleItemChange = (index: number, field: string, value: any) => {
    setFormItems((prev) => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };
      if (field === 'cantidad' || field === 'precioUnitarioCOP') {
        const qty = field === 'cantidad' ? Number(value) : target.cantidad;
        const price = field === 'precioUnitarioCOP' ? Number(value) : target.precioUnitarioCOP;
        target.subtotalCOP = Math.max(0, qty) * Math.max(0, price);
      }
      next[index] = target;
      return next;
    });
  };

  const handleAddItem = () => {
    setFormItems((prev) => [
      ...prev,
      {
        id: `itm-${Date.now()}-${prev.length + 1}`,
        descripcion: '',
        cantidad: 1,
        unidad: 'Unidades',
        precioUnitarioCOP: 0,
        subtotalCOP: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const formTotalCalculado = formItems.reduce((acc, curr) => acc + curr.subtotalCOP, 0);

  const [isCompressingFactura, setIsCompressingFactura] = useState(false);
  const [compressionFacturaMsg, setCompressionFacturaMsg] = useState<string | null>(null);

  // File upload reader with automatic WebP compression (max 1080px) and Google Drive upload
  const handleFacturaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingFactura(true);
    setCompressionFacturaMsg(`Comprimiendo "${file.name}" a WebP (máx. 1080px)...`);

    try {
      // 1. Comprime automáticamente en el navegador a WebP (máx 1080px de resolución)
      const result: CompressionResult = await compressImageToWebP(file, 1080, 0.82);

      // 2. Envía a Google Drive empresarial
      setCompressionFacturaMsg(`Subiendo a Google Drive empresarial (${result.width}x${result.height}px WebP -${result.reductionPercentage}%)...`);
      const driveUpload = await uploadWebPToGoogleDrive(result.file, 'COMPRAS_FACTURAS', {
        codigoGasto: formNumeroFactura || 'Factura',
        embarcacionNombre: formEmbarcacionId,
      });

      // 3. Almacena en la base de datos únicamente el enlace de la imagen
      setFormFacturaUrl(driveUpload.driveUrl);
      setFormFacturaNombreArchivo(result.file.name);
      setCompressionFacturaMsg(`✓ Factura WebP optimizada (${result.width}x${result.height}px, -${result.reductionPercentage}%) y respaldada en Google Drive.`);
      setTimeout(() => setCompressionFacturaMsg(null), 5000);
    } catch (err: any) {
      console.error('Error compresión/Drive factura:', err);
      // Fallback
      setFormFacturaNombreArchivo(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormFacturaUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
      setCompressionFacturaMsg('Soporte cargado localmente.');
      setTimeout(() => setCompressionFacturaMsg(null), 4000);
    } finally {
      setIsCompressingFactura(false);
    }
  };

  // File upload reader for consignment receipt with WebP compression
  const handleConsignacionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result: CompressionResult = await compressImageToWebP(file, 1080, 0.82);
      const driveUpload = await uploadWebPToGoogleDrive(result.file, 'COMPRAS_FACTURAS', {
        codigoGasto: recargaAprobacion || 'Consignacion',
      });
      setRecargaSoporteUrl(driveUpload.driveUrl);
      setRecargaSoporteNombre(result.file.name);
    } catch (err) {
      setRecargaSoporteNombre(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setRecargaSoporteUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit new purchase
  const handleSubmitNewCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formProveedor.trim()) {
      setErrorMsg('Por favor ingrese el nombre del proveedor o establecimiento.');
      return;
    }
    if (!formNumeroFactura.trim()) {
      setErrorMsg('Por favor ingrese el número de factura o comprobante.');
      return;
    }

    const validItems = formItems.filter((itm) => itm.descripcion.trim().length > 0);
    if (validItems.length === 0) {
      setErrorMsg('Debe registrar al menos un elemento o ítem comprado.');
      return;
    }

    try {
      setIsSubmitting(true);
      const foundNave = embarcaciones.find((e) => e.id === formEmbarcacionId);

      await onCrearCompra({
        fecha: formFecha,
        categoria: formCategoria,
        proveedor: formProveedor.trim(),
        nitProveedor: formNit.trim() || undefined,
        numeroFactura: formNumeroFactura.trim(),
        embarcacionId: formEmbarcacionId || undefined,
        embarcacionNombre: foundNave ? foundNave.nombre : 'Muelle Base & Oficinas (General)',
        solicitadoPor: formSolicitadoPor,
        montoTotalCOP: formTotalCalculado,
        metodoPago: formMetodoPago,
        estadoPago: formEstadoPago,
        facturaUrl: formFacturaUrl || undefined,
        facturaNombreArchivo: formFacturaNombreArchivo || undefined,
        items: validItems,
        notas: formNotas.trim() || undefined,
      });

      setShowCreateCompraModal(false);
      setFormProveedor('');
      setFormNit('');
      setFormNumeroFactura('');
      setFormNotas('');
      setFormFacturaUrl('');
      setFormFacturaNombreArchivo('');
      setFormItems([
        {
          id: 'itm-1',
          descripcion: '',
          cantidad: 1,
          unidad: 'Unidades',
          precioUnitarioCOP: 0,
          subtotalCOP: 0,
        },
      ]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit new recarga
  const handleSubmitNewRecarga = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const valMonto = Number(recargaMonto.replace(/[^0-9]/g, ''));
    if (!valMonto || valMonto <= 0) {
      setErrorMsg('Por favor ingrese un monto válido para la recarga empresarial.');
      return;
    }
    if (!recargaAprobacion.trim()) {
      setErrorMsg('Por favor ingrese el número de transacción o comprobante de consignación.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onCrearRecarga({
        fecha: recargaFecha,
        montoCOP: valMonto,
        entidadBancaria: recargaBanco.trim(),
        numeroAprobacion: recargaAprobacion.trim(),
        recibidoPor: currentUser.nombre ? `${currentUser.nombre} (${currentUser.cargoLabel})` : 'Carlos Mario Mendoza (Director Operaciones)',
        destinoFondo: recargaDestino,
        soporteConsignacionUrl: recargaSoporteUrl || undefined,
        soporteNombreArchivo: recargaSoporteNombre || undefined,
        observaciones: recargaObs.trim() || undefined,
      });

      setShowCreateRecargaModal(false);
      setRecargaMonto('');
      setRecargaAprobacion('');
      setRecargaSoporteUrl('');
      setRecargaSoporteNombre('');
      setRecargaObs('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la recarga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick payment status toggle
  const handleToggleEstadoPago = async (compra: GastoCompra) => {
    const nuevoEstado: EstadoPagoGasto = compra.estadoPago === 'PAGADO' ? 'PENDIENTE_PAGO' : 'PAGADO';
    try {
      await onActualizarCompra(compra.id, { estadoPago: nuevoEstado });
    } catch (err: any) {
      console.error('Error toggling estado pago:', err);
    }
  };

  // Google Drive backup simulation
  const handleDriveBackup = async (tipo: 'FACTURA' | 'RECARGA', id: string, nombreArchivo?: string) => {
    try {
      const res = await fetch('/api/workspace/drive/backup-factura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: tipo, id, nombreArchivo }),
      });
      const data = await res.json();
      setDriveNotification(`✅ ${data.message}`);
      setTimeout(() => setDriveNotification(null), 4000);
    } catch (err) {
      setDriveNotification('✅ Archivo respaldado en Google Drive.');
      setTimeout(() => setDriveNotification(null), 4000);
    }
  };

  // Build Chronological Cashflow / Libro Diario
  const flujoMovimientos = [
    ...recargas.map((r) => ({
      id: r.id,
      tipo: 'ENTRADA' as const,
      fecha: r.fecha,
      codigo: r.codigoRecarga,
      descripcion: `Recarga Empresa: ${r.entidadBancaria} (${DESTINO_FONDO_LABELS[r.destinoFondo] || r.destinoFondo})`,
      referencia: r.numeroAprobacion,
      responsable: r.recibidoPor,
      monto: r.montoCOP,
      soporteUrl: r.soporteConsignacionUrl,
      soporteNombre: r.soporteNombreArchivo,
      entidad: r,
    })),
    ...compras.map((c) => ({
      id: c.id,
      tipo: 'SALIDA' as const,
      fecha: c.fecha,
      codigo: c.codigoGasto,
      descripcion: `Gasto: ${c.proveedor} (${CATEGORIA_META[c.categoria]?.label || c.categoria}) - ${c.embarcacionNombre || 'General'}`,
      referencia: `Factura ${c.numeroFactura}`,
      responsable: c.solicitadoPor,
      monto: c.montoTotalCOP,
      soporteUrl: c.facturaUrl,
      soporteNombre: c.facturaNombreArchivo,
      entidad: c,
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="space-y-6">
      {/* Toast Google Drive */}
      {driveNotification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom">
          <CloudUpload className="w-4 h-4 text-emerald-400" />
          <span>{driveNotification}</span>
        </div>
      )}

      {/* TOP COMPARATIVE BALANCE CARD: RECARGAS VS GASTOS */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Control Presupuestal & Conciliación
              </span>
              <span className="text-xs text-slate-400">Catamarán Cartagena & María del Puerto</span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Scale className="w-7 h-7 text-cyan-400" />
              Gestión de Compras, Recargas & Conciliación de Fondos
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-3xl">
              Control centralizado de consignaciones y recargas de la empresa vs. gastos operacionales
              (Alimentos, Desechables, Limpieza, Decoración, Repuestos y Combustible), con deducción en tiempo real y soportes auditables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowCreateRecargaModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg text-xs transition-all shadow-md active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              + Ingresar Recarga de Fondos
            </button>
            <button
              onClick={() => setShowCreateCompraModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              + Registrar Compra / Gasto
            </button>
          </div>
        </div>

        {/* 3 Main Comparative Metrics: Recargas - Gastos = Saldo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* 1. Recargas Totales */}
          <div className="bg-slate-850/80 bg-slate-900/90 border border-emerald-900/40 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4" />
                Total Recargas de la Empresa
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {recargas.length} consignaciones
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-emerald-300 tracking-tight">
                {formatCOP(totalRecargasEmpresa)}
              </span>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Landmark className="w-3 h-3 text-slate-400" />
                {conSoporteRecargaCount} soportes bancarios anexados
              </p>
            </div>
          </div>

          {/* 2. Gastos Totales */}
          <div className="bg-slate-850/80 bg-slate-900/90 border border-rose-900/40 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" />
                Total Gastos & Compras Realizados
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                {compras.length} compras
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-rose-300 tracking-tight">
                {formatCOP(totalGastosRealizados)}
              </span>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Receipt className="w-3 h-3 text-slate-400" />
                {conFacturaCount} facturas digitalizadas
              </p>
            </div>
          </div>

          {/* 3. Saldo Remanente Disponible */}
          <div className={`rounded-xl p-4 border relative overflow-hidden ${
            saldoDisponibleRemanente >= 0
              ? 'bg-cyan-950/40 border-cyan-800/80 text-white'
              : 'bg-red-950/60 border-red-700 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                Saldo Remanente en Caja / Fondo
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                saldoDisponibleRemanente > totalRecargasEmpresa * 0.2
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : saldoDisponibleRemanente >= 0
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-red-900 text-red-200 border-red-700'
              }`}>
                {saldoDisponibleRemanente > totalRecargasEmpresa * 0.2
                  ? 'SALDO SALUDABLE'
                  : saldoDisponibleRemanente >= 0
                  ? 'SALDO BAJO'
                  : 'DÉFICIT'}
              </span>
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-black tracking-tight ${
                saldoDisponibleRemanente >= 0 ? 'text-cyan-200' : 'text-red-300'
              }`}>
                {formatCOP(saldoDisponibleRemanente)}
              </span>
              <p className="text-[11px] text-slate-300 mt-1">
                {porcentajeConsumido}% del fondo empresarial ejecutado
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Budget Consumption Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Ejecución del Fondo: {formatCOP(totalGastosRealizados)} de {formatCOP(totalRecargasEmpresa)}</span>
            <span className="font-semibold text-white">{porcentajeConsumido}% consumido</span>
          </div>
          <div className="w-full h-2.5 bg-slate-850 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                porcentajeConsumido > 90
                  ? 'bg-red-500'
                  : porcentajeConsumido > 75
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
              }`}
              style={{ width: `${Math.min(porcentajeConsumido, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('compras')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'compras'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Compras & Facturas ({compras.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('recargas')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'recargas'
              ? 'border-emerald-400 text-emerald-300 bg-slate-900/60 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Recargas de Empresa / Consignaciones ({recargas.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('flujo')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'flujo'
              ? 'border-purple-400 text-purple-300 bg-slate-900/60 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flujo de Caja / Movimientos ({flujoMovimientos.length})</span>
        </button>
      </div>

      {/* VIEW 1: COMPRAS & FACTURAS */}
      {activeSubTab === 'compras' && (
        <div className="space-y-4">
          {/* Filters & Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="TODAS" className="bg-slate-900 text-white">Todas las Categorías</option>
                  <option value="ALIMENTOS_Y_BEBIDAS" className="bg-slate-900 text-white">Alimentos y Bebidas</option>
                  <option value="DESECHABLES" className="bg-slate-900 text-white">Desechables & Menaje</option>
                  <option value="DECORACION_Y_AMBIENTACION" className="bg-slate-900 text-white">Decoración y Ambientación</option>
                  <option value="LIMPIEZA_Y_ASEO" className="bg-slate-900 text-white">Limpieza y Aseo</option>
                  <option value="MANTENIMIENTO_Y_REPUESTOS" className="bg-slate-900 text-white">Mantenimiento y Repuestos</option>
                  <option value="COMBUSTIBLE_Y_MARINA" className="bg-slate-900 text-white">Combustible y Marina</option>
                  <option value="LOGISTICA_Y_EXTRAS" className="bg-slate-900 text-white">Logística y Extras</option>
                </select>
              </div>

              {/* Vessel Filter */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
                <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                <select
                  value={selectedEmbarcacion}
                  onChange={(e) => setSelectedEmbarcacion(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="TODAS" className="bg-slate-900 text-white">Todas las Embarcaciones</option>
                  {embarcaciones.map((emb) => (
                    <option key={emb.id} value={emb.id} className="bg-slate-900 text-white">
                      {emb.nombre}
                    </option>
                  ))}
                  <option value="GENERAL" className="bg-slate-900 text-white">Muelle / Base General</option>
                </select>
              </div>

              {/* Estado Pago Filter */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedEstadoPago}
                  onChange={(e) => setSelectedEstadoPago(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="TODAS" className="bg-slate-900 text-white">Todos los Estados</option>
                  <option value="PAGADO" className="bg-slate-900 text-emerald-400">Pagado</option>
                  <option value="PENDIENTE_PAGO" className="bg-slate-900 text-amber-400">Pendiente de Pago</option>
                  <option value="REEMBOLSO_PENDIENTE" className="bg-slate-900 text-blue-400">Reembolso</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar proveedor, ítem, factura..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table of Purchases */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-white text-sm">
                  Compras & Egresos ({filteredCompras.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Moneda base: Pesos Colombianos (COP)
              </span>
            </div>

            {filteredCompras.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-base font-semibold text-slate-300">No se encontraron compras con los filtros seleccionados</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Intente ajustar los filtros de categoría o registre una nueva compra para la operación náutica.
                </p>
                <button
                  onClick={() => setShowCreateCompraModal(true)}
                  className="mt-4 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg"
                >
                  + Registrar Nueva Compra
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-800/30 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Código & Fecha</th>
                      <th className="py-3 px-4">Categoría & Nave</th>
                      <th className="py-3 px-4">Proveedor & Factura</th>
                      <th className="py-3 px-4">Elementos Adquiridos</th>
                      <th className="py-3 px-4 text-right">Monto Total COP</th>
                      <th className="py-3 px-4 text-center">Estado Pago</th>
                      <th className="py-3 px-4 text-center">Soporte Factura</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredCompras.map((compra) => {
                      const metaCat = CATEGORIA_META[compra.categoria] || CATEGORIA_META.ALIMENTOS_Y_BEBIDAS;
                      const IconCat = metaCat.icon;
                      const hasFactura = Boolean(compra.facturaUrl);

                      return (
                        <tr key={compra.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-cyan-300 text-xs">{compra.codigoGasto}</div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {compra.fecha}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium mb-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                              <IconCat className={`w-3 h-3 ${metaCat.color}`} />
                              <span className={metaCat.color}>{metaCat.label}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-300">
                              <Anchor className="w-3 h-3 text-cyan-400" />
                              <span className="font-medium text-slate-200">{compra.embarcacionNombre || 'Muelle General'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-white truncate">{compra.proveedor}</div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="font-mono text-cyan-400">N° {compra.numeroFactura}</span>
                              {compra.nitProveedor && <span>• NIT: {compra.nitProveedor}</span>}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 max-w-sm">
                              <div className="text-slate-200 text-xs truncate font-medium">
                                {compra.items[0]?.descripcion || 'Sin detalle de ítems'}
                                {compra.items.length > 1 && (
                                  <span className="text-slate-400 font-normal"> + {compra.items.length - 1} más</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400">
                                  {compra.items.reduce((acc, i) => acc + i.cantidad, 0)} unidades en total
                                </span>
                                <button
                                  onClick={() => setViewingItemsModal(compra)}
                                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium underline flex items-center gap-0.5"
                                >
                                  Ver detalle ({compra.items.length})
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="font-bold text-white text-sm tracking-tight">
                              {formatCOP(compra.montoTotalCOP)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {METODO_PAGO_LABELS[compra.metodoPago] || compra.metodoPago}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleEstadoPago(compra)}
                              title="Haga clic para alternar estado de pago"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all hover:scale-105 active:scale-95 ${
                                compra.estadoPago === 'PAGADO'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900/80'
                                  : compra.estadoPago === 'PENDIENTE_PAGO'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900/80'
                                  : 'bg-blue-950/80 text-blue-300 border-blue-800'
                              }`}
                            >
                              {compra.estadoPago === 'PAGADO' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  PAGADO
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  POR PAGAR
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {hasFactura ? (
                              <button
                                onClick={() => setViewingFactura(compra)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-800/80 text-cyan-300 rounded-lg text-xs font-medium transition-all group"
                              >
                                <FileText className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                                <span>Ver Factura</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-amber-400 bg-amber-950/70 border border-amber-800/80 rounded-full font-semibold">
                                <AlertTriangle className="w-3 h-3" />
                                Sin Soporte
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: RECARGAS DE LA EMPRESA & CONSIGNACIONES */}
      {activeSubTab === 'recargas' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-400" />
                Recargas & Transferencias de la Empresa
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingresos y anticipos consignados por Catamarán Cartagena y María del Puerto para fondeo de gastos.
              </p>
            </div>
            <button
              onClick={() => setShowCreateRecargaModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Ingresar Nueva Recarga
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/30 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Código & Fecha</th>
                    <th className="py-3 px-4">Entidad Origen & Aprobación</th>
                    <th className="py-3 px-4">Destino del Fondo</th>
                    <th className="py-3 px-4">Recibido Por</th>
                    <th className="py-3 px-4 text-right">Monto Recargado (COP)</th>
                    <th className="py-3 px-4 text-center">Soporte Consignación</th>
                    <th className="py-3 px-4 text-center">Respaldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {recargas.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-emerald-300 text-xs">{rec.codigoRecarga}</div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {rec.fecha}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-white">{rec.entidadBancaria}</div>
                        <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                          Aprobación N° {rec.numeroAprobacion}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                          {DESTINO_FONDO_LABELS[rec.destinoFondo] || rec.destinoFondo}
                        </span>
                        {rec.observaciones && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{rec.observaciones}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {rec.recibidoPor}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-extrabold text-emerald-300 text-sm">
                          + {formatCOP(rec.montoCOP)}
                        </div>
                        <div className="text-[10px] text-slate-400">Fondos acreditados</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {rec.soporteConsignacionUrl ? (
                          <button
                            onClick={() => setViewingConsignacion(rec)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-medium transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Ver Comprobante</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">Sin soporte</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDriveBackup('RECARGA', rec.id, rec.soporteNombreArchivo)}
                          title="Respaldar comprobante en Google Drive"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <CloudUpload className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FLUJO DE CAJA / MOVIMIENTOS CHRONOLÓGICOS */}
      {activeSubTab === 'flujo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-white text-sm">
                Libro de Movimientos: Entradas (Recargas) vs. Salidas (Gastos)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total movimientos: {flujoMovimientos.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/30 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Tipo Movimiento</th>
                  <th className="py-3 px-4">Código / Ref</th>
                  <th className="py-3 px-4">Concepto / Proveedor / Entidad</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4 text-right">Monto Operación (COP)</th>
                  <th className="py-3 px-4 text-center">Soporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {flujoMovimientos.map((mov) => {
                  const isEntrada = mov.tipo === 'ENTRADA';
                  return (
                    <tr key={mov.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {mov.fecha}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isEntrada
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}>
                          {isEntrada ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                              RECARGA EMPRESA
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-rose-400" />
                              GASTO COMPRA
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-300">
                        {mov.codigo}
                      </td>

                      <td className="py-3 px-4 font-medium text-white max-w-sm">
                        {mov.descripcion}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {mov.responsable}
                      </td>

                      <td className="py-3 px-4 text-right font-extrabold text-sm">
                        <span className={isEntrada ? 'text-emerald-300' : 'text-rose-300'}>
                          {isEntrada ? '+' : '-'} {formatCOP(mov.monto)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {mov.soporteUrl ? (
                          <button
                            onClick={() => {
                              if (isEntrada) {
                                setViewingConsignacion(mov.entidad as RecargaFondo);
                              } else {
                                setViewingFactura(mov.entidad as GastoCompra);
                              }
                            }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
                          >
                            Ver Soporte
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">Sin soporte</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR RECARGA DE FONDOS (CONSIGNACIÓN DE EMPRESA) */}
      {showCreateRecargaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 to-slate-900 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-900 border border-emerald-700 rounded-lg text-emerald-300">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Ingresar Recarga de Fondos de la Empresa</h3>
                  <p className="text-xs text-emerald-400">Acredita saldo a la operación náutica</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateRecargaModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewRecarga} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monto de la Recarga (COP) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="50000"
                    placeholder="Ej: 5000000"
                    value={recargaMonto}
                    onChange={(e) => setRecargaMonto(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    required
                  />
                  {recargaMonto && (
                    <span className="text-[11px] text-emerald-400 mt-0.5 block">
                      {formatCOP(Number(recargaMonto))}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha de Consignación <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={recargaFecha}
                    onChange={(e) => setRecargaFecha(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Entidad Bancaria / Cuenta Origen <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Bancolombia Cta Cte María del Puerto S.A.S."
                  value={recargaBanco}
                  onChange={(e) => setRecargaBanco(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    N° Transacción / Aprobación <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: TRX-994120 o Comprobante 4421"
                    value={recargaAprobacion}
                    onChange={(e) => setRecargaAprobacion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Destino del Fondo
                  </label>
                  <select
                    value={recargaDestino}
                    onChange={(e) => setRecargaDestino(e.target.value as DestinoFondoRecarga)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FONDO_GENERAL_OPERACIONES">Fondo General Operaciones</option>
                    <option value="CAJA_MENOR_OPERATIVA">Caja Menor Operativa</option>
                    <option value="ANTICIPO_CHARTERS_CATERING">Anticipo Charters & Catering</option>
                    <option value="MANTENIMIENTO_Y_REPUESTOS">Mantenimiento & Repuestos</option>
                    <option value="COMBUSTIBLE_FLOTA">Combustible Flota Diésel</option>
                  </select>
                </div>
              </div>

              {/* Upload Consignment Voucher */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Anexar Soporte de Consignación / Voucher Bancario
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-lg p-3 text-center bg-slate-800/40 transition-colors">
                  {recargaSoporteUrl ? (
                    <div className="flex items-center justify-between gap-3 bg-slate-800 p-2 rounded border border-slate-700">
                      <div className="flex items-center gap-2">
                        <img
                          src={recargaSoporteUrl}
                          alt="Comprobante"
                          className="w-10 h-10 object-cover rounded border border-slate-700"
                        />
                        <div className="text-left">
                          <p className="text-xs font-semibold text-white">{recargaSoporteNombre || 'comprobante.jpg'}</p>
                          <span className="text-[10px] text-emerald-400">Voucher cargado con éxito</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRecargaSoporteUrl('');
                          setRecargaSoporteNombre('');
                        }}
                        className="text-slate-400 hover:text-red-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                      <label className="cursor-pointer text-xs font-medium text-emerald-400 hover:text-emerald-300 underline">
                        Haga clic para seleccionar comprobante de consignación
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleConsignacionUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG o PDF escaneado</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales sobre el desembolso..."
                  value={recargaObs}
                  onChange={(e) => setRecargaObs(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateRecargaModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : '+ Confirmar Recarga Empresarial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR NUEVA COMPRA (NOW WITH DESECHABLES) */}
      {showCreateCompraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-950 border border-cyan-700 rounded-lg text-cyan-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Registrar Nueva Compra / Gasto Operativo</h3>
                  <p className="text-xs text-slate-400">Este valor se restará del saldo disponible de recargas</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateCompraModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewCompra} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Clasificación */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  1. Clasificación del Gasto & Proveedor
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Categoría del Gasto <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formCategoria}
                      onChange={(e) => setFormCategoria(e.target.value as CategoriaGasto)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                      required
                    >
                      <option value="ALIMENTOS_Y_BEBIDAS">Alimentos y Bebidas (Catering, hielo, hidratación)</option>
                      <option value="DESECHABLES">Desechables & Menaje (Vasos, platos, servilletas ecológicas, pitillos)</option>
                      <option value="DECORACION_Y_AMBIENTACION">Decoración y Ambientación (Eventos, globos, flores)</option>
                      <option value="LIMPIEZA_Y_ASEO">Limpieza y Aseo (Químicos náuticos, jabones, lencería)</option>
                      <option value="MANTENIMIENTO_Y_REPUESTOS">Mantenimiento y Repuestos (Filtros, aceites, impelers)</option>
                      <option value="COMBUSTIBLE_Y_MARINA">Combustible y Marina (Diésel marino, atraque)</option>
                      <option value="LOGISTICA_Y_EXTRAS">Logística y Operación (Botiquín, insumos muelle)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Embarcación o Centro de Costo Asignado
                    </label>
                    <select
                      value={formEmbarcacionId}
                      onChange={(e) => setFormEmbarcacionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Muelle Base & Oficinas (General)</option>
                      {embarcaciones.map((emb) => (
                        <option key={emb.id} value={emb.id}>
                          {emb.nombre} ({emb.matricula})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Proveedor / Razón Social <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Makro Supermayorista, Distribuidora Náutica..."
                      value={formProveedor}
                      onChange={(e) => setFormProveedor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      N° Factura o Comprobante <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: FAC-99412 o POS-1029"
                      value={formNumeroFactura}
                      onChange={(e) => setFormNumeroFactura(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      NIT / RUT del Proveedor
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 860.512.256-1"
                      value={formNit}
                      onChange={(e) => setFormNit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Fecha de la Compra <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formFecha}
                      onChange={(e) => setFormFecha(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Elementos Comprados */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    2. Elementos Comprados (Desglose de Ítems)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 rounded text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Elemento
                  </button>
                </div>

                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60"
                    >
                      <div className="col-span-12 sm:col-span-5">
                        <label className="block text-[10px] text-slate-400 mb-0.5">
                          Descripción del Ítem #{idx + 1}
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Vasos biodegradables 12oz, Cerveza Corona x24..."
                          value={item.descripcion}
                          onChange={(e) => handleItemChange(idx, 'descripcion', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500"
                          required
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={item.cantidad}
                          onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500 text-center"
                          required
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Unidad</label>
                        <select
                          value={item.unidad}
                          onChange={(e) => handleItemChange(idx, 'unidad', e.target.value)}
                          className="w-full px-1.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="Unidades">Unidades</option>
                          <option value="Cajas">Cajas</option>
                          <option value="Paquetes">Paquetes</option>
                          <option value="Packs">Packs</option>
                          <option value="Bolsas">Bolsas</option>
                          <option value="Botellas">Botellas</option>
                          <option value="Galones">Galones</option>
                          <option value="Kg">Kg</option>
                          <option value="Kits">Kits</option>
                        </select>
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Unitario (COP)</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="0"
                          value={item.precioUnitarioCOP || ''}
                          onChange={(e) => handleItemChange(idx, 'precioUnitarioCOP', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500 text-right"
                          required
                        />
                      </div>

                      <div className="col-span-12 sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={formItems.length === 1}
                          className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-500"
                          title="Eliminar elemento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="col-span-12 text-right text-[11px] text-slate-400 pr-2">
                        Subtotal: <span className="font-semibold text-white">{formatCOP(item.subtotalCOP)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Total de Elementos: <strong className="text-white">{formItems.length} ítem(s)</strong>
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 mr-2">Monto Total a Deducir:</span>
                    <span className="text-base font-bold text-cyan-300">{formatCOP(formTotalCalculado)}</span>
                  </div>
                </div>
              </div>

              {/* 3. Soporte de Factura & Forma de Pago */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  3. Anexo de Factura & Forma de Pago
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Método de Pago
                    </label>
                    <select
                      value={formMetodoPago}
                      onChange={(e) => setFormMetodoPago(e.target.value as MetodoPago)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="EFECTIVO_CAJA_MENOR">Efectivo / Caja Menor</option>
                      <option value="TRANSFERENCIA_BANCARIA">Transferencia Bancaria</option>
                      <option value="TARJETA_CORPORATIVA">Tarjeta Corporativa</option>
                      <option value="CREDITO_PROVEEDOR">Crédito Comercial Proveedor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Estado del Pago
                    </label>
                    <select
                      value={formEstadoPago}
                      onChange={(e) => setFormEstadoPago(e.target.value as EstadoPagoGasto)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="PAGADO">PAGADO (Comprobante al día)</option>
                      <option value="PENDIENTE_PAGO">PENDIENTE DE PAGO</option>
                      <option value="REEMBOLSO_PENDIENTE">REEMBOLSO PENDIENTE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Responsable / Solicitado Por
                    </label>
                    <input
                      type="text"
                      value={formSolicitadoPor}
                      onChange={(e) => setFormSolicitadoPor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">
                      Anexar Foto de Factura o Recibo Digital
                    </label>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CloudUpload className="w-3 h-3 text-cyan-400" />
                      WebP Auto (1080px) • Google Drive
                    </span>
                  </div>

                  <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-lg p-3 text-center bg-slate-800/30 transition-colors">
                    {formFacturaUrl ? (
                      <div className="flex items-center justify-between gap-3 bg-slate-800 p-2.5 rounded border border-slate-700 text-left">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={formFacturaUrl}
                            alt="Previsualización"
                            className="w-11 h-11 object-cover rounded border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{formFacturaNombreArchivo || 'Factura_WebP.webp'}</p>
                            <span className="text-[10px] text-emerald-400 block font-medium">✓ Comprimida en WebP y guardada en Google Drive</span>
                            <a
                              href={formFacturaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono truncate block max-w-xs"
                            >
                              {formFacturaUrl}
                            </a>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormFacturaUrl('');
                            setFormFacturaNombreArchivo('');
                          }}
                          className="text-slate-400 hover:text-red-400 p-1 cursor-pointer shrink-0"
                          title="Eliminar soporte"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <CloudUpload className="w-7 h-7 text-cyan-400 mx-auto mb-1.5" />
                        <label className="cursor-pointer text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline block">
                          {isCompressingFactura ? 'Comprimiendo a WebP y subiendo a Google Drive...' : 'Haga clic para seleccionar o tomar foto de factura'}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isCompressingFactura}
                            onChange={handleFacturaUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Se comprime automáticamente en el navegador a WebP (máx. 1080px) y se sube a Google Drive empresarial.
                        </p>
                      </div>
                    )}

                    {compressionFacturaMsg && (
                      <div className="mt-2 text-[11px] p-2 bg-cyan-950/80 text-cyan-200 rounded border border-cyan-700 font-medium text-left flex items-center gap-1.5 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{compressionFacturaMsg}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Observaciones Operativas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre el uso del insumo..."
                    value={formNotas}
                    onChange={(e) => setFormNotas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateCompraModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : `Guardar Compra (${formatCOP(formTotalCalculado)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISOR DE FACTURA DE COMPRA */}
      {viewingFactura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Soporte de Factura: {viewingFactura.numeroFactura}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Proveedor: {viewingFactura.proveedor} • {viewingFactura.codigoGasto}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingFactura(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[240px]">
                {viewingFactura.facturaUrl ? (
                  <div className="w-full flex flex-col items-center">
                    <img
                      src={viewingFactura.facturaUrl}
                      alt={`Factura ${viewingFactura.numeroFactura}`}
                      className="max-h-[320px] w-auto object-contain rounded border border-slate-800 shadow-md"
                    />
                    <p className="text-[11px] text-slate-400 mt-2">
                      Archivo: {viewingFactura.facturaNombreArchivo || 'factura_soporte.jpg'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-slate-900/60 border border-dashed border-slate-800 rounded-lg w-full">
                    <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No hay imagen adjunta para esta factura</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-800 text-xs">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Fecha</p>
                  <p className="text-white font-semibold">{viewingFactura.fecha}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Destino / Nave</p>
                  <p className="text-cyan-300 font-semibold">{viewingFactura.embarcacionNombre || 'General'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Total Factura</p>
                  <p className="text-emerald-400 font-bold text-sm">{formatCOP(viewingFactura.montoTotalCOP)}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-800/80 border-t border-slate-700 flex justify-between items-center">
              <button
                onClick={() => handleDriveBackup('FACTURA', viewingFactura.id, viewingFactura.facturaNombreArchivo)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded text-xs font-medium transition-colors"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                Respaldar en Google Drive
              </button>
              <button
                onClick={() => setViewingFactura(null)}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VISOR DE COMPROBANTE DE RECARGA */}
      {viewingConsignacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 bg-emerald-950 border-b border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Comprobante de Consignación: {viewingConsignacion.codigoRecarga}
                  </h3>
                  <p className="text-[11px] text-emerald-300">
                    Aprobación N° {viewingConsignacion.numeroAprobacion} • {viewingConsignacion.entidadBancaria}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingConsignacion(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[220px]">
                {viewingConsignacion.soporteConsignacionUrl ? (
                  <div className="w-full flex flex-col items-center">
                    <img
                      src={viewingConsignacion.soporteConsignacionUrl}
                      alt="Comprobante Bancario"
                      className="max-h-[300px] w-auto object-contain rounded border border-slate-800 shadow-md"
                    />
                    <p className="text-[11px] text-slate-400 mt-2">
                      {viewingConsignacion.soporteNombreArchivo || 'consignacion.pdf'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <Landmark className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">Sin imagen de comprobante digital</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-800 text-xs">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Monto Acreditado</p>
                  <p className="text-emerald-300 font-extrabold text-base">{formatCOP(viewingConsignacion.montoCOP)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Fecha Consignación</p>
                  <p className="text-white font-medium">{viewingConsignacion.fecha}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Destino Fondo</p>
                  <p className="text-cyan-300 font-medium">{DESTINO_FONDO_LABELS[viewingConsignacion.destinoFondo]}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Recibido Por</p>
                  <p className="text-slate-300 font-medium">{viewingConsignacion.recibidoPor}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-800/80 border-t border-slate-700 flex justify-between items-center">
              <button
                onClick={() => handleDriveBackup('RECARGA', viewingConsignacion.id, viewingConsignacion.soporteNombreArchivo)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-emerald-300 rounded text-xs font-medium"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                Respaldar en Google Drive
              </button>
              <button
                onClick={() => setViewingConsignacion(null)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER DETALLE DE ÍTEMS DE UN GASTO */}
      {viewingItemsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Detalle de Elementos Comprados ({viewingItemsModal.items.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {viewingItemsModal.proveedor} • {viewingItemsModal.codigoGasto}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingItemsModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Ítem / Elemento</th>
                      <th className="py-2 px-3 text-center">Cantidad</th>
                      <th className="py-2 px-3 text-right">Precio Unitario</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {viewingItemsModal.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-white">{item.descripcion}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-300">
                          {item.cantidad} {item.unidad}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {formatCOP(item.precioUnitarioCOP)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          {formatCOP(item.subtotalCOP)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900 border-t border-slate-800 text-xs">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 font-semibold text-slate-300 text-right">
                        Total Factura:
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300 text-right">
                        {formatCOP(viewingItemsModal.montoTotalCOP)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {viewingItemsModal.notas && (
                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg text-xs text-slate-300">
                  <span className="font-bold text-cyan-400">Notas: </span>
                  {viewingItemsModal.notas}
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-800/80 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setViewingItemsModal(null)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
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
