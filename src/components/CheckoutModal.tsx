import React, { useState, useEffect } from 'react';
import { UserCheck, X, Bed, Clock, Check } from 'lucide-react';
import { ClinicRecord } from '../types/clinic';
import { formatDateTime, getNowDateTimeLocal } from '../utils/dateHelper';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ClinicRecord | null;
  onConfirm: (recordId: string, waktuKeluar: string, catatan: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  record,
  onConfirm,
}) => {
  const [waktuKeluar, setWaktuKeluar] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('Sembuh / Kembali ke Barak dengan Observasi Mandiri');

  useEffect(() => {
    if (isOpen) {
      setWaktuKeluar(getNowDateTimeLocal());
      setCatatan('Sembuh / Kembali ke Barak dengan Observasi Mandiri');
    }
  }, [isOpen]);

  if (!isOpen || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(record.id, waktuKeluar || getNowDateTimeLocal(), catatan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 text-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-400">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pulangkan Siswa dari Rawat Inap</h3>
              <p className="text-xs text-slate-400">Selesaikan status rawat inap dan catat kondisi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
          <p className="text-slate-400">
            Nama Siswa: <strong className="text-white">{record.nama}</strong> ({record.nosis || '-'})
          </p>
          <p className="text-slate-400 flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-amber-400" />
            Ruangan: <span className="text-amber-300 font-semibold">{record.ruangRawat || 'Ruang Rawat'}</span>
          </p>
          <p className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Masuk Sejak: <span className="text-slate-300 font-mono">{formatDateTime(record.tglMasukInap)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tanggal & Waktu Keluar Inap: <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={waktuKeluar}
              onChange={(e) => setWaktuKeluar(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Keterangan Akhir / Kondisi Pasien:
            </label>
            <input
              type="text"
              required
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Konfirmasi Pulang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
