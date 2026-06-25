'use client';

import { useState } from 'react';
import { Debt, DebtType } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface DebtFormProps {
  onSubmit: (data: {
    type: DebtType;
    counterpart_name: string;
    amount: number;
    note: string | null;
    created_at: string;
    due_date: string | null;
  }) => Promise<void>;
  initialData?: Debt;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function DebtForm({ onSubmit, initialData, isLoading = false, onCancel }: DebtFormProps) {
  const [type, setType] = useState<DebtType>(initialData?.type || 'owed_to_me');
  const [counterpartName, setCounterpartName] = useState(initialData?.counterpart_name || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [debtDate, setDebtDate] = useState(
    initialData?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(initialData?.due_date || "");
  const [error, setError] = useState<string | null>(null);

  const buildCreatedAtTimestamp = (selectedDate: string): string => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const now = new Date();
    const combinedDate = new Date(
      year,
      (month || 1) - 1,
      day || 1,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );

    return combinedDate.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!counterpartName.trim()) {
      setError('Nama orang diperlukan');
      return;
    }

    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount <= 0) {
      setError('Jumlah harus lebih dari 0');
      return;
    }

    if (note && note.length > 200) {
      setError('Catatan maksimal 200 karakter');
      return;
    }

    try {
      await onSubmit({
        type,
        counterpart_name: counterpartName.trim(),
        amount: numAmount,
        note: note || null,
        created_at: buildCreatedAtTimestamp(debtDate),
        due_date: dueDate || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          Tipe *
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="owed_to_me"
              checked={type === 'owed_to_me'}
              onChange={(e) => setType(e.target.value as DebtType)}
              className="w-4 h-4 text-cyan-600"
            />
            <span className="ml-2 text-sm text-gray-300">Saya dihutang</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="i_owe"
              checked={type === 'i_owe'}
              onChange={(e) => setType(e.target.value as DebtType)}
              className="w-4 h-4 text-cyan-600"
            />
            <span className="ml-2 text-sm text-gray-300">Saya hutang</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-xs ml-2 font-medium text-gray-300">
          Nama orang *
        </label>
        <input
          id="name"
          type="text"
          value={counterpartName}
          onChange={(e) => setCounterpartName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 border-gray-600 text-white"
          placeholder="Nama teman/keluarga"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-xs ml-2 font-medium text-gray-300">
          Jumlah (Rp) *
        </label>
        <input
          id="amount"
          type="text"
          value={amount ? formatRupiah(parseInt(amount.replace(/\D/g, ''), 10) || 0) : ''}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 border-gray-600 text-white"
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="debtDate" className="block text-xs ml-2 font-medium text-gray-300">
            Tanggal hutang *
          </label>
          <input
            id="debtDate"
            type="date"
            value={debtDate}
            onChange={(e) => setDebtDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-xs ml-2 font-medium text-gray-300">
            Jatuh tempo
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="note" className="block text-xs ml-2 font-medium text-gray-300">
          Catatan (max 200 karakter)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 border-gray-600 text-white"
          placeholder="Catatan tambahan (opsional)"
          rows={3}
        />
        <p className="mt-1 text-xs ml-2 text-gray-500">{note.length}/200</p>
      </div>

      {error && (
        <div className="p-3 border rounded-md bg-rose-900/20 border-rose-900">
          <p className="text-xs text-rose-400">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="cursor-pointer flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer flex-1 px-4 py-2 border font-medium rounded-md border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
