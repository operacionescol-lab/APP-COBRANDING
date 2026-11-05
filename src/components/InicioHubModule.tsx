import React from 'react';
import {
  Compass,
  FileCheck,
  CalendarDays,
  Clock,
  ShoppingBag,
  Wrench,
  Package,
  Sparkles,
  Anchor,
  Users,
  Bot,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Receipt,
  Building2,
  Lock,
  Layers,
  Ship,
  DollarSign,
  FileBarChart,
} from 'lucide-react';
import {
  Salida,
  Embarcacion,
  Tripulante,
  GastoCompra,
  RegistroAsistencia,
  ChecklistPreZarpe,
  PerfilUsuarioAuth,
} from '../types/nautical';

interface InicioHubModuleProps {
  onNavigateTab: (tabId: string) => void;
  salidas: Salida[];
  embarcaciones: Embarcacion[];
  tripulacion: Tripulante[];
  compras: GastoCompra[];
  asistencias: RegistroAsistencia[];
  checklists: ChecklistPreZarpe[];
  currentUser: PerfilUsuarioAuth;
}

export const InicioHubModule: React.FC<InicioHubModuleProps> = ({
  onNavigateTab,
  salidas,
  embarcaciones,
  tripulacion,
  compras,
  asistencias,
  checklists,
  currentUser,
}) => {
  // Key operational metrics
  const totalSalidas = salidas.length;
  const salidasEjecutadas = salidas.filter((s) => s.estado === 'EJECUTADA').length;
  const conSitmar = salidas.filter((s) => s.codigoSitmar && s.codigoSitmar.length >= 5).length;
  const sitmarPct = totalSalidas > 0 ? Math.round((conSitmar / totalSalidas) * 100) : 100;

  const alertasDocumentos = embarcaciones.flatMap((e) =>
    e.documentos.filter((d) => d.estado === 'POR_VENCER' || d.estado === 'VENCIDO')
  ).length + tripulacion.filter((t) => t.licencia?.estado === 'POR_VENCER').length;

  const totalColaboradores = tripulacion.length;
  const colabMDP = tripulacion.filter((t) => t.empresaContratanteId === 'maria-del-puerto').length;
  const colabCAT = tripulacion.filter((t) => t.empresaContratanteId !== 'maria-del-puerto').length;

  const turnosActivos = asistencias.filter((a) => a.estado === 'EN_TURNO').length;
  const totalGastosCOP = compras.reduce((sum, c) => sum + (c.montoTotalCOP || 0), 0);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isDirector =
    currentUser.rol === 'DIRECTOR_OPERACIONES' ||
    currentUser.rol === 'DIRECTOR_OPERACIONES_DPA' ||
    (currentUser as any).rol === 'SUPER_ADMIN' ||
    currentUser.permissions === 'SUPER_ADMIN';

  // Module items list
  const modulos = [
    {
      id: 'salidas',
      title: 'Control de Salidas & Candado SITMAR',
      tag: 'Operaciones Marítimas',
      description: 'Programación de charters, registro de pasajeros, candado operativo DIMAR y firma digital del piloto.',
      icon: Compass,
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'border-blue-500/30 hover:border-blue-400',
      bgColor: 'bg-blue-500/10 text-blue-400',
      metric: `${salidasEjecutadas} de ${totalSalidas} Zarpes`,
      subMetric: `${sitmarPct}% con Código SITMAR`,
      badge: 'DIMAR CP05',
    },
    {
      id: 'checklists',
      title: 'Checklists Pre-Zarpe DIMAR',
      tag: 'Seguridad de la Vida Humana',
      description: 'Inspección de 16 puntos obligatorios: chalecos, balsas, luces de navegación, radio VHF y firma DPA.',
      icon: FileCheck,
      color: 'from-emerald-600 to-teal-600',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      bgColor: 'bg-emerald-500/10 text-emerald-400',
      metric: `${checklists.length} Inspecciones`,
      subMetric: 'Cumplimiento Estándar OMI',
      badge: '16 Puntos',
    },
    {
      id: 'servicios',
      title: 'Servicios Quincenales & Cuentas de Cobro',
      tag: 'Liquidación & Facturación',
      description: 'Planilla de servicios ejecutados (Full Day/Sunset) y emisión legal de Cuentas de Cobro a empresa contratante con Art. 383/206 E.T.',
      icon: CalendarDays,
      color: 'from-indigo-600 to-purple-600',
      borderColor: 'border-indigo-500/30 hover:border-indigo-400',
      bgColor: 'bg-indigo-500/10 text-indigo-400',
      metric: 'Corte Quincenal',
      subMetric: 'Conversión Letras + PESOS M/CTE.',
      badge: 'MDP & CAT',
    },
    {
      id: 'asistencia',
      title: 'Control de Asistencia & Turnos',
      tag: 'Talento Humano',
      description: 'Registro de entrada y salida en muelle con reloj inmutable COT, rotación dinámica de roles y tarifas confidenciales de dirección.',
      icon: Clock,
      color: 'from-amber-600 to-orange-600',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      bgColor: 'bg-amber-500/10 text-amber-400',
      metric: `${turnosActivos} en Muelle`,
      subMetric: 'Tarifas Confidenciales',
      badge: 'Hora COT (UTC-5)',
    },
    {
      id: 'compras',
      title: 'Fondo de Compras & Facturas',
      tag: 'Finanzas Operacionales',
      description: 'Control de caja menor, recargas autorizadas, pagos de muellaje, hielo, avituallamiento y compresión WebP de soportes.',
      icon: ShoppingBag,
      color: 'from-rose-600 to-pink-600',
      borderColor: 'border-rose-500/30 hover:border-rose-400',
      bgColor: 'bg-rose-500/10 text-rose-400',
      metric: `${compras.length} Gastos`,
      subMetric: isDirector ? formatCOP(totalGastosCOP) : '•••••••• (Confidencial)',
      badge: 'Caja Menor',
    },
    {
      id: 'mantenimiento',
      title: 'Bitácora Técnica & Horas Motor',
      tag: 'Ingeniería Naval',
      description: 'Monitoreo de horas de motores Yanmar y Northern Lights, reportes de novedades de fibra/motores y aprobaciones de arreglo.',
      icon: Wrench,
      color: 'from-teal-600 to-emerald-600',
      borderColor: 'border-teal-500/30 hover:border-teal-400',
      bgColor: 'bg-teal-500/10 text-teal-400',
      metric: `${embarcaciones.reduce((sum, e) => sum + (e.horasMotorAcumuladas || 0), 0)} Horas Totales`,
      subMetric: 'Motores Yanmar Diesel',
      badge: 'MOP-250H',
    },
    {
      id: 'inventario',
      title: 'Repuestos & Talleres Navales',
      tag: 'Cadena de Suministro',
      description: 'Catálogo de repuestos (filtros Yanmar, racor, correas, aceites 15W40) y directorio de talleres certificados en Cartagena.',
      icon: Package,
      color: 'from-cyan-600 to-blue-600',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      bgColor: 'bg-cyan-500/10 text-cyan-400',
      metric: 'Ítems & Proveedores',
      subMetric: 'Manga / El Bosque / Bahía',
      badge: 'CRUD Almacén',
    },
    {
      id: 'lavanderia',
      title: 'Lavandería & Aseo de Naves',
      tag: 'Hotelería Marina',
      description: 'Control de lencería de a bordo (toallas, manteles, forros, chalecos) y programación de jornadas de aseo profundo.',
      icon: Sparkles,
      color: 'from-purple-600 to-pink-600',
      borderColor: 'border-purple-500/30 hover:border-purple-400',
      bgColor: 'bg-purple-500/10 text-purple-400',
      metric: 'Control Lencería',
      subMetric: 'Aseo de Flota & Oficina',
      badge: 'Limpieza VIP',
    },
    {
      id: 'embarcaciones',
      title: 'Flota & Certificados DIMAR',
      tag: 'Activos Marítimos',
      description: 'Fichas técnicas oficiales de Catamarán ARMONIA, MAUI OCEAN, MOANA LOUNGE y SIRENAS. Pólizas e inspección de casco Portobello.',
      icon: Anchor,
      color: 'from-sky-600 to-indigo-600',
      borderColor: 'border-sky-500/30 hover:border-sky-400',
      bgColor: 'bg-sky-500/10 text-sky-400',
      metric: `${embarcaciones.length} Catamaranes`,
      subMetric: 'Capitanía de Puerto CP05',
      badge: 'Ficha RENET',
    },
    {
      id: 'tripulacion',
      title: 'Tripulación & Hojas de Vida',
      tag: 'Nómina Operacional',
      description: 'Gestión de 29 colaboradores con empresa contratante asignada, cuentas bancarias, licencias DIMAR, certificados Cendiatra y VHF.',
      icon: Users,
      color: 'from-emerald-600 to-cyan-600',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      bgColor: 'bg-emerald-500/10 text-emerald-400',
      metric: `${totalColaboradores} Colaboradores`,
      subMetric: `${colabMDP} María del Puerto • ${colabCAT} Catamaranes`,
      badge: 'Carné Digital',
    },
    {
      id: 'informe',
      title: 'Informe & Dashboard Mensual',
      tag: 'Consolidado Gerencial',
      description: 'Tablero mensual integral de los 7 módulos operativos con exportación profesional a Excel (.xlsx multi-hoja) y PowerPoint (.pptx editable 16:9).',
      icon: FileBarChart,
      color: 'from-amber-600 via-rose-600 to-indigo-600',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      bgColor: 'bg-amber-500/10 text-amber-400',
      metric: 'Excel (.xlsx) + PPTX',
      subMetric: 'Consolidado Flota & Finanzas',
      badge: 'Reporte Mensual',
    },
    {
      id: 'auditoria',
      title: 'Auditoría IA & Supervisión DIMAR',
      tag: 'Inteligencia Artificial',
      description: 'Supervisión inteligente con Gemini: análisis de vencimiento de pólizas, auditoría de dotaciones mínimas y generación de actas.',
      icon: Bot,
      color: 'from-violet-600 to-indigo-600',
      borderColor: 'border-violet-500/30 hover:border-violet-400',
      bgColor: 'bg-violet-500/10 text-violet-400',
      metric: 'Gemini 3.8 Flash',
      subMetric: 'Inspección de Cumplimiento',
      badge: 'IA Integrada',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HERO BANNER - OPERATIONAL HUB */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 text-white">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                Centro de Mando Operacional • Cartagena de Indias
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Alianza Catamarán Cartagena &amp; María del Puerto S.A.S.
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              COBRANDING OPS • Menú Principal del Sistema
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Bienvenida, <strong className="text-white">{currentUser.nombre}</strong> (
              <span className="text-cyan-300 font-semibold">{currentUser.cargoLabel}</span>). Selecciona cualquiera
              de los módulos operativos para gestionar zarpes, listas de chequeo, dotación, inventarios y cobros quincenales.
            </p>
          </div>

          {/* Quick Access to SITMAR DIMAR and Monthly Report */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigateTab('informe')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-rose-900/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <FileBarChart className="w-4 h-4 text-amber-200" />
              <span>Informe Mensual (Excel &amp; PPTX)</span>
            </button>

            <a
              href="https://sitmar.dimar.mil.co/core/login"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Portal SITMAR DIMAR</span>
            </a>
          </div>
        </div>

        {/* TOP QUICK METRICS STRIP */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-900/70 rounded-2xl border border-slate-800 backdrop-blur-xs">
            <span className="text-slate-400 block text-[11px] uppercase font-semibold">Flota Principal</span>
            <div className="text-xl font-black text-cyan-400 mt-0.5">{embarcaciones.length} Naves</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">ARMONIA, MAUI, MOANA, SIRENAS</span>
          </div>

          <div className="p-3 bg-slate-900/70 rounded-2xl border border-slate-800 backdrop-blur-xs">
            <span className="text-slate-400 block text-[11px] uppercase font-semibold">Despachos del Mes</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{salidas.length} Salidas</div>
            <span className="text-[10px] text-emerald-300 block mt-0.5">✓ {sitmarPct}% Con Candado SITMAR</span>
          </div>

          <div className="p-3 bg-slate-900/70 rounded-2xl border border-slate-800 backdrop-blur-xs">
            <span className="text-slate-400 block text-[11px] uppercase font-semibold">Dotación Oficial</span>
            <div className="text-xl font-black text-white mt-0.5">{totalColaboradores} Tripulantes</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">MDP: {colabMDP} • CAT: {colabCAT}</span>
          </div>

          <div className="p-3 bg-slate-900/70 rounded-2xl border border-slate-800 backdrop-blur-xs">
            <span className="text-slate-400 block text-[11px] uppercase font-semibold">Alertas DIMAR</span>
            <div className={`text-xl font-black mt-0.5 ${alertasDocumentos > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {alertasDocumentos} Documentos
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Pólizas &amp; Licencias en Seguimiento</span>
          </div>
        </div>
      </div>

      {/* MODULES GRID - COMPLETE OVERVIEW */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-600" />
              <span>Todos los Módulos del Sistema</span>
            </h2>
            <p className="text-xs text-slate-500">
              Haz clic en cualquier tarjeta para ingresar directamente a su pantalla de gestión.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-200/70 px-3 py-1 rounded-full">
            {modulos.length} Módulos Activos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modulos.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => onNavigateTab(m.id)}
                className={`group bg-white rounded-2xl p-5 border ${m.borderColor} shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1`}
              >
                <div>
                  {/* Card Header with Icon & Category */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${m.bgColor} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {m.tag}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug">
                          {m.title}
                        </h3>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {m.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {m.description}
                  </p>
                </div>

                {/* Footer Metrics & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">{m.metric}</span>
                    <span className="text-[11px] text-slate-500">{m.subMetric}</span>
                  </div>

                  <div className="flex items-center gap-1 text-cyan-700 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Ingresar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK ACTIONS DOCK */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-cyan-600" />
          Accesos Rápidos Más Utilizados
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => onNavigateTab('salidas')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-left transition-all cursor-pointer group"
          >
            <Compass className="w-5 h-5 text-cyan-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-800 block text-xs">Programar Salida</span>
            <span className="text-[11px] text-slate-500">Zarpe con SITMAR</span>
          </button>

          <button
            onClick={() => onNavigateTab('asistencia')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
          >
            <Clock className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-800 block text-xs">Registrar Asistencia</span>
            <span className="text-[11px] text-slate-500">Check-in de muelle</span>
          </button>

          <button
            onClick={() => onNavigateTab('servicios')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer group"
          >
            <Receipt className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-800 block text-xs">Cuentas de Cobro</span>
            <span className="text-[11px] text-slate-500">Liquidación quincenal</span>
          </button>

          <button
            onClick={() => onNavigateTab('tripulacion')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer group"
          >
            <Users className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-800 block text-xs">Dotación &amp; Soportes</span>
            <span className="text-[11px] text-slate-500">29 colaboradores</span>
          </button>
        </div>
      </div>
    </div>
  );
};
