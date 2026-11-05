import React, { useState, useEffect } from 'react';
import {
  Compass,
  Anchor,
  Users,
  CalendarDays,
  Bot,
  AlertTriangle,
  Clock,
  Sparkles,
  Wrench,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  LogOut,
  Sliders,
  ShoppingBag,
  FileCheck,
  Package,
  LayoutGrid,
  FileBarChart,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { CobrandingIsotipo } from './CobrandingIsotipo';
import { PerfilUsuarioAuth, RolUsuario } from '../types/nautical';
import { ROLES_USUARIOS } from '../data/initialData';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  salidasCount: number;
  sitmarCompliance: number;
  alertasCount: number;
  currentUser: PerfilUsuarioAuth;
  onSelectUser: (user: PerfilUsuarioAuth) => void;
  embarcacionesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  salidasCount,
  sitmarCompliance,
  alertasCount,
  currentUser,
  onSelectUser,
  embarcacionesCount,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [currentCotTime, setCurrentCotTime] = useState('');

  // Live Colombia Time (COT - GMT-5) Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentCotTime(`${formatted} COT`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Role-based visible tab permissions
  const ROLE_ALLOWED_TABS: Record<RolUsuario, string[]> = {
    DIRECTOR_OPERACIONES_DPA: ['inicio', 'salidas', 'checklists', 'servicios', 'asistencia', 'mantenimiento', 'lavanderia', 'compras', 'embarcaciones', 'tripulacion', 'inventario', 'informe', 'auditoria'],
    SUPER_ADMIN: ['inicio', 'salidas', 'checklists', 'servicios', 'asistencia', 'mantenimiento', 'lavanderia', 'compras', 'embarcaciones', 'tripulacion', 'inventario', 'informe', 'auditoria'],
    GERENTE_MANTENIMIENTO: ['inicio', 'mantenimiento', 'embarcaciones', 'checklists', 'compras', 'asistencia', 'inventario', 'informe', 'auditoria'],
    DIRECTOR_OPERACIONES: ['inicio', 'salidas', 'checklists', 'servicios', 'asistencia', 'mantenimiento', 'lavanderia', 'compras', 'embarcaciones', 'tripulacion', 'inventario', 'informe', 'auditoria'],
    PILOTO: ['inicio', 'salidas', 'checklists', 'embarcaciones', 'mantenimiento', 'asistencia', 'inventario'],
    PILOTO_MECANICO: ['inicio', 'salidas', 'checklists', 'embarcaciones', 'mantenimiento', 'asistencia', 'inventario'],
    CARPINTERO: ['inicio', 'mantenimiento', 'asistencia', 'inventario'],
    AYUDANTE_MARINERO: ['inicio', 'salidas', 'checklists', 'asistencia'],
    HOST_ANFITRIONA: ['inicio', 'asistencia', 'servicios'],
    PERSONAL_LIMPIEZA: ['inicio', 'lavanderia', 'asistencia'],
    PERSONAL_EXTRA: ['inicio', 'asistencia'],
    MESERO: ['inicio', 'asistencia', 'servicios'],
    BARMAN: ['inicio', 'asistencia', 'servicios'],
  };

  const allTabs = [
    {
      id: 'inicio',
      label: 'Inicio / Menú General',
      icon: LayoutGrid,
      badge: 'Dashboard',
    },
    {
      id: 'salidas',
      label: 'Control de Salidas (Mes)',
      icon: Compass,
      badge: `${salidasCount} Despachos`,
    },
    {
      id: 'checklists',
      label: 'Checklists Pre-Zarpe',
      icon: FileCheck,
      badge: 'DIMAR 16 Pts',
    },
    {
      id: 'servicios',
      label: 'Servicios & Cuentas Cobro',
      icon: CalendarDays,
      badge: 'Planilla Quincenal',
    },
    {
      id: 'asistencia',
      label: 'Control de Asistencia',
      icon: Clock,
      badge: 'Check-In/Out',
    },
    {
      id: 'compras',
      label: 'Compras & Gastos Ops',
      icon: ShoppingBag,
      badge: 'Facturas & Pagos',
    },
    {
      id: 'mantenimiento',
      label: 'Mantenimiento & Horas Motor',
      icon: Wrench,
      badge: 'DIMAR MOP',
    },
    {
      id: 'inventario',
      label: 'Repuestos & Talleres Navales',
      icon: Package,
      badge: 'Inventario & CRUD',
    },
    {
      id: 'lavanderia',
      label: 'Lavandería & Aseo',
      icon: Sparkles,
      badge: 'Lencería & Naves',
    },
    {
      id: 'embarcaciones',
      label: 'Naves & Ficha RENET',
      icon: Anchor,
      badge: `${embarcacionesCount !== undefined ? embarcacionesCount : 4} Embarcaciones`,
    },
    {
      id: 'tripulacion',
      label: 'Tripulación & Licencias',
      icon: Users,
      badge: 'DIMAR CP05',
    },
    {
      id: 'informe',
      label: 'Informe & Dashboard Mensual',
      icon: FileBarChart,
      badge: 'Excel & PPTX',
    },
    {
      id: 'auditoria',
      label: 'Auditoría IA & DIMAR',
      icon: Bot,
      badge: 'Gemini 3.8',
    },
  ];

  const allowedTabIds = ROLE_ALLOWED_TABS[currentUser.rol] || ['salidas'];
  const visibleTabs = allTabs.filter((t) => allowedTabIds.includes(t.id));

  const getRoleBadgeStyle = (rol: RolUsuario) => {
    switch (rol) {
      case 'DIRECTOR_OPERACIONES_DPA':
      case 'SUPER_ADMIN':
        return 'bg-cyan-950/90 text-cyan-300 border-cyan-500 shadow-sm';
      case 'GERENTE_MANTENIMIENTO':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'DIRECTOR_OPERACIONES':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
      case 'PILOTO_MECANICO':
      case 'PILOTO':
        return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
      case 'CARPINTERO':
        return 'bg-orange-950/80 text-orange-300 border-orange-700/60';
      case 'AYUDANTE_MARINERO':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60';
      case 'HOST_ANFITRIONA':
        return 'bg-pink-950/80 text-pink-300 border-pink-700/60';
      case 'PERSONAL_LIMPIEZA':
        return 'bg-teal-950/80 text-teal-300 border-teal-700/60';
      case 'PERSONAL_EXTRA':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Top utility strip with COT Clock and Compliance */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            DIMAR SITMAR Online (CP05)
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Protocolo <strong className="text-slate-200">MOP-CHARTER-001</strong>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          {/* Live Colombia Time Clock (COT GMT-5) */}
          <div className="flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-800/80 px-2.5 py-0.5 rounded text-cyan-300 font-mono text-[11px] font-semibold">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{currentCotTime || 'Calculando COT...'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Candado Operativo SITMAR DIMAR */}
          <a
            href="https://sitmar.dimar.mil.co/core/login"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold px-2.5 py-0.5 rounded-full text-[11px] shadow-sm transition-all hover:scale-105 border border-cyan-400/40"
            title="Candado Operativo DIMAR: Abrir portal oficial SITMAR (https://sitmar.dimar.mil.co/core/login) en nueva pestaña para generar código y firmar con el capitán"
          >
            <Lock className="w-3 h-3 text-amber-300" />
            <span className="font-semibold">Candado SITMAR</span>
            <ExternalLink className="w-2.5 h-2.5 text-cyan-200" />
          </a>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300">SITMAR Auditado:</span>
            <strong className="text-emerald-400">{sitmarCompliance}%</strong>
          </div>
          {alertasCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-950/60 text-amber-300 px-2.5 py-0.5 rounded border border-amber-800/60 text-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{alertasCount} Documentos por Vencer</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Brand & Role Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 border-b border-slate-800/60 gap-4">
          {/* Brand with Official Cobranding Isotipo */}
          <div className="flex items-center gap-3">
            <CobrandingIsotipo size={42} showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-wider text-white">
                  COBRANDING<span className="text-cyan-400"> OPS</span>
                </span>
                <span className="bg-cyan-950 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-700/60 uppercase tracking-widest hidden sm:inline">
                  Charter &amp; Turismo Operacional
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Alianza Comercial <strong className="text-slate-200">Catamarán Cartagena</strong> &amp; <strong className="text-slate-200">María del Puerto</strong>
              </p>
            </div>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-750 px-3 py-1.5 rounded-xl border border-slate-700 text-left transition-all cursor-pointer shadow-sm"
              title="Cambiar perfil de usuario y matriz de permisos"
            >
              <img
                src={currentUser.fotoUrl}
                alt={currentUser.nombre}
                className="w-9 h-9 rounded-full object-cover border-2 border-cyan-400/80 shadow"
              />
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{currentUser.nombre}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[10px] text-cyan-300 font-medium">
                  {currentUser.cargoLabel}
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleBadgeStyle(currentUser.rol)} sm:hidden`}>
                {currentUser.rol.split('_')[0]}
              </span>
            </button>

            {/* Role Switcher Dropdown Modal */}
            {showRoleMenu && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40"
                  onClick={() => setShowRoleMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3.5 bg-slate-950/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-cyan-400" />
                        Matriz de Permisos &amp; Roles COBRANDING
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">7 Perfiles</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Selecciona un perfil para simular su interfaz operativa y sus accesos según los manuales DIMAR y RENET.
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                    {ROLES_USUARIOS.map((user) => {
                      const isSelected = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSelectUser(user);
                            setShowRoleMenu(false);
                            // If current tab is not allowed for the new role, switch tab to the first allowed tab
                            const newAllowed = ROLE_ALLOWED_TABS[user.rol];
                            if (!newAllowed.includes(activeTab)) {
                              setActiveTab(newAllowed[0]);
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-950/70 border border-cyan-500/50 text-white'
                              : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <img
                            src={user.fotoUrl}
                            alt={user.nombre}
                            className="w-10 h-10 rounded-full object-cover border border-slate-600 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate text-white">
                                {user.nombre}
                              </span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {user.cargoLabel}
                            </div>
                            <span
                              className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(
                                user.rol
                              )}`}
                            >
                              {user.rol.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2.5 bg-slate-950/60 text-center text-[10px] text-slate-400">
                    Nivel de seguridad RBAC activo • COBRANDING OPS v3.5
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation (Role Filtered) */}
        <nav className="flex space-x-1 sm:space-x-1.5 py-2.5 overflow-x-auto scrollbar-none">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
