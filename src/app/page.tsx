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
  id: number;
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
    id: 1,
    setpoint: 24,
    hysteresis: 2,
    temp_max: 30,
    temp_min: 18,
  });
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [esp32Online, setEsp32Online] = useState(false);
  const [dbOnline, setDbOnline] = useState(false);

  // Cargar datos más recientes
  const loadLatest = async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error Supabase:', error);
        setDbOnline(false);
        setEsp32Online(false);
        return;
      }

      setDbOnline(true);

      if (data && data.length > 0) {
        const reading = data[0] as SensorReading;
        setLatest(reading);

        // Verificar si ESP32 está activo (datos de últimos 60 segundos)
        const diffSeconds = (Date.now() - new Date(reading.created_at).getTime()) / 1000;
        setEsp32Online(diffSeconds < 60);
      } else {
        setEsp32Online(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setDbOnline(false);
      setEsp32Online(false);
    }
  };

  // Cargar datos para el gráfico
  const loadChart = async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('created_at, temperatura, humedad')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const reversed = [...data].reverse();
        setChartData({
          labels: reversed.map((r) =>
            new Date(r.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
          ),
          temp: reversed.map((r) => r.temperatura),
          hum: reversed.map((r) => r.humedad),
        });
      }
    } catch (error) {
      console.error('Error gráfico:', error);
    }
  };

  // Cargar estado de relays
  const loadRelays = async () => {
    try {
      const { data, error } = await supabase
        .from('relay_states')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      if (data && data.length > 0) {
        // Agrupar por relay_number (último estado de cada uno)
        const latestMap = new Map<number, RelayState>();
        data.forEach((r: RelayState) => {
          if (!latestMap.has(r.relay_number)) {
            latestMap.set(r.relay_number, r);
          }
        });
        setRelays(Array.from(latestMap.values()).sort((a, b) => a.relay_number - b.relay_number));
      }
    } catch (error) {
      console.error('Error relays:', error);
    }
  };

  // Cargar configuración
  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const cfg = data[0];
        setConfig({
          id: cfg.id,
          setpoint: cfg.setpoint ?? 24,
          hysteresis: cfg.hysteresis ?? 2,
          temp_max: cfg.temp_max ?? 30,
          temp_min: cfg.temp_min ?? 18,
        });
      }
    } catch (error) {
      console.error('Error config:', error);
    }
  };

  // Cargar historial
  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) setHistory(data as SensorReading[]);
    } catch (error) {
      console.error('Error historial:', error);
    }
  };

  // Cargar alertas
  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) setAlerts(data as Alert[]);
    } catch (error) {
      console.error('Error alertas:', error);
    }
  };

  // Inicialización
  useEffect(() => {
    console.log('🚀 Iniciando Dashboard ESP32 (Solo Lectura)...');

    // Primera carga
    loadLatest();
    loadChart();
    loadRelays();
    loadConfig();
    loadHistory();
    loadAlerts();

    // Actualización periódica
    const fastInterval = setInterval(() => {
      loadLatest();
      loadChart();
    }, 5000); // Cada 5 segundos

    const mediumInterval = setInterval(() => {
      loadRelays();
    }, 10000); // Cada 10 segundos

    const slowInterval = setInterval(() => {
      loadConfig();
      loadHistory();
      loadAlerts();
    }, 15000); // Cada 15 segundos

    console.log('✅ Dashboard listo');
    console.log('📡 Leyendo datos de Supabase cada 5 segundos');

    return () => {
      clearInterval(fastInterval);
      clearInterval(mediumInterval);
      clearInterval(slowInterval);
    };
  }, []);

  // Configuración del gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: 'Temperatura (°C)', color: '#f59e0b' },
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: { display: false },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: 'Humedad (%)', color: '#06b6d4' },
      },
      x: {
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8', maxRotation: 0 },
      },
    },
  };

  const modes = ['🔴 Forzado OFF', '🟢 Forzado ON', '🤖 Automático', '✋ Manual'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="text-center mb-5">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-1">
            🤖 ESP32 Dashboard
          </h1>
          <p className="text-slate-400 text-sm">Monitoreo en Tiempo Real - Control por Telegram</p>
        </header>

        {/* Modo solo lectura */}
        <div className="bg-indigo-900/20 border-2 border-indigo-600 rounded-xl p-4 text-center mb-5">
          <h3 className="text-indigo-400 text-lg font-bold mb-2">📖 Modo Solo Lectura</h3>
          <p className="text-sm">
            Este dashboard muestra datos en tiempo real desde Supabase.<br />
            Para controlar dispositivos, usa el <strong>Bot de Telegram</strong> 👇
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex justify-center gap-3 mb-5 flex-wrap">
          <div className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 text-sm font-semibold ${
            dbOnline
              ? 'bg-green-900/20 border-green-500 text-green-400'
              : 'bg-red-900/20 border-red-500 text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${dbOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
            Base de Datos
          </div>
          <div className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 text-sm font-semibold ${
            esp32Online
              ? 'bg-green-900/20 border-green-500 text-green-400'
              : 'bg-red-900/20 border-red-500 text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${esp32Online ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
            ESP32
          </div>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Instrucciones */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-700">
              <span className="text-2xl">📋</span>
              <h2 className="text-xl font-bold">Instrucciones de Uso</h2>
            </div>
            <div className="text-sm space-y-3">
              <p><strong>🔍 Este Dashboard:</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>📊 Visualiza temperatura y humedad en tiempo real</li>
                <li>📈 Muestra gráficos históricos actualizados</li>
                <li>⚡ Observa el estado de los dispositivos (ON/OFF)</li>
                <li>⚙️ Ve la configuración automática actual</li>
                <li>⚠️ Recibe alertas de temperatura</li>
              </ul>

              <p className="mt-4"><strong>🎮 Para Controlar por Telegram:</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>&quot;<strong>¿qué temperatura hay?</strong>&quot; - Consulta clima</li>
                <li>&quot;<strong>enciende ventilador</strong>&quot; - Controla dispositivos</li>
                <li>&quot;<strong>temperatura mínima 18</strong>&quot; - Cambia límite bajo</li>
                <li>&quot;<strong>temperatura máxima 30</strong>&quot; - Cambia límite alto</li>
                <li>&quot;<strong>cambia setpoint a 25</strong>&quot; - Ajusta objetivo</li>
              </ul>

              <a
                href="https://t.me/TU_BOT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-lg font-semibold mt-3 hover:scale-105 transition"
              >
                📱 Abrir Bot de Telegram
              </a>
            </div>
          </div>

          {/* Clima Actual */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-700">
              <span className="text-2xl">🌡️</span>
              <h2 className="text-xl font-bold">Clima Actual</h2>
            </div>
            <div className="text-center bg-indigo-900/10 border-2 border-indigo-600 rounded-xl p-4 mb-3">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                {latest ? `${latest.temperatura.toFixed(1)}°C` : '--°C'}
              </div>
              <p className="text-slate-400 text-xs mt-2">
                Actualizado: {latest ? new Date(latest.created_at).toLocaleTimeString('es-PE') : 'Cargando...'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-slate-400 text-xs">💧 Humedad</p>
                <p className="text-2xl font-bold text-cyan-400">{latest ? `${latest.humedad.toFixed(0)}%` : '--%'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">🎯 Setpoint</p>
                <p className="text-2xl font-bold text-amber-400">
                  {latest?.setpoint?.toFixed(1) ?? config.setpoint.toFixed(1)}°C
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-700">
              <span className="text-2xl">📈</span>
              <h2 className="text-xl font-bold">Historial Tiempo Real</h2>
            </div>
            <div className="h-56">
              <Line
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: 'Temperatura (°C)',
                      data: chartData.temp,
                      borderColor: '#f59e0b',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      borderWidth: 2,
                      tension: 0.4,
                      fill: true,
                      pointRadius: 3,
                      pointBackgroundColor: '#f59e0b',
                    },
                    {
                      label: 'Humedad (%)',
                      data: chartData.hum,
                      borderColor: '#06b6d4',
                      backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      borderWidth: 2,
                      tension: 0.4,
                      fill: true,
                      pointRadius: 3,
                      pointBackgroundColor: '#06b6d4',
                      yAxisID: 'y1',
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              Últimos 20 datos (actualización automática cada 5 segundos)
            </p>
          </div>

          {/* Estado de Dispositivos */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-700">
              <span className="text-2xl">🔌</span>
              <h2 className="text-xl font-bold">Estado de Dispositivos</h2>
            </div>
            <div className="space-y-3">
              {relays.length === 0 ? (
                <p className="text-center text-slate-400 text-sm">Esperando datos...</p>
              ) : (
                relays.map((r) => (
                  <div key={r.relay_number} className="bg-slate-700/30 border border-slate-600 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{r.relay_name || `Relay ${r.relay_number}`}</span>
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        r.state
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-red-900/20 text-red-400'
                      }`}>
                        {r.state ? '🟢 ENCENDIDO' : '🔴 APAGADO'}
                      </span>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      r.mode === 0 ? 'bg-red-900/20 text-red-400' :
                      r.mode === 1 ? 'bg-green-900/20 text-green-400' :
                      r.mode === 2 ? 'bg-indigo-900/20 text-indigo-400' :
                      'bg-amber-900/20 text-amber-400'
                    }`}>
                      {modes[r.mode] || 'Desconocido'}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 p-3 bg-amber-900/10 border border-amber-600 rounded-xl text-xs">
              <strong>ℹ️ Nota:</strong> Para encender/apagar dispositivos, usa el bot de Telegram
            </div>
          </div>

          {/* Configuración Actual */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-700">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-xl font-bold">Configuración Actual</h2>
            </div>
            <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-3 mb-3">
              <div className="flex justify-between py-2 border-b border-slate-600/50">
                <span className="text-slate-400 text-sm">🎯 Temperatura Objetivo</span>
                <span className="font-bold text-amber-400">{config.setpoint.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-600/50">
                <span className="text-slate-400 text-sm">📊 Histéresis</span>
                <span className="font-bold text-amber-400">{config.hysteresis.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-600/50">
                <span className="text-slate-400 text-sm">🔥 Temp Máxima Alerta</span>
                <span className="font-bold text-amber-400">{config.temp_max}°C</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400 text-sm">❄️ Temp Mínima Alerta</span>
                <span className="font-bold text-amber-400">{config.temp_min}°C</span>
              </div>
            </div>
            <div className="p-3 bg-cyan-900/10 border border-cyan-600 rounded-xl text-xs">
              <strong>💡 Comandos Bot:</strong><br />
              &quot;temperatura mínima 10&quot;<br />
              &quot;temperatura máxima 35&quot;
            </div>
          </div>

          {/* Historial Registrado */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <h2 className="text-xl font-bold">Historial Registrado</h2>
              </div>
              <button
                onClick={loadHistory}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:scale-105 transition"
              >
                🔄
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <p className="text-center text-slate-400 text-sm">Cargando...</p>
              ) : (
                history.map((r) => (
                  <div key={r.id} className="bg-slate-700/50 rounded-lg p-3 border-l-4 border-indigo-600">
                    <div className="flex justify-between mb-1">
                      <strong className="text-sm">🌡️ {r.temperatura.toFixed(1)}°C</strong>
                      <span className="text-sm">💧 {r.humedad.toFixed(0)}%</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      📅 {new Date(r.created_at).toLocaleString('es-PE')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Alertas Recientes */}
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <h2 className="text-xl font-bold">Alertas Recientes</h2>
              </div>
              <button
                onClick={loadAlerts}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:scale-105 transition"
              >
                🔄
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {alerts.length === 0 ? (
                <p className="text-center text-slate-400 text-sm">Sin alertas</p>
              ) : (
                alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`bg-slate-700/50 rounded-lg p-3 border-l-4 ${
                      a.severity === 'DANGER' ? 'border-red-600' : 'border-amber-600'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">
                      {a.severity === 'DANGER' ? '🚨' : '⚠️'} {a.alert_type}
                    </div>
                    <div className="text-xs text-slate-300">{a.message}</div>
                    <div className="text-xs text-slate-400 mt-1">
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
  );
}