'use client';

import { formatRupiah } from '@/lib/utils';
import { Debt } from '@/lib/types';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';

interface SummaryCardsProps {
  debts: Debt[];
}

export function SummaryCards({ debts }: SummaryCardsProps) {
  const owedToMe = debts
    .filter((debt) => debt.type === 'owed_to_me')
    .reduce((sum, debt) => sum + debt.amount, 0);
  const iOwe = debts
    .filter((debt) => debt.type === 'i_owe')
    .reduce((sum, debt) => sum + debt.amount, 0);
  const net = owedToMe - iOwe;
  const isPositive = net >= 0;

  return (
    <div className="flex flex-col w-full mb-8 gap-4">
      {/* Horizontal Bar Chart */}
      <div className="grow grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 px-5 rounded-lg border border-cyan-600 bg-cyan-900/90">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-cyan-300">Total Dihutang ke Saya</p>
            <TrendingUp className="text-cyan-400" size={20} />
          </div>
          <p className="text-xl font-bold text-cyan-100 text-ellipsis overflow-hidden whitespace-nowrap">
            {formatRupiah(owedToMe)}
          </p>
        </div>

        <div className="p-4 px-5 rounded-lg border border-yellow-600 bg-yellow-900/70">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-yellow-300">Total Saya Hutang</p>
            <TrendingDown className="text-yellow-400" size={20} />
          </div>
          <p className="text-xl font-bold text-rose-100 text-ellipsis overflow-hidden whitespace-nowrap">
            {formatRupiah(iOwe)}
          </p>
        </div>

        <div
          className={`p-4 px-5 rounded-lg border ${
            isPositive
              ? 'border-teal-600 bg-teal-900/80'
              : 'border-rose-600 bg-rose-900/70'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-medium ${isPositive ? 'text-teal-300' : 'text-rose-300'}`}>
              Net
            </p>
            <Scale className={isPositive ? 'text-teal-400' : 'text-rose-400'} size={20} />
          </div>
          <p
            className={`text-xl font-bold ${isPositive ? 'text-teal-100' : 'text-rose-100'} text-ellipsis overflow-hidden whitespace-nowrap`}
          >
            {formatRupiah(net)}
          </p>
        </div>
      </div>
    </div>
  );
}
