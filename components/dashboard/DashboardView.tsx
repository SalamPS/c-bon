'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Debt, DebtType } from '@/lib/types';
import { getTodayDateString } from '@/lib/utils';
import { SummaryCards } from '@/components/SummaryCards';
import { DebtList } from '@/components/DebtList';
import { DebtForm } from '@/components/DebtForm';
import { LogoutButton } from '@/components/LogoutButton';
import { ChevronDown, Plus, X } from 'lucide-react';

type FilterStatus = 'semua' | 'belum' | 'lunas';
type FilterType = 'semua' | 'owed_to_me' | 'i_owe';

export function DashboardView() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('semua');
  const [typeFilter, setTypeFilter] = useState<FilterType>('semua');
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState<
    'amount_asc' | 'amount_desc' | 'date_newest' | 'date_oldest' | 'due_nearest' | 'due_farthest'
  >('date_newest');
  const [isSaving, setIsSaving] = useState(false);

  const fetchDebts = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/debts', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(error.errorStatusText);
        return;
      }

      const { data } = await response.json();
      setDebts(data || []);
    } catch (error) {
      console.error('Error fetching debts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateDebt = async (data: {
    type: DebtType;
    counterpart_name: string;
    amount: number;
    note: string | null;
    created_at: string;
    due_date: string | null;
  }) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(error.errorStatusText);
        return;
      }

      setShowForm(false);
      await fetchDebts();
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateDebt = async (
    id: string,
    data: {
      type: DebtType;
      counterpart_name: string;
      amount: number;
      note: string | null;
      created_at: string;
      due_date: string | null;
    }
  ) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/debts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(error.errorStatusText);
        return;
      }

      setEditingDebt(null);
      await fetchDebts();
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDebt = async (id: string) => {
    if (!confirm('Yakin mau hapus?')) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/debts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(error.errorStatusText);
        return;
      }

      await fetchDebts();
    } catch (error) {
      console.error('Error deleting debt:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkSettled = async (id: string) => {
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;

    try {
      setIsSaving(true);
      const settledAt = getTodayDateString();
      const response = await fetch(`/api/debts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settled_at: settledAt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(error.errorStatusText);
        return;
      }

      await fetchDebts();
    } catch (error) {
      console.error('Error marking settled:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchDebts();
    })();
  }, [fetchDebts]);

  const filteredDebts = useMemo(() => {
    const searchQuery = searchText.trim().toLowerCase();

    return debts.filter((debt) => {
      const statusMatches =
        statusFilter === 'semua' ||
        (statusFilter === 'belum' ? !debt.settled_at : !!debt.settled_at);
      const typeMatches = typeFilter === 'semua' || debt.type === typeFilter;
      const normalizedCounterpartName = debt.counterpart_name.trim().toLowerCase();
      const searchMatches = !searchQuery || normalizedCounterpartName === searchQuery;

      return statusMatches && typeMatches && searchMatches;
    });
  }, [debts, searchText, statusFilter, typeFilter]);

  const visibleDebts = useMemo(() => {
    return [...filteredDebts].sort((a, b) => {
      const aCreated = new Date(a.created_at).getTime();
      const bCreated = new Date(b.created_at).getTime();

      if (sortOption === 'amount_asc') {
        return a.amount - b.amount;
      }
      if (sortOption === 'amount_desc') {
        return b.amount - a.amount;
      }

      if (sortOption === 'due_nearest' || sortOption === 'due_farthest') {
        const aDue = a.due_date ? new Date(a.due_date).getTime() : null;
        const bDue = b.due_date ? new Date(b.due_date).getTime() : null;

        // Entries tanpa due_date diletakkan paling bawah agar urutan tempo tidak bias.
        if (aDue === null && bDue !== null) {
          return 1;
        }
        if (bDue === null && aDue !== null) {
          return -1;
        }
        if (aDue !== null && bDue !== null && aDue !== bDue) {
          return sortOption === 'due_nearest' ? aDue - bDue : bDue - aDue;
        }
      }

      if (sortOption === 'date_newest') {
        if (bCreated !== aCreated) {
          return bCreated - aCreated;
        }
        return b.id.localeCompare(a.id);
      }

      if (sortOption === 'date_oldest') {
        if (aCreated !== bCreated) {
          return aCreated - bCreated;
        }
        return a.id.localeCompare(b.id);
      }

      if (bCreated !== aCreated) {
        return bCreated - aCreated;
      }
      return b.id.localeCompare(a.id);
    });
  }, [filteredDebts, sortOption]);

  const searchSummary = useMemo(() => {
    const query = searchText.trim();
    if (!query) return null;

    const totalMatches = filteredDebts.length;
    const filteredUnsettled = filteredDebts.filter((debt) => !debt.settled_at);
    const totalEntry = filteredUnsettled.length;
    const totalIOwe = filteredUnsettled
      .filter((debt) => debt.type === 'i_owe')
      .reduce((sum, debt) => sum + debt.amount, 0);
    const totalOwedToMe = filteredUnsettled
      .filter((debt) => debt.type === 'owed_to_me')
      .reduce((sum, debt) => sum + debt.amount, 0);

    return {
      name: filteredDebts[0]?.counterpart_name ?? query,
      totalMatches,
      totalEntry,
      totalIOwe,
      totalOwedToMe,
    };
  }, [filteredDebts, searchText]);

  return (
    <div className="min-h-screen bg-[#1d2337]">
      {/* Header */}
      <header className="sticky top-0 z-10 pt-6">
        <div className="backdrop-blur-md border border-slate-500/80 rounded-full max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center gap-4 mx-4">
            <h1 className="text-xl font-bold text-white">C-Bon by LamP</h1>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="sticky top-24 space-y-2 rounded-3xl border border-slate-500/80 bg-slate-800/90 p-5 pt-4 shadow-xl shadow-slate-950/20">
              <div className="">
                <h3 className="tracking-wider text-slate-400">Filter dan Sortir</h3>
              </div>

              <div className="border-t mb-4 border-slate-600"></div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="search-filter" className="ml-3 block text-xs font-medium text-gray-300">
                    Cari nama orang
                  </label>
                  <input
                    id="search-filter"
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Budi, Ani, dll."
                    className="w-full outline-none px-3 py-2 rounded-2xl text-sm border bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="sort-filter" className="ml-3 block text-xs font-medium text-gray-300">
                    Urutkan
                  </label>
                  <div className="relative">
                    <select
                      id="sort-filter"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
                      className="appearance-none w-full outline-none px-3 py-2 rounded-2xl text-sm cursor-pointer border bg-slate-700 border-slate-600 duration-200 hover:bg-slate-700/90 text-white"
                    >
                      <option value="date_newest">Terbaru</option>
                      <option value="date_oldest">Terlama</option>
                      <option value="due_nearest">Tempo terdekat</option>
                      <option value="due_farthest">Tempo terjauh</option>
                      <option value="amount_desc">Jumlah besar ke kecil</option>
                      <option value="amount_asc">Jumlah kecil ke besar</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="text-gray-400" size={16} />
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="status-filter" className="ml-3 block text-xs font-medium text-gray-300">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                      className="appearance-none w-full outline-none px-3 py-2 rounded-2xl text-sm cursor-pointer border bg-slate-700 border-slate-600 duration-200 hover:bg-slate-700/90 text-white"
                    >
                      <option value="semua">Semua</option>
                      <option value="belum">Belum Lunas</option>
                      <option value="lunas">Lunas</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="text-gray-400" size={16} />
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="type-filter" className="ml-3 block text-xs font-medium text-gray-300">
                    Tipe
                  </label>
                  <div className="relative">
                    <select
                      id="type-filter"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                      className="appearance-none w-full outline-none px-3 py-2 rounded-2xl text-sm cursor-pointer border bg-slate-700 border-slate-600 duration-200 hover:bg-slate-700/90 text-white"
                    >
                      <option value="semua">Semua</option>
                      <option value="owed_to_me">Dihutang ke Saya</option>
                      <option value="i_owe">Saya Hutang</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="text-gray-400" size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <SummaryCards debts={debts} />

            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 z-50 bg-black/80 h-screen p-3 md:p-6 flex items-center justify-center">
                <div className="w-full h-auto md:h-auto md:w-lg p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-sm overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white">Catat Hutang Baru</h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="cursor-pointer p-1 hover:bg-gray-700 rounded"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <DebtForm
                    onSubmit={handleCreateDebt}
                    isLoading={isSaving}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              </div>
            )}

            {/* Edit Form Modal */}
            {editingDebt && (
              <div className="fixed inset-0 z-50 bg-black/80 h-screen p-3 md:p-6 flex items-center justify-center">
                <div className="w-full h-auto md:h-auto md:w-lg p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-sm overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white">Edit Hutang</h2>
                    <button
                      onClick={() => setEditingDebt(null)}
                      className="cursor-pointer p-1 hover:bg-gray-700 rounded"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <DebtForm
                    initialData={editingDebt}
                    onSubmit={(data) => handleUpdateDebt(editingDebt.id, data)}
                    isLoading={isSaving}
                    onCancel={() => setEditingDebt(null)}
                  />
                </div>
              </div>
            )}

            {!showForm && (
              <button
                onClick={() => {
                  setEditingDebt(null);
                  setShowForm(!showForm);
                }}
                className="w-full cursor-pointer px-3 py-3 bg-cyan-600 hover:bg-cyan-600/90 text-white font-medium rounded-full flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={20} />
                <span>Catat Baru</span>
              </button>
            )}

            {/* Debt List */}
            <div className="bg-gray-800 rounded-2xl border border-gray-600 shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="grow">
                  <h2 className="text-lg font-semibold text-white">
                    Daftar Hutang {searchSummary ? `dengan ${searchSummary.name}` : ''}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchSummary ? (
                      searchSummary.totalMatches === 0 ? (
                        'Belum ada data hutang terkait dengan orang ini'
                      ) : searchSummary.totalIOwe === 0 && searchSummary.totalOwedToMe === 0 ? (
                        'Status hutang udah dilunasi semua'
                      ) : (
                        <>
                          Total hutang aktif: {searchSummary.totalEntry} entry,{' '}
                          {searchSummary.totalOwedToMe > searchSummary.totalIOwe ? (
                            <>
                              saya dihutangi{' '}
                              <span className="text-teal-600">
                                Rp {searchSummary.totalOwedToMe.toLocaleString('id-ID')}
                              </span>
                            </>
                          ) : (
                            <>
                              saya berhutang{' '}
                              <span className="text-rose-400">
                                Rp {searchSummary.totalIOwe.toLocaleString('id-ID')}
                              </span>
                            </>
                          )}
                        </>
                      )
                    ) : (
                      `Total hutang: ${debts.length} entry`
                    )}
                  </p>
                </div>
              </div>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Memuat...</p>
                </div>
              ) : (
                <DebtList
                  debts={visibleDebts}
                  onEdit={setEditingDebt}
                  onDelete={handleDeleteDebt}
                  onMarkSettled={handleMarkSettled}
                  isLoading={isSaving}
                />
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
