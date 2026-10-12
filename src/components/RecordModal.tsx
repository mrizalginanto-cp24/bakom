import React, { useState, useEffect } from 'react';
import {
  X,
  Stethoscope,
  Activity,
  Bed,
  CheckCircle2,
  Clock,
  Save,
  Star,
  GraduationCap,
  Shield,
  Plus,
} from 'lucide-react';
import { ClinicRecord, POLDA_LIST, RUANGAN_LIST } from '../types/clinic';
import {
  generateNoReg,
  getNowDateTimeLocal,
  calculateInpatientDuration,
} from '../utils/dateHelper';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: ClinicRecord) => void;
  recordToEdit: ClinicRecord | null;
}

const QUICK_DIAGNOSES = [
  'ISPA / Faringitis Akut',
  'Febris / Demam Observasi',
  'Myalgia / Kelelahan Fisik Ekstrem',
  'Gastritis Akut / Dispepsia',
  'Dehidrasi Ringan-Sedang',
  'Vulnus Excoriatum (Luka Lecet Latihan)',
  'Sprain Ankle / Cedera Sendi',
];

const QUICK_THERAPIES = [
  'Paracetamol 500mg 3x1',
  'Amoxicillin 500mg 3x1',
  'Antasida DOEN 3x1',
  'Vitamin C 500mg 1x1',
  'Oralit 2 Sachet',
  'Bed rest total di barak',
];

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<ClinicRecord>>({});
  const [isRawatInapActive, setIsRawatInapActive] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        setFormData({ ...recordToEdit });
        setIsRawatInapActive(
          recordToEdit.isDirawat ?? !recordToEdit.tglKeluarInap
        );
      } else {
        const now = getNowDateTimeLocal();
        setFormData({
          id: 'rec_' + Date.now(),
          noReg: generateNoReg(),
          waktuKunjungan: now,
          nama: '',
          nosis: '',
          jenisKelamin: 'Laki-laki',
          asalPengiriman: 'Spoting',
          polda: '',
          tensi: '120/80',
          suhu: '37.0',
          nadi: '80',
          keluhan: '',
          diagnosa: '',
          terapi: '',
          statusPerawatan: 'Rawat Jalan',
          ruangRawat: 'Ruang Melati - Bed 01',
          tglMasukInap: now,
          tglKeluarInap: '',
          isDirawat: true,
          catatanKeluar: '',
        });
        setIsRawatInapActive(true);
      }
    }
  }, [isOpen, recordToEdit]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof ClinicRecord, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAppendTherapy = (therapyItem: string) => {
    const current = formData.terapi?.trim() || '';
    if (!current) {
      handleInputChange('terapi', therapyItem);
    } else {
      handleInputChange('terapi', `${current}, ${therapyItem}`);
    }
  };

  const handleStatusPerawatanChange = (status: 'Rawat Jalan' | 'Rawat Inap') => {
    handleInputChange('statusPerawatan', status);
    if (status === 'Rawat Inap' && !formData.tglMasukInap) {
      handleInputChange('tglMasukInap', getNowDateTimeLocal());
    }
  };

  const handleFlagDirawatToggle = (active: boolean) => {
    setIsRawatInapActive(active);
    handleInputChange('isDirawat', active);
    if (!active) {
      if (!formData.tglKeluarInap) {
        handleInputChange('tglKeluarInap', getNowDateTimeLocal());
      }
    } else {
      handleInputChange('tglKeluarInap', '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.polda) {
      alert('Silakan pilih Pengiriman Polda asal siswa!');
      return;
    }

    const isRawatInap = formData.statusPerawatan === 'Rawat Inap';
    const finalRecord: ClinicRecord = {
      id: formData.id || 'rec_' + Date.now(),
      noReg: formData.noReg || generateNoReg(),
      nama: formData.nama || '',
      nosis: formData.nosis || '',
      jenisKelamin: formData.jenisKelamin || 'Laki-laki',
      asalPengiriman: formData.asalPengiriman || 'Spoting',
      polda: formData.polda || '',
      waktuKunjungan: formData.waktuKunjungan || getNowDateTimeLocal(),
      tensi: formData.tensi || '',
      suhu: formData.suhu || '',
      nadi: formData.nadi || '',
      keluhan: formData.keluhan || '',
      diagnosa: formData.diagnosa || '',
      terapi: formData.terapi || '',
      statusPerawatan: formData.statusPerawatan || 'Rawat Jalan',
      ruangRawat: isRawatInap ? formData.ruangRawat : '',
      tglMasukInap: isRawatInap ? formData.tglMasukInap : '',
      tglKeluarInap: isRawatInap ? formData.tglKeluarInap : '',
      isDirawat: isRawatInap ? (isRawatInapActive || !formData.tglKeluarInap) : false,
      catatanKeluar: formData.catatanKeluar || '',
    };

    onSave(finalRecord);
    onClose();
  };

  const currentDurationPreview = formData.statusPerawatan === 'Rawat Inap'
    ? calculateInpatientDuration(
        formData.tglMasukInap,
        formData.tglKeluarInap,
        isRawatInapActive || !formData.tglKeluarInap
      )
    : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl w-full max-w-2xl shadow-2xl relative my-8 overflow-hidden transform transition-all text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 px-6 py-4 border-b-2 border-amber-500/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 text-lg">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-serif-header">
                {recordToEdit ? 'Edit Rekam Medis Kunjungan Siswa' : 'Form Rekam Medis Kunjungan Siswa'}
              </h3>
              <p className="text-xs text-amber-200/80">Klinik Pendidikan Pembentukan Bakomsus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/30 hover:bg-black/60 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Nomor Registrasi & Tanggal Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                No. Rekam Medis / Registrasi <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={formData.noReg || ''}
                readOnly
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-amber-400 font-mono font-bold focus:outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Tanggal & Jam Kunjungan <span className="text-amber-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.waktuKunjungan || ''}
                onChange={(e) => handleInputChange('waktuKunjungan', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Row 2: Identitas Siswa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Nama Lengkap Siswa <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Siswa Bripda Tegar Maulana"
                value={formData.nama || ''}
                onChange={(e) => handleInputChange('nama', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Nomor Siswa (Nosis) / Peleton
              </label>
              <input
                type="text"
                placeholder="Contoh: Nosis 082 / Ton 2 Kompi A"
                value={formData.nosis || ''}
                onChange={(e) => handleInputChange('nosis', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Row 3: Jenis Kelamin & Asal Pengiriman */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Jenis Kelamin <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <label
                  className={`relative flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.jenisKelamin === 'Laki-laki'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                      : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="modal_jenis_kelamin"
                      checked={formData.jenisKelamin === 'Laki-laki'}
                      onChange={() => handleInputChange('jenisKelamin', 'Laki-laki')}
                      className="accent-blue-500"
                    />
                    <span className="text-xs sm:text-sm font-bold">Laki-laki</span>
                  </div>
                  <span className="text-blue-400 text-xs">L</span>
                </label>
                <label
                  className={`relative flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.jenisKelamin === 'Perempuan'
                      ? 'border-pink-500 bg-pink-500/10 text-pink-300'
                      : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="modal_jenis_kelamin"
                      checked={formData.jenisKelamin === 'Perempuan'}
                      onChange={() => handleInputChange('jenisKelamin', 'Perempuan')}
                      className="accent-pink-500"
                    />
                    <span className="text-xs sm:text-sm font-bold">Perempuan</span>
                  </div>
                  <span className="text-pink-400 text-xs">P</span>
                </label>
              </div>
            </div>

            {/* Asal Pengiriman */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Jalur Pengiriman <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <label
                  className={`relative flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.asalPengiriman === 'Spoting'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                      : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="modal_asal_pengiriman"
                      checked={formData.asalPengiriman === 'Spoting'}
                      onChange={() => handleInputChange('asalPengiriman', 'Spoting')}
                      className="accent-amber-500"
                    />
                    <span className="text-xs sm:text-sm font-bold">Spoting</span>
                  </div>
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                </label>
                <label
                  className={`relative flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.asalPengiriman === 'Reguler'
                      ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                      : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="modal_asal_pengiriman"
                      checked={formData.asalPengiriman === 'Reguler'}
                      onChange={() => handleInputChange('asalPengiriman', 'Reguler')}
                      className="accent-sky-500"
                    />
                    <span className="text-xs sm:text-sm font-bold">Reguler</span>
                  </div>
                  <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                </label>
              </div>
            </div>
          </div>

          {/* Row 3b: Pengiriman Polda */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Pengiriman Polda <span className="text-red-400">*</span></span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">35 Polda se-Indonesia</span>
            </label>
            <select
              required
              value={formData.polda || ''}
              onChange={(e) => handleInputChange('polda', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="" disabled>-- Pilih Pengiriman Polda --</option>
              {POLDA_LIST.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Row 4: Tanda Vital Dasar */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Pemeriksaan Tanda Vital
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tensi Darah</label>
                <input
                  type="text"
                  placeholder="120/80 mmHg"
                  value={formData.tensi || ''}
                  onChange={(e) => handleInputChange('tensi', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Suhu (°C)</label>
                <input
                  type="text"
                  placeholder="37.5 °C"
                  value={formData.suhu || ''}
                  onChange={(e) => handleInputChange('suhu', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nadi (bpm)</label>
                <input
                  type="text"
                  placeholder="84 bpm"
                  value={formData.nadi || ''}
                  onChange={(e) => handleInputChange('nadi', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Keluhan Utama */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Keluhan Utama Siswa <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Jelaskan keluhan sakit yang dirasakan siswa saat tiba di poliklinik..."
              value={formData.keluhan || ''}
              onChange={(e) => handleInputChange('keluhan', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Row 6: Diagnosa & Quick Tags */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Diagnosa Medis <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] text-amber-400/80">Klik tag cepat untuk mengisi:</span>
            </div>
            <input
              type="text"
              required
              placeholder="Contoh: ISPA, Febris Hari ke-2, Kelelahan Otot / Myalgia..."
              value={formData.diagnosa || ''}
              onChange={(e) => handleInputChange('diagnosa', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {QUICK_DIAGNOSES.map((diag) => (
                <button
                  type="button"
                  key={diag}
                  onClick={() => handleInputChange('diagnosa', diag)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  {diag}
                </button>
              ))}
            </div>
          </div>

          {/* Row 7: Terapi & Obat */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Terapi / Obat yang Diberikan <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Contoh: Paracetamol 500mg 3x1, Antasida DOEN 3x1, Istirahat barak 1 hari..."
              value={formData.terapi || ''}
              onChange={(e) => handleInputChange('terapi', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 mb-1"
            />
            <div className="flex flex-wrap gap-1.5 mt-1">
              {QUICK_THERAPIES.map((th) => (
                <button
                  type="button"
                  key={th}
                  onClick={() => handleAppendTherapy(th)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5" />
                  {th}
                </button>
              ))}
            </div>
          </div>

          {/* Row 8: Status Perawatan */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Status Perawatan Medis <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`relative flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.statusPerawatan === 'Rawat Jalan'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="modal_status_perawatan"
                    checked={formData.statusPerawatan === 'Rawat Jalan'}
                    onChange={() => handleStatusPerawatanChange('Rawat Jalan')}
                    className="accent-emerald-500"
                  />
                  <div>
                    <span className="block text-sm font-bold text-emerald-300">Rawat Jalan</span>
                    <span className="block text-[11px] text-slate-400">Obat jalan / Kembali ke barak</span>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </label>

              <label
                className={`relative flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.statusPerawatan === 'Rawat Inap'
                    ? 'border-red-500 bg-red-950/40 text-red-300'
                    : 'border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="modal_status_perawatan"
                    checked={formData.statusPerawatan === 'Rawat Inap'}
                    onChange={() => handleStatusPerawatanChange('Rawat Inap')}
                    className="accent-red-500"
                  />
                  <div>
                    <span className="block text-sm font-bold text-red-300">Rawat Inap</span>
                    <span className="block text-[11px] text-amber-300">Opname di ruang klinik</span>
                  </div>
                </div>
                <Bed className="w-5 h-5 text-red-400" />
              </label>
            </div>
          </div>

          {/* Section Khusus Rawat Inap */}
          {formData.statusPerawatan === 'Rawat Inap' && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/40 via-slate-950 to-slate-950 border-2 border-red-600/70 space-y-3 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-red-900/50 pb-2">
                <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                  <Bed className="w-4 h-4 text-red-400" />
                  <span>Data Fasilitas & Durasi Rawat Inap</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600/30 text-red-200 border border-red-500/40">
                  Modul Rawat Inap
                </span>
              </div>

              {/* Ruangan */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kamar / Ruang Rawat Inap
                </label>
                <select
                  value={formData.ruangRawat || 'Ruang Melati - Bed 01'}
                  onChange={(e) => handleInputChange('ruangRawat', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {RUANGAN_LIST.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Masuk & Keluar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal & Jam Masuk Inap <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.tglMasukInap || ''}
                    onChange={(e) => handleInputChange('tglMasukInap', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Tanggal & Jam Keluar Inap
                    </label>
                    <span className="text-[10px] text-slate-400">(Kosongkan jika aktif)</span>
                  </div>
                  <input
                    type="datetime-local"
                    value={formData.tglKeluarInap || ''}
                    onChange={(e) => {
                      handleInputChange('tglKeluarInap', e.target.value);
                      if (e.target.value) {
                        setIsRawatInapActive(false);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Toggle Status Kepulangan */}
              <div className="flex items-center justify-between bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-300">Status Rawat Saat Ini:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-amber-300 font-semibold">
                    <input
                      type="radio"
                      name="flag_dirawat"
                      checked={isRawatInapActive}
                      onChange={() => handleFlagDirawatToggle(true)}
                      className="accent-amber-500"
                    />
                    <span>Masih Dirawat (Aktif)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-emerald-300 font-semibold">
                    <input
                      type="radio"
                      name="flag_dirawat"
                      checked={!isRawatInapActive}
                      onChange={() => handleFlagDirawatToggle(false)}
                      className="accent-emerald-500"
                    />
                    <span>Sudah Pulang</span>
                  </label>
                </div>
              </div>

              {/* Live Automatic Calculated Duration Display Box */}
              <div className="bg-black/50 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">
                      Hitungan Otomatis Durasi Inap
                    </p>
                    <p className="text-sm font-bold text-amber-300 tracking-wide">
                      {currentDurationPreview}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                    isRawatInapActive
                      ? 'bg-red-600/30 text-red-200 border-red-500/50'
                      : 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50'
                  }`}
                >
                  {isRawatInapActive ? 'Sedang Dirawat' : 'Selesai / Pulang'}
                </span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-sm font-extrabold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{recordToEdit ? 'Perbarui Rekam Medis' : 'Simpan Rekam Medis'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
