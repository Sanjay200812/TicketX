"use client";

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react';
import { AdminEmptyState } from './AdminEmptyState';

export interface Column<T> {
  header: string;
  accessor?: keyof T | string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFields?: (keyof T | string)[];
  filters?: {
    label: string;
    key: keyof T | string;
    options: { label: string; value: string }[];
  }[];
  bulkActions?: {
    label: string;
    action: (selectedIds: string[]) => void;
    isDestructive?: boolean;
  }[];
  emptyIcon?: React.ElementType;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  itemsPerPage?: number;
}

export function AdminDataTable<T extends object>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  searchFields = [],
  filters = [],
  bulkActions = [],
  emptyIcon = Search,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no records matching your current filter criteria.',
  emptyActionHref,
  emptyActionLabel,
  itemsPerPage = 10,
}: AdminDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterValues, setSelectedFilterValues] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter & Search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const itemRecord = item as Record<string, unknown>;

      // Filter dropdowns
      for (const [filterKey, filterVal] of Object.entries(selectedFilterValues)) {
        if (filterVal && filterVal !== 'ALL') {
          const itemVal = String(itemRecord[filterKey] ?? '').toLowerCase();
          if (itemVal !== filterVal.toLowerCase()) {
            return false;
          }
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        if (searchFields.length > 0) {
          const matches = searchFields.some((field) => {
            const val = String(itemRecord[field as string] ?? '').toLowerCase();
            return val.includes(q);
          });
          if (!matches) return false;
        } else {
          const values = Object.values(itemRecord).join(' ').toLowerCase();
          if (!values.includes(q)) return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, searchFields, selectedFilterValues]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = (a as Record<string, unknown>)[sortColumn];
      const valB = (b as Record<string, unknown>)[sortColumn];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [filteredData, sortColumn, sortDirection]);


  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSet = new Set(paginatedData.map((item) => keyExtractor(item)));
      setSelectedIds(newSet);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Search, Filters, Bulk Selection Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#16191f] p-3 md:p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          {filters.map((flt) => (
            <div key={String(flt.key)} className="relative hidden sm:block">
              <select
                value={selectedFilterValues[String(flt.key)] || 'ALL'}
                onChange={(e) => {
                  setSelectedFilterValues((prev) => ({
                    ...prev,
                    [String(flt.key)]: e.target.value,
                  }));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-semibold text-gray-200 outline-none focus:border-primary appearance-none pr-8 cursor-pointer"
              >
                <option value="ALL">All {flt.label}</option>
                {flt.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.size > 0 && bulkActions.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl animate-in fade-in">
            <span className="text-xs font-bold text-primary">{selectedIds.size} selected</span>
            <div className="h-4 w-[1px] bg-white/10 mx-1" />
            {bulkActions.map((ba) => (
              <button
                key={ba.label}
                onClick={() => ba.action(Array.from(selectedIds))}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  ba.isDestructive
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-primary hover:bg-primary/90 text-white'
                }`}
              >
                {ba.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Table / Mobile Cards */}
      {paginatedData.length > 0 ? (
        <div className="bg-[#16191f] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-black/40 border-b border-white/10 text-gray-400 font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  {bulkActions.length > 0 && (
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedData.length > 0 &&
                          paginatedData.every((item) => selectedIds.has(keyExtractor(item)))
                        }
                        onChange={handleSelectAll}
                        className="rounded border-white/20 bg-black/40 text-primary cursor-pointer"
                      />
                    </th>
                  )}
                  {columns.map((col, idx) => (
                    <th
                      key={col.header || idx}
                      className={`p-4 font-bold ${col.className || ''}`}
                    >
                      {col.sortable && col.accessor ? (
                        <button
                          onClick={() => handleSort(String(col.accessor))}
                          className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                        >
                          <span>{col.header}</span>
                          <ArrowUpDown className="w-3 h-3 text-gray-400" />
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedData.map((item) => {
                  const id = keyExtractor(item);
                  const isSelected = selectedIds.has(id);

                  return (
                    <tr
                      key={id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isSelected ? 'bg-primary/[0.04]' : ''
                      }`}
                    >
                      {bulkActions.length > 0 && (
                        <td className="p-4 w-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(id)}
                            className="rounded border-white/20 bg-black/40 text-primary cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((col, idx) => (
                        <td key={col.header || idx} className={`p-4 ${col.className || ''}`}>
                          {col.render
                            ? col.render(item)
                            : col.accessor
                            ? String(item[col.accessor as keyof T] ?? '')
                            : null}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-white/10 bg-black/20 text-xs text-gray-400 font-mono">
            <div>
              Showing {sortedData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length}{' '}
              records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 text-white font-bold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <AdminEmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionHref={emptyActionHref}
          actionLabel={emptyActionLabel}
        />
      )}
    </div>
  );
}
