import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Bed,
  Users,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  HeartPulse,
  Award,
} from 'lucide-react';
import { ClinicRecord } from '../types/clinic';

interface MonthlyVisitsChartProps {
  records: ClinicRecord[];
}

interface MonthlyStat {
  key: string;
  bulan: string;
  namaBulan: string;
  total: number;
  rawatJalan: number;
  rawatInap: number;
  spoting: number;
  reguler: number;
  lakiLaki: number;
  perempuan: number;
}

const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const BULAN_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

export const MonthlyVisitsChart: React.FC<MonthlyVisitsChartProps> = ({ records }) => {
  const [viewMode, setViewMode] = useState<'total' | 'status' | 'asal' | 'gender'>('total');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [timeRange, setTimeRange] = useState<'all' | '2026' | '6m'>('all');

  // Aggregation per month
  const monthlyData: MonthlyStat[] = useMemo(() => {
    const map = new Map<string, MonthlyStat>();

    // Baseline fallback months for continuous smooth graph (Mei - Okt 2026)
    const baseKeys = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    baseKeys.forEach((ym) => {
      const [yearStr, monthStr] = ym.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1;
      const shortYear = yearStr.slice(2);
      map.set(ym, {
        key: ym,
        bulan: `${BULAN_SHORT[monthIdx]} '${shortYear}`,
        namaBulan: `${BULAN_NAMES[monthIdx]} ${yearStr}`,
        total: 0,
        rawatJalan: 0,
        rawatInap: 0,
        spoting: 0,
        reguler: 0,
        lakiLaki: 0,
        perempuan: 0,
      });
    });

    records.forEach((rec) => {
      if (!rec.waktuKunjungan) return;
      const datePart = rec.waktuKunjungan.split('T')[0] || rec.waktuKunjungan;
      const [yearStr, monthStr] = datePart.split('-');
      if (!yearStr || !monthStr) return;
      const ym = `${yearStr}-${monthStr.padStart(2, '0')}`;
      if (!map.has(ym)) {
        const monthIdx = parseInt(monthStr, 10) - 1;
        const shortYear = yearStr.slice(2);
        map.set(ym, {
          key: ym,
          bulan: `${BULAN_SHORT[monthIdx] || 'Bln'} '${shortYear}`,
          namaBulan: `${BULAN_NAMES[monthIdx] || monthStr} ${yearStr}`,
          total: 0,
          rawatJalan: 0,
          rawatInap: 0,
          spoting: 0,
          reguler: 0,
          lakiLaki: 0,
          perempuan: 0,
        });
      }

      const stat = map.get(ym)!;
      stat.total += 1;
      if (rec.statusPerawatan === 'Rawat Inap') {
        stat.rawatInap += 1;
      } else {
        stat.rawatJalan += 1;
      }

      if (rec.asalPengiriman === 'Spoting') {
        stat.spoting += 1;
      } else {
        stat.reguler += 1;
      }

      const gender = (rec.jenisKelamin || '').toLowerCase();
      if (gender.includes('perempuan')) {
        stat.perempuan += 1;
      } else {
        stat.lakiLaki += 1;
      }
    });

    let sorted = Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
    if (timeRange === '6m') {
      sorted = sorted.slice(-6);
    } else if (timeRange === '2026') {
      sorted = sorted.filter((d) => d.key.startsWith('2026'));
    }
    return sorted;
  }, [records, timeRange]);

  const totalKunjungan = useMemo(
    () => monthlyData.reduce((acc, curr) => acc + curr.total, 0),
    [monthlyData]
  );

  const peakMonth = useMemo(() => {
    if (monthlyData.length === 0) return { namaBulan: '-', bulan: '-', total: 0 };
    return monthlyData.reduce(
      (max, curr) => (curr.total > max.total ? curr : max),
      monthlyData[0]
    );
  }, [monthlyData]);

  const avgPerMonth = useMemo(() => {
    if (monthlyData.length === 0) return 0;
    const withData = monthlyData.filter((m) => m.total > 0);
    const count = withData.length || monthlyData.length;
    return Math.round(totalKunjungan / count);
  }, [monthlyData, totalKunjungan]);

  const totalRawatInap = useMemo(
    () => monthlyData.reduce((acc, curr) => acc + curr.rawatInap, 0),
    [monthlyData]
  );

  const rawatInapRate = useMemo(() => {
    if (totalKunjungan === 0) return 0;
    return Math.round((totalRawatInap / totalKunjungan) * 100);
  }, [totalKunjungan, totalRawatInap]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyStat = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border-2 border-amber-500/70 p-3.5 rounded-xl shadow-2xl backdrop-blur-md min-w-[220px] text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 font-serif-header">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {data.namaBulan}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40">
              {data.total} Kunjungan
            </span>
          </div>
          <div className="space-y-1.5 pt-1 text-slate-300">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Rawat Jalan:
              </span>
              <strong className="text-white font-mono">{data.rawatJalan}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Rawat Inap:
              </span>
              <strong className="text-white font-mono">{data.rawatInap}</strong>
            </div>
            <div className="border-t border-slate-800/80 my-1"></div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-amber-200/80">Spoting / Reguler:</span>
              <span className="text-slate-200 font-mono">
                {data.spoting} / {data.reguler}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Laki-laki / Perempuan:</span>
              <span className="text-slate-200 font-mono">
                {data.lakiLaki} / {data.perempuan}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-slate-900/95 border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-amber-500/50">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40">
              Analitik Medis Siswa
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <Activity className="w-3.5 h-3.5" /> Recharts Engine
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white font-serif-header tracking-wide mt-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>Tren Jumlah Kunjungan Siswa per Bulan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoring fluktuasi angka kunjungan berobat, rawat inap, dan tren kesehatan siswa Bakomsus
          </p>
        </div>

        {/* Action & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Selector */}
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode('total')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'total'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Tren
            </button>
            <button
              onClick={() => setViewMode('status')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'status'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bed className="w-3 h-3" />
              Rawat Inap/Jalan
            </button>
            <button
              onClick={() => setViewMode('asal')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'asal'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              Spoting/Reguler
            </button>
            <button
              onClick={() => setViewMode('gender')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'gender'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gender
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              title="Grafik Garis Area Halus"
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                chartType === 'area'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              title="Grafik Batang Komparasi"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-slate-950 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Semua Bulan</option>
            <option value="6m">6 Bulan Terakhir</option>
            <option value="2026">Tahun 2026</option>
          </select>
        </div>
      </div>

      {/* KPI Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Periode
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-extrabold text-white font-mono">
              {totalKunjungan}
            </span>
            <span className="text-[10px] text-amber-400">kasus siswa</span>
          </div>
        </div>
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" /> Puncak Kasus
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-extrabold text-amber-300 font-mono">
              {peakMonth.total}
            </span>
            <span className="text-[10px] text-slate-300 truncate">({peakMonth.bulan})</span>
          </div>
        </div>
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Rata-rata Bulanan
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-extrabold text-sky-400 font-mono">
              {avgPerMonth}
            </span>
            <span className="text-[10px] text-slate-400">kunjungan/bln</span>
          </div>
        </div>
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Rasio Rawat Inap
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-extrabold text-red-400 font-mono">
              {rawatInapRate}%
            </span>
            <span className="text-[10px] text-red-300/80">({totalRawatInap} opname)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorRawatJalan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorRawatInap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.85} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorSpoting" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorReguler" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorLaki" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorPerempuan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="bulan"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              {viewMode === 'total' && (
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Kunjungan"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  activeDot={{ r: 6, fill: '#FDE047', stroke: '#854D0E', strokeWidth: 2 }}
                />
              )}
              {viewMode === 'status' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="rawatJalan"
                    name="Rawat Jalan"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRawatJalan)"
                  />
                  <Area
                    type="monotone"
                    dataKey="rawatInap"
                    name="Rawat Inap"
                    stroke="#EF4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRawatInap)"
                  />
                </>
              )}
              {viewMode === 'asal' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="spoting"
                    name="Pengiriman Spoting"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSpoting)"
                  />
                  <Area
                    type="monotone"
                    dataKey="reguler"
                    name="Pengiriman Reguler"
                    stroke="#0EA5E9"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorReguler)"
                  />
                </>
              )}
              {viewMode === 'gender' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="lakiLaki"
                    name="Laki-laki"
                    stroke="#06B6D4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorLaki)"
                  />
                  <Area
                    type="monotone"
                    dataKey="perempuan"
                    name="Perempuan"
                    stroke="#F43F5E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPerempuan)"
                  />
                </>
              )}
            </AreaChart>
          ) : (
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="bulan"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              {viewMode === 'total' && (
                <Bar
                  dataKey="total"
                  name="Total Kunjungan"
                  fill="#D4AF37"
                  radius={[6, 6, 0, 0]}
                />
              )}
              {viewMode === 'status' && (
                <>
                  <Bar
                    dataKey="rawatJalan"
                    name="Rawat Jalan"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="rawatInap"
                    name="Rawat Inap"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                  />
                </>
              )}
              {viewMode === 'asal' && (
                <>
                  <Bar
                    dataKey="spoting"
                    name="Pengiriman Spoting"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="reguler"
                    name="Pengiriman Reguler"
                    fill="#0EA5E9"
                    radius={[4, 4, 0, 0]}
                  />
                </>
              )}
              {viewMode === 'gender' && (
                <>
                  <Bar
                    dataKey="lakiLaki"
                    name="Laki-laki"
                    fill="#06B6D4"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="perempuan"
                    name="Perempuan"
                    fill="#F43F5E"
                    radius={[4, 4, 0, 0]}
                  />
                </>
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Notes */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 gap-2 mt-2">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-3.5 h-3.5 text-red-400" />
          <span>
            Data disinkronkan secara otomatis saat formulir kunjungan pasien ditambah atau diperbarui.
          </span>
        </div>
        <div className="text-slate-500 font-mono">
          Periode Terdata: {monthlyData[0]?.bulan || '-'} s/d {monthlyData[monthlyData.length - 1]?.bulan || '-'}
        </div>
      </div>
    </section>
  );
};
