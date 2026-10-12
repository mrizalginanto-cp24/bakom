import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Clock,
  ClipboardList,
  Users,
  Bed,
  HeartPulse,
  Search,
  X,
  RotateCcw,
  FileSpreadsheet,
  Trash2,
  Edit3,
  FileText,
  UserCheck,
  Star,
  GraduationCap,
  Building2,
  Database,
  ShieldAlert,
} from 'lucide-react';
import { ClinicRecord, INITIAL_RECORDS, POLDA_LIST } from './types/clinic';
import { KlinikLogo } from './components/KlinikLogo';
import { MonthlyVisitsChart } from './components/MonthlyVisitsChart';
import { RecordModal } from './components/RecordModal';
import { DetailModal } from './components/DetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { formatDateTime, calculateInpatientDuration } from './utils/dateHelper';

const STORAGE_KEY = 'klinik_bakomsus_records_v1';

export default function App() {
  const [records, setRecords] = useState<ClinicRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAsal, setFilterAsal] = useState<string>('ALL');
  const [filterPolda, setFilterPolda] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [recordToEdit, setRecordToEdit] = useState<ClinicRecord | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ClinicRecord | null>(null);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [selectedRecordForCheckout, setSelectedRecordForCheckout] = useState<ClinicRecord | null>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${h}:${m}:${s} WIB`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      setCurrentDate(now.toLocaleDateString('id-ID', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load records from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecords(parsed);
          return;
        }
      }
      // If no stored records, seed with INITIAL_RECORDS
      setRecords(INITIAL_RECORDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECORDS));
    } catch (err) {
      console.error('Failed to load records:', err);
      setRecords(INITIAL_RECORDS);
    }
  }, []);

  // Save records helper
  const saveRecords = (newRecords: ClinicRecord[]) => {
    setRecords(newRecords);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  };

  // Stats calculation
  const totalVisits = records.length;
  const spotingCount = useMemo(
    () => records.filter((r) => r.asalPengiriman === 'Spoting').length,
    [records]
  );
  const regulerCount = useMemo(
    () => records.filter((r) => r.asalPengiriman === 'Reguler').length,
    [records]
  );
  const activeInpatients = useMemo(
    () =>
      records.filter(
        (r) => r.statusPerawatan === 'Rawat Inap' && (r.isDirawat || !r.tglKeluarInap)
      ).length,
    [records]
  );
  const finishedVisits = useMemo(
    () =>
      records.filter(
        (r) =>
          r.statusPerawatan === 'Rawat Jalan' ||
          (r.statusPerawatan === 'Rawat Inap' && !r.isDirawat && r.tglKeluarInap)
      ).length,
    [records]
  );

  const totalAsal = spotingCount + regulerCount;
  const spotingPct = totalAsal > 0 ? (spotingCount / totalAsal) * 100 : 50;
  const regulerPct = totalAsal > 0 ? (regulerCount / totalAsal) * 100 : 50;

  // Filtered Records
  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return records.filter((item) => {
      const matchQuery =
        !q ||
        item.nama.toLowerCase().includes(q) ||
        (item.nosis && item.nosis.toLowerCase().includes(q)) ||
        (item.polda && item.polda.toLowerCase().includes(q)) ||
        (item.diagnosa && item.diagnosa.toLowerCase().includes(q)) ||
        (item.keluhan && item.keluhan.toLowerCase().includes(q)) ||
        (item.noReg && item.noReg.toLowerCase().includes(q)) ||
        (item.terapi && item.terapi.toLowerCase().includes(q));

      const matchAsal = filterAsal === 'ALL' || item.asalPengiriman === filterAsal;
      const matchPolda = filterPolda === 'ALL' || item.polda === filterPolda;

      let matchStatus = true;
      if (filterStatus === 'Rawat Inap - Aktif') {
        matchStatus =
          item.statusPerawatan === 'Rawat Inap' && (item.isDirawat || !item.tglKeluarInap);
      } else if (filterStatus === 'Rawat Inap - Selesai') {
        matchStatus =
          item.statusPerawatan === 'Rawat Inap' && !item.isDirawat && Boolean(item.tglKeluarInap);
      } else if (filterStatus === 'Rawat Jalan') {
        matchStatus = item.statusPerawatan === 'Rawat Jalan';
      }

      return matchQuery && matchAsal && matchPolda && matchStatus;
    });
  }, [records, searchQuery, filterAsal, filterPolda, filterStatus]);

  // Handlers
  const handleOpenAdd = () => {
    setRecordToEdit(null);
    setIsRecordModalOpen(true);
  };

  const handleOpenEdit = (rec: ClinicRecord) => {
    setRecordToEdit(rec);
    setIsRecordModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data rekam medis siswa "${name}"?`)) {
      const next = records.filter((r) => r.id !== id);
      saveRecords(next);
    }
  };

  const handleSaveRecord = (record: ClinicRecord) => {
    const exists = records.some((r) => r.id === record.id);
    let next: ClinicRecord[];
    if (exists) {
      next = records.map((r) => (r.id === record.id ? record : r));
    } else {
      next = [record, ...records];
    }
    saveRecords(next);
  };

  const handleOpenCheckout = (rec: ClinicRecord) => {
    setSelectedRecordForCheckout(rec);
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = (id: string, waktuKeluar: string, catatan: string) => {
    const next = records.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          tglKeluarInap: waktuKeluar,
          isDirawat: false,
          catatanKeluar: catatan,
        };
      }
      return r;
    });
    saveRecords(next);
  };

  const handleOpenDetail = (rec: ClinicRecord) => {
    setSelectedRecordForDetail(rec);
    setIsDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterAsal('ALL');
    setFilterPolda('ALL');
    setFilterStatus('ALL');
  };

  const handleResetToSample = () => {
    if (
      confirm(
        'Muat kembali data sampel kunjungan siswa Bakomsus? Rekam medis baru akan digantikan.'
      )
    ) {
      saveRecords(INITIAL_RECORDS);
    }
  };

  const handleClearAll = () => {
    if (
      confirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh data kunjungan dan rawat inap?')
    ) {
      saveRecords([]);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('Tidak ada data kunjungan untuk diekspor.');
      return;
    }

    const headers = [
      'No Registrasi',
      'Nama Siswa',
      'Nosis/Peleton',
      'Jenis Kelamin',
      'Asal Pengiriman',
      'Pengiriman Polda',
      'Waktu Kunjungan',
      'Tensi (mmHg)',
      'Suhu (°C)',
      'Nadi (bpm)',
      'Keluhan Utama',
      'Diagnosa',
      'Terapi & Obat',
      'Status Perawatan',
      'Ruang Rawat Inap',
      'Tgl Masuk Inap',
      'Tgl Keluar Inap',
      'Durasi Rawat Inap',
      'Status Rawat Inap',
      'Catatan Kepulangan',
    ];

    const csvRows = [headers.join(',')];

    records.forEach((r) => {
      const isRawatInap = r.statusPerawatan === 'Rawat Inap';
      const isAktif = isRawatInap && (r.isDirawat || !r.tglKeluarInap);
      const durasi = isRawatInap
        ? calculateInpatientDuration(r.tglMasukInap, r.tglKeluarInap, isAktif)
        : '-';
      const statusInap = isRawatInap ? (isAktif ? 'Sedang Dirawat' : 'Sudah Keluar') : '-';

      const row = [
        `"${(r.noReg || '').replace(/"/g, '""')}"`,
        `"${(r.nama || '').replace(/"/g, '""')}"`,
        `"${(r.nosis || '').replace(/"/g, '""')}"`,
        `"${(r.jenisKelamin || 'Laki-laki').replace(/"/g, '""')}"`,
        `"${(r.asalPengiriman || '').replace(/"/g, '""')}"`,
        `"${(r.polda || '-').replace(/"/g, '""')}"`,
        `"${(r.waktuKunjungan || '').replace(/"/g, '""')}"`,
        `"${(r.tensi || '').replace(/"/g, '""')}"`,
        `"${(r.suhu || '').replace(/"/g, '""')}"`,
        `"${(r.nadi || '').replace(/"/g, '""')}"`,
        `"${(r.keluhan || '').replace(/"/g, '""')}"`,
        `"${(r.diagnosa || '').replace(/"/g, '""')}"`,
        `"${(r.terapi || '').replace(/"/g, '""')}"`,
        `"${(r.statusPerawatan || '').replace(/"/g, '""')}"`,
        `"${(r.ruangRawat || '').replace(/"/g, '""')}"`,
        `"${(r.tglMasukInap || '').replace(/"/g, '""')}"`,
        `"${(r.tglKeluarInap || '').replace(/"/g, '""')}"`,
        `"${durasi.replace(/"/g, '""')}"`,
        `"${statusInap}"`,
        `"${(r.catatanKeluar || '').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvString = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `rekap_kunjungan_klinik_pratama_bumi_kresna_${dateStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0B1120] text-slate-100 min-h-screen antialiased flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* ================= TOP HEADER INSTITUSIONAL ================= */}
      <header className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b-4 border-amber-500 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo & Branding */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-600 to-amber-800 p-[3px] shadow-lg shadow-black/60 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border-2 border-amber-300 relative overflow-hidden p-0.5">
                    <KlinikLogo className="w-full h-full drop-shadow-md" />
                  </div>
                </div>
                <span
                  className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-red-950 rounded-full"
                  title="Sistem Aktif 24 Jam"
                ></span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/50">
                    Unit Pelayanan Kesehatan
                  </span>
                  <span className="text-xs text-amber-200/80 font-medium hidden sm:inline-flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" /> Lemdiklat Polri
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide font-serif-header text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-sm">
                  KLINIK PRATAMA BUMI KRESNA
                </h1>
                <p className="text-xs sm:text-sm font-semibold tracking-widest text-amber-200/90 uppercase flex items-center gap-1.5 mt-0.5">
                  <span>Bermoral</span>
                  <span className="text-amber-400">•</span>
                  <span>Cekatan</span>
                  <span className="text-amber-400">•</span>
                  <span>Cerdas</span>
                </p>
                <p className="text-[12px] text-slate-300 hidden md:block mt-1">
                  Sistem Informasi Kunjungan Berobat, Rekam Medis & Monitoring Rawat Inap Siswa Bakomsus
                </p>
              </div>
            </div>

            {/* Quick Info & Action Header */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Realtime Digital Clock Widget */}
              <div className="bg-black/40 backdrop-blur-sm border border-amber-500/30 rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner">
                <div className="text-amber-400 text-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold font-mono tracking-wider text-amber-200 leading-tight">
                    {currentTime || '00:00:00 WIB'}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {currentDate || 'Memuat waktu...'}
                  </div>
                </div>
              </div>

              {/* Add Record Button */}
              <button
                onClick={handleOpenAdd}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center gap-2 text-sm transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Catat Pasien Baru</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ================= DASHBOARD SUMMARY CARDS ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Kunjungan */}
          <div className="bg-slate-900/90 rounded-2xl border-2 border-amber-500/40 p-4 shadow-xl relative overflow-hidden group hover:border-amber-400 transition-all">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Total Kunjungan Siswa
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{totalVisits}</h3>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="text-emerald-400 font-medium">Seluruh Periode Terdata</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/30 border border-amber-500/50 flex items-center justify-center text-amber-400 text-xl shadow-md">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 2: Spoting vs Reguler */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-700/80 p-4 shadow-xl relative overflow-hidden hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-full pr-3">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Asal Pengiriman Siswa
                </p>
                <div className="flex items-baseline gap-3 mt-1">
                  <div>
                    <span className="text-xl font-bold text-amber-300">{spotingCount}</span>
                    <span className="text-[10px] text-amber-200/70 ml-1">Spoting</span>
                  </div>
                  <span className="text-slate-500 font-light">|</span>
                  <div>
                    <span className="text-xl font-bold text-sky-400">{regulerCount}</span>
                    <span className="text-[10px] text-sky-300/70 ml-1">Reguler</span>
                  </div>
                </div>
                {/* Mini Bar Progress */}
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2 flex overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 transition-all duration-500"
                    style={{ width: `${spotingPct}%` }}
                    title={`Spoting: ${Math.round(spotingPct)}%`}
                  ></div>
                  <div
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 transition-all duration-500"
                    style={{ width: `${regulerPct}%` }}
                    title={`Reguler: ${Math.round(regulerPct)}%`}
                  ></div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400 text-xl shadow-md flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 3: Sedang Rawat Inap (Aktif) */}
          <div className="bg-gradient-to-br from-red-950/90 via-slate-900 to-slate-900 rounded-2xl border-2 border-red-600/60 p-4 shadow-xl relative overflow-hidden group hover:border-red-500 transition-all">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-600/20 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <p className="text-xs uppercase tracking-wider text-red-300 font-bold">
                    Sedang Rawat Inap
                  </p>
                </div>
                <h3 className="text-3xl font-extrabold text-red-200 mt-1">{activeInpatients}</h3>
                <p className="text-[11px] text-amber-300/90 mt-1 font-medium flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" /> Siswa Aktif di Ruang Rawat
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-900/60 border border-red-500/60 flex items-center justify-center text-red-300 text-xl shadow-md">
                <Bed className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 4: Rawat Jalan & Sembuh */}
          <div className="bg-slate-900/90 rounded-2xl border border-emerald-600/50 p-4 shadow-xl relative overflow-hidden hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Rawat Jalan / Selesai
                </p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{finishedVisits}</h3>
                <p className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5" /> Sudah Kembali ke Barak
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xl shadow-md">
                <HeartPulse className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* ================= VISUALISASI TREN KUNJUNGAN SISWA PER BULAN ================= */}
        <MonthlyVisitsChart records={records} />

        {/* ================= CONTROLS & FILTER BAR ================= */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari Nama Siswa, Nosis, Diagnosa, Keluhan, atau Terapi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Asal */}
            <select
              value={filterAsal}
              onChange={(e) => setFilterAsal(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Semua Jalur Pengiriman</option>
              <option value="Spoting">Hanya Spoting</option>
              <option value="Reguler">Hanya Reguler</option>
            </select>

            {/* Filter Polda */}
            <select
              value={filterPolda}
              onChange={(e) => setFilterPolda(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer max-w-[160px] truncate"
            >
              <option value="ALL">Semua Polda</option>
              {POLDA_LIST.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Semua Status Perawatan</option>
              <option value="Rawat Inap - Aktif">Sedang Rawat Inap (Aktif)</option>
              <option value="Rawat Inap - Selesai">Rawat Inap (Sudah Keluar)</option>
              <option value="Rawat Jalan">Rawat Jalan</option>
            </select>

            {/* Actions: Export & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                title="Unduh Rekap Spreadsheet (CSV / Excel)"
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-medium px-3.5 py-2.5 rounded-xl border border-emerald-600/60 shadow text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline">Export Excel/CSV</span>
              </button>

              <button
                onClick={handleResetFilters}
                title="Reset Filter Pencarian"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= DATA TABLE CONTAINER ================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Table Header Info */}
          <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <h2 className="text-base font-bold text-white tracking-wide">
                Daftar Rekam Medis Kunjungan Siswa
              </h2>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {filteredRecords.length} Data
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Rawat Jalan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span> Rawat Inap Aktif
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Rawat Inap Selesai
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950/90 text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Waktu Kunjungan</th>
                  <th className="py-3.5 px-4">Identitas Siswa</th>
                  <th className="py-3.5 px-4">Asal & Polda</th>
                  <th className="py-3.5 px-4">Keluhan & Diagnosa</th>
                  <th className="py-3.5 px-4">Terapi / Obat</th>
                  <th className="py-3.5 px-4">Status & Ruangan</th>
                  <th className="py-3.5 px-4 text-center">Durasi Inap</th>
                  <th className="py-3.5 px-4 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200 font-normal">
                {filteredRecords.map((item, index) => {
                  const isRawatInap = item.statusPerawatan === 'Rawat Inap';
                  const isAktifDirawat = isRawatInap && (item.isDirawat || !item.tglKeluarInap);
                  const durationText = isRawatInap
                    ? calculateInpatientDuration(item.tglMasukInap, item.tglKeluarInap, isAktifDirawat)
                    : '-';

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-300 whitespace-nowrap">
                          {formatDateTime(item.waktuKunjungan)}
                        </div>
                        <div className="text-[10px] font-mono text-amber-400/90">{item.noReg}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5 flex-wrap">
                          <span>{item.nama}</span>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.jenisKelamin === 'Perempuan'
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            }`}
                            title={item.jenisKelamin || 'Laki-laki'}
                          >
                            {item.jenisKelamin === 'Perempuan' ? 'P' : 'L'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {item.nosis || '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div>
                            {item.asalPengiriman === 'Spoting' ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400" /> Spoting
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 inline-flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-sky-400" /> Reguler
                              </span>
                            )}
                          </div>
                          <div
                            className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5"
                            title={item.polda || '-'}
                          >
                            <Building2 className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            <span className="truncate max-w-[130px]">{item.polda || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div
                          className="font-bold text-amber-300 text-xs truncate"
                          title={item.diagnosa}
                        >
                          {item.diagnosa}
                        </div>
                        <div
                          className="text-[11px] text-slate-400 line-clamp-1 mt-0.5"
                          title={item.keluhan}
                        >
                          {item.keluhan}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div
                          className="text-xs text-slate-300 line-clamp-2"
                          title={item.terapi}
                        >
                          {item.terapi}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isRawatInap ? (
                          isAktifDirawat ? (
                            <div className="space-y-1">
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600/30 text-red-200 border border-red-500/60 inline-flex items-center gap-1.5 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>{' '}
                                Sedang Dirawat
                              </span>
                              <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                                <Bed className="w-3 h-3" /> {item.ruangRawat || 'Ruang Rawat'}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                                Inap Selesai
                              </span>
                              <div className="text-[10px] text-slate-400">Sudah Pulang</div>
                            </div>
                          )
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 inline-flex items-center gap-1">
                            Rawat Jalan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        {isRawatInap ? (
                          isAktifDirawat ? (
                            <span
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-950/80 text-amber-300 border border-red-500/40 block text-center"
                              title="Lama perawatan sedang berjalan"
                            >
                              {durationText}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800/90 text-slate-200 border border-slate-700 block text-center">
                              {durationText}
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 text-center block">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {isAktifDirawat && (
                            <button
                              onClick={() => handleOpenCheckout(item)}
                              title="Pulangkan Siswa / Selesaikan Inap"
                              className="w-8 h-8 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/50 flex items-center justify-center transition cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenDetail(item)}
                            title="Lihat Resume Medis / Cetak Dokumen"
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center justify-center transition cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data Rekam Medis"
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex items-center justify-center transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.nama)}
                            title="Hapus Data"
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 border border-slate-700 flex items-center justify-center transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredRecords.length === 0 && (
            <div className="py-14 px-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 text-2xl mb-3">
                <ShieldAlert className="w-8 h-8 text-amber-400/80" />
              </div>
              <h4 className="text-base font-bold text-slate-300">
                Tidak ada data rekam medis yang sesuai
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian, bersihkan filter, atau catat kunjungan pasien baru.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Reset Filter Pencarian
              </button>
            </div>
          )}
        </div>

        {/* Quick Utilities / Data Seed Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 px-2 gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-500/70" />
            <span>Data tersimpan otomatis di LocalStorage (Offline-Ready & Cepat).</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToSample}
              className="text-slate-400 hover:text-amber-400 underline decoration-dotted cursor-pointer transition"
            >
              Muat Ulang Data Sampel Siswa
            </button>
            <span>•</span>
            <button
              onClick={handleClearAll}
              className="text-red-400 hover:text-red-300 underline decoration-dotted cursor-pointer transition"
            >
              Kosongkan Semua Data
            </button>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mt-12 bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-amber-300 font-serif-header">
              KLINIK PRATAMA BUMI KRESNA
            </span>
            <span>• Dedikasi Medis untuk Siswa Bintara Kompetensi Khusus</span>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">
              Semboyan:{' '}
              <span className="text-amber-300/80 font-medium">Bermoral • Cekatan • Cerdas</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSave={handleSaveRecord}
        recordToEdit={recordToEdit}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={selectedRecordForDetail}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        record={selectedRecordForCheckout}
        onConfirm={handleConfirmCheckout}
      />
    </div>
  );
}
