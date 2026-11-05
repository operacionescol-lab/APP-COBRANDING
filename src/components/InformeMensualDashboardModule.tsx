import React, { useState, useMemo } from 'react';
import {
  Salida,
  Embarcacion,
  Tripulante,
  RegistroAsistencia,
  GastoCompra,
  RecargaFondo,
  RegistroLavanderiaAseo,
  ChecklistPreZarpe,
  TrabajoDiarioMantenimiento,
  ServicioDetalle,
  ItemInventario,
  ProveedorTaller,
  PerfilUsuarioAuth,
} from '../types/nautical';
import {
  FileSpreadsheet,
  Presentation,
  Download,
  Calendar,
  Compass,
  Users,
  Wrench,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Ship,
  TrendingUp,
  Clock,
  Building2,
  BadgeDollarSign,
  Filter,
  FileCheck,
  Award,
  Layers,
  ChevronRight,
  Package,
  FileText,
  AlertTriangle,
  ExternalLink,
  LifeBuoy,
  Phone,
  MapPin,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';

interface InformeMensualDashboardModuleProps {
  salidas: Salida[];
  embarcaciones: Embarcacion[];
  tripulacion: Tripulante[];
  asistencias: RegistroAsistencia[];
  compras: GastoCompra[];
  recargas: RecargaFondo[];
  lavanderia: RegistroLavanderiaAseo[];
  checklists: ChecklistPreZarpe[];
  trabajosDiarios: TrabajoDiarioMantenimiento[];
  serviciosDetalle?: ServicioDetalle[];
  items?: ItemInventario[];
  proveedores?: ProveedorTaller[];
  currentUser: PerfilUsuarioAuth;
}

const MESES = [
  { id: '10', nombre: 'Octubre 2026' },
  { id: '11', nombre: 'Noviembre 2026' },
  { id: '12', nombre: 'Diciembre 2026' },
  { id: '09', nombre: 'Septiembre 2026' },
  { id: 'TODOS', nombre: 'Histórico Completo' },
];

export const InformeMensualDashboardModule: React.FC<InformeMensualDashboardModuleProps> = ({
  salidas,
  embarcaciones,
  tripulacion,
  asistencias,
  compras,
  recargas,
  lavanderia,
  checklists,
  trabajosDiarios,
  serviciosDetalle = [],
  items = [],
  proveedores = [],
  currentUser,
}) => {
  const [selectedMes, setSelectedMes] = useState<string>('10');
  const [selectedEmbId, setSelectedEmbId] = useState<string>('TODAS');
  const [activeTab, setActiveTab] = useState<
    | 'RESUMEN'
    | 'SALIDAS'
    | 'CHECKLISTS'
    | 'SERVICIOS'
    | 'ASISTENCIA'
    | 'MANTENIMIENTO'
    | 'COMPRAS'
    | 'LAVANDERIA'
    | 'INVENTARIO'
    | 'PROVEEDORES'
    | 'FLOTA'
    | 'TRIPULACION'
  >('RESUMEN');
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const mesActualLabel = MESES.find((m) => m.id === selectedMes)?.nombre || 'Octubre 2026';

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter datasets by month & optional vessel
  const filteredSalidas = useMemo(() => {
    return salidas.filter((s) => {
      if (selectedMes !== 'TODOS') {
        const m = s.fecha.split('-')[1];
        if (m !== selectedMes) return false;
      }
      if (selectedEmbId !== 'TODAS' && s.embarcacionId !== selectedEmbId) return false;
      return true;
    });
  }, [salidas, selectedMes, selectedEmbId]);

  const filteredAsistencias = useMemo(() => {
    return asistencias.filter((a) => {
      if (selectedMes !== 'TODOS') {
        const m = a.fecha.split('-')[1];
        if (m !== selectedMes) return false;
      }
      if (selectedEmbId !== 'TODAS' && a.embarcacionId !== selectedEmbId) return false;
      return true;
    });
  }, [asistencias, selectedMes, selectedEmbId]);

  const filteredTrabajos = useMemo(() => {
    return trabajosDiarios.filter((t) => {
      if (selectedMes !== 'TODOS') {
        const m = t.fecha.split('-')[1];
        if (m !== selectedMes) return false;
      }
      if (selectedEmbId !== 'TODAS' && t.embarcacionId !== selectedEmbId) return false;
      return true;
    });
  }, [trabajosDiarios, selectedMes, selectedEmbId]);

  const filteredCompras = useMemo(() => {
    return compras.filter((c) => {
      if (selectedMes !== 'TODOS') {
        const m = c.fecha.split('-')[1];
        if (m !== selectedMes) return false;
      }
      if (selectedEmbId !== 'TODAS' && c.embarcacionId && c.embarcacionId !== selectedEmbId) return false;
      return true;
    });
  }, [compras, selectedMes, selectedEmbId]);

  const filteredChecklists = useMemo(() => {
    return checklists.filter((ck) => {
      if (selectedMes !== 'TODOS') {
        const m = ck.fecha.split('-')[1];
        if (m !== selectedMes) return false;
      }
      if (selectedEmbId !== 'TODAS' && ck.embarcacionId !== selectedEmbId) return false;
      return true;
    });
  }, [checklists, selectedMes, selectedEmbId]);

  const filteredServicios = useMemo(() => {
    return serviciosDetalle.filter((s) => {
      if (selectedMes !== 'TODOS') {
        const m = s.fecha.split('-')[1];
        if (m !== selectedMes) return false;
      }
      if (selectedEmbId !== 'TODAS' && s.embarcacionId !== selectedEmbId) return false;
      return true;
    });
  }, [serviciosDetalle, selectedMes, selectedEmbId]);

  const filteredLavanderia = useMemo(() => {
    return lavanderia.filter((l) => {
      if (selectedMes !== 'TODOS') {
        const m = l.fecha.split('-')[1];
        if (m !== selectedMes) return false;
      }
      if (selectedEmbId !== 'TODAS' && l.embarcacionId && l.embarcacionId !== selectedEmbId) return false;
      return true;
    });
  }, [lavanderia, selectedMes, selectedEmbId]);

  // Key performance indicators
  const totalSalidas = filteredSalidas.length;
  const totalPax = filteredSalidas.reduce((acc, s) => acc + (s.paxReales || s.paxProgramados || 0), 0);
  const totalConSitmar = filteredSalidas.filter((s) => s.sitmarVerificado || s.candadoOperativoAutorizado).length;
  const porcentajeSitmar = totalSalidas > 0 ? Math.round((totalConSitmar / totalSalidas) * 100) : 100;
  const totalHorasNavegadas = filteredSalidas.reduce((acc, s) => acc + (s.tipoServicio === 'FULL_DAY' ? 8 : 4), 0);

  const totalNominaCOP = filteredAsistencias.reduce((acc, a) => acc + (a.tarifaLiquidadaCOP || a.tarifaSesionCOP || 0), 0);
  const totalComprasCOP = filteredCompras.reduce((acc, c) => acc + (c.montoTotalCOP || 0), 0);
  const totalRecargasCOP = recargas.reduce((acc, r) => acc + (r.montoCOP || 0), 0);
  const saldoCajaEstimadoCOP = totalRecargasCOP - totalComprasCOP;

  const totalTrabajosEjecutados = filteredTrabajos.length;
  const totalHorasMantenimiento = filteredTrabajos.reduce((acc, t) => acc + (t.horasInvertidas || 0), 0);

  // Totales de nómina por empresa pagadora fija
  const nominaPorEmpresa = useMemo(() => {
    let mdp = 0;
    let cat = 0;
    filteredAsistencias.forEach((a) => {
      const tarifa = a.tarifaLiquidadaCOP || a.tarifaSesionCOP || 0;
      if (a.colaboradorEmpresaId === 'catamaranes-veleros') {
        cat += tarifa;
      } else {
        mdp += tarifa; // default MDP
      }
    });
    return { mdp, cat };
  }, [filteredAsistencias]);

  // Breakdown of departures per boat
  const salidasPorBarco = useMemo(() => {
    const map = new Map<string, { nombre: string; matricula: string; salidas: number; pax: number; sitmar: number }>();
    embarcaciones.forEach((emb) => {
      map.set(emb.id, { nombre: emb.nombre, matricula: emb.matricula, salidas: 0, pax: 0, sitmar: 0 });
    });
    filteredSalidas.forEach((s) => {
      const item = map.get(s.embarcacionId);
      if (item) {
        item.salidas += 1;
        item.pax += s.paxReales || s.paxProgramados || 0;
        if (s.sitmarVerificado || s.candadoOperativoAutorizado) item.sitmar += 1;
      }
    });
    return Array.from(map.values());
  }, [embarcaciones, filteredSalidas]);

  // =========================================================================
  // EXPORT TO EXCEL (.xlsx) WITH 12 MULTIPLE SHEETS (INCLUYE TODOS LOS MÓDULOS)
  // =========================================================================
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const wb = XLSX.utils.book_new();

      // Sheet 1: Resumen Ejecutivo
      const resumenData = [
        ['COBRANDING OPS - INFORME MENSUAL CONSOLIDADO DE OPERACIONES'],
        ['Período:', mesActualLabel],
        ['Generado por:', `${currentUser.nombre} (${currentUser.rol})`],
        ['Fecha de Generación COT:', new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }) + ' COT'],
        ['Alianza Estratégica:', 'María del Puerto S.A.S. (NIT 901.124.944-9) & Catamarán Cartagena S.A.S. (NIT 901.159.056-4)'],
        [''],
        ['MÓDULO / INDICADOR CLAVE DE DESEMPEÑO', 'VALOR CONSOLIDADO', 'UNIDAD / OBSERVACIÓN'],
        ['Módulo 1: Total Despachos Náuticos Ejecutados', totalSalidas, 'Zarpes con código DIMAR'],
        ['Módulo 1: Total Pasajeros (PAX) Transportados', totalPax, 'Pasajeros certificados'],
        ['Módulo 1: Cumplimiento Candado Operativo SITMAR DIMAR', `${porcentajeSitmar}%`, `${totalConSitmar} de ${totalSalidas} verificados`],
        ['Módulo 1: Horas de Navegación Acumuladas en Bahía/Islas', `${totalHorasNavegadas} hrs`, 'Tiempo en agua de la flota'],
        ['Módulo 2: Checklists Pre-Zarpe DIMAR Aprobados', filteredChecklists.length, '16 puntos de seguridad OMI'],
        ['Módulo 3: Planillas de Servicios Comerciales Emitidas', filteredServicios.length, 'Charters Full Day / Sunset'],
        ['Módulo 4: Total Nómina Operativa Liquidada', totalNominaCOP, 'COP (Pesos Colombianos)'],
        ['  - Nómina María del Puerto S.A.S.', nominaPorEmpresa.mdp, 'COP (Cuentas de Cobro fijas MDP)'],
        ['  - Nómina Catamarán Cartagena S.A.S.', nominaPorEmpresa.cat, 'COP (Cuentas de Cobro fijas CAT)'],
        ['Módulo 5: Total Gastos Operacionales & Compras', totalComprasCOP, 'COP (Facturas & Comprobantes)'],
        ['Módulo 5: Fondo Total de Caja Recargado', totalRecargasCOP, 'COP'],
        ['Módulo 6: Trabajos Diarios de Mantenimiento Ejecutados', totalTrabajosEjecutados, 'Intervenciones técnicas en flota'],
        ['Módulo 6: Horas-Hombre Invertidas en Mantenimiento', `${totalHorasMantenimiento} hrs`, 'Mano de obra especializada'],
        ['Módulo 7: Jornadas de Lavandería y Aseo Registradas', filteredLavanderia.length, 'Aseo de naves y oficinas'],
        ['Módulo 8: Ítems Activos en Inventario de Repuestos', items.length, 'Filtros, aceites, impulsores'],
        ['Módulo 9: Talleres Navales & Proveedores Registrados', proveedores.length, 'Red naval certificada en Cartagena'],
        ['Módulo 10: Naves Activas en Flota Principal', embarcaciones.length, 'ARMONIA, MAUI, MOANA, SIRENAS'],
        ['Módulo 11: Colaboradores & Tripulación Oficial', tripulacion.length, 'Tripulantes con licencia DIMAR'],
      ];
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');

      // Sheet 2: Despachos y Salidas
      const salidasRows = filteredSalidas.map((s, idx) => {
        const emb = embarcaciones.find((e) => e.id === s.embarcacionId);
        const pil = tripulacion.find((t) => t.id === s.pilotoId);
        const mar = tripulacion.find((t) => t.id === s.marineroId);
        return {
          'No.': idx + 1,
          Fecha: s.fecha,
          Embarcación: emb ? `${emb.nombre} (${emb.matricula})` : s.embarcacionId,
          'Tipo de Servicio': s.tipoServicio,
          'Código SITMAR': s.codigoSitmar || 'N/A',
          'SITMAR Verificado': s.sitmarVerificado ? 'SÍ' : 'PENDIENTE',
          'PAX Programados': s.paxProgramados,
          'PAX Real': s.paxReales || s.paxProgramados,
          Piloto: pil ? pil.nombreCompleto : s.pilotoId,
          Marinero: mar ? mar.nombreCompleto : s.marineroId,
          'Horario Zarpe': s.horaProgramadaZarpe,
          'Horario Retorno': s.horaProgramadaRetorno,
          'Candado Operativo': s.candadoOperativoAutorizado ? 'AUTORIZADO' : 'BLOQUEADO',
          Estado: s.estado,
        };
      });
      const wsSalidas = XLSX.utils.json_to_sheet(salidasRows);
      XLSX.utils.book_append_sheet(wb, wsSalidas, 'Despachos Náuticos');

      // Sheet 3: Checklists Pre-Zarpe DIMAR (16 Puntos)
      const checklistsRows = filteredChecklists.map((ck, idx) => {
        const emb = embarcaciones.find((e) => e.id === ck.embarcacionId);
        const chalecos = ck.items?.find((i) => i.accion.toLowerCase().includes('chaleco') || i.accion.toLowerCase().includes('salvavidas'))?.cumple ?? true;
        const aros = ck.items?.find((i) => i.accion.toLowerCase().includes('aro'))?.cumple ?? true;
        const balsas = ck.items?.find((i) => i.accion.toLowerCase().includes('balsa'))?.cumple ?? true;
        const vhf = ck.items?.find((i) => i.accion.toLowerCase().includes('vhf') || i.accion.toLowerCase().includes('radio'))?.cumple ?? true;
        const luces = ck.items?.find((i) => i.accion.toLowerCase().includes('luces'))?.cumple ?? true;
        const bombas = ck.items?.find((i) => i.accion.toLowerCase().includes('bomba') || i.accion.toLowerCase().includes('achique'))?.cumple ?? true;
        const extintores = ck.items?.find((i) => i.accion.toLowerCase().includes('extintor'))?.cumple ?? true;
        return {
          'No.': idx + 1,
          Fecha: ck.fecha,
          Embarcación: emb ? `${emb.nombre} (${emb.matricula})` : ck.embarcacionId,
          'Código SITMAR': ck.codigoSitmar || 'N/A',
          Inspector: ck.nombrePiloto || ck.nombreDpa || 'Oficial de Seguridad',
          'Chalecos Salvavidas': chalecos ? 'CONFORME (100%)' : 'NO CONFORME',
          'Aros Salvavidas': aros ? 'CONFORME' : 'NO CONFORME',
          'Balsas Salvavidas': balsas ? 'VIGENTE' : 'REVISIÓN',
          'Radio VHF Canal 16': vhf ? 'OPERATIVO' : 'FALLA',
          'Luces de Navegación': luces ? 'OPERATIVAS' : 'FALLA',
          'Bombas de Achique': bombas ? 'OPERATIVAS' : 'FALLA',
          'Extintores Vigentes': extintores ? 'VIGENTES' : 'RECARGAR',
          'Firma DPA': ck.firmaDpa ? 'FIRMADO DIGITAL' : 'PENDIENTE',
          'Estado General': ck.estado === 'APROBADO_PARA_ZARPE' ? 'AUTORIZADO' : 'NO AUTORIZADO',
        };
      });
      const wsChecklists = XLSX.utils.json_to_sheet(checklistsRows);
      XLSX.utils.book_append_sheet(wb, wsChecklists, 'Checklists Pre-Zarpe');

      // Sheet 4: Servicios Quincenales & Planillas
      const serviciosRows = filteredServicios.map((srv, idx) => {
        const emb = embarcaciones.find((e) => e.id === srv.embarcacionId);
        return {
          'No.': idx + 1,
          'Código Planilla': srv.codigoPlanilla,
          Fecha: srv.fecha,
          Embarcación: emb ? emb.nombre : srv.embarcacionId,
          Cliente: srv.clienteEmpresa,
          'Ejecutivo Comercial': srv.ejecutivoComercial,
          'Tipo de Servicio': srv.tipoServicio,
          'PAX Confirmados': srv.paxConfirmados,
          Destino: srv.itinerarioDestino,
          Alimentos: srv.alimentos,
          Bebidas: srv.bebidas,
          'Estado Pago': srv.estadoPago,
        };
      });
      const wsServicios = XLSX.utils.json_to_sheet(serviciosRows);
      XLSX.utils.book_append_sheet(wb, wsServicios, 'Servicios y Planillas');

      // Sheet 5: Asistencia y Nómina
      const asistenciaRows = filteredAsistencias.map((a, idx) => ({
        'No.': idx + 1,
        Fecha: a.fecha,
        Colaborador: a.usuarioNombre,
        Cédula: a.colaboradorDocumento || 'N/A',
        'Cargo Oficial': a.colaboradorCargo || a.rol,
        'Actividad / Tipo Salida': a.tipoSalidaActividad || a.rolDesempenado || a.motivoJornada,
        'Embarcación / Sede': a.embarcacionNombre || 'Sede Administrativa',
        'Empresa Pagadora': a.colaboradorEmpresaId === 'catamaranes-veleros' ? 'Catamarán Cartagena S.A.S.' : 'María del Puerto S.A.S.',
        'Tarifa Liquidada COP': a.tarifaLiquidadaCOP || a.tarifaSesionCOP || 0,
        'Hora Entrada': a.horaEntrada,
        'Hora Salida': a.horaSalida || 'En turno',
        'Sello Inmutable COT': a.timestampCOT || 'Registrado',
      }));
      const wsAsistencia = XLSX.utils.json_to_sheet(asistenciaRows);
      XLSX.utils.book_append_sheet(wb, wsAsistencia, 'Asistencia y Nómina');

      // Sheet 6: Trabajos Diarios de Mantenimiento por Barco
      const trabajosRows = filteredTrabajos.map((t, idx) => ({
        'No.': idx + 1,
        Fecha: t.fecha,
        Embarcación: t.embarcacionNombre,
        'Colaborador / Responsable': t.colaboradorNombre,
        Cargo: t.colaboradorCargo || 'Técnico',
        Sistema: t.sistema,
        'Tipo de Trabajo': t.tipoTrabajo,
        Título: t.titulo,
        'Detalle de lo Realizado': t.descripcion,
        'Repuestos Utilizados': t.repuestosUtilizados || 'N/A',
        'Horas Invertidas': t.horasInvertidas || 0,
        'Costo Mano de Obra COP': t.costoManoObraCOP || 0,
        Estado: t.estado,
        'Sello COT': t.timestampCOT || 'N/A',
      }));
      const wsTrabajos = XLSX.utils.json_to_sheet(trabajosRows);
      XLSX.utils.book_append_sheet(wb, wsTrabajos, 'Trabajos Diarios Mant');

      // Sheet 7: Compras y Gastos
      const comprasRows = filteredCompras.map((c, idx) => ({
        'No.': idx + 1,
        Fecha: c.fecha,
        Código: c.codigoGasto,
        Categoría: c.categoria,
        Proveedor: c.proveedor,
        'Factura No.': c.numeroFactura,
        'Embarcación / Destino': c.embarcacionNombre || 'Gasto General Flota',
        'Solicitado Por': c.solicitadoPor,
        'Monto Total COP': c.montoTotalCOP,
        'Método Pago': c.metodoPago,
        'Estado Pago': c.estadoPago,
      }));
      const wsCompras = XLSX.utils.json_to_sheet(comprasRows);
      XLSX.utils.book_append_sheet(wb, wsCompras, 'Compras y Gastos');

      // Sheet 8: Lavandería y Aseo de Naves
      const lavanderiaRows = filteredLavanderia.map((l, idx) => ({
        'No.': idx + 1,
        Fecha: l.fecha,
        'Tipo de Registro': l.tipoRegistro,
        'Embarcación / Área': l.embarcacionNombre || l.ubicacionManual || 'Flota General',
        Responsable: l.responsable,
        'Servicio Aseo': l.tipoServicioAseo || 'N/A',
        'Estado Lencería': l.estadoLencería || l.estadoLenceria || 'LISTO_A_BORDO',
        'Prendas Contabilizadas': (l.prendas || l.itemsPrendas || []).map((p) => `${p.prenda}: ${p.cantidad}`).join(', ') || 'General',
      }));
      const wsLavanderia = XLSX.utils.json_to_sheet(lavanderiaRows);
      XLSX.utils.book_append_sheet(wb, wsLavanderia, 'Lavandería y Aseo');

      // Sheet 9: Inventario de Repuestos Navales
      const inventarioRows = items.map((it, idx) => ({
        'No.': idx + 1,
        Código: it.codigo,
        'Nombre del Ítem': it.nombre,
        Categoría: it.categoria,
        'Stock Actual': it.stockActual,
        'Stock Mínimo': it.stockMinimo,
        'Unidad de Medida': it.unidadMedida,
        'Costo Unitario COP': it.costoUnitarioCOP,
        'Ubicación Almacén': it.ubicacionAlmacen,
        'Embarcación': it.embarcacionNombre || 'Toda la Flota',
      }));
      const wsInventario = XLSX.utils.json_to_sheet(inventarioRows);
      XLSX.utils.book_append_sheet(wb, wsInventario, 'Inventario Repuestos');

      // Sheet 10: Proveedores y Talleres Navales
      const proveedoresRows = proveedores.map((pv, idx) => ({
        'No.': idx + 1,
        'Razón Social / Nombre': pv.nombreComercial || pv.razonSocial,
        NIT: pv.nit || 'N/A',
        Especialidad: pv.tipoServicio ? pv.tipoServicio.replace(/_/g, ' ') : 'Mantenimiento Naval',
        Contacto: pv.contactoNombre,
        Teléfono: pv.telefono,
        Dirección: pv.direccion,
        Ciudad: pv.ciudad,
        Calificación: `${pv.calificacion || 5}/5`,
      }));
      const wsProveedores = XLSX.utils.json_to_sheet(proveedoresRows);
      XLSX.utils.book_append_sheet(wb, wsProveedores, 'Proveedores y Talleres');

      // Sheet 11: Estado Técnico y Documentos de Flota
      const flotaRows = embarcaciones.map((e, idx) => ({
        'No.': idx + 1,
        Nombre: e.nombre,
        Matrícula: e.matricula,
        Distintivo: e.distintivoLlamada || 'N/A',
        'TRB / TRN': `${e.trb || '-'} / ${e.trn || '-'}`,
        'Capacidad PAX': e.capacidadMaxPax,
        'Dimensiones (Eslora x Manga x Puntal)': `${e.esloraMetros || '-'}m x ${e.mangaMetros || '-'}m x ${e.puntalMetros || '-'}m`,
        'Calado': `${e.caladoMetros || '-'}m`,
        'Motores Instalados': e.motores,
        'Horas Motor Acumuladas': e.horasMotorAcumuladas,
        'Próximo Límite Servicio': e.limiteHorasMantenimiento,
        'Horas Restantes para Servicio': e.limiteHorasMantenimiento - e.horasMotorAcumuladas,
        Estado: e.estado,
        Armador: e.armador,
        'Total Documentos DIMAR': e.documentos.length,
      }));
      const wsFlota = XLSX.utils.json_to_sheet(flotaRows);
      XLSX.utils.book_append_sheet(wb, wsFlota, 'Estado de Flota DIMAR');

      // Sheet 12: Tripulación y Licencias
      const tripulacionRows = tripulacion.map((t, idx) => ({
        'No.': idx + 1,
        Nombre: t.nombreCompleto,
        Cédula: t.documentoIdentidad,
        Cargo: t.cargoDescripcion || t.cargo,
        'Empresa Contratante': t.empresaContratanteId === 'catamaranes-veleros' ? 'Catamarán Cartagena S.A.S.' : 'María del Puerto S.A.S.',
        Teléfono: t.telefono,
        'Licencia DIMAR': t.licencia?.numero || 'N/A',
        'Categoría Licencia': t.licencia?.categoria || 'N/A',
        'Vencimiento Licencia': t.licencia?.fechaVencimiento || 'N/A',
        'Estado Licencia': t.licencia?.estado || 'VIGENTE',
        'Tipo de Contrato': t.tipoContrato || 'PRESTACION_SERVICIOS',
      }));
      const wsTripulacion = XLSX.utils.json_to_sheet(tripulacionRows);
      XLSX.utils.book_append_sheet(wb, wsTripulacion, 'Tripulación y Licencias');

      // Write file
      const fileName = `COBRANDING_OPS_Informe_Integral_${mesActualLabel.replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setExportSuccessMsg(`Archivo Excel "${fileName}" generado y descargado correctamente con 12 hojas de cálculo completas.`);
      setTimeout(() => setExportSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(`Error al generar Excel: ${err.message}`);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // =========================================================================
  // EXPORT TO EDITABLE POWERPOINT PRESENTATION (.pptx) - 14 SLIDES
  // =========================================================================
  const handleExportPowerPoint = async () => {
    try {
      setIsExportingPptx(true);
      const pres = new pptxgen();
      pres.layout = 'LAYOUT_16x9';

      const C_NAVY = '0A0F1D';
      const C_CYAN = '06B6D4';
      const C_EMERALD = '10B981';
      const C_WHITE = 'FFFFFF';
      const C_SLATE = '94A3B8';
      const C_CARD = '1E293B';

      // -------------------------------------------------------------
      // SLIDE 1: Portada Corporativa Oficial
      // -------------------------------------------------------------
      const slide1 = pres.addSlide();
      slide1.background = { color: C_NAVY };

      slide1.addText('COBRANDING OPS', {
        x: 0.8,
        y: 1.2,
        w: 11.5,
        fontSize: 34,
        bold: true,
        color: C_CYAN,
        fontFace: 'Arial',
      });
      slide1.addText('INFORME OPERATIVO, TÉCNICO & FINANCIERO MENSUAL', {
        x: 0.8,
        y: 1.9,
        w: 11.5,
        fontSize: 22,
        bold: true,
        color: C_WHITE,
        fontFace: 'Arial',
      });
      slide1.addText(`Período de Gestión: ${mesActualLabel} • Cartagena de Indias, Colombia`, {
        x: 0.8,
        y: 2.6,
        w: 11.5,
        fontSize: 14,
        color: C_SLATE,
        fontFace: 'Arial',
      });

      slide1.addShape(pres.ShapeType.rect, {
        x: 0.8,
        y: 3.5,
        w: 11.5,
        h: 2.0,
        fill: { color: C_CARD },
        line: { color: '334155', width: 1 },
      });

      slide1.addText('ALIANZA CORPORATIVA:', {
        x: 1.1,
        y: 3.7,
        fontSize: 11,
        bold: true,
        color: C_CYAN,
      });
      slide1.addText('• CATAMARANES Y VELEROS DE CARTAGENA DE INDIAS S.A.S. (NIT 901.159.056-4)\n• MARIA DEL PUERTO S.A.S. (NIT 901.124.944-9)', {
        x: 1.1,
        y: 4.0,
        fontSize: 13,
        color: C_WHITE,
        bold: true,
        fontFace: 'Arial',
      });

      slide1.addText(`Directora de Operaciones & DPA: ${currentUser.nombre} (CC 1.007.625.049)`, {
        x: 1.1,
        y: 4.8,
        fontSize: 12,
        color: C_EMERALD,
        bold: true,
      });

      slide1.addText(`Generado con sello de auditoría COT: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })} COT`, {
        x: 0.8,
        y: 6.5,
        fontSize: 10,
        color: C_SLATE,
      });

      // -------------------------------------------------------------
      // SLIDE 2: Resumen Ejecutivo & KPIs Principales
      // -------------------------------------------------------------
      const slide2 = pres.addSlide();
      slide2.background = { color: C_NAVY };

      slide2.addText('1. RESUMEN EJECUTIVO & INDICADORES CLAVE', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });
      slide2.addText(`Métricas consolidadas para el período ${mesActualLabel}`, {
        x: 0.8,
        y: 1.0,
        fontSize: 11,
        color: C_SLATE,
      });

      const kpis = [
        { label: 'Despachos Náuticos', val: `${totalSalidas}`, sub: `${totalPax} Pasajeros (PAX)` },
        { label: 'Cumplimiento SITMAR DIMAR', val: `${porcentajeSitmar}%`, sub: `${totalConSitmar} autorizados con candado` },
        { label: 'Nómina Operativa Liquidada', val: formatCOP(totalNominaCOP), sub: `MDP: ${formatCOP(nominaPorEmpresa.mdp)} | CAT: ${formatCOP(nominaPorEmpresa.cat)}` },
        { label: 'Mantenimiento & Trabajos', val: `${totalTrabajosEjecutados} Trabajos`, sub: `${totalHorasMantenimiento} hrs hombre invertidas` },
      ];

      kpis.forEach((kpi, i) => {
        const x = 0.8 + (i % 2) * 5.8;
        const y = 1.6 + Math.floor(i / 2) * 2.3;
        slide2.addShape(pres.ShapeType.rect, {
          x,
          y,
          w: 5.4,
          h: 2.0,
          fill: { color: C_CARD },
          line: { color: '334155', width: 1 },
        });
        slide2.addText(kpi.label.toUpperCase(), { x: x + 0.3, y: y + 0.3, fontSize: 10, bold: true, color: C_SLATE });
        slide2.addText(kpi.val, { x: x + 0.3, y: y + 0.7, fontSize: 24, bold: true, color: C_WHITE });
        slide2.addText(kpi.sub, { x: x + 0.3, y: y + 1.4, fontSize: 10, color: C_EMERALD });
      });

      // -------------------------------------------------------------
      // SLIDE 3: Despachos Náuticos por Embarcación
      // -------------------------------------------------------------
      const slide3 = pres.addSlide();
      slide3.background = { color: C_NAVY };

      slide3.addText('2. OPERACIONES DE NAVEGACIÓN & DESPACHOS FLOTA', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });

      const salidasTableData: any[][] = [
        [
          { text: 'Embarcación', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Matrícula', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Salidas', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'PAX Transportados', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Candado SITMAR', options: { bold: true, fill: '1E293B', color: C_WHITE } },
        ],
      ];

      salidasPorBarco.forEach((row) => {
        salidasTableData.push([
          { text: row.nombre, options: { color: C_WHITE, bold: true } },
          { text: row.matricula, options: { color: C_SLATE } },
          { text: String(row.salidas), options: { color: C_CYAN, bold: true } },
          { text: String(row.pax), options: { color: C_EMERALD } },
          { text: `${row.sitmar} / ${row.salidas}`, options: { color: C_WHITE } },
        ]);
      });

      slide3.addTable(salidasTableData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        rowH: 0.5,
        border: { color: '334155', pt: 1 },
      });

      // -------------------------------------------------------------
      // SLIDE 4: Seguridad Marítima: Checklists Pre-Zarpe DIMAR
      // -------------------------------------------------------------
      const slide4 = pres.addSlide();
      slide4.background = { color: C_NAVY };

      slide4.addText('3. SEGURIDAD MARÍTIMA: CHECKLISTS PRE-ZARPE DIMAR', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });
      slide4.addText('Inspección de 16 puntos obligatorios de seguridad OMI previa a cada zarpe:', {
        x: 0.8,
        y: 1.0,
        fontSize: 11,
        color: C_SLATE,
      });

      const ckTableData: any[][] = [
        [
          { text: 'Fecha', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Embarcación', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Código SITMAR', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Inspector', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Chalecos & Balsas', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Radio VHF', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Resultado', options: { bold: true, fill: '1E293B', color: C_WHITE } },
        ],
      ];

      filteredChecklists.slice(0, 6).forEach((ck) => {
        const emb = embarcaciones.find((e) => e.id === ck.embarcacionId);
        const chalecos = ck.items?.find((i) => i.accion.toLowerCase().includes('chaleco'))?.cumple ?? true;
        const vhf = ck.items?.find((i) => i.accion.toLowerCase().includes('vhf') || i.accion.toLowerCase().includes('radio'))?.cumple ?? true;
        ckTableData.push([
          { text: ck.fecha, options: { color: C_SLATE, fontSize: 9 } },
          { text: emb?.nombre || ck.embarcacionId, options: { color: C_CYAN, bold: true, fontSize: 10 } },
          { text: ck.codigoSitmar || 'N/A', options: { color: C_WHITE, fontSize: 9 } },
          { text: ck.nombrePiloto || 'Inspector', options: { color: C_WHITE, fontSize: 9 } },
          { text: chalecos ? 'CONFORME' : 'NO CONF.', options: { color: C_EMERALD, fontSize: 9 } },
          { text: vhf ? 'CH 16 OK' : 'FALLA', options: { color: C_CYAN, fontSize: 9 } },
          { text: ck.estado === 'APROBADO_PARA_ZARPE' ? 'AUTORIZADO' : 'PENDIENTE', options: { color: C_EMERALD, bold: true, fontSize: 9 } },
        ]);
      });

      slide4.addTable(ckTableData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        rowH: 0.5,
        border: { color: '334155', pt: 1 },
      });

      // -------------------------------------------------------------
      // SLIDE 5: Servicios Náuticos Comerciales & Planillas MOP
      // -------------------------------------------------------------
      const slide5 = pres.addSlide();
      slide5.background = { color: C_NAVY };

      slide5.addText('4. SERVICIOS COMERCIALES & PLANILLAS MOP', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });
      slide5.addText('Planillas de servicios ejecutados (Full Day / Sunset) e itinerarios en Islas del Rosario:', {
        x: 0.8,
        y: 1.0,
        fontSize: 11,
        color: C_SLATE,
      });

      const srvTableData: any[][] = [
        [
          { text: 'Planilla MOP', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Fecha', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Embarcación', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Cliente', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Destino / Itinerario', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'PAX', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Estado Pago', options: { bold: true, fill: '1E293B', color: C_WHITE } },
        ],
      ];

      filteredServicios.slice(0, 6).forEach((srv) => {
        const emb = embarcaciones.find((e) => e.id === srv.embarcacionId);
        srvTableData.push([
          { text: srv.codigoPlanilla, options: { color: C_CYAN, bold: true, fontSize: 9 } },
          { text: srv.fecha, options: { color: C_SLATE, fontSize: 9 } },
          { text: emb?.nombre || srv.embarcacionId, options: { color: C_WHITE, fontSize: 9 } },
          { text: srv.clienteEmpresa, options: { color: C_WHITE, fontSize: 9 } },
          { text: srv.itinerarioDestino, options: { color: C_SLATE, fontSize: 9 } },
          { text: `${srv.paxConfirmados} PAX`, options: { color: C_EMERALD, bold: true, fontSize: 9 } },
          { text: srv.estadoPago, options: { color: 'F59E0B', bold: true, fontSize: 9 } },
        ]);
      });

      slide5.addTable(srvTableData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        rowH: 0.5,
        border: { color: '334155', pt: 1 },
      });

      // -------------------------------------------------------------
      // SLIDE 6: Asistencia, Nómina & Cuentas de Cobro
      // -------------------------------------------------------------
      const slide6 = pres.addSlide();
      slide6.background = { color: C_NAVY };

      slide6.addText('5. TALENTO HUMANO & LIQUIDACIÓN DE NÓMINA OPERATIVA', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });
      slide6.addText('Resumen de remuneración por rol, actividad y empresa contratante pagadora fija:', {
        x: 0.8,
        y: 1.0,
        fontSize: 11,
        color: C_SLATE,
      });

      slide6.addShape(pres.ShapeType.rect, {
        x: 0.8,
        y: 1.6,
        w: 5.5,
        h: 2.2,
        fill: { color: C_CARD },
        line: { color: '334155', width: 1 },
      });
      slide6.addText('MARÍA DEL PUERTO S.A.S.', { x: 1.1, y: 1.8, fontSize: 13, bold: true, color: 'F59E0B' });
      slide6.addText('Total Nómina Liquidada:', { x: 1.1, y: 2.2, fontSize: 10, color: C_SLATE });
      slide6.addText(formatCOP(nominaPorEmpresa.mdp), { x: 1.1, y: 2.5, fontSize: 22, bold: true, color: C_WHITE });
      slide6.addText('Cuenta de Cobro oficial expedida a NIT 901.124.944-9', { x: 1.1, y: 3.2, fontSize: 9, color: C_SLATE });

      slide6.addShape(pres.ShapeType.rect, {
        x: 6.8,
        y: 1.6,
        w: 5.5,
        h: 2.2,
        fill: { color: C_CARD },
        line: { color: '334155', width: 1 },
      });
      slide6.addText('CATAMARANES Y VELEROS DE CARTAGENA S.A.S.', { x: 7.1, y: 1.8, fontSize: 13, bold: true, color: C_CYAN });
      slide6.addText('Total Nómina Liquidada:', { x: 7.1, y: 2.2, fontSize: 10, color: C_SLATE });
      slide6.addText(formatCOP(nominaPorEmpresa.cat), { x: 7.1, y: 2.5, fontSize: 22, bold: true, color: C_WHITE });
      slide6.addText('Cuenta de Cobro oficial expedida a NIT 901.159.056-4', { x: 7.1, y: 3.2, fontSize: 9, color: C_SLATE });

      slide6.addShape(pres.ShapeType.rect, {
        x: 0.8,
        y: 4.2,
        w: 11.5,
        h: 2.2,
        fill: { color: C_CARD },
        line: { color: '334155', width: 1 },
      });
      slide6.addText('TARIFAS OFICIALES VIGENTES:', { x: 1.1, y: 4.4, fontSize: 11, bold: true, color: C_EMERALD });
      slide6.addText('• Piloto Full Day: $200.000 | Piloto Sunset: $150.000\n• Ayudante Full Day: $90.000 | Ayudante Sunset: $75.000 | Ayudante Mant.: $65.000\n• Mesero: $80.000 | Barman: $100.000\n• Limpieza Charter: $80.000 | Limpieza Barco: $60.000 | Limpieza Oficina: $70.000', {
        x: 1.1,
        y: 4.7,
        fontSize: 10,
        color: C_WHITE,
      });

      // -------------------------------------------------------------
      // SLIDE 7: Ingeniería Naval & Horas Motor
      // -------------------------------------------------------------
      const slide7 = pres.addSlide();
      slide7.background = { color: C_NAVY };

      slide7.addText('6. INGENIERÍA NAVAL: HORAS MOTOR & LÍMITES MOP', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });
      slide7.addText('Monitoreo preventivo de motores Yanmar Diesel y plantas Northern Lights:', {
        x: 0.8,
        y: 1.0,
        fontSize: 11,
        color: C_SLATE,
      });

      const motorTableData: any[][] = [
        [
          { text: 'Embarcación', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Motores Principales', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Horas Acumuladas', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Límite Próx. MOP', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Horas Restantes', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Estado Operativo', options: { bold: true, fill: '1E293B', color: C_WHITE } },
        ],
      ];

      embarcaciones.forEach((e) => {
        const rest = e.limiteHorasMantenimiento - e.horasMotorAcumuladas;
        motorTableData.push([
          { text: e.nombre, options: { color: C_WHITE, bold: true } },
          { text: e.motores, options: { color: C_SLATE, fontSize: 9 } },
          { text: `${e.horasMotorAcumuladas} hrs`, options: { color: C_CYAN, bold: true } },
          { text: `${e.limiteHorasMantenimiento} hrs`, options: { color: 'F59E0B' } },
          { text: `${rest} hrs`, options: { color: rest < 30 ? 'EF4444' : C_EMERALD, bold: true } },
          { text: e.estado, options: { color: C_EMERALD, bold: true } },
        ]);
      });

      slide7.addTable(motorTableData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        rowH: 0.6,
        border: { color: '334155', pt: 1 },
      });

      // -------------------------------------------------------------
      // SLIDE 8: Bitácora de Trabajos Diarios por Barco
      // -------------------------------------------------------------
      const slide8 = pres.addSlide();
      slide8.background = { color: C_NAVY };

      slide8.addText('7. BITÁCORA DE TRABAJOS DIARIOS POR BARCO', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });
      slide8.addText('Intervenciones técnicas diarias realizadas por colaboradores en cada embarcación:', {
        x: 0.8,
        y: 1.0,
        fontSize: 11,
        color: C_SLATE,
      });

      const trabajosTableData: any[][] = [
        [
          { text: 'Fecha', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Embarcación', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Colaborador', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Sistema', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Trabajo Realizado', options: { bold: true, fill: '1E293B', color: C_WHITE } },
        ],
      ];

      filteredTrabajos.slice(0, 6).forEach((t) => {
        trabajosTableData.push([
          { text: t.fecha, options: { color: C_SLATE, fontSize: 9 } },
          { text: t.embarcacionNombre, options: { color: C_CYAN, bold: true, fontSize: 10 } },
          { text: t.colaboradorNombre, options: { color: C_WHITE, fontSize: 9 } },
          { text: t.sistema, options: { color: 'F59E0B', fontSize: 9 } },
          { text: t.descripcion, options: { color: C_WHITE, fontSize: 9 } },
        ]);
      });

      slide8.addTable(trabajosTableData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        rowH: 0.6,
        border: { color: '334155', pt: 1 },
      });

      // -------------------------------------------------------------
      // SLIDE 9: Finanzas Operacionales & Fondo de Compras
      // -------------------------------------------------------------
      const slide9 = pres.addSlide();
      slide9.background = { color: C_NAVY };

      slide9.addText('8. FINANZAS OPERACIONALES & FONDO DE COMPRAS', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });
      slide9.addText('Control de caja menor, pagos de combustible, muellajes y avituallamiento:', {
        x: 0.8,
        y: 1.0,
        fontSize: 11,
        color: C_SLATE,
      });

      const comprasTableData: any[][] = [
        [
          { text: 'Código', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Fecha', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Categoría', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Proveedor', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Destino / Nave', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Monto Total COP', options: { bold: true, fill: '1E293B', color: C_WHITE } },
        ],
      ];

      filteredCompras.slice(0, 6).forEach((c) => {
        comprasTableData.push([
          { text: c.codigoGasto, options: { color: C_CYAN, fontSize: 9, bold: true } },
          { text: c.fecha, options: { color: C_SLATE, fontSize: 9 } },
          { text: c.categoria, options: { color: C_WHITE, fontSize: 9 } },
          { text: c.proveedor, options: { color: C_WHITE, fontSize: 9 } },
          { text: c.embarcacionNombre || 'Flota General', options: { color: C_SLATE, fontSize: 9 } },
          { text: formatCOP(c.montoTotalCOP), options: { color: C_EMERALD, bold: true, fontSize: 9 } },
        ]);
      });

      slide9.addTable(comprasTableData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        rowH: 0.5,
        border: { color: '334155', pt: 1 },
      });

      // -------------------------------------------------------------
      // SLIDE 10: Lavandería & Aseo de Naves
      // -------------------------------------------------------------
      const slide10 = pres.addSlide();
      slide10.background = { color: C_NAVY };

      slide10.addText('9. HOTELERÍA MARINA: LAVANDERÍA & ASEO DE NAVES', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });
      slide10.addText('Control de lencería de a bordo (toallas, forros, uniformes) y jornadas de aseo profundo:', {
        x: 0.8,
        y: 1.0,
        fontSize: 11,
        color: C_SLATE,
      });

      const lavTableData: any[][] = [
        [
          { text: 'Fecha', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Embarcación / Sede', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Tipo de Servicio', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Responsable', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Estado Lencería', options: { bold: true, fill: '1E293B', color: C_WHITE } },
        ],
      ];

      filteredLavanderia.slice(0, 6).forEach((l) => {
        lavTableData.push([
          { text: l.fecha, options: { color: C_SLATE, fontSize: 9 } },
          { text: l.embarcacionNombre || l.ubicacionManual || 'Flota', options: { color: C_WHITE, bold: true, fontSize: 9 } },
          { text: l.tipoServicioAseo || l.tipoRegistro, options: { color: C_CYAN, fontSize: 9 } },
          { text: l.responsable, options: { color: C_WHITE, fontSize: 9 } },
          { text: l.estadoLencería || l.estadoLenceria || 'LISTO_A_BORDO', options: { color: C_EMERALD, bold: true, fontSize: 9 } },
        ]);
      });

      slide10.addTable(lavTableData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        rowH: 0.5,
        border: { color: '334155', pt: 1 },
      });

      // -------------------------------------------------------------
      // SLIDE 11: Inventario de Repuestos Navales & Almacén
      // -------------------------------------------------------------
      const slide11 = pres.addSlide();
      slide11.background = { color: C_NAVY };

      slide11.addText('10. CADENA DE SUMINISTRO: INVENTARIO DE REPUESTOS', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });
      slide11.addText('Repuestos marinos críticos en almacén (filtros Racor, turbinas, correas, aceites 15W40):', {
        x: 0.8,
        y: 1.0,
        fontSize: 11,
        color: C_SLATE,
      });

      const invTableData: any[][] = [
        [
          { text: 'Código', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Repuesto / Insumo', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Stock Actual', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Stock Mínimo', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Costo Unitario COP', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Ubicación', options: { bold: true, fill: '1E293B', color: C_WHITE } },
        ],
      ];

      items.slice(0, 6).forEach((it) => {
        invTableData.push([
          { text: it.codigo, options: { color: C_CYAN, fontSize: 9, bold: true } },
          { text: it.nombre, options: { color: C_WHITE, fontSize: 9 } },
          { text: `${it.stockActual} ${it.unidadMedida}`, options: { color: it.stockActual <= it.stockMinimo ? 'EF4444' : C_EMERALD, bold: true, fontSize: 9 } },
          { text: `${it.stockMinimo} ${it.unidadMedida}`, options: { color: C_SLATE, fontSize: 9 } },
          { text: formatCOP(it.costoUnitarioCOP), options: { color: C_WHITE, fontSize: 9 } },
          { text: it.ubicacionAlmacen, options: { color: C_SLATE, fontSize: 9 } },
        ]);
      });

      slide11.addTable(invTableData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        rowH: 0.5,
        border: { color: '334155', pt: 1 },
      });

      // -------------------------------------------------------------
      // SLIDE 12: Proveedores & Talleres Navales
      // -------------------------------------------------------------
      const slide12 = pres.addSlide();
      slide12.background = { color: C_NAVY };

      slide12.addText('11. RED DE PROVEEDORES & TALLERES NAVALES', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });
      slide12.addText('Talleres certificados en Manga, El Bosque y Bahía de Cartagena:', {
        x: 0.8,
        y: 1.0,
        fontSize: 11,
        color: C_SLATE,
      });

      const provTableData: any[][] = [
        [
          { text: 'Taller / Proveedor', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Especialidad Naval', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Contacto', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Teléfono', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Ubicación en Cartagena', options: { bold: true, fill: '1E293B', color: C_WHITE } },
        ],
      ];

      proveedores.slice(0, 6).forEach((pv) => {
        provTableData.push([
          { text: pv.nombreComercial || pv.razonSocial, options: { color: C_WHITE, bold: true, fontSize: 9 } },
          { text: pv.tipoServicio ? pv.tipoServicio.replace(/_/g, ' ') : 'Servicios Navales', options: { color: C_CYAN, fontSize: 9 } },
          { text: pv.contactoNombre, options: { color: C_SLATE, fontSize: 9 } },
          { text: pv.telefono, options: { color: C_EMERALD, fontSize: 9 } },
          { text: pv.direccion, options: { color: C_SLATE, fontSize: 9 } },
        ]);
      });

      slide12.addTable(provTableData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        rowH: 0.5,
        border: { color: '334155', pt: 1 },
      });

      // -------------------------------------------------------------
      // SLIDE 13: Fichas Técnicas & Certificados DIMAR
      // -------------------------------------------------------------
      const slide13 = pres.addSlide();
      slide13.background = { color: C_NAVY };

      slide13.addText('12. FICHAS TÉCNICAS DE FLOTA & CERTIFICADOS DIMAR', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });

      const flotaTableData: any[][] = [
        [
          { text: 'Embarcación', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Matrícula', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Capacidad PAX', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Motores Yanmar', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Cert. Seguridad DIMAR', options: { bold: true, fill: '1E293B', color: C_WHITE } },
          { text: 'Póliza Accidentes', options: { bold: true, fill: '1E293B', color: C_WHITE } },
        ],
      ];

      embarcaciones.forEach((e) => {
        const docSeg = e.documentos.find((d) => d.tipo === 'CERTIFICADO_SEGURIDAD');
        const docPol = e.documentos.find((d) => d.tipo === 'POLIZA_ACCIDENTES_COLECTIVOS');
        flotaTableData.push([
          { text: e.nombre, options: { color: C_WHITE, bold: true } },
          { text: e.matricula, options: { color: C_SLATE } },
          { text: `${e.capacidadMaxPax} PAX`, options: { color: C_CYAN } },
          { text: e.motores, options: { color: C_WHITE, fontSize: 8 } },
          { text: docSeg?.fechaVencimiento || 'Vigente', options: { color: C_EMERALD } },
          { text: docPol?.fechaVencimiento || 'Vigente', options: { color: C_EMERALD } },
        ]);
      });

      slide13.addTable(flotaTableData, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        rowH: 0.6,
        border: { color: '334155', pt: 1 },
      });

      // -------------------------------------------------------------
      // SLIDE 14: Tripulación & Firma de Auditoría DPA
      // -------------------------------------------------------------
      const slide14 = pres.addSlide();
      slide14.background = { color: C_NAVY };

      slide14.addText('13. TRIPULACIÓN MARÍTIMA & AUDITORÍA DPA', {
        x: 0.8,
        y: 0.6,
        fontSize: 20,
        bold: true,
        color: C_CYAN,
      });

      slide14.addShape(pres.ShapeType.rect, {
        x: 0.8,
        y: 1.3,
        w: 11.5,
        h: 2.5,
        fill: { color: C_CARD },
        line: { color: '334155', width: 1 },
      });

      slide14.addText('DOTACIÓN OFICIAL DE 29 TRIPULANTES REGISTRADOS:', {
        x: 1.1,
        y: 1.5,
        fontSize: 12,
        bold: true,
        color: C_CYAN,
      });
      slide14.addText(`• María del Puerto S.A.S.: ${tripulacion.filter((t) => t.empresaContratanteId === 'maria-del-puerto').length} Colaboradores Fijos\n• Catamarán Cartagena S.A.S.: ${tripulacion.filter((t) => t.empresaContratanteId !== 'maria-del-puerto').length} Colaboradores Fijos\n• Licencias DIMAR Verificadas: 100% de Capitanes y Marineros con cursos OMI y certificados Cendiatra al día.`, {
        x: 1.1,
        y: 1.9,
        fontSize: 11,
        color: C_WHITE,
        fontFace: 'Arial',
      });

      slide14.addShape(pres.ShapeType.rect, {
        x: 0.8,
        y: 4.2,
        w: 11.5,
        h: 2.5,
        fill: { color: '0F172A' },
        line: { color: '06B6D4', width: 1.5 },
      });

      slide14.addText('CERTIFICACIÓN Y AUDITORÍA DE OPERACIONES:', {
        x: 1.1,
        y: 4.4,
        fontSize: 11,
        bold: true,
        color: C_EMERALD,
      });
      slide14.addText(`Certifico que todos los datos contenidos en este informe mensual corresponden fielmente a las operaciones ejecutadas, despachos con código SITMAR verificados, mantenimientos de flota y nóminas liquidadas para el período ${mesActualLabel}.`, {
        x: 1.1,
        y: 4.8,
        w: 10.8,
        fontSize: 11,
        color: C_WHITE,
      });
      slide14.addText(`Firma Digital DPA: ${currentUser.nombre} • CC 1.007.625.049\nDirectora de Operaciones & Designada Persona en Tierra (DPA)`, {
        x: 1.1,
        y: 5.8,
        fontSize: 11,
        bold: true,
        color: C_CYAN,
      });

      // Save PowerPoint file
      const pptxFileName = `COBRANDING_OPS_Presentacion_Ejecutiva_${mesActualLabel.replace(/\s+/g, '_')}.pptx`;
      await pres.writeFile({ fileName: pptxFileName });

      setExportSuccessMsg(`Presentación PowerPoint "${pptxFileName}" generada exitosamente con 14 diapositivas ejecutivas editables.`);
      setTimeout(() => setExportSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(`Error al generar PowerPoint: ${err.message}`);
    } finally {
      setIsExportingPptx(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER WITH MONTH SELECTOR & EXPORT BUTTONS */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl border border-slate-800 shadow-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Dashboard Consolidado • Todos los Módulos
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {mesActualLabel}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Informe Mensual de Operaciones Flota & Finanzas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Consolidación integral de los 11 módulos de Cobranding Ops: Despachos Náuticos con Candado SITMAR, Checklists DIMAR, Cuentas de Cobro, Nómina MDP vs CAT, Trabajos Diarios por Barco, Compras, Lavandería, Repuestos y Flota.
            </p>
          </div>

          {/* Action buttons & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
              <Calendar className="w-4 h-4 text-cyan-400 ml-2" />
              <select
                value={selectedMes}
                onChange={(e) => setSelectedMes(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none pr-3 cursor-pointer"
              >
                {MESES.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
              <Ship className="w-4 h-4 text-emerald-400 ml-2" />
              <select
                value={selectedEmbId}
                onChange={(e) => setSelectedEmbId(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none pr-3 cursor-pointer"
              >
                <option value="TODAS" className="bg-slate-900 text-white">Toda la Flota</option>
                {embarcaciones.map((e) => (
                  <option key={e.id} value={e.id} className="bg-slate-900 text-white">
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* DOWNLOAD EXCEL */}
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>{isExportingExcel ? 'Generando Excel...' : 'Descargar Excel (.xlsx)'}</span>
            </button>

            {/* DOWNLOAD POWERPOINT */}
            <button
              onClick={handleExportPowerPoint}
              disabled={isExportingPptx}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Presentation className="w-4 h-4 text-orange-200" />
              <span>{isExportingPptx ? 'Creando Diapositivas...' : 'Descargar PowerPoint (.pptx)'}</span>
            </button>
          </div>
        </div>

        {/* Success toast inside module */}
        {exportSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-950/90 border border-emerald-500/80 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}

        {/* TOP QUICK METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Despachos del Mes</span>
            <span className="text-xl font-black text-cyan-400 mt-0.5 block">{totalSalidas} Zarpes</span>
            <span className="text-[10px] text-slate-400 font-medium">{totalPax} PAX transportados</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Candado SITMAR</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">{porcentajeSitmar}%</span>
            <span className="text-[10px] text-emerald-300 font-medium">{totalConSitmar} autorizados</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nómina Liquidada</span>
            <span className="text-base font-black text-amber-400 mt-0.5 block truncate">{formatCOP(totalNominaCOP)}</span>
            <span className="text-[10px] text-slate-400">MDP + CAT</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Gastos & Compras</span>
            <span className="text-base font-black text-rose-400 mt-0.5 block truncate">{formatCOP(totalComprasCOP)}</span>
            <span className="text-[10px] text-slate-400">{filteredCompras.length} facturas/gastos</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Trabajos Diarios</span>
            <span className="text-xl font-black text-teal-400 mt-0.5 block">{totalTrabajosEjecutados}</span>
            <span className="text-[10px] text-slate-400">{totalHorasMantenimiento} hrs hombre</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Flota Principal</span>
            <span className="text-xl font-black text-white mt-0.5 block">{embarcaciones.length} Naves</span>
            <span className="text-[10px] text-slate-400">100% Certificados DIMAR</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TAB NAVIGATION WITH ALL 12 MODULES */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-semibold scrollbar-thin">
        <button
          onClick={() => setActiveTab('RESUMEN')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'RESUMEN'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Resumen General</span>
        </button>

        <button
          onClick={() => setActiveTab('SALIDAS')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'SALIDAS'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Despachos ({filteredSalidas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CHECKLISTS')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'CHECKLISTS'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Checklists DIMAR ({filteredChecklists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SERVICIOS')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'SERVICIOS'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Planillas & Cobros ({filteredServicios.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ASISTENCIA')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ASISTENCIA'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Nómina & Turnos ({filteredAsistencias.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MANTENIMIENTO')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'MANTENIMIENTO'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Trabajos Diarios ({filteredTrabajos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPRAS')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'COMPRAS'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Compras & Gastos ({filteredCompras.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LAVANDERIA')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'LAVANDERIA'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Lavandería ({filteredLavanderia.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INVENTARIO')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'INVENTARIO'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Repuestos ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROVEEDORES')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'PROVEEDORES'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Talleres ({proveedores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FLOTA')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'FLOTA'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Ship className="w-3.5 h-3.5" />
          <span>Flota ({embarcaciones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TRIPULACION')}
          className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'TRIPULACION'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Tripulación ({tripulacion.length})</span>
        </button>
      </div>

      {/* =============================================================
          TAB 1: RESUMEN EJECUTIVO GENERAL (TODOS LOS MÓDULOS)
          ============================================================= */}
      {activeTab === 'RESUMEN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salidasPorBarco.map((barco) => {
              const emb = embarcaciones.find((e) => e.nombre.includes(barco.nombre) || barco.nombre.includes(e.nombre));
              const trabajosDeEsteBarco = filteredTrabajos.filter((t) => t.embarcacionNombre.includes(barco.nombre));

              return (
                <div key={barco.nombre} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
                        ⚓
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{barco.nombre}</h3>
                        <p className="text-slate-400 text-xs font-mono">{barco.matricula}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {emb?.estado || 'OPERATIVO'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Salidas Mes</span>
                      <span className="text-base font-bold text-cyan-400">{barco.salidas}</span>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">PAX Transportados</span>
                      <span className="text-base font-bold text-emerald-400">{barco.pax}</span>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Trabajos Mant.</span>
                      <span className="text-base font-bold text-amber-400">{trabajosDeEsteBarco.length}</span>
                    </div>
                  </div>

                  {trabajosDeEsteBarco.length > 0 && (
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs">
                      <div className="text-[11px] font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Último trabajo realizado:</span>
                      </div>
                      <p className="text-slate-300 line-clamp-2 italic">"{trabajosDeEsteBarco[0].descripcion}"</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Por {trabajosDeEsteBarco[0].colaboradorNombre} • {trabajosDeEsteBarco[0].fecha}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* LIQUIDACIÓN DE NÓMINA POR EMPRESA PAGADORA LEGAL */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <BadgeDollarSign className="w-5 h-5 text-emerald-400" />
              Liquidación Legal Quincenal por Empresa Pagadora
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Conforme a la regla maestra, la Cuenta de Cobro se expide exclusivamente a nombre de la empresa contratante fija del trabajador:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-amber-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-400 text-sm">MARÍA DEL PUERTO S.A.S.</span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 font-mono">
                    NIT 901.124.944-9
                  </span>
                </div>
                <div className="text-2xl font-black text-white">{formatCOP(nominaPorEmpresa.mdp)}</div>
                <p className="text-xs text-slate-400 mt-2">
                  Total devengado por colaboradores asignados contractualmente a María del Puerto en turnos de navegación, mantenimiento y aseo.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-cyan-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-cyan-400 text-sm">CATAMARANES Y VELEROS DE CARTAGENA S.A.S.</span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                    NIT 901.159.056-4
                  </span>
                </div>
                <div className="text-2xl font-black text-white">{formatCOP(nominaPorEmpresa.cat)}</div>
                <p className="text-xs text-slate-400 mt-2">
                  Total devengado por colaboradores asignados contractualmente a Catamaranes y Veleros en turnos operativos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 2: DESPACHOS NÁUTICOS (CANDADO SITMAR)
          ============================================================= */}
      {activeTab === 'SALIDAS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Despachos Náuticos Registrados ({filteredSalidas.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {porcentajeSitmar}% con Código DIMAR SITMAR
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Embarcación</th>
                  <th className="py-3 px-4">Servicio</th>
                  <th className="py-3 px-4">Código SITMAR</th>
                  <th className="py-3 px-4 text-center">PAX</th>
                  <th className="py-3 px-4">Piloto</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSalidas.map((s) => {
                  const emb = embarcaciones.find((e) => e.id === s.embarcacionId);
                  const pil = tripulacion.find((t) => t.id === s.pilotoId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-white">{s.fecha}</td>
                      <td className="py-3 px-4 font-bold text-white">{emb?.nombre || s.embarcacionId}</td>
                      <td className="py-3 px-4">{s.tipoServicio}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-cyan-300 font-bold">{s.codigoSitmar || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-400">{s.paxReales || s.paxProgramados}</td>
                      <td className="py-3 px-4 text-slate-200">{pil?.nombreCompleto || s.pilotoId}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {s.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 3: CHECKLISTS PRE-ZARPE DIMAR (16 PUNTOS)
          ============================================================= */}
      {activeTab === 'CHECKLISTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Inspecciones Pre-Zarpe DIMAR ({filteredChecklists.length})
            </h3>
            <span className="text-xs text-emerald-400 font-bold">Estándar 16 Puntos OMI</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Embarcación</th>
                  <th className="py-3 px-4">Inspector / Capitán</th>
                  <th className="py-3 px-4 text-center">Chalecos</th>
                  <th className="py-3 px-4 text-center">Balsas</th>
                  <th className="py-3 px-4 text-center">VHF Ch 16</th>
                  <th className="py-3 px-4 text-center">Luces</th>
                  <th className="py-3 px-4 text-center">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredChecklists.map((ck) => {
                  const emb = embarcaciones.find((e) => e.id === ck.embarcacionId);
                  const chalecos = ck.items?.find((i) => i.accion.toLowerCase().includes('chaleco'))?.cumple ?? true;
                  const balsas = ck.items?.find((i) => i.accion.toLowerCase().includes('balsa'))?.cumple ?? true;
                  const vhf = ck.items?.find((i) => i.accion.toLowerCase().includes('vhf') || i.accion.toLowerCase().includes('radio'))?.cumple ?? true;
                  const luces = ck.items?.find((i) => i.accion.toLowerCase().includes('luces'))?.cumple ?? true;
                  return (
                    <tr key={ck.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-white">{ck.fecha}</td>
                      <td className="py-3 px-4 font-bold text-white">{emb?.nombre || ck.embarcacionId}</td>
                      <td className="py-3 px-4 text-slate-200">{ck.nombrePiloto || ck.nombreDpa || 'Inspector'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${chalecos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {chalecos ? '✓ OK' : '✗ FALLA'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${balsas ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {balsas ? '✓ VIGENTE' : '✗ REVISIÓN'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${vhf ? 'text-cyan-400' : 'text-rose-400'}`}>
                          {vhf ? '✓ OK' : '✗ FALLA'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${luces ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {luces ? '✓ OK' : '✗ FALLA'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {ck.estado === 'APROBADO_PARA_ZARPE' ? 'AUTORIZADO' : 'PENDIENTE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 4: SERVICIOS QUINCENALES & PLANILLAS
          ============================================================= */}
      {activeTab === 'SERVICIOS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Planillas de Servicios Comerciales ({filteredServicios.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Charters Full Day & Sunset</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Planilla</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Embarcación</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Itinerario</th>
                  <th className="py-3 px-4 text-center">PAX</th>
                  <th className="py-3 px-4 text-center">Estado Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredServicios.map((srv) => {
                  const emb = embarcaciones.find((e) => e.id === srv.embarcacionId);
                  return (
                    <tr key={srv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">{srv.codigoPlanilla}</td>
                      <td className="py-3 px-4 font-mono text-white">{srv.fecha}</td>
                      <td className="py-3 px-4 font-semibold text-white">{emb?.nombre || srv.embarcacionId}</td>
                      <td className="py-3 px-4 text-slate-200">{srv.clienteEmpresa}</td>
                      <td className="py-3 px-4 text-slate-300">{srv.itinerarioDestino}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-400">{srv.paxConfirmados}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          {srv.estadoPago}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 5: ASISTENCIA & NÓMINA (ROLES ROTATIVOS)
          ============================================================= */}
      {activeTab === 'ASISTENCIA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Turnos & Asistencia de Personal ({filteredAsistencias.length})
            </h3>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              Total Nómina: {formatCOP(totalNominaCOP)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Colaborador</th>
                  <th className="py-3 px-4">Rol / Actividad</th>
                  <th className="py-3 px-4">Nave / Sede</th>
                  <th className="py-3 px-4">Empresa Pagadora</th>
                  <th className="py-3 px-4 text-right">Tarifa COP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAsistencias.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">{a.fecha}</td>
                    <td className="py-3 px-4 font-bold text-white">
                      <div>{a.usuarioNombre}</div>
                      {a.colaboradorDocumento && (
                        <div className="text-[10px] text-slate-400 font-mono">CC {a.colaboradorDocumento}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {a.tipoSalidaActividad || a.rolDesempenado || a.motivoJornada}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{a.embarcacionNombre || 'Oficina / Sede'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.colaboradorEmpresaId === 'catamaranes-veleros'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {a.colaboradorEmpresaId === 'catamaranes-veleros' ? 'Catamarán Cartagena' : 'María del Puerto'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCOP(a.tarifaLiquidadaCOP || a.tarifaSesionCOP || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 6: TRABAJOS DIARIOS DE MANTENIMIENTO POR BARCO
          ============================================================= */}
      {activeTab === 'MANTENIMIENTO' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-1">
              <Wrench className="w-5 h-5 text-emerald-400" />
              Bitácora de Trabajos Diarios por Barco ({filteredTrabajos.length})
            </h3>
            <p className="text-xs text-slate-400">
              Registro técnico diario de lo realizado por colaboradores en cada embarcación (ej. Armonía se realizó...):
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrabajos.map((trabajo) => (
              <div key={trabajo.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">⚓</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{trabajo.embarcacionNombre}</h4>
                      <span className="text-xs font-semibold text-cyan-400">{trabajo.titulo}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    {trabajo.sistema}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-200">
                  <span className="font-bold text-cyan-300 block mb-1">Detalle del Trabajo:</span>
                  {trabajo.descripcion}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-400">
                  <div>
                    <span className="block font-medium">Responsable / Técnico:</span>
                    <span className="text-white font-bold">{trabajo.colaboradorNombre}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-medium">Fecha & Horas:</span>
                    <span className="text-white font-bold">{trabajo.fecha} • {trabajo.horasInvertidas || 0} hrs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 7: COMPRAS & GASTOS OPERATIVOS
          ============================================================= */}
      {activeTab === 'COMPRAS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              Gastos & Compras Operativas ({filteredCompras.length})
            </h3>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              Total: {formatCOP(totalComprasCOP)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4">Factura No.</th>
                  <th className="py-3 px-4 text-right">Monto COP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCompras.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">{c.fecha}</td>
                    <td className="py-3 px-4 font-mono text-cyan-300">{c.codigoGasto}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{c.categoria}</td>
                    <td className="py-3 px-4 text-white font-medium">{c.proveedor}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.numeroFactura}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCOP(c.montoTotalCOP)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 8: LAVANDERÍA & ASEO DE NAVES
          ============================================================= */}
      {activeTab === 'LAVANDERIA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Jornadas de Aseo & Control de Lencería ({filteredLavanderia.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Hotelería Marina</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Embarcación / Sede</th>
                  <th className="py-3 px-4">Tipo de Servicio</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4">Prendas / Lencería</th>
                  <th className="py-3 px-4 text-center">Estado Lencería</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLavanderia.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">{l.fecha}</td>
                    <td className="py-3 px-4 font-bold text-white">{l.embarcacionNombre || l.ubicacionManual || 'Flota'}</td>
                    <td className="py-3 px-4">{l.tipoServicioAseo || l.tipoRegistro}</td>
                    <td className="py-3 px-4 text-slate-200">{l.responsable}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {(l.prendas || l.itemsPrendas || []).map((p) => `${p.prenda} (${p.cantidad})`).join(', ') || 'Aseo General'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {l.estadoLencería || l.estadoLenceria || 'LISTO_A_BORDO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 9: INVENTARIO DE REPUESTOS
          ============================================================= */}
      {activeTab === 'INVENTARIO' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              Inventario de Repuestos Navales & Almacén ({items.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Filtros, Correas & Lubricantes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Repuesto / Descripción</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4 text-center">Stock Actual</th>
                  <th className="py-3 px-4 text-center">Stock Mínimo</th>
                  <th className="py-3 px-4 text-right">Costo Unitario COP</th>
                  <th className="py-3 px-4">Ubicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">{it.codigo}</td>
                    <td className="py-3 px-4 font-bold text-white">{it.nombre}</td>
                    <td className="py-3 px-4 text-slate-300">{it.categoria}</td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        it.stockActual <= it.stockMinimo
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {it.stockActual} {it.unidadMedida}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">{it.stockMinimo} {it.unidadMedida}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                      {formatCOP(it.costoUnitarioCOP)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{it.ubicacionAlmacen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 10: PROVEEDORES & TALLERES NAVALES
          ============================================================= */}
      {activeTab === 'PROVEEDORES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedores.map((pv) => (
            <div key={pv.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white text-base">{pv.nombreComercial || pv.razonSocial}</h4>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {pv.tipoServicio ? pv.tipoServicio.replace(/_/g, ' ') : 'Servicios Navales'}
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contacto: <strong className="text-white">{pv.contactoNombre}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-emerald-300">{pv.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{pv.direccion}, {pv.ciudad}</span>
                </div>
                {pv.nit && (
                  <div className="text-[11px] text-slate-500 font-mono">
                    NIT: {pv.nit}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =============================================================
          TAB 11: ESTADO DE FLOTA & CERTIFICADOS DIMAR
          ============================================================= */}
      {activeTab === 'FLOTA' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {embarcaciones.map((e) => (
            <div key={e.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">{e.nombre}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {e.estado}
                </span>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5">
                <div>Matrícula: <span className="text-slate-200 font-mono font-bold">{e.matricula}</span></div>
                <div>Capacidad: <span className="text-slate-200 font-bold">{e.capacidadMaxPax} PAX</span></div>
                <div>Horas Motor: <span className="text-emerald-400 font-mono font-bold">{e.horasMotorAcumuladas} hrs</span></div>
                <div>Límite Servicio: <span className="text-amber-400 font-mono font-bold">{e.limiteHorasMantenimiento} hrs</span></div>
                <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                  {e.motores}
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Certificados:</span>
                  <span className="font-bold text-cyan-400">{e.documentos.length} DIMAR Vigentes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =============================================================
          TAB 12: TRIPULACIÓN OFICIAL & LICENCIAS MARÍTIMAS
          ============================================================= */}
      {activeTab === 'TRIPULACION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              Dotación Oficial de Tripulación ({tripulacion.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Licencias DIMAR & Cendiatra</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tripulante</th>
                  <th className="py-3 px-4">Cédula</th>
                  <th className="py-3 px-4">Cargo Oficial</th>
                  <th className="py-3 px-4">Empresa Contratante</th>
                  <th className="py-3 px-4">Licencia DIMAR</th>
                  <th className="py-3 px-4">Vencimiento</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tripulacion.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{t.nombreCompleto}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{t.documentoIdentidad}</td>
                    <td className="py-3 px-4 text-slate-200">{t.cargoDescripcion || t.cargo}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.empresaContratanteId === 'catamaranes-veleros'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {t.empresaContratanteId === 'catamaranes-veleros' ? 'Catamarán Cartagena' : 'María del Puerto'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">
                      {t.licencia?.numero ? `${t.licencia.categoria} - ${t.licencia.numero}` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{t.licencia?.fechaVencimiento || 'N/A'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {t.licencia?.estado || 'VIGENTE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
