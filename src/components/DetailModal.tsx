import React from 'react';
import {
  X,
  Printer,
  FileText,
  Bed,
  CheckCircle,
  Building2,
  Calendar,
  Activity,
  User,
} from 'lucide-react';
import { ClinicRecord } from '../types/clinic';
import { formatDateTime, calculateInpatientDuration } from '../utils/dateHelper';
import { KlinikLogo } from './KlinikLogo';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ClinicRecord | null;
}

export const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const isRawatInap = record.statusPerawatan === 'Rawat Inap';
  const isAktif = isRawatInap && (record.isDirawat || !record.tglKeluarInap);
  const durasiText = isRawatInap
    ? calculateInpatientDuration(record.tglMasukInap, record.tglKeluarInap, isAktif)
    : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl w-full max-w-2xl shadow-2xl relative my-8 overflow-hidden transform transition-all text-slate-100">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-950 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between no-print">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Dokumen Rekam Medis Klinik Siswa
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak Dokumen / Resume
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div id="printable-medical-document" className="p-6 sm:p-8 bg-slate-900 space-y-6">
          {/* Official Letterhead / Kop Surat */}
          <div className="border-b-2 border-amber-500 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-amber-400 p-0.5 flex items-center justify-center shadow-md flex-shrink-0">
                <KlinikLogo className="w-full h-full" />
              </div>
              <div className="text-left sm:text-center">
                <h2 className="text-lg sm:text-xl font-bold font-serif-header text-amber-300 tracking-wide uppercase">
                  KLINIK PRATAMA BUMI KRESNA
                </h2>
                <p className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
                  LEMBAGA PENDIDIKAN DAN PELATIHAN POLRI
                </p>
                <p className="text-[11px] text-amber-200/80 font-medium">
                  Semboyan: &quot;Bermoral • Cekatan • Cerdas&quot;
                </p>
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Jl. Raya Pendidikan Pembentukan Bakomsus Polri • Layanan Medis Siswa 24 Jam
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider underline decoration-amber-500 decoration-2 underline-offset-4">
              RESUME MEDIS & KETERANGAN PEMERIKSAAN KLINIK
            </h3>
            <p className="text-xs font-mono text-amber-400 mt-1">
              Nomor: {record.noReg}
            </p>
          </div>

          {/* Student Biodata Grid */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-400">Nama Siswa</span>
              <span className="col-span-2 font-bold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                {record.nama}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-400">Nosis / Peleton</span>
              <span className="col-span-2 font-semibold text-slate-200">
                {record.nosis || '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-400">Jenis Kelamin</span>
              <span className="col-span-2 font-medium">
                {record.jenisKelamin === 'Perempuan' ? (
                  <span className="text-pink-400 font-bold">Perempuan</span>
                ) : (
                  <span className="text-blue-400 font-bold">Laki-laki</span>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-400">Jalur Pengiriman</span>
              <span className="col-span-2 font-semibold">
                {record.asalPengiriman === 'Spoting' ? (
                  <span className="text-amber-400">Spoting (Jalur Khusus / Bakat)</span>
                ) : (
                  <span className="text-sky-400">Reguler</span>
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-400">Pengiriman Polda</span>
              <span className="col-span-2 font-bold text-amber-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                {record.polda}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-400">Waktu Kunjungan</span>
              <span className="col-span-2 font-medium text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDateTime(record.waktuKunjungan)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-400">Tanda Vital (TTV)</span>
              <span className="col-span-2 font-mono text-emerald-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                TD: {record.tensi || '-'} mmHg | Suhu: {record.suhu || '-'} °C | Nadi: {record.nadi || '-'} bpm
              </span>
            </div>
          </div>

          {/* Clinical Assessment */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Keluhan Utama Siswa:
              </h4>
              <div className="mt-1 p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 leading-relaxed">
                {record.keluhan || '-'}
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Diagnosa Medis:
              </h4>
              <div className="mt-1 p-3 bg-slate-950 rounded-xl border border-slate-800 text-amber-300 font-bold">
                {record.diagnosa || '-'}
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Terapi & Obat Diberikan:
              </h4>
              <div className="mt-1 p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 leading-relaxed">
                {record.terapi || '-'}
              </div>
            </div>
          </div>

          {/* Inpatient Info (If Applicable) */}
          {isRawatInap && (
            <div className="bg-red-950/30 p-4 rounded-xl border border-red-600/50 space-y-2 text-xs sm:text-sm">
              <h4 className="text-xs uppercase font-bold text-red-300 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-red-400" /> Status Rawat Inap:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Ruangan / Bed:</span>
                  <span className="font-bold text-white">{record.ruangRawat || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lama Durasi Rawat:</span>
                  <span className="font-bold text-amber-300">{durasiText}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tgl Masuk Inap:</span>
                  <span className="text-slate-300 font-mono">{formatDateTime(record.tglMasukInap)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tgl Keluar Inap:</span>
                  <span className="text-slate-300 font-mono">
                    {record.tglKeluarInap ? formatDateTime(record.tglKeluarInap) : 'Masih Dirawat (Aktif)'}
                  </span>
                </div>
                {record.catatanKeluar && (
                  <div className="col-span-2 pt-1 border-t border-red-900/50">
                    <span className="text-slate-400 block">Catatan Kepulangan:</span>
                    <span className="text-emerald-300 font-medium">{record.catatanKeluar}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="pt-6 border-t border-slate-800 flex justify-between items-end text-xs">
            <div className="text-slate-400 max-w-xs">
              <p className="font-semibold text-slate-300">Catatan Medis:</p>
              <p className="italic text-[11px] text-slate-400 mt-0.5">
                Siswa wajib mematuhi rekomendasi dokter jaga, meminum obat secara tertib, dan menjaga kebersihan barak.
              </p>
            </div>
            <div className="text-center w-52">
              <p className="text-slate-400">Petugas Medis Klinik,</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-amber-400/40 text-xs font-serif-header">
                  KLINIK PRATAMA BUMI KRESNA
                </span>
              </div>
              <p className="font-bold text-white border-t border-slate-700 pt-1">
                Paramedis Jaga
              </p>
              <p className="text-[11px] text-slate-400">NRP. Urkes / Poliklinik</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
