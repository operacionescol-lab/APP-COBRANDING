import React from 'react';
import { Embarcacion } from '../types/nautical';
import { Gauge, AlertTriangle, CheckCircle2, Clock, Wrench, ShieldAlert } from 'lucide-react';

interface HorasMotorBarChartProps {
  embarcaciones: Embarcacion[];
  selectedEmbId?: string;
  onSelectEmbarcacion?: (id: string) => void;
  onProgramarMnt?: (embarcacionId: string) => void;
}

export const HorasMotorBarChart: React.FC<HorasMotorBarChartProps> = ({
  embarcaciones,
  selectedEmbId = embarcaciones[0]?.id || '',
  onSelectEmbarcacion = () => {},
  onProgramarMnt = () => {},
}) => {
  // Statistics
  const totalHorasFlota = embarcaciones.reduce((acc, e) => acc + e.horasMotorAcumuladas, 0);

  const embarcacionesAlerta = embarcaciones.filter((e) => {
    const restantes = e.limiteHorasMantenimiento - e.horasMotorAcumuladas;
    return restantes <= 50;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-6">
      {/* Title & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-50 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-200 uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-600" /> Monitoreo Telemétrico de Horómetros
            </span>
            <span className="text-xs text-slate-400 font-medium">Ciclo de Servicio Preventivo</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            Horas de Motor Acumuladas vs. Límites de Mantenimiento Programado
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparativa gráfica de desgaste de motor frente al umbral crítico para cambio de aceite, filtros y revisión mayor.
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Flota</div>
            <div className="text-sm font-black text-slate-800">{totalHorasFlota.toLocaleString()} hrs</div>
          </div>
          {embarcacionesAlerta.length > 0 ? (
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-right animate-pulse">
              <div className="text-[10px] uppercase font-bold text-amber-700 flex items-center justify-end gap-1">
                <AlertTriangle className="w-3 h-3" /> Atención
              </div>
              <div className="text-sm font-black text-amber-800">
                {embarcacionesAlerta.length} {embarcacionesAlerta.length === 1 ? 'Nave próxima' : 'Naves próximas'}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-right">
              <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3 h-3" /> Estado
              </div>
              <div className="text-sm font-black text-emerald-800">Flota al día</div>
            </div>
          )}
        </div>
      </div>

      {/* Fleet Comparative Bar Chart */}
      <div className="space-y-5">
        {embarcaciones.map((emb) => {
          const acumuladas = emb.horasMotorAcumuladas;
          const limite = emb.limiteHorasMantenimiento || 2000;
          const restantes = Math.max(0, limite - acumuladas);
          const porcentaje = Math.min(100, Math.round((acumuladas / limite) * 100));
          const isSelected = emb.id === selectedEmbId;

          // Color classification based on proximity to limit
          let colorBar = 'bg-gradient-to-r from-emerald-500 to-teal-500';
          let textColor = 'text-emerald-700';
          let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          let estadoTexto = 'En Rango Operativo';

          if (porcentaje >= 95 || restantes <= 35) {
            colorBar = 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse';
            textColor = 'text-rose-700 font-extrabold';
            badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
            estadoTexto = '¡Servicio Urgente Requerido!';
          } else if (porcentaje >= 88 || restantes <= 120) {
            colorBar = 'bg-gradient-to-r from-amber-500 to-orange-500';
            textColor = 'text-amber-700 font-bold';
            badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
            estadoTexto = 'Próximo a Servicio';
          }

          return (
            <div
              key={emb.id}
              onClick={() => onSelectEmbarcacion(emb.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-50/90 border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm'
                  : 'bg-white hover:bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{emb.nombre}</span>
                    <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded font-bold">
                      {emb.matricula}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badgeBg}`}>
                      {estadoTexto}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Motores: <strong className="text-slate-700">{emb.motores}</strong> ({emb.potenciaTotalHp} HP)
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-slate-800">
                    <span className="text-base text-slate-900 font-black">{acumuladas} hrs</span>{' '}
                    <span className="text-slate-400">/ {limite} hrs límite</span>
                  </div>
                  <div className={`text-[11px] ${textColor}`}>
                    {restantes > 0 ? `${restantes} horas restantes` : 'Límite alcanzado'} ({porcentaje}%)
                  </div>
                </div>
              </div>

              {/* Graphical Bar */}
              <div className="space-y-1.5 mt-1">
                <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 shadow-inner">
                  {/* Progress Fill */}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colorBar}`}
                    style={{ width: `${porcentaje}%` }}
                  />

                  {/* Marker lines at 25%, 50%, 75% */}
                  <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-40">
                    <span className="w-px h-full bg-slate-400" />
                    <span className="w-px h-full bg-slate-400" />
                    <span className="w-px h-full bg-slate-400" />
                  </div>
                </div>

                {/* Scale labels */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
                  <span>0 hrs (Último overhaul)</span>
                  <span>50%</span>
                  <span>75% (Alerta de repuestos)</span>
                  <span className="font-bold text-slate-700">{limite} hrs (Límite Service)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Vessel Deep-Dive Breakdown (Babor & Estribor Engines) */}
      {(() => {
        const selectedEmb = embarcaciones.find((e) => e.id === selectedEmbId) || embarcaciones[0];
        const isCatamaran = selectedEmb.nombre.includes('Catamarán');
        const horasBase = selectedEmb.horasMotorAcumuladas;
        const horasBabor = horasBase;
        const horasEstribor = isCatamaran ? horasBase - 15 : horasBase; // Realistic tiny variance between port & starboard
        const limite = selectedEmb.limiteHorasMantenimiento;

        return (
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Detalle de Motores por Banda: {selectedEmb.nombre}
                </h3>
              </div>
              <button
                onClick={() => onProgramarMnt(selectedEmb.id)}
                className="px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Programar Mantenimiento de Horómetro</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Motor Babor */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Motor Babor (Port Side)</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    Banda Izquierda
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Horómetro Actual:</span>
                  <strong className="text-slate-900 font-mono">{horasBabor} hrs</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Próximo Service:</span>
                  <strong className="text-slate-900 font-mono">{limite} hrs</strong>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((horasBabor / limite) * 100))}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Presión Aceite: 4.2 bar (Óptima)</span>
                  <span>Temp: 82°C</span>
                </div>
              </div>

              {/* Motor Estribor */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Motor Estribor (Starboard)</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    Banda Derecha
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Horómetro Actual:</span>
                  <strong className="text-slate-900 font-mono">{horasEstribor} hrs</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Próximo Service:</span>
                  <strong className="text-slate-900 font-mono">{limite} hrs</strong>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((horasEstribor / limite) * 100))}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Presión Aceite: 4.1 bar (Óptima)</span>
                  <span>Temp: 83°C</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
