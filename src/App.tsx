import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SalidasModule } from './components/SalidasModule';
import { EmbarcacionesModule } from './components/EmbarcacionesModule';
import { TripulacionModule } from './components/TripulacionModule';
import { ServiciosQuincenalModule } from './components/ServiciosQuincenalModule';
import { AuditoriaIAModule } from './components/AuditoriaIAModule';
import { AsistenciaModule } from './components/AsistenciaModule';
import { LavanderiaAseoModule } from './components/LavanderiaAseoModule';
import { MantenimientoIndependienteModule } from './components/MantenimientoIndependienteModule';
import { ComprasModule } from './components/ComprasModule';
import { ChecklistsChapterModule } from './components/ChecklistsChapterModule';
import { InventarioProveedoresModule } from './components/InventarioProveedoresModule';
import { InicioHubModule } from './components/InicioHubModule';
import { InformeMensualDashboardModule } from './components/InformeMensualDashboardModule';
import {
  Salida,
  Embarcacion,
  Tripulante,
  ServicioDetalle,
  Mantenimiento,
  NovedadFalla,
  PerfilUsuarioAuth,
  RegistroAsistencia,
  RegistroLavanderiaAseo,
  EstadoLenceria,
  DocumentoMaritimo,
  GastoCompra,
  RecargaFondo,
  ChecklistPreZarpe,
  ItemInventario,
  ProveedorTaller,
  TrabajoDiarioMantenimiento,
} from './types/nautical';
import {
  INITIAL_EMBARCACIONES,
  INITIAL_TRIPULACION,
  INITIAL_SALIDAS,
  INITIAL_SERVICIOS_DETALLE,
  INITIAL_ASISTENCIAS,
  INITIAL_LAVANDERIA,
  INITIAL_COMPRAS,
  INITIAL_RECARGAS,
  INITIAL_CHECKLISTS_PREZARPE,
  INITIAL_INVENTARIO,
  INITIAL_PROVEEDORES,
  INITIAL_TRABAJOS_DIARIOS,
  ROLES_USUARIOS,
} from './initialData';
import { Anchor, ShieldCheck, HeartHandshake, FileCheck, Sparkles, Clock, Wrench } from 'lucide-react';
import { CobrandingIsotipo } from './components/CobrandingIsotipo';

export default function App() {
  const [currentUser, setCurrentUser] = useState<PerfilUsuarioAuth>(ROLES_USUARIOS[0]); // Default to Leidys Tatiana Corpus (Directora de Operaciones / DPA - Super Admin)
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [embarcaciones, setEmbarcaciones] = useState<Embarcacion[]>(INITIAL_EMBARCACIONES);
  const [tripulacion, setTripulacion] = useState<Tripulante[]>(INITIAL_TRIPULACION);
  const [salidas, setSalidas] = useState<Salida[]>(INITIAL_SALIDAS);
  const [serviciosDetalle, setServiciosDetalle] = useState<ServicioDetalle[]>(INITIAL_SERVICIOS_DETALLE);
  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>(INITIAL_ASISTENCIAS);
  const [lavanderia, setLavanderia] = useState<RegistroLavanderiaAseo[]>(INITIAL_LAVANDERIA);
  const [compras, setCompras] = useState<GastoCompra[]>(INITIAL_COMPRAS);
  const [recargas, setRecargas] = useState<RecargaFondo[]>(INITIAL_RECARGAS);
  const [checklists, setChecklists] = useState<ChecklistPreZarpe[]>(INITIAL_CHECKLISTS_PREZARPE);
  const [items, setItems] = useState<ItemInventario[]>(INITIAL_INVENTARIO);
  const [proveedores, setProveedores] = useState<ProveedorTaller[]>(INITIAL_PROVEEDORES);
  const [trabajosDiarios, setTrabajosDiarios] = useState<TrabajoDiarioMantenimiento[]>(INITIAL_TRABAJOS_DIARIOS);

  const [selectedPlanillaSalida, setSelectedPlanillaSalida] = useState<Salida | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch initial data from server if available
  useEffect(() => {
    fetch('/api/nautical/data')
      .then((res) => {
        if (!res.ok) throw new Error('Servidor local inicializado');
        return res.json();
      })
      .then((data) => {
        if (data.embarcaciones) setEmbarcaciones(data.embarcaciones);
        if (data.tripulacion) setTripulacion(data.tripulacion);
        if (data.salidas) setSalidas(data.salidas);
        if (data.serviciosDetalle) setServiciosDetalle(data.serviciosDetalle);
        if (data.asistencias) setAsistencias(data.asistencias);
        if (data.lavanderia) setLavanderia(data.lavanderia);
        if (data.compras) setCompras(data.compras);
        if (data.recargas) setRecargas(data.recargas);
        if (data.checklistsPreZarpe) setChecklists(data.checklistsPreZarpe);
      })
      .catch((err) => {
        console.log('Operando con datos iniciales en memoria:', err.message);
      });
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Reconfirm departure handler with SITMAR validation
  const handleReconfirmSalida = async (updatedData: Partial<Salida> & { id: string }) => {
    try {
      const res = await fetch('/api/nautical/salida/reconfirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Error al reconfirmar salida');
      }

      // Update local state
      setSalidas((prev) =>
        prev.map((s) => (s.id === updatedData.id ? result.salida : s))
      );

      // Refresh crew metrics if needed
      if (result.salida.estado === 'EJECUTADA') {
        setTripulacion((prev) =>
          prev.map((t) => {
            if (t.id === result.salida.pilotoId || t.id === result.salida.marineroId) {
              return {
                ...t,
                historialSalidasMes: (t.historialSalidasMes || 0) + 1,
                horasNavegadasMes: (t.horasNavegadasMes || 0) + 7,
              };
            }
            return t;
          })
        );
      }

      showToast(`Salida ${updatedData.id} reconfirmada y auditada con Código SITMAR.`);
    } catch (err: any) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Create departure handler
  const handleCrearSalida = async (newSalidaData: Partial<Salida>) => {
    try {
      const res = await fetch('/api/nautical/salida/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSalidaData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error creando salida');

      setSalidas((prev) => [...prev, result.salida]);
      showToast('Nueva salida programada exitosamente en el sistema.');
    } catch (err: any) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Save service detail handler
  const handleSaveServicio = async (servicio: ServicioDetalle) => {
    try {
      const res = await fetch('/api/nautical/servicio/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servicio),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error guardando servicio');

      setServiciosDetalle((prev) => {
        const idx = prev.findIndex((s) => s.id === servicio.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = servicio;
          return updated;
        }
        return [...prev, servicio];
      });

      showToast(`Planilla ${servicio.codigoPlanilla} guardada exitosamente.`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Add maintenance handler
  const handleAddMantenimiento = (embarcacionId: string, mntData: Omit<Mantenimiento, 'id'>) => {
    const newMnt: Mantenimiento = {
      id: `mnt-${Date.now().toString(36)}`,
      ...mntData,
    };

    setEmbarcaciones((prev) =>
      prev.map((e) => {
        if (e.id === embarcacionId) {
          return {
            ...e,
            horasMotorAcumuladas: Math.max(e.horasMotorAcumuladas, mntData.horasMotor),
            mantenimientos: [newMnt, ...e.mantenimientos],
          };
        }
        return e;
      })
    );

    showToast(`Mantenimiento registrado para ${mntData.embarcacionId}.`);
  };

  // Add novedad handler
  const handleAddNovedad = async (novedadData: Omit<NovedadFalla, 'id'>) => {
    try {
      const res = await fetch('/api/nautical/novedad/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novedadData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error registrando novedad');

      setEmbarcaciones((prev) =>
        prev.map((e) => (e.id === novedadData.embarcacionId ? result.embarcacion : e))
      );
      showToast(`Novedad técnica "${novedadData.titulo}" asentada en la bitácora.`);
    } catch (err: any) {
      // Local fallback in case network error
      const newNov: NovedadFalla = {
        id: `nov-${Date.now().toString(36)}`,
        ...novedadData,
      };
      setEmbarcaciones((prev) =>
        prev.map((e) =>
          e.id === novedadData.embarcacionId
            ? { ...e, novedades: [newNov, ...(e.novedades || [])] }
            : e
        )
      );
      showToast(`Novedad técnica guardada en memoria local.`);
    }
  };

  // Update novedad handler (solve, add repair photo, approve budget)
  const handleUpdateNovedad = async (updateData: Partial<NovedadFalla> & { id: string; embarcacionId: string }) => {
    try {
      const res = await fetch('/api/nautical/novedad/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error actualizando novedad');

      setEmbarcaciones((prev) =>
        prev.map((e) => (e.id === updateData.embarcacionId ? result.embarcacion : e))
      );
      showToast('Novedad técnica actualizada con evidencia de arreglo / firma gerencial.');
    } catch (err: any) {
      // Local fallback
      setEmbarcaciones((prev) =>
        prev.map((e) => {
          if (e.id === updateData.embarcacionId) {
            const updatedNovs = (e.novedades || []).map((n) =>
              n.id === updateData.id ? { ...n, ...updateData } : n
            );
            return { ...e, novedades: updatedNovs };
          }
          return e;
        })
      );
      showToast('Novedad técnica actualizada localmente.');
    }
  };

  // Vessel Management Handlers (Director de Operaciones / Gerencia)
  const handleCrearEmbarcacion = async (embData: Omit<Embarcacion, 'id'>) => {
    try {
      const res = await fetch('/api/nautical/embarcacion/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al crear embarcación');

      setEmbarcaciones((prev) => [...prev, result.embarcacion]);
      showToast(`Embarcación "${embData.nombre}" dada de alta en RENET y DIMAR exitosamente.`);
    } catch (err: any) {
      // Local fallback
      const cleanName = embData.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const localEmb: Embarcacion = {
        id: `emb-${cleanName || Date.now().toString(36)}`,
        ...embData,
      };
      setEmbarcaciones((prev) => [...prev, localEmb]);
      showToast(`Embarcación "${embData.nombre}" registrada localmente.`);
    }
  };

  const handleActualizarEmbarcacion = async (embId: string, updates: Partial<Embarcacion>) => {
    try {
      const res = await fetch('/api/nautical/embarcacion/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: embId, ...updates }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al actualizar embarcación');

      setEmbarcaciones((prev) =>
        prev.map((e) => (e.id === embId ? result.embarcacion : e))
      );
      showToast('Ficha técnica de la nave actualizada exitosamente.');
    } catch (err: any) {
      setEmbarcaciones((prev) =>
        prev.map((e) => (e.id === embId ? { ...e, ...updates } : e))
      );
      showToast('Ficha técnica actualizada localmente.');
    }
  };

  const handleAgregarDocumento = async (embId: string, doc: DocumentoMaritimo) => {
    try {
      const res = await fetch('/api/nautical/embarcacion/documento/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embarcacionId: embId, documento: doc }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al incorporar documento marítimo');

      setEmbarcaciones((prev) =>
        prev.map((e) => (e.id === embId ? result.embarcacion : e))
      );
      showToast(`Documento "${doc.nombre}" incorporado a la ficha de la nave.`);
    } catch (err: any) {
      setEmbarcaciones((prev) =>
        prev.map((e) => {
          if (e.id === embId) {
            return {
              ...e,
              documentos: [doc, ...e.documentos],
            };
          }
          return e;
        })
      );
      showToast(`Documento "${doc.nombre}" guardado localmente.`);
    }
  };

  const handleActualizarDocumento = async (
    embId: string,
    numeroOriginal: string,
    docUpdates: Partial<DocumentoMaritimo>
  ) => {
    try {
      const res = await fetch('/api/nautical/embarcacion/documento/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embarcacionId: embId,
          numeroOriginal,
          updateDoc: docUpdates,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al actualizar documento');

      setEmbarcaciones((prev) =>
        prev.map((e) => (e.id === embId ? result.embarcacion : e))
      );
      showToast('Documento marítimo renovado / actualizado.');
    } catch (err: any) {
      setEmbarcaciones((prev) =>
        prev.map((e) => {
          if (e.id === embId) {
            return {
              ...e,
              documentos: e.documentos.map((d) =>
                d.numero === numeroOriginal ? { ...d, ...docUpdates } : d
              ),
            };
          }
          return e;
        })
      );
      showToast('Documento actualizado localmente.');
    }
  };

  const handleEliminarEmbarcacion = async (embId: string) => {
    try {
      const res = await fetch('/api/nautical/embarcacion/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: embId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al eliminar embarcación');

      setEmbarcaciones((prev) => prev.filter((e) => e.id !== embId));
      showToast('Embarcación removida de la flota.');
    } catch (err: any) {
      setEmbarcaciones((prev) => prev.filter((e) => e.id !== embId));
      showToast('Embarcación eliminada localmente.');
    }
  };

  const handleEliminarDocumento = async (embId: string, docNumero: string) => {
    try {
      const res = await fetch('/api/nautical/embarcacion/documento/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embarcacionId: embId, docNumero }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al eliminar documento');

      setEmbarcaciones((prev) =>
        prev.map((e) => (e.id === embId ? result.embarcacion : e))
      );
      showToast('Documento marítimo retirado.');
    } catch (err: any) {
      setEmbarcaciones((prev) =>
        prev.map((e) => {
          if (e.id === embId) {
            return {
              ...e,
              documentos: e.documentos.filter((d) => d.numero !== docNumero),
            };
          }
          return e;
        })
      );
      showToast('Documento eliminado localmente.');
    }
  };

  // Attendance Handlers
  const handleCheckIn = async (data: Omit<RegistroAsistencia, 'id' | 'estado'>) => {
    try {
      const res = await fetch('/api/nautical/asistencia/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al registrar ingreso');

      setAsistencias((prev) => [result.asistencia, ...prev]);
      showToast(`Ingreso registrado exitosamente para ${data.usuarioNombre}.`);
    } catch (err: any) {
      // Local fallback
      const localItem: RegistroAsistencia = {
        id: `asis-${Date.now().toString(36)}`,
        estado: 'EN_TURNO',
        ...data,
      };
      setAsistencias((prev) => [localItem, ...prev]);
      showToast(`Check-in registrado localmente.`);
    }
  };

  const handleCheckOut = async (asistenciaId: string, horaSalida: string, notas?: string) => {
    try {
      const res = await fetch('/api/nautical/asistencia/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asistenciaId, horaSalida, notas }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al registrar salida');

      setAsistencias((prev) =>
        prev.map((a) => (a.id === asistenciaId ? result.asistencia : a))
      );
      showToast(`Cierre de turno registrado.`);
    } catch (err: any) {
      // Local fallback
      setAsistencias((prev) =>
        prev.map((a) => {
          if (a.id === asistenciaId) {
            return {
              ...a,
              horaSalida,
              estado: 'FINALIZADO',
              observaciones: notas ? `${a.observaciones || ''} | Cierre: ${notas}` : a.observaciones,
            };
          }
          return a;
        })
      );
      showToast(`Cierre de turno registrado localmente.`);
    }
  };

  // Laundry and Cleaning Handlers
  const handleAddLavanderia = async (data: Omit<RegistroLavanderiaAseo, 'id'>) => {
    try {
      const res = await fetch('/api/nautical/lavanderia/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al registrar aseo / lencería');

      setLavanderia((prev) => [result.registro, ...prev]);
      showToast('Registro de lavandería o jornada de aseo guardado.');
    } catch (err: any) {
      const localItem: RegistroLavanderiaAseo = {
        id: `lav-${Date.now().toString(36)}`,
        ...data,
      };
      setLavanderia((prev) => [localItem, ...prev]);
      showToast('Registro guardado localmente.');
    }
  };

  const handleUpdateEstadoLenceria = async (
    id: string,
    nuevoEstado: EstadoLenceria,
    fechaRecepcion?: string
  ) => {
    try {
      const res = await fetch('/api/nautical/lavanderia/update-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nuevoEstado, fechaRecepcion }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al actualizar lencería');

      setLavanderia((prev) =>
        prev.map((l) => (l.id === id ? result.registro : l))
      );
      showToast(`Lencería actualizada a: ${nuevoEstado}`);
    } catch (err: any) {
      setLavanderia((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                estadoLencería: nuevoEstado,
                fechaRecepcion: fechaRecepcion || l.fechaRecepcion,
              }
            : l
        )
      );
      showToast(`Estado de lencería actualizado.`);
    }
  };

  // Handlers for purchases and expenses (Compras)
  const handleCrearCompra = async (compraData: Omit<GastoCompra, 'id' | 'codigoGasto' | 'fechaCreacion'>) => {
    try {
      const res = await fetch('/api/nautical/compras/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compraData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al registrar la compra');

      setCompras((prev) => [result.compra, ...prev]);
      showToast(`Gasto ${result.compra.codigoGasto} registrado exitosamente.`);
    } catch (err: any) {
      const correlativo = String(compras.length + 41).padStart(3, '0');
      const fallbackCompra: GastoCompra = {
        ...compraData,
        id: `cmp-${Date.now().toString(36)}`,
        codigoGasto: `CMP-2026-10-${correlativo}`,
        fechaCreacion: new Date().toISOString(),
      };
      setCompras((prev) => [fallbackCompra, ...prev]);
      showToast(`Gasto ${fallbackCompra.codigoGasto} registrado.`);
    }
  };

  const handleActualizarCompra = async (id: string, updateData: Partial<GastoCompra>) => {
    try {
      const res = await fetch('/api/nautical/compras/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updateData }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al actualizar el gasto');

      setCompras((prev) => prev.map((c) => (c.id === id ? result.compra : c)));
      showToast(`Gasto actualizado.`);
    } catch (err: any) {
      setCompras((prev) => prev.map((c) => (c.id === id ? { ...c, ...updateData } : c)));
      showToast(`Gasto actualizado.`);
    }
  };

  // Handler for corporate recargas / consignaciones
  const handleCrearRecarga = async (recargaData: Omit<RecargaFondo, 'id' | 'codigoRecarga' | 'fechaCreacion'>) => {
    try {
      const res = await fetch('/api/nautical/recargas/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recargaData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al registrar la recarga');

      setRecargas((prev) => [result.recarga, ...prev]);
      showToast(`Recarga ${result.recarga.codigoRecarga} acreditada exitosamente.`);
    } catch (err: any) {
      const correlativo = String(recargas.length + 1).padStart(3, '0');
      const fallbackRec: RecargaFondo = {
        ...recargaData,
        id: `rec-${Date.now().toString(36)}`,
        codigoRecarga: `REC-2026-10-${correlativo}`,
        fechaCreacion: new Date().toISOString(),
      };
      setRecargas((prev) => [fallbackRec, ...prev]);
      showToast(`Recarga ${fallbackRec.codigoRecarga} registrada.`);
    }
  };

  // Handler to update crew contract type (e.g. Laboral vs Prestación)
  const handleUpdateTripulanteContrato = async (tripulanteId: string, tipoContrato: 'CONTRATO_LABORAL' | 'PRESTACION_SERVICIOS') => {
    try {
      const res = await fetch('/api/nautical/tripulacion/update-contrato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripulanteId,
          tipoContrato,
          mantenimientoIncluidoEnContrato: tipoContrato === 'CONTRATO_LABORAL',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al actualizar contrato');

      setTripulacion((prev) => prev.map((t) => (t.id === tripulanteId ? result.tripulante : t)));
      showToast(`Contrato actualizado a ${tipoContrato}.`);
    } catch (err: any) {
      setTripulacion((prev) =>
        prev.map((t) =>
          t.id === tripulanteId
            ? { ...t, tipoContrato, mantenimientoIncluidoEnContrato: tipoContrato === 'CONTRATO_LABORAL' }
            : t
        )
      );
      showToast(`Contrato actualizado a ${tipoContrato}.`);
    }
  };

  // Handler to save/update crew profiles
  const handleSaveTripulante = async (updatedTrip: Tripulante) => {
    setTripulacion((prev) => {
      const idx = prev.findIndex((t) => t.id === updatedTrip.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedTrip;
        return copy;
      }
      return [updatedTrip, ...prev];
    });
    showToast(`Colaborador ${updatedTrip.nombreCompleto} guardado en nómina.`);
  };

  // Handlers for Inventory Items & Vendors (Proveedores)
  const handleSaveItem = async (item: ItemInventario) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    showToast(`Ítem de inventario "${item.nombre}" guardado.`);
  };

  const handleDeleteItem = async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Ítem de inventario eliminado.');
  };

  const handleSaveProveedor = async (prov: ProveedorTaller) => {
    setProveedores((prev) => {
      const idx = prev.findIndex((p) => p.id === prov.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = prov;
        return copy;
      }
      return [prov, ...prev];
    });
    showToast(`Proveedor/Taller "${prov.nombreComercial}" guardado.`);
  };

  const handleDeleteProveedor = async (provId: string) => {
    setProveedores((prev) => prev.filter((p) => p.id !== provId));
    showToast('Proveedor/Taller removido.');
  };

  // Daily Maintenance Works Handler (Trabajos Diarios por Barco)
  const handleAddTrabajoDiario = (nuevoTrabajo: Omit<TrabajoDiarioMantenimiento, 'id'>) => {
    const id = `trabajo-${Date.now()}`;
    const nuevo: TrabajoDiarioMantenimiento = {
      ...nuevoTrabajo,
      id,
      timestampCOT: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }) + ' COT',
    };
    setTrabajosDiarios((prev) => [nuevo, ...prev]);
    showToast(`Trabajo registrado: ${nuevo.titulo} en ${nuevo.embarcacionNombre}.`);
  };

  // Pre-departure Checklist Handler
  const handleSaveChecklist = async (checklistData: Partial<ChecklistPreZarpe>) => {
    try {
      const res = await fetch('/api/nautical/checklist/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checklistData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al guardar el checklist');

      setChecklists((prev) => {
        const idx = prev.findIndex((c) => c.id === result.checklist.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = result.checklist;
          return updated;
        }
        return [result.checklist, ...prev];
      });

      // Update departure with SITMAR and checklist link
      if (result.checklist.salidaId) {
        setSalidas((prev) =>
          prev.map((s) => {
            if (s.id === result.checklist.salidaId) {
              return {
                ...s,
                checklistPreZarpeId: result.checklist.id,
                codigoSitmar: s.codigoSitmar || result.checklist.codigoSitmar,
                sitmarVerificado: Boolean(s.codigoSitmar || result.checklist.codigoSitmar),
              };
            }
            return s;
          })
        );
      }

      showToast(`Formato Pre-Zarpe ${result.checklist.codigoChecklist} guardado con Código SITMAR ${result.checklist.codigoSitmar}.`);
    } catch (err: any) {
      showToast(err.message || 'Error guardando formato', 'error');
      throw err;
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    try {
      const res = await fetch(`/api/nautical/checklist/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al eliminar');

      setChecklists((prev) => prev.filter((c) => c.id !== id));
      setSalidas((prev) =>
        prev.map((s) => (s.checklistPreZarpeId === id ? { ...s, checklistPreZarpeId: undefined } : s))
      );
      showToast('Formato de pre-zarpe eliminado.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Apply parsed radio message
  const handleApplyParsedNovedad = async (parsed: any) => {
    const target = salidas.find(
      (s) => s.diaMes === 21 && s.estado !== 'EJECUTADA'
    ) || salidas.find((s) => s.estado === 'PROGRAMADA');

    if (target) {
      await handleReconfirmSalida({
        id: target.id,
        estado: (parsed.estadoSugerido as any) || 'EJECUTADA',
        codigoSitmar: parsed.codigoSitmar || 'STM-202610-0988',
        paxReales: parsed.paxReales || target.paxProgramados,
        horaRealZarpe: parsed.horaRealZarpe || '08:35',
        observaciones: parsed.observacionResumen || 'Despacho reconfirmado vía radio marina',
      });
    } else {
      showToast('No se encontró salida pendiente para aplicar la novedad.', 'error');
    }
  };

  // View planilla modal trigger
  const handleVerPlanilla = (salida: Salida) => {
    setSelectedPlanillaSalida(salida);
    setActiveTab('servicios');
  };

  // Compliance metrics for banner
  const ejecutadas = salidas.filter((s) => s.estado === 'EJECUTADA').length;
  const conSitmar = salidas.filter((s) => s.estado === 'EJECUTADA' && s.codigoSitmar && s.codigoSitmar.length >= 5).length;
  const sitmarCompliance = ejecutadas > 0 ? Math.round((conSitmar / ejecutadas) * 100) : 100;

  const alertasDocs = embarcaciones.flatMap((e) =>
    e.documentos.filter((d) => d.estado === 'POR_VENCER' || d.estado === 'VENCIDO')
  ).length + tripulacion.filter((t) => t.licencia?.estado === 'POR_VENCER').length;

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-200 ${
            notification.type === 'success'
              ? 'bg-slate-900 text-white border-cyan-500'
              : 'bg-rose-900 text-white border-rose-500'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        salidasCount={salidas.length}
        embarcacionesCount={embarcaciones.length}
        sitmarCompliance={sitmarCompliance}
        alertasCount={alertasDocs}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'inicio' && (
          <InicioHubModule
            onNavigateTab={(tabId) => setActiveTab(tabId)}
            salidas={salidas}
            embarcaciones={embarcaciones}
            tripulacion={tripulacion}
            compras={compras}
            asistencias={asistencias}
            checklists={checklists}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'salidas' && (
          <SalidasModule
            salidas={salidas}
            embarcaciones={embarcaciones}
            tripulacion={tripulacion}
            checklists={checklists}
            onReconfirmSalida={handleReconfirmSalida}
            onCrearSalida={handleCrearSalida}
            onVerPlanilla={handleVerPlanilla}
            onSaveChecklist={handleSaveChecklist}
            onGoToChecklists={() => setActiveTab('checklists')}
          />
        )}

        {activeTab === 'checklists' && (
          <ChecklistsChapterModule
            checklists={checklists}
            salidas={salidas}
            embarcaciones={embarcaciones}
            tripulacion={tripulacion}
            currentUser={currentUser}
            onSaveChecklist={handleSaveChecklist}
            onDeleteChecklist={handleDeleteChecklist}
          />
        )}

        {activeTab === 'compras' && (
          <ComprasModule
            compras={compras}
            recargas={recargas}
            embarcaciones={embarcaciones}
            currentUser={currentUser}
            onCrearCompra={handleCrearCompra}
            onActualizarCompra={handleActualizarCompra}
            onCrearRecarga={handleCrearRecarga}
          />
        )}

        {activeTab === 'mantenimiento' && (
          <MantenimientoIndependienteModule
            embarcaciones={embarcaciones}
            tripulacion={tripulacion}
            currentUser={currentUser}
            onAddNovedad={handleAddNovedad}
            onUpdateNovedad={handleUpdateNovedad}
            onAddMantenimiento={handleAddMantenimiento}
            trabajosDiarios={trabajosDiarios}
            onAddTrabajoDiario={handleAddTrabajoDiario}
          />
        )}

        {activeTab === 'asistencia' && (
          <AsistenciaModule
            asistencias={asistencias}
            currentUser={currentUser}
            salidas={salidas}
            embarcaciones={embarcaciones}
            tripulacion={tripulacion}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onUpdateTripulanteContrato={handleUpdateTripulanteContrato}
          />
        )}

        {activeTab === 'lavanderia' && (
          <LavanderiaAseoModule
            registros={lavanderia}
            embarcaciones={embarcaciones}
            onAddRegistro={handleAddLavanderia}
            onUpdateEstadoLenceria={handleUpdateEstadoLenceria}
          />
        )}

        {activeTab === 'servicios' && (
          <ServiciosQuincenalModule
            servicios={serviciosDetalle}
            salidas={salidas}
            embarcaciones={embarcaciones}
            tripulacion={tripulacion}
            asistencias={asistencias}
            onSaveServicio={handleSaveServicio}
            selectedPlanillaSalida={selectedPlanillaSalida}
            onClosePlanillaModal={() => setSelectedPlanillaSalida(null)}
          />
        )}

        {activeTab === 'embarcaciones' && (
          <EmbarcacionesModule
            embarcaciones={embarcaciones}
            tripulacion={tripulacion}
            currentUser={currentUser}
            onAddMantenimiento={handleAddMantenimiento}
            onAddNovedad={handleAddNovedad}
            onUpdateNovedad={handleUpdateNovedad}
            onCrearEmbarcacion={handleCrearEmbarcacion}
            onActualizarEmbarcacion={handleActualizarEmbarcacion}
            onEliminarEmbarcacion={handleEliminarEmbarcacion}
            onAgregarDocumento={handleAgregarDocumento}
            onActualizarDocumento={handleActualizarDocumento}
            onEliminarDocumento={handleEliminarDocumento}
          />
        )}

        {activeTab === 'tripulacion' && (
          <TripulacionModule
            tripulacion={tripulacion}
            onSaveTripulante={handleSaveTripulante}
            isDirector={currentUser.permisos === 'SUPER_ADMIN' || currentUser.rol === 'DIRECTOR_OPERACIONES' || currentUser.rol === 'DIRECTOR_OPERACIONES_DPA'}
          />
        )}

        {activeTab === 'inventario' && (
          <InventarioProveedoresModule
            items={items}
            proveedores={proveedores}
            embarcaciones={embarcaciones}
            onSaveItem={handleSaveItem}
            onDeleteItem={handleDeleteItem}
            onSaveProveedor={handleSaveProveedor}
            onDeleteProveedor={handleDeleteProveedor}
          />
        )}

        {activeTab === 'informe' && (
          <InformeMensualDashboardModule
            salidas={salidas}
            embarcaciones={embarcaciones}
            tripulacion={tripulacion}
            compras={compras}
            recargas={recargas}
            asistencias={asistencias}
            checklists={checklists}
            lavanderia={lavanderia}
            trabajosDiarios={trabajosDiarios}
            serviciosDetalle={serviciosDetalle}
            items={items}
            proveedores={proveedores}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'auditoria' && (
          <AuditoriaIAModule
            salidas={salidas}
            embarcaciones={embarcaciones}
            tripulacion={tripulacion}
            onApplyParsedNovedad={handleApplyParsedNovedad}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CobrandingIsotipo size={36} showText={false} />
            <div>
              <div className="font-bold text-white tracking-wide flex items-center gap-2">
                <span>COBRANDING OPS</span>
                <span className="text-[10px] text-cyan-400 font-semibold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  Charter &amp; Turismo Operacional
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Alianza Comercial Flota Catamarán Cartagena &amp; María del Puerto • Estándar DIMAR (CP05) / RENET
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              SITMAR Activo
            </span>
            <span className="text-slate-600">|</span>
            <span>Manual MOP-CHARTER-001</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-mono">renet.com.co</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
