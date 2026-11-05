import React, { useState, useMemo } from 'react';
import { ItemInventario, ProveedorTaller, Embarcacion } from '../types/nautical';
import {
  Package,
  Wrench,
  Fuel,
  ShieldCheck,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Boxes,
  Clock,
  DollarSign,
  Tag,
  Ship,
} from 'lucide-react';

interface InventarioProveedoresModuleProps {
  items: ItemInventario[];
  proveedores: ProveedorTaller[];
  embarcaciones: Embarcacion[];
  onSaveItem: (item: ItemInventario) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onSaveProveedor: (prov: ProveedorTaller) => Promise<void>;
  onDeleteProveedor: (provId: string) => Promise<void>;
}

export const InventarioProveedoresModule: React.FC<InventarioProveedoresModuleProps> = ({
  items,
  proveedores,
  embarcaciones,
  onSaveItem,
  onDeleteItem,
  onSaveProveedor,
  onDeleteProveedor,
}) => {
  const [activeTab, setActiveTab] = useState<'inventario' | 'proveedores'>('inventario');

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipoItem, setFilterTipoItem] = useState<string>('TODOS');
  const [filterVessel, setFilterVessel] = useState<string>('TODAS');
  const [filterTipoServicio, setFilterTipoServicio] = useState<string>('TODOS');

  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemInventario | null>(null);

  const [showProvModal, setShowProvModal] = useState(false);
  const [editingProv, setEditingProv] = useState<ProveedorTaller | null>(null);

  // Form state for Item
  const [itemCodigo, setItemCodigo] = useState('');
  const [itemNombre, setItemNombre] = useState('');
  const [itemTipo, setItemTipo] = useState<ItemInventario['tipo']>('REPUESTO');
  const [itemCategoria, setItemCategoria] = useState('');
  const [itemEmbarcacionId, setItemEmbarcacionId] = useState('FLOTA_GENERAL');
  const [itemStock, setItemStock] = useState<number>(10);
  const [itemMinimo, setItemMinimo] = useState<number>(4);
  const [itemUnidad, setItemUnidad] = useState('Unidades');
  const [itemCosto, setItemCosto] = useState<number>(85000);
  const [itemProveedorId, setItemProveedorId] = useState('');
  const [itemUbicacion, setItemUbicacion] = useState('Bodega Central Manga');
  const [itemNotas, setItemNotas] = useState('');

  // Form state for Proveedor
  const [provRazonSocial, setProvRazonSocial] = useState('');
  const [provNit, setProvNit] = useState('');
  const [provContacto, setProvContacto] = useState('');
  const [provTelefono, setProvTelefono] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provTipoServicio, setProvTipoServicio] = useState<ProveedorTaller['tipoServicio']>('TALLER_MECANICO');
  const [provDireccion, setProvDireccion] = useState('Cartagena de Indias');
  const [provServiciosText, setProvServiciosText] = useState('');
  const [provCalificacion, setProvCalificacion] = useState<number>(5);
  const [provNotas, setProvNotas] = useState('');

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterTipoItem !== 'TODOS' && item.tipo !== filterTipoItem) return false;
      if (filterVessel !== 'TODAS' && item.embarcacionId !== filterVessel) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = item.nombre.toLowerCase().includes(term);
        const matchesCode = item.codigo.toLowerCase().includes(term);
        const matchesCategory = item.categoria.toLowerCase().includes(term);
        return matchesName || matchesCode || matchesCategory;
      }
      return true;
    });
  }, [items, filterTipoItem, filterVessel, searchTerm]);

  // Filtered proveedores
  const filteredProveedores = useMemo(() => {
    return proveedores.filter((prov) => {
      if (filterTipoServicio !== 'TODOS' && prov.tipoServicio !== filterTipoServicio) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = prov.razonSocial.toLowerCase().includes(term);
        const matchesNit = prov.nit.toLowerCase().includes(term);
        const matchesContact = prov.contactoNombre.toLowerCase().includes(term);
        return matchesName || matchesNit || matchesContact;
      }
      return true;
    });
  }, [proveedores, filterTipoServicio, searchTerm]);

  // Total valuation
  const totalInventarioCOP = useMemo(() => {
    return items.reduce((sum, item) => sum + item.stockActual * item.costoUnitarioCOP, 0);
  }, [items]);

  const itemsBajoStockCount = useMemo(() => {
    return items.filter((item) => item.stockActual <= item.stockMinimo).length;
  }, [items]);

  // Open item modal for create/edit
  const handleOpenItemModal = (item?: ItemInventario) => {
    if (item) {
      setEditingItem(item);
      setItemCodigo(item.codigo);
      setItemNombre(item.nombre);
      setItemTipo(item.tipo);
      setItemCategoria(item.categoria);
      setItemEmbarcacionId(item.embarcacionId || 'FLOTA_GENERAL');
      setItemStock(item.stockActual);
      setItemMinimo(item.stockMinimo);
      setItemUnidad(item.unidadMedida);
      setItemCosto(item.costoUnitarioCOP);
      setItemProveedorId(item.proveedorPreferidoId || '');
      setItemUbicacion(item.ubicacionAlmacen);
      setItemNotas(item.notas || '');
    } else {
      setEditingItem(null);
      setItemCodigo(`REP-${Date.now().toString().slice(-4)}`);
      setItemNombre('');
      setItemTipo('REPUESTO');
      setItemCategoria('Mecánica General');
      setItemEmbarcacionId('FLOTA_GENERAL');
      setItemStock(10);
      setItemMinimo(4);
      setItemUnidad('Unidades');
      setItemCosto(85000);
      setItemProveedorId('');
      setItemUbicacion('Bodega Central Manga');
      setItemNotas('');
    }
    setShowItemModal(true);
  };

  // Submit Item
  const handleSaveItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemNombre.trim()) return;

    const cotTimestamp = new Date().toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      hour12: false,
    }) + ' COT';

    const provObj = proveedores.find((p) => p.id === itemProveedorId);
    const embObj = embarcaciones.find((e) => e.id === itemEmbarcacionId);

    const newItem: ItemInventario = {
      id: editingItem ? editingItem.id : `item-${Date.now().toString(36)}`,
      codigo: itemCodigo.trim() || `ITM-${Date.now().toString().slice(-4)}`,
      nombre: itemNombre.trim(),
      tipo: itemTipo,
      categoria: itemCategoria.trim() || 'General',
      embarcacionId: itemEmbarcacionId,
      embarcacionNombre: itemEmbarcacionId === 'FLOTA_GENERAL' ? 'Toda la Flota' : embObj?.nombre,
      stockActual: Number(itemStock),
      stockMinimo: Number(itemMinimo),
      unidadMedida: itemUnidad,
      costoUnitarioCOP: Number(itemCosto),
      proveedorPreferidoId: itemProveedorId || undefined,
      proveedorNombre: provObj?.razonSocial,
      ubicacionAlmacen: itemUbicacion,
      ultimaActualizacionCOT: cotTimestamp,
      notas: itemNotas,
    };

    await onSaveItem(newItem);
    setShowItemModal(false);
  };

  // Open prov modal
  const handleOpenProvModal = (prov?: ProveedorTaller) => {
    if (prov) {
      setEditingProv(prov);
      setProvRazonSocial(prov.razonSocial);
      setProvNit(prov.nit);
      setProvContacto(prov.contactoNombre);
      setProvTelefono(prov.telefono);
      setProvEmail(prov.email);
      setProvTipoServicio(prov.tipoServicio);
      setProvDireccion(prov.direccion);
      setProvServiciosText(prov.serviciosOfrecidos.join('\n'));
      setProvCalificacion(prov.calificacion || 5);
      setProvNotas(prov.notas || '');
    } else {
      setEditingProv(null);
      setProvRazonSocial('');
      setProvNit('');
      setProvContacto('');
      setProvTelefono('');
      setProvEmail('');
      setProvTipoServicio('TALLER_MECANICO');
      setProvDireccion('Cartagena de Indias');
      setProvServiciosText('Mantenimiento naval especializado\nSuministro de repuestos certificados');
      setProvCalificacion(5);
      setProvNotas('');
    }
    setShowProvModal(true);
  };

  // Submit Prov
  const handleSaveProvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provRazonSocial.trim()) return;

    const serviciosList = provServiciosText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newProv: ProveedorTaller = {
      id: editingProv ? editingProv.id : `prov-${Date.now().toString(36)}`,
      razonSocial: provRazonSocial.trim(),
      nit: provNit.trim(),
      contactoNombre: provContacto.trim(),
      telefono: provTelefono.trim(),
      email: provEmail.trim(),
      tipoServicio: provTipoServicio,
      direccion: provDireccion.trim(),
      ciudad: 'Cartagena de Indias',
      calificacion: provCalificacion,
      serviciosOfrecidos: serviciosList,
      notas: provNotas,
    };

    await onSaveProveedor(newProv);
    setShowProvModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-cyan-500/30">
              Gestión Integral de Almacén & Talleres Navales
            </span>
            <span className="text-slate-400 text-xs">Cartagena de Indias</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1 flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-400" />
            Repuestos, Consumibles & Red de Talleres
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Control de stock de repuestos Yanmar, lubricantes 15W40, combustibles y directorio verificado de talleres marítimos.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-800/90 p-1 border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('inventario')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'inventario'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Inventario de Ítems ({items.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('proveedores')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'proveedores'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Talleres & Proveedores ({proveedores.length})</span>
            </button>
          </div>

          {activeTab === 'inventario' ? (
            <button
              onClick={() => handleOpenItemModal()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Repuesto / Ítem</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenProvModal()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Taller / Proveedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Strip */}
      {activeTab === 'inventario' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Referencias</div>
            <div className="text-xl font-bold text-white mt-1">{items.length} Referencias</div>
            <div className="text-[10px] text-slate-500 mt-0.5">En catálogo de flota</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Valuación en Bodega</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{formatCOP(totalInventarioCOP)}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Costo acumulado de existencias</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-amber-400 font-semibold uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Bajo Stock
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1">{itemsBajoStockCount} Ítems</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Requieren orden de compra</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-cyan-400 font-semibold uppercase">Talleres Homologados</div>
            <div className="text-xl font-bold text-cyan-300 mt-1">{proveedores.length} Aliados</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Cartagena & Mamonal</div>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {activeTab === 'inventario' ? (
            <>
              <select
                value={filterTipoItem}
                onChange={(e) => setFilterTipoItem(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="TODOS">📦 Todos los Tipos</option>
                <option value="REPUESTO">🔧 Repuestos Mecánicos</option>
                <option value="CONSUMIBLE">🛢️ Lubricantes & Consumibles</option>
                <option value="COMBUSTIBLE">⛽ Combustibles</option>
                <option value="SEGURIDAD">🦺 Equipos de Seguridad</option>
              </select>

              <select
                value={filterVessel}
                onChange={(e) => setFilterVessel(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="TODAS">⚓ Aplicación: Todas las Naves</option>
                <option value="FLOTA_GENERAL">Flota General</option>
                {embarcaciones.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <select
              value={filterTipoServicio}
              onChange={(e) => setFilterTipoServicio(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="TODOS">🛠️ Todas las Especialidades</option>
              <option value="TALLER_MECANICO">Mecánica Diésel</option>
              <option value="ELECTRICIDAD_MARINA">Electricidad Marina</option>
              <option value="TORNERIA">Tornería & Ejes</option>
              <option value="FIBRA_Y_PINTURA">Varadero & Fibra</option>
              <option value="COMBUSTIBLE_MARINA">Combustible Marino</option>
            </select>
          )}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'inventario' ? 'Buscar código, repuesto...' : 'Buscar taller, NIT, contacto...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* TAB 1: INVENTARIO DE ÍTEMS */}
      {activeTab === 'inventario' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5">Código &amp; Nombre</th>
                  <th className="py-3 px-3.5">Tipo / Categoría</th>
                  <th className="py-3 px-3.5">Embarcación Asignada</th>
                  <th className="py-3 px-3.5 text-center">Stock Actual</th>
                  <th className="py-3 px-3.5 text-right">Costo Unitario</th>
                  <th className="py-3 px-3.5 text-right">Total Subtotal</th>
                  <th className="py-3 px-3.5">Ubicación Almacén</th>
                  <th className="py-3 px-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredItems.map((item) => {
                  const isLowStock = item.stockActual <= item.stockMinimo;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{item.nombre}</div>
                        <div className="text-[10px] font-mono text-cyan-700 font-semibold">{item.codigo}</div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.tipo === 'REPUESTO'
                            ? 'bg-blue-100 text-blue-800'
                            : item.tipo === 'CONSUMIBLE'
                            ? 'bg-amber-100 text-amber-800'
                            : item.tipo === 'COMBUSTIBLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.tipo}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.categoria}</div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {item.embarcacionNombre || 'Flota General'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`font-bold text-sm ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                            {item.stockActual}
                          </span>
                          <span className="text-[10px] text-slate-500">{item.unidadMedida}</span>
                        </div>
                        {isLowStock && (
                          <span className="inline-block px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-bold mt-0.5">
                            Mín: {item.stockMinimo}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap font-medium text-slate-800">
                        {formatCOP(item.costoUnitarioCOP)}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap font-bold text-emerald-700">
                        {formatCOP(item.stockActual * item.costoUnitarioCOP)}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.ubicacionAlmacen}</span>
                        </div>
                        {item.proveedorNombre && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            Prov: {item.proveedorNombre}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenItemModal(item)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-cyan-700 transition-colors cursor-pointer"
                            title="Editar ítem"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Eliminar ítem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* TAB 2: PROVEEDORES & TALLERES */}
      {activeTab === 'proveedores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProveedores.map((prov) => (
            <div
              key={prov.id}
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                      {prov.tipoServicio.replace(/_/g, ' ')}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{prov.razonSocial}</h3>
                    <p className="text-[11px] font-mono text-slate-500">NIT: {prov.nit}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{prov.calificacion || 5}.0</span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700">{prov.contactoNombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{prov.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{prov.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{prov.direccion}</span>
                  </div>
                </div>

                {prov.serviciosOfrecidos && prov.serviciosOfrecidos.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Servicios Especializados:
                    </span>
                    <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
                      {prov.serviciosOfrecidos.map((s, idx) => (
                        <li key={idx} className="truncate">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenProvModal(prov)}
                  className="px-3 py-1 rounded bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDeleteProveedor(prov.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Eliminar proveedor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ITEM INVENTARIO */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Editar Ítem de Inventario' : 'Registrar Nuevo Ítem / Repuesto'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código de Referencia</label>
                  <input
                    type="text"
                    value={itemCodigo}
                    onChange={(e) => setItemCodigo(e.target.value)}
                    placeholder="Ej: REP-YAN-05"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Ítem</label>
                  <select
                    value={itemTipo}
                    onChange={(e) => setItemTipo(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 cursor-pointer"
                  >
                    <option value="REPUESTO">Repuesto Mecánico</option>
                    <option value="CONSUMIBLE">Lubricante / Consumible</option>
                    <option value="COMBUSTIBLE">Combustible</option>
                    <option value="SEGURIDAD">Equipo de Seguridad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre o Descripción del Repuesto</label>
                <input
                  type="text"
                  value={itemNombre}
                  onChange={(e) => setItemNombre(e.target.value)}
                  placeholder="Ej: Rodete Bomba Agua Salada Yanmar 3YM30"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={itemCategoria}
                    onChange={(e) => setItemCategoria(e.target.value)}
                    placeholder="Ej: Filtros, Correas, Aceites..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Embarcación Asignada</label>
                  <select
                    value={itemEmbarcacionId}
                    onChange={(e) => setItemEmbarcacionId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 cursor-pointer"
                  >
                    <option value="FLOTA_GENERAL">Flota General (Catamarán)</option>
                    {embarcaciones.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    min="0"
                    value={itemStock}
                    onChange={(e) => setItemStock(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={itemMinimo}
                    onChange={(e) => setItemMinimo(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidad</label>
                  <input
                    type="text"
                    value={itemUnidad}
                    onChange={(e) => setItemUnidad(e.target.value)}
                    placeholder="Unidades, Galones..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Costo Unitario (COP)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={itemCosto}
                    onChange={(e) => setItemCosto(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proveedor Homologado</label>
                  <select
                    value={itemProveedorId}
                    onChange={(e) => setItemProveedorId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Sin proveedor fijo --</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ubicación en Almacén / Barco</label>
                <input
                  type="text"
                  value={itemUbicacion}
                  onChange={(e) => setItemUbicacion(e.target.value)}
                  placeholder="Ej: Bodega Central Manga - Estante 2 o Pañol Proa"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notas Técnicas</label>
                <textarea
                  rows={2}
                  value={itemNotas}
                  onChange={(e) => setItemNotas(e.target.value)}
                  placeholder="Número de parte Yanmar, compatibilidad de roscas, etc..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-600 rounded-xl shadow cursor-pointer"
                >
                  {editingItem ? 'Guardar Cambios' : 'Registrar en Almacén'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROVEEDOR */}
      {showProvModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingProv ? 'Editar Taller o Proveedor' : 'Registrar Nuevo Taller o Proveedor'}
              </h3>
              <button
                onClick={() => setShowProvModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProvSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Razón Social</label>
                  <input
                    type="text"
                    value={provRazonSocial}
                    onChange={(e) => setProvRazonSocial(e.target.value)}
                    placeholder="Ej: Portobello Marina S.A.S."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIT</label>
                  <input
                    type="text"
                    value={provNit}
                    onChange={(e) => setProvNit(e.target.value)}
                    placeholder="Ej: 900.584.219-3"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Especialidad Principal</label>
                  <select
                    value={provTipoServicio}
                    onChange={(e) => setProvTipoServicio(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 cursor-pointer"
                  >
                    <option value="TALLER_MECANICO">Taller Mecánico Diésel</option>
                    <option value="ELECTRICIDAD_MARINA">Electricidad Marina</option>
                    <option value="TORNERIA">Tornería Naval & Ejes</option>
                    <option value="FIBRA_Y_PINTURA">Varadero, Fibra & Carenado</option>
                    <option value="COMBUSTIBLE_MARINA">Combustible Marino</option>
                    <option value="REPUESTOS_IMPORTADOS">Repuestos Importados</option>
                    <option value="PROVEEDURIA_GENERAL">Proveeduría General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Calificación (1 a 5)</label>
                  <select
                    value={provCalificacion}
                    onChange={(e) => setProvCalificacion(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 cursor-pointer"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Estrellas (Excelente)</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Estrellas (Bueno)</option>
                    <option value={3}>⭐⭐⭐ 3 Estrellas (Regular)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Persona de Contacto</label>
                  <input
                    type="text"
                    value={provContacto}
                    onChange={(e) => setProvContacto(e.target.value)}
                    placeholder="Ej: Ing. Carlos Gómez"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono Móvil / Fijo</label>
                  <input
                    type="text"
                    value={provTelefono}
                    onChange={(e) => setProvTelefono(e.target.value)}
                    placeholder="Ej: +57 312 650 9944"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={provEmail}
                    onChange={(e) => setProvEmail(e.target.value)}
                    placeholder="taller@empresa.com"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dirección en Cartagena</label>
                  <input
                    type="text"
                    value={provDireccion}
                    onChange={(e) => setProvDireccion(e.target.value)}
                    placeholder="Ej: Manga 3ra Avenida # 21-45"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Servicios Ofrecidos (un servicio por línea)
                </label>
                <textarea
                  rows={3}
                  value={provServiciosText}
                  onChange={(e) => setProvServiciosText(e.target.value)}
                  placeholder="Varada en Travel Lift\nMantenimiento de bombas\nPintura antifouling"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowProvModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-600 rounded-xl shadow cursor-pointer"
                >
                  {editingProv ? 'Guardar Cambios' : 'Registrar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
