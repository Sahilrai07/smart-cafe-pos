'use client';

import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/services/supabaseService';
import { cafeStore } from '@/lib/store';
import { Restaurant, RestaurantSettings, Expense, ExpenseCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Calendar,
  Download,
  Receipt,
  FileSpreadsheet,
  PieChart,
  Trash2,
  X,
  CreditCard,
  Building,
  Users,
  Utensils,
  Zap,
  Megaphone,
  Wrench,
  Coffee,
} from 'lucide-react';

export default function FinanceAnalyticsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // New expense form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<ExpenseCategory>('INGREDIENTS');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'UPI'>('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const refreshData = async () => {
    try {
      const rId = cafeStore.getActiveRestaurantId();
      const r = (await supabaseService.getRestaurantById(rId)) || (await supabaseService.getAllRestaurants())[0];
      setRestaurant(r || null);
      if (r) {
        const [s, expList, finSummary] = await Promise.all([
          supabaseService.getSettings(r.id),
          supabaseService.getExpenses(r.id),
          supabaseService.getFinancialSummary(r.id),
        ]);
        setSettings(s);
        setExpenses(expList);
        setSummary(finSummary);
      }
    } catch (e) {
      console.error('Error refreshing finance data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !title.trim() || amount <= 0) return;

    await supabaseService.addExpense({
      restaurant_id: restaurant.id,
      title,
      amount,
      category,
      payment_method: paymentMethod,
      date,
      notes: notes || undefined,
    });

    setTitle('');
    setAmount(0);
    setNotes('');
    setIsAddExpenseOpen(false);
    refreshData();
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Delete this expense entry?')) {
      await supabaseService.deleteExpense(id);
      refreshData();
    }
  };

  const handleExportCSV = () => {
    if (!summary || expenses.length === 0) return;
    const headers = ['Date', 'Category', 'Title', 'Amount', 'Payment Method', 'Notes'];
    const rows = expenses.map((e) => [
      e.date,
      e.category,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      e.payment_method,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currency = settings?.currency || '₹';

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'RENT':
        return <Building className="w-3.5 h-3.5" />;
      case 'SALARY':
        return <Users className="w-3.5 h-3.5" />;
      case 'INGREDIENTS':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'UTILITIES':
        return <Zap className="w-3.5 h-3.5" />;
      case 'MARKETING':
        return <Megaphone className="w-3.5 h-3.5" />;
      case 'MAINTENANCE':
        return <Wrench className="w-3.5 h-3.5" />;
      default:
        return <Receipt className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1713] p-5 rounded-3xl border border-[#2B221A]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#241D17] border border-[#352B21] flex items-center justify-center text-[#9BB89E]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FAF8F5] tracking-tight">
              Finance & P&L Analytics
            </h1>
            <p className="text-xs text-[#8E7E73] mt-0.5">
              Sales reports, expense tracking, COGS, P&L statements & exportable balance sheets • {restaurant?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#221B16] hover:bg-[#2C231D] text-[#A8988C] hover:text-[#EDE7DF] border border-[#30261F] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-[#9BB89E]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2 rounded-2xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Gross Sales Revenue</span>
          <div className="text-2xl font-bold text-[#9BB89E] mt-1">
            {formatCurrency(summary?.totalRevenue || 0, currency)}
          </div>
          <span className="text-[10px] text-[#7A6B60]">From {summary?.ordersCount || 0} customer orders</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Total Operating Expenses</span>
          <div className="text-2xl font-bold text-[#DF9182] mt-1">
            {formatCurrency(summary?.totalExpenses || 0, currency)}
          </div>
          <span className="text-[10px] text-[#7A6B60]">Rent, payroll, utilities & restock</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Net Estimated Profit</span>
          <div
            className={`text-2xl font-bold mt-1 ${
              (summary?.netProfit || 0) >= 0 ? 'text-[#9BB89E]' : 'text-[#DF9182]'
            }`}
          >
            {formatCurrency(summary?.netProfit || 0, currency)}
          </div>
          <span className="text-[10px] text-[#7A6B60]">
            {(summary?.netProfit || 0) >= 0 ? 'Healthy operating margin' : 'Operating at loss'}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[#1C1713] border border-[#2B221A]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E7E73]">Net Margin %</span>
          <div className="text-2xl font-bold text-[#D4AD85] mt-1">
            {summary?.profitMargin ? summary.profitMargin.toFixed(1) : '0.0'}%
          </div>
          <span className="text-[10px] text-[#7A6B60]">Net profitability percentage</span>
        </div>
      </div>

      {/* P&L Breakdown Card */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] p-5 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-[#FAF8F5] flex items-center gap-2 border-b border-[#28201A] pb-3">
          <FileSpreadsheet className="w-4 h-4 text-[#9BB89E]" />
          Profit & Loss Statement (P&L) Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#211A15] border border-[#2E241D] space-y-2">
            <span className="font-semibold text-[#8E7E73] block uppercase text-[10px]">1. Revenue (Income)</span>
            <div className="flex justify-between text-[#EDE7DF]">
              <span>Food & Beverage Sales</span>
              <span className="text-[#9BB89E] font-semibold">{formatCurrency(summary?.totalRevenue || 0, currency)}</span>
            </div>
            <div className="flex justify-between text-[#8E7E73]">
              <span>Estimated COGS (Raw Food ~32%)</span>
              <span className="text-[#DF9182]">-{formatCurrency(summary?.estimatedCOGS || 0, currency)}</span>
            </div>
            <div className="border-t border-[#2D231B] pt-1.5 flex justify-between font-bold text-[#FAF8F5]">
              <span>Gross Food Profit</span>
              <span className="text-[#D4AD85]">
                {formatCurrency(Math.max(0, (summary?.totalRevenue || 0) - (summary?.estimatedCOGS || 0)), currency)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#211A15] border border-[#2E241D] space-y-2">
            <span className="font-semibold text-[#8E7E73] block uppercase text-[10px]">2. Operating Overheads</span>
            <div className="flex justify-between text-[#8E7E73]">
              <span>Rent & Outlet Lease</span>
              <span className="text-[#EDE7DF] font-semibold">{formatCurrency(summary?.expenseByCategory?.RENT || 0, currency)}</span>
            </div>
            <div className="flex justify-between text-[#8E7E73]">
              <span>Staff Salaries & Payroll</span>
              <span className="text-[#EDE7DF] font-semibold">{formatCurrency(summary?.expenseByCategory?.SALARY || 0, currency)}</span>
            </div>
            <div className="flex justify-between text-[#8E7E73]">
              <span>Power, Gas & Utilities</span>
              <span className="text-[#EDE7DF] font-semibold">{formatCurrency(summary?.expenseByCategory?.UTILITIES || 0, currency)}</span>
            </div>
            <div className="flex justify-between text-[#8E7E73]">
              <span>Marketing & Printing</span>
              <span className="text-[#EDE7DF] font-semibold">{formatCurrency(summary?.expenseByCategory?.MARKETING || 0, currency)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#211A15] border border-[#2E241D] space-y-2">
            <span className="font-semibold text-[#8E7E73] block uppercase text-[10px]">3. Net Bottom Line</span>
            <div className="flex justify-between text-[#EDE7DF]">
              <span>Total Inflows</span>
              <span className="text-[#9BB89E] font-semibold">{formatCurrency(summary?.totalRevenue || 0, currency)}</span>
            </div>
            <div className="flex justify-between text-[#8E7E73]">
              <span>Total Outflows</span>
              <span className="text-[#DF9182]">-{formatCurrency(summary?.totalExpenses || 0, currency)}</span>
            </div>
            <div className="border-t border-[#2D231B] pt-2 flex justify-between font-bold text-sm">
              <span className="text-[#FAF8F5]">Net Business Earnings</span>
              <span className={(summary?.netProfit || 0) >= 0 ? 'text-[#9BB89E]' : 'text-[#DF9182]'}>
                {formatCurrency(summary?.netProfit || 0, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Ledger */}
      <div className="bg-[#1C1713] rounded-3xl border border-[#2B221A] p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28201A] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#FAF8F5]">Expense Tracker & Ledger</h3>
            <p className="text-xs text-[#8E7E73]">Log and classify daily cafe outflows</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'RENT', 'SALARY', 'INGREDIENTS', 'UTILITIES', 'MARKETING', 'MAINTENANCE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#C29B72] text-[#14110E] font-bold'
                    : 'bg-[#221B16] text-[#8E7E73] border border-[#2E241D] hover:text-[#EDE7DF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#28201A] text-[10px] font-semibold uppercase tracking-wider text-[#7A6B60]">
                <th className="pb-3">Date</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Title & Notes</th>
                <th className="pb-3">Paid Via</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#241D17]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#7A6B60] font-medium">
                    No expense entries found for this category
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#221A15]/60 transition-colors">
                    <td className="py-3 font-semibold text-[#8E7E73]">{exp.date}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#221B16] border border-[#30261F] text-[#D8C7B8]">
                        {getCategoryIcon(exp.category)}
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-[#FAF8F5] block">{exp.title}</span>
                      {exp.notes && <span className="text-[10px] text-[#7A6B60] line-clamp-1">{exp.notes}</span>}
                    </td>
                    <td className="py-3 text-[#8E7E73] font-medium">{exp.payment_method}</td>
                    <td className="py-3 font-bold text-[#DF9182] text-sm">
                      -{formatCurrency(exp.amount, currency)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 rounded-lg hover:bg-[#B35C4A]/20 text-[#7A6B60] hover:text-[#DF9182] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-[#14110E]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1713] border border-[#2B221A] rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 text-[#EDE7DF]">
            <div className="flex items-center justify-between border-b border-[#28201A] pb-3">
              <h3 className="text-base font-bold text-[#FAF8F5] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C29B72]" />
                Record Cafe Expense
              </h3>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="w-7 h-7 rounded-full bg-[#241D17] text-[#8E7E73] hover:text-[#EDE7DF] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly High Street Rent"
                  className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Amount ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="35000"
                    className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  >
                    <option value="RENT">Rent & Lease</option>
                    <option value="SALARY">Salaries & Wages</option>
                    <option value="INGREDIENTS">Raw Ingredients</option>
                    <option value="UTILITIES">Electricity & Power</option>
                    <option value="MARKETING">Marketing & Ads</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                  >
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E7E73] mb-1">Notes / Vendor</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid to Landlord via Bank"
                  className="w-full px-3 py-2 rounded-xl bg-[#211A15] border border-[#2F241D] text-xs text-[#EDE7DF] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-[#C29B72] hover:bg-[#B58D64] text-[#14110E] font-bold text-xs transition-colors mt-2 shadow-xs"
              >
                Save Expense Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
