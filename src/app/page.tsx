'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SensorReading {
  id: number;
  created_at: string;
  temperatura: number;
  humedad: number;
  setpoint?: number;
}

interface RelayState {
  relay_number: number;
  relay_name: string;
  state: boolean;
  mode: number;
  created_at: string;
}

interface SystemConfig {
  setpoint: number;
  hysteresis: number;
  temp_max: number;
  temp_min: number;
}

interface Alert {
  id: number;
  created_at: string;
  severity: 'DANGER' | 'WARNING';
  alert_type: string;
  message: string;
}

export default function Home() {
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    temp: [] as number[],
    hum: [] as number[],
  });
  const [relays, setRelays] = useState<RelayState[]>([]);
  const [config, setConfig] = useState<SystemConfig>({
    setpoint: 24,
    hysteresis: 2,
    temp_max: 30,
    temp_min: 18,
  });
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [esp32Online, setEsp32Online] = useState(false);

  const loadLatest = async () => {
    const { data } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const reading = data[0] as SensorReading;
      setLatest(reading);

      const diffSeconds = (Date.now() - new Date(reading.created_at).getTime()) / 1000;
      setEsp32Online(diffSeconds < 60);
    }
  };

  const loadChart = async () => {
    const { data } = await supabase
      .from('sensor_readings')
      .select('created_at, temperatura, humedad')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      const reversed = [...data].reverse();
      setChartData({
        labels: reversed.map((r) =>
          new Date(r.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        ),
        temp: reversed.map((r) => r.temperatura),
        hum: reversed.map((r) => r.humedad),
      });
    }
  };

  const loadRelays = async () => {
    const { data } = await supabase
      .from('relay_states')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8); // más por si hay duplicados

    if (data) {
      const latestMap = new Map<number, RelayState>();
      data.forEach((r: RelayState) => {
        if (!latestMap.has(r.relay_number)) {
          latestMap.set(r.relay_number, r);
        }
      });
      setRelays(Array.from(latestMap.values()).sort((a, b) => a.relay_number - b.relay_number));
    }
  };

  const loadConfig = async () => {
    const { data } = await supabase
      .from('system_config')
      .select('*')
      .order('id', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setConfig({
        setpoint: data[0].setpoint ?? 24,
        hysteresis: data[0].hysteresis ?? 2,
        temp_max: data[0].temp_max ?? 30,
        temp_min: data[0].temp_min ?? 18,
      });
    }
  };

  const loadHistory = async () => {
    const { data } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setHistory(data as SensorReading[]);
  };

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('system_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setAlerts(data as Alert[]);
  };

  useEffect(() => {
    loadLatest();
    loadChart();
    loadRelays();
    loadConfig();
    loadHistory();
    loadAlerts();

    const fastInterval = setInterval(() => {
      loadLatest();
      loadChart();
    }, 5000);

    const slowInterval = setInterval(() => {
      loadRelays();
      loadConfig();
      loadHistory();
      loadAlerts();
    }, 15000);

    return () => {
      clearInterval(fastInterval);
      clearInterval(slowInterval);
    };
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: {
        position: 'left' as const,
        title: { display: true, text: 'Temperatura (°C)', color: '#f59e0b' },
      },
      y1: {
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Humedad (%)', color: '#06b6d4' },
      },
    },
  };

  const modes = ['🔴 Forzado OFF', '🟢 Forzado ON', '🤖 Automático', '✋ Manual'];
  const modeClasses = ['forced-off', 'forced-on', 'auto', 'manual'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            🤖 ESP32 Dashboard
          </h1>
          <p className="text-slate-400 mt-3 text-lg">Monitoreo en Tiempo Real - Control por Telegram</p>
        </header>

        {/* Modo solo lectura */}
        <div className="bg-blue-900/30 border-2 border-blue-600 rounded-2xl p-6 text-center mb-10">
          <h3 className="text-blue-400 text-2xl font-bold mb-3">📖 Modo Solo Lectura</h3>
          <p className="text-lg">
            Este dashboard muestra datos en tiempo real desde Supabase.<br />
            Para controlar dispositivos, usa el <strong>Bot de Telegram</strong>
          </p>
        </div>

        {/* Status */}
        <div className="flex justify-center gap-8 mb-10 flex-wrap">
          <div className="px-8 py-4 rounded-full bg-green-900/30 border-2 border-green-500 text-green-400 flex items-center gap-4 text-lg font-semibold">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            Base de Datos
          </div>
          <div className={`px-8 py-4 rounded-full border-2 flex items-center gap-4 text-lg font-semibold ${
            esp32Online
              ? 'bg-green-900/30 border-green-500 text-green-400'
              : 'bg-red-900/30 border-red-500 text-red-400'
          }`}>
            <div className={`w-4 h-4 rounded-full ${esp32Online ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            ESP32 {esp32Online ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Clima Actual */}
          <div className="bg-slate-800/70 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">🌡️ Clima Actual</h2>
            <div className="text-center mb-6">
              <div className="text-7xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {latest ? `${latest.temperatura.toFixed(1)}°C` : '--°C'}
              </div>
              <p className="text-slate-400 mt-4">
                Actualizado: {latest ? new Date(latest.created_at).toLocaleTimeString('es-PE') : '--'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-slate-400 mb-2">💧 Humedad</p>
                <p className="text-4xl font-bold text-cyan-400">{latest ? `${latest.humedad}%` : '--%'}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-2">🎯 Setpoint</p>
                <p className="text-4xl font-bold text-amber-400">
                  {latest?.setpoint?.toFixed(1) ?? config.setpoint.toFixed(1)}°C
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-slate-800/70 rounded-2xl p-8 border border-slate-700 xl:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">📈 Historial Tiempo Real</h2>
            <div className="h-64">
              <Line data={{
                labels: chartData.labels,
                datasets: [
                  {
                    label: 'Temperatura (°C)',
                    data: chartData.temp,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: 'Humedad (%)',
                    data: chartData.hum,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1',
                  },
                ],
              }} options={chartOptions} />
            </div>
          </div>

          {/* Dispositivos */}
          <div className="bg-slate-800/70 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">🔌 Estado de Dispositivos</h2>
            <div className="space-y-4">
              {relays.length === 0 ? (
                <p className="text-center text-slate-400">Esperando datos...</p>
              ) : (
                relays.map((r) => (
                  <div key={r.relay_number} className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-lg">{r.relay_name || `Relay ${r.relay_number}`}</span>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${r.state ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {r.state ? '🟢 ENCENDIDO' : '🔴 APAGADO'}
                      </span>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                      modeClasses[r.mode] === 'forced-off' ? 'bg-red-900/50 text-red-400' :
                      modeClasses[r.mode] === 'forced-on' ? 'bg-green-900/50 text-green-400' :
                      modeClasses[r.mode] === 'auto' ? 'bg-blue-900/50 text-blue-400' :
                      'bg-amber-900/50 text-amber-400'
                    }`}>
                      {modes[r.mode] || 'Desconocido'}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 p-4 bg-amber-900/30 rounded-xl text-sm">
              <strong>ℹ️ Nota:</strong> Para encender/apagar dispositivos, usa el bot de Telegram
            </div>
          </div>

          {/* Configuración */}
          <div className="bg-slate-800/70 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">⚙️ Configuración Actual</h2>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-slate-600/50">
                <span className="text-slate-400">🎯 Temperatura Objetivo</span>
                <span className="font-bold text-amber-400">{config.setpoint.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-600/50">
                <span className="text-slate-400">📊 Histéresis</span>
                <span className="font-bold text-amber-400">{config.hysteresis.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-600/50">
                <span className="text-slate-400">🔥 Temp Máxima Alerta</span>
                <span className="font-bold text-amber-400">{config.temp_max}°C</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-400">❄️ Temp Mínima Alerta</span>
                <span className="font-bold text-amber-400">{config.temp_min}°C</span>
              </div>
            </div>
          </div>

          {/* Historial y Alertas */}
          <div className="bg-slate-800/70 rounded-2xl p-8 border border-slate-700 xl:col-span-2">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Historial */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
                  <span className="flex items-center gap-3">📊 Historial Registrado</span>
                  <button onClick={loadHistory} className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition">
                    🔄
                  </button>
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-center text-slate-400">Cargando...</p>
                  ) : (
                    history.map((r) => (
                      <div key={r.id} className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-600">
                        <div className="flex justify-between mb-2">
                          <strong>🌡️ {r.temperatura.toFixed(1)}°C</strong>
                          <span>💧 {r.humedad}%</span>
                        </div>
                        <div className="text-sm text-slate-400">
                          📅 {new Date(r.created_at).toLocaleString('es-PE')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Alertas */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
                  <span className="flex items-center gap-3">⚠️ Alertas Recientes</span>
                  <button onClick={loadAlerts} className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition">
                    🔄
                  </button>
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-center text-slate-400">✅ Sin alertas</p>
                  ) : (
                    alerts.map((a) => (
                      <div key={a.id} className={`bg-slate-700/50 rounded-lg p-4 border-l-4 ${a.severity === 'DANGER' ? 'border-red-600' : 'border-amber-600'}`}>
                        <div className="font-bold mb-2">
                          {a.severity === 'DANGER' ? '🚨' : '⚠️'} {a.alert_type}
                        </div>
                        <div className="text-sm">{a.message}</div>
                        <div className="text-xs text-slate-400 mt-2">
                          📅 {new Date(a.created_at).toLocaleString('es-PE')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Telegram */}
        <div className="text-center mt-12">
          <a
            href="https://t.me/TU_BOT_AQUI" // ← Cambia por el link real de tu bot
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition shadow-2xl"
          >
            📱 Abrir Bot de Telegram para Controlar
          </a>
        </div>
      </div>
    </div>
  );
}