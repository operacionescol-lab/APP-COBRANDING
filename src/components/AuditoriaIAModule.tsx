import React, { useState } from 'react';
import { Salida, Embarcacion, Tripulante } from '../types/nautical';
import {
  Bot,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  FileCode,
  Radio,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Ship,
  Users,
} from 'lucide-react';

interface AuditoriaIAModuleProps {
  salidas: Salida[];
  embarcaciones: Embarcacion[];
  tripulacion: Tripulante[];
  onApplyParsedNovedad: (parsedData: any) => Promise<void>;
}

export const AuditoriaIAModule: React.FC<AuditoriaIAModuleProps> = ({
  salidas,
  embarcaciones,
  tripulacion,
  onApplyParsedNovedad,
}) => {
  const [activeTab, setActiveTab] = useState<'AUDITORIA' | 'JSON' | 'BITACORA' | 'RADIO'>('AUDITORIA');
  const [loading, setLoading] = useState(false);
  const [markdownOutput, setMarkdownOutput] = useState<string>('');
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [bitacoraOutput, setBitacoraOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Radio note parser
  const [radioInput, setRadioInput] = useState(
    'Capitán Carlos Mendoza en Catamarán Armonía zarpó a las 08:35 con 58 pax reales hacia Islas del Rosario. Código SITMAR STM-202610-0988 verificado en muelle Bodeguita. Marinero Brayan Torres confirmado a bordo sin novedades.'
  );
  const [parsedRadioResult, setParsedRadioResult] = useState<any>(null);
  const [isParsingRadio, setIsParsingRadio] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Instant pre-checks
  const sinSitmarEjecutadas = salidas.filter(
    (s) => s.estado === 'EJECUTADA' && (!s.codigoSitmar || s.codigoSitmar.length < 5)
  );

  const docAlerts = embarcaciones.flatMap((e) =>
    e.documentos
      .filter((d) => d.estado === 'POR_VENCER' || d.estado === 'VENCIDO')
      .map((d) => ({ embarcacion: e.nombre, ...d }))
  );

  const crewAlerts = tripulacion.filter((t) => t.licencia?.estado === 'POR_VENCER');

  // Trigger Markdown Audit with Gemini 3.8-flash
  const handleRunAudit = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gemini/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'markdown' }),
      });
      const data = await res.json();
      if (data.content) {
        setMarkdownOutput(data.content);
      } else {
        setMarkdownOutput('No se pudo generar la auditoría: ' + (data.error || 'Error desconocido'));
      }
    } catch (err: any) {
      setMarkdownOutput('Error de conexión al núcleo de IA: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger JSON Export with Gemini 3.8-flash (response_mime_type: application/json)
  const handleRunJsonAudit = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gemini/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json' }),
      });
      const data = await res.json();
      if (data.data) {
        setJsonOutput(JSON.stringify(data.data, null, 2));
      } else {
        setJsonOutput(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setJsonOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Generate Bitacora
  const handleGenerateBitacora = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gemini/bitacora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salidasSeleccionadas: salidas.slice(0, 15) }),
      });
      const data = await res.json();
      if (data.content) {
        setBitacoraOutput(data.content);
      }
    } catch (err: any) {
      setBitacoraOutput('Error generando bitácora: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Parse natural language dispatch
  const handleParseRadio = async () => {
    if (!radioInput.trim()) return;
    try {
      setIsParsingRadio(true);
      setAppliedSuccess(false);
      const res = await fetch('/api/gemini/parse-novedad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: radioInput }),
      });
      const data = await res.json();
      setParsedRadioResult(data);
    } catch (err: any) {
      alert('Error procesando reporte: ' + err.message);
    } finally {
      setIsParsingRadio(false);
    }
  };

  // Apply parsed novedad into real state
  const handleApplyParsed = async () => {
    if (!parsedRadioResult) return;
    try {
      await onApplyParsedNovedad(parsedRadioResult);
      setAppliedSuccess(true);
    } catch (err: any) {
      alert('Error aplicando reconfirmación: ' + err.message);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> Núcleo de Inteligencia Artificial Gemini 3.8-flash
            </span>
            <span className="text-slate-400 text-xs">DIMAR / RENET Standard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Auditoría Inteligente &amp; Cumplimiento Marítimo
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Validación de Códigos SITMAR, bitácoras oficiales de zarpe, auditoría documental y procesamiento de novedades.
          </p>
        </div>

        {/* Live status indicators */}
        <div className="flex items-center gap-2">
          {sinSitmarEjecutadas.length === 0 ? (
            <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>0 Infracciones SITMAR</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-950/80 text-rose-300 px-3 py-1.5 rounded-xl border border-rose-800 text-xs font-semibold animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{sinSitmarEjecutadas.length} Salidas sin SITMAR</span>
            </div>
          )}
        </div>
      </div>

      {/* Instant Fleet Compliance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SITMAR Audit Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Control Códigos SITMAR
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {salidas.filter((s) => s.codigoSitmar && s.codigoSitmar.length >= 5).length} / {salidas.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Salidas con Código SITMAR de Capitanía radicado y verificado en plataforma.
          </p>
        </div>

        {/* Document alerts card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pólizas &amp; Patentes en Alerta
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{docAlerts.length} Documentos</div>
          <p className="text-xs text-slate-500 mt-1">
            {docAlerts.map((d) => `${d.embarcacion}: ${d.nombre}`).join(' • ') || 'Todos los documentos al día'}
          </p>
        </div>

        {/* Crew license alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Licencias Tripulación
            </span>
            <Users className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{crewAlerts.length} Por Renovar</div>
          <p className="text-xs text-slate-500 mt-1">
            {crewAlerts.map((c) => `${c.nombreCompleto.split(' ')[0]} (Vence ${c.licencia?.fechaVencimiento || 'N/A'})`).join(', ') || 'Licencias vigentes'}
          </p>
        </div>
      </div>

      {/* Tab Nav for AI tools */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 flex flex-wrap gap-2 pt-2 bg-slate-50">
          <button
            onClick={() => {
              setActiveTab('AUDITORIA');
              if (!markdownOutput) handleRunAudit();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-t border-x ${
              activeTab === 'AUDITORIA'
                ? 'bg-white text-cyan-800 border-slate-200 -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Auditoría Integral en Markdown
          </button>
          <button
            onClick={() => {
              setActiveTab('JSON');
              if (!jsonOutput) handleRunJsonAudit();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-t border-x ${
              activeTab === 'JSON'
                ? 'bg-white text-cyan-800 border-slate-200 -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Volcado Estructurado JSON (DIMAR/RENET)
          </button>
          <button
            onClick={() => {
              setActiveTab('BITACORA');
              if (!bitacoraOutput) handleGenerateBitacora();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-t border-x ${
              activeTab === 'BITACORA'
                ? 'bg-white text-cyan-800 border-slate-200 -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚓ Bitácora Oficial de Despachos DIMAR
          </button>
          <button
            onClick={() => setActiveTab('RADIO')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-t border-x ${
              activeTab === 'RADIO'
                ? 'bg-white text-cyan-800 border-slate-200 -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📻 Reconfirmación Asistida por Radio VHF
          </button>
        </div>

        {/* Tab 1: Markdown Audit */}
        {activeTab === 'AUDITORIA' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Informe de Auditoría Operativa &amp; Normativa DIMAR
                </h3>
                <p className="text-xs text-slate-500">
                  Generado con Gemini 3.8-flash utilizando terminología náutica oficial y manual MOP-CHARTER-001.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAudit}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Analizando...' : 'Ejecutar Nueva Auditoría'}</span>
                </button>
                {markdownOutput && (
                  <button
                    onClick={() => handleCopy(markdownOutput)}
                    className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title="Copiar Markdown"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="text-sm font-bold text-slate-800">
                  Auditando matriz de zarpes, códigos SITMAR y vencimientos de pólizas...
                </div>
                <div className="text-xs text-slate-400">Consultando núcleo de backend Gemini 3.8-flash</div>
              </div>
            ) : markdownOutput ? (
              <div className="prose prose-slate max-w-none text-xs sm:text-sm bg-slate-50 p-5 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap font-sans leading-relaxed text-slate-800">
                {markdownOutput}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Haga clic en &quot;Ejecutar Nueva Auditoría&quot; para iniciar la verificación integral de la flota.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: JSON Export */}
        {activeTab === 'JSON' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Volcado Estructurado JSON (Standard RENET &amp; DIMAR API)
                </h3>
                <p className="text-xs text-slate-500">
                  Salida estricta bajo especificación <code className="text-cyan-700">response_mime_type: application/json</code>.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunJsonAudit}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Generando JSON...' : 'Sincronizar JSON'}</span>
                </button>
                {jsonOutput && (
                  <button
                    onClick={() => handleCopy(jsonOutput)}
                    className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title="Copiar JSON"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Estructurando payload JSON con Gemini...
              </div>
            ) : jsonOutput ? (
              <pre className="p-4 bg-slate-950 text-cyan-300 rounded-xl font-mono text-xs overflow-x-auto max-h-[500px]">
                {jsonOutput}
              </pre>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Haga clic en &quot;Sincronizar JSON&quot; para generar el payload estructurado.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Official Bitacora */}
        {activeTab === 'BITACORA' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Bitácora Oficial de Zarpes y Despachos (Capitanía CP05)
                </h3>
                <p className="text-xs text-slate-500">
                  Formato oficial para presentación ante inspectores de Guardacostas y DIMAR.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateBitacora}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Compilando...' : 'Regenerar Bitácora'}</span>
                </button>
                {bitacoraOutput && (
                  <button
                    onClick={() => handleCopy(bitacoraOutput)}
                    className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {bitacoraOutput ? (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs whitespace-pre-wrap font-mono leading-relaxed text-slate-900">
                {bitacoraOutput}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Presione &quot;Regenerar Bitácora&quot; para compilar el libro de zarpes oficial.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Radio & Natural Language Parser */}
        {activeTab === 'RADIO' && (
          <div className="p-6 space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Reconfirmación Rápida Asistida por Radio VHF / Novedades de Muelle</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pegue o dicte el mensaje de despacho reportado por el Capitán o muelle. La IA extraerá los datos náuticos, validará el código SITMAR y autocompletará la salida.
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={radioInput}
                onChange={(e) => setRadioInput(e.target.value)}
                placeholder="Ej: Capitán Mendoza en Armonía zarpó a las 08:35 con 58 pax, SITMAR STM-202610-0988..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-cyan-500 font-medium"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleParseRadio}
                  disabled={isParsingRadio || !radioInput.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>{isParsingRadio ? 'Analizando Mensaje...' : 'Procesar con IA'}</span>
                </button>
              </div>
            </div>

            {/* Parsed Result Box */}
            {parsedRadioResult && (
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Datos Náuticos Extraídos y Auditados:</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-700 bg-white px-2 py-0.5 rounded border border-cyan-300">
                    SITMAR: {parsedRadioResult.codigoSitmar || 'Detectado'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-cyan-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Embarcación</span>
                    <strong className="text-slate-800">{parsedRadioResult.embarcacionNombre || 'Detectada'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PAX Reales</span>
                    <strong className="text-slate-800">{parsedRadioResult.paxReales || 'Reales'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Piloto / Capitán</span>
                    <strong className="text-slate-800">{parsedRadioResult.pilotoNombre || 'Confirmado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estado Sugerido</span>
                    <strong className="text-emerald-700 font-bold">{parsedRadioResult.estadoSugerido || 'EJECUTADA'}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-600">
                    Observación: <em>{parsedRadioResult.observacionResumen}</em>
                  </div>
                  <button
                    onClick={handleApplyParsed}
                    disabled={appliedSuccess}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition-colors"
                  >
                    {appliedSuccess ? '✓ Reconfirmación Aplicada' : 'Aplicar a Matriz de Salidas'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
