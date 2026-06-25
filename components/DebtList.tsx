'use client';

import { Debt } from '@/lib/types';
import { formatRupiah, formatRelativeTime } from '@/lib/utils';
import { Trash2, Edit2, Check } from 'lucide-react';

interface DebtListProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
  onMarkSettled: (id: string) => void;
  isLoading?: boolean;
}

const DebtSettledBadge = ({ debt, className }: { debt: Debt; className?: string }) => {
  return (
    <>
      <span className={`text-xs px-2 py-1 rounded-sm font-medium bg-gray-700 text-gray-300 ${className || ''}`}>
        {!debt.settled_at ? 'Belum Lunas' : 'Lunas'}
      </span>
      <>
        {
          debt.settled_at || debt.due_date ? <span className="w-1 h-1 rounded-full bg-gray-500 mx-1 md:mx-1.5 inline-block"/> : null
        }
        <span className="text-gray-400 text-xs">
          {debt.settled_at ? 
            `Dilunasi pada ${formatRelativeTime(debt.settled_at).toLocaleLowerCase()}` : 
            debt.due_date ? `Jatuh tempo ${formatRelativeTime(debt.due_date).toLocaleLowerCase().replace(" lagi", "")}` 
            : ''
          }
        </span>
      </>
    </>
  )
}

const DebtTypeBadge = ({ debt, className }: { debt: Debt; className?: string }) => {
  return (
    <>
      <span
        className={`text-xs px-2 py-1 rounded-sm font-medium ${className || ''} ${
          debt.type === 'owed_to_me'
            ? 'bg-teal-900/60 text-teal-300'
            : 'bg-rose-900/60 text-rose-300'
        }`}
      >
        {debt.type === 'owed_to_me' ? 'Dihutang ke saya' : 'Saya hutang'}
      </span>
      <span className="w-1 h-1 rounded-full bg-gray-500 mx-1 md:mx-1.5 inline-block"/>
      <span className="text-gray-400 text-xs">
        {formatRelativeTime(debt.created_at)}
      </span>
    </>
  )
}

export function DebtList({ debts, onEdit, onDelete, onMarkSettled, isLoading = false }: DebtListProps) {
  if (debts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Belum ada catatan. Mulai catat hutang piutang kamu!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {debts.map((debt) => (
        <div
          key={debt.id}
          className="p-4 border rounded-lg border-gray-700 hover:bg-gray-800 transition-colors"
        >
          <div className = "flex justify-between gap-4">
            <div className="grow">
              <div className="flex items-center -ml-1 mb-1.5 text-xs">
                <DebtTypeBadge debt={debt}/>
              </div>
              <div className="flex flex-col mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-white/90">{debt.counterpart_name}</h3>
                  </div>
                </div>
                <p className="text-lg font-bold text-white">
                  {formatRupiah(debt.amount)}
                </p>
              </div>

              {debt.note && (
                <p className="text-sm text-gray-400 mb-2 italic text-justify">
                  &quot;{debt.note}&quot;
                </p>
              )}
              <div className="flex items-center mb-1 text-xs">
                <DebtSettledBadge debt={debt}/>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onEdit(debt)}
                disabled={isLoading}
                className="w-full cursor-pointer px-3 py-2 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-300 transition-colors"
              >
                <Edit2 size={16} />
                <span className="sr-only">Edit</span>
              </button>
              <button
                onClick={() => onDelete(debt.id)}
                disabled={isLoading}
                className="w-full cursor-pointer px-3 py-2 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-rose-900/20 hover:bg-rose-900/40 text-rose-300 transition-colors"
              >
                <Trash2 size={16} />
                <span className="sr-only">Hapus</span>
              </button>
            </div>
          </div>

          {!debt.settled_at && (
            <button
              onClick={() => onMarkSettled(debt.id)}
              disabled={isLoading}
              className="cursor-pointer w-full flex items-center justify-center mt-2 gap-1 py-2 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-teal-900/20 hover:bg-teal-900/40 text-teal-300 transition-colors"
            >
              <Check size={16} />
              Tandai Lunas
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
