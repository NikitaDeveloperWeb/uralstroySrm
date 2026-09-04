'use client';

import { useState, useEffect } from 'react';
import { useAlert } from '@/shared/hooks/useAlert';
import { Modal } from '@/shared/components/ui/Modal';
import { PiggyBank, History, TrendingUp, TrendingDown, Edit2, Trash2, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

interface Fund {
  id: string;
  name: string;
  type: string;
  balance: number;
  targetAmount: number;
  description: string;
  createdAt: string;
}

interface FundTransaction {
  id: string;
  fundId: string;
  fundName: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

interface FundManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  funds: Fund[];
  fundTransactions: FundTransaction[];
  onEditFund: (fund: Fund) => void;
  onDeleteFund: (id: string) => void;
  onOperation: (fund: Fund, type: 'income' | 'expense') => void;
  onCreateModal: () => void;
}

const fundTypes = [
  { value: 'bonus', label: 'Премирование', icon: '🎯', description: 'Бонусы и поощрения' },
  { value: 'development', label: 'Развитие', icon: '📈', description: 'Развитие бизнеса' },
  { value: 'emergency', label: 'Чрезвычайный', icon: '🚨', description: 'Форс-мажоры' },
  { value: 'equipment', label: 'Техника', icon: '🛠️', description: 'Оборудование' },
  { value: 'other', label: 'Прочий', icon: '💰', description: 'Другие цели' },
];

const typeColors: Record<string, string> = {
  bonus: 'bg-green-100 text-green-800',
  development: 'bg-blue-100 text-blue-800',
  emergency: 'bg-red-100 text-red-800',
  equipment: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200',
};

function FundCard({ fund, transactions, onEdit, onDelete, onOperation }: {
  fund: Fund;
  transactions: FundTransaction[];
  onEdit: () => void;
  onDelete: () => void;
  onOperation: (type: 'income' | 'expense') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const stats = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    totalExpense: transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    count: transactions.length,
  };
  const progress = fund.targetAmount > 0 ? Math.min((fund.balance / fund.targetAmount) * 100, 100) : 0;
  const fundType = fundTypes.find(t => t.value === fund.type);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{fundType?.icon || '💰'}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{fund.name}</h3>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${typeColors[fund.type] || ''}`}>
                {fundType?.label || fund.type}
              </span>
            </div>
            {fund.description && <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{fund.description}</p>}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-green-50 rounded-lg p-2">
                <p className="text-xs text-green-600 mb-1">Пополнено</p>
                <p className="text-sm font-bold text-green-700">+{stats.totalIncome.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-xs text-red-600 mb-1">Списано</p>
                <p className="text-sm font-bold text-red-700">-{stats.totalExpense.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-xs text-blue-600 mb-1">Баланс</p>
                <p className="text-sm font-bold text-blue-700">{fund.balance.toLocaleString('ru-RU')} ₽</p>
              </div>
            </div>
            {fund.targetAmount > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
                  <span>Прогресс</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <button onClick={() => onOperation('income')} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
            <TrendingUp className="w-4 h-4" />Пополнить
          </button>
          <button onClick={() => onOperation('expense')} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
            <TrendingDown className="w-4 h-4" />Списать
          </button>
          <button onClick={onEdit} className="p-2 text-gray-500 dark:text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Редактировать">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Удалить">
            <Trash2 className="w-4 h-4" />
          </button>
          {transactions.length > 0 && (
            <button onClick={() => setExpanded(!expanded)} className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 rounded-lg transition-colors" title="История">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      {expanded && transactions.length > 0 && (
        <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 p-4">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {transactions.map(txn => (
              <div key={txn.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-200 dark:border-slate-700 last:border-0">
                <div className="flex-1 pr-2">
                  <p className="text-gray-900 dark:text-white">{txn.description || '-'}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(txn.date).toLocaleDateString('ru-RU')}</p>
                </div>
                <span className={`font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.type === 'income' ? '+' : '-'}{txn.amount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTab({ funds, transactions }: { funds: Fund[]; transactions: FundTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-16 h-16 text-gray-300 dark:text-slate-500 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-slate-400 text-lg mb-2">История пуста</p>
        <p className="text-sm text-gray-400 dark:text-slate-500">Операции по фондам появятся здесь</p>
      </div>
    );
  }

  const byFund = new Map<string, FundTransaction[]>();
  transactions.forEach(txn => {
    const list = byFund.get(txn.fundId) || [];
    list.push(txn);
    byFund.set(txn.fundId, list);
  });

  const sortedFunds = Array.from(byFund.entries())
    .map(([fundId, txns]) => ({ fundId, txns: txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }))
    .filter(item => funds.find(f => f.id === item.fundId))
    .sort((a, b) => {
      const fundA = funds.find(f => f.id === a.fundId);
      const fundB = funds.find(f => f.id === b.fundId);
      return (fundB?.createdAt || '').localeCompare(fundA?.createdAt || '');
    });

  return (
    <div className="space-y-4">
      {sortedFunds.map(item => {
        const fund = funds.find(f => f.id === item.fundId);
        if (!fund) return null;
        const fundType = fundTypes.find(t => t.value === fund.type);

        return (
          <div key={item.fundId} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">{fundType?.icon || '💰'}</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{fund.name}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400">{item.txns.length} операций</p>
              </div>
            </div>
            <div className="space-y-2">
              {item.txns.map(txn => (
                <div key={txn.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                  <div className="flex-1 pr-2">
                    <p className="text-gray-900 dark:text-white text-xs">{txn.description || '-'}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{new Date(txn.date).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <span className={`font-semibold whitespace-nowrap ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.type === 'income' ? '+' : '-'}{txn.amount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CreateFundForm({ onSubmit, onCancel }: { onSubmit: (data: { name: string; type: string; targetAmount: number; description: string }) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'bonus',
    targetAmount: 0,
    description: '',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Создать фонд</h3>
        <button onClick={onCancel} className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Название фонда</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Например: Фонд премирования Q4"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Тип фонда</label>
        <div className="grid grid-cols-2 gap-3">
          {fundTypes.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                formData.type === type.value
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:border-slate-600'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Целевая сумма (₽)</label>
        <input
          type="number"
          min="0"
          step="1000"
          value={formData.targetAmount}
          onChange={e => setFormData(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Оставьте 0, если целевая сумма не установлена</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Описание</label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          placeholder="Для чего предназначен этот фонд..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={() => onSubmit(formData)}
          disabled={!formData.name}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 dark:bg-slate-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
        >
          Создать фонд
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

function OperationForm({ fund, type, onSubmit, onCancel }: {
  fund: Fund;
  type: 'income' | 'expense';
  onSubmit: (data: { amount: number; description: string }) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const isIncome = type === 'income';
  const maxAmount = isIncome ? Infinity : fund.balance;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {isIncome ? 'Пополнение' : 'Списание'}: {fund.name}
        </h3>
        <button onClick={onCancel} className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Текущий баланс</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{fund.balance.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className={`text-right ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            <p className="text-sm font-medium">{isIncome ? 'Пополнение' : 'Списание'}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {isIncome ? 'Добавление средств' : 'Макс: ' + fund.balance.toLocaleString('ru-RU') + ' ₽'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Сумма (₽)</label>
        <input
          type="number"
          min="0"
          step="100"
          max={maxAmount}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Описание</label>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          placeholder={isIncome ? ' reason пополнения средств...' : ' reason списания средств...'}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={() => onSubmit({ amount: parseFloat(amount), description })}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
            !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount
              ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed'
              : isIncome
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isIncome ? 'Пополнить' : 'Списать'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export function FundManagementModal({ isOpen, onClose, funds, fundTransactions, onEditFund, onDeleteFund, onOperation, onCreateModal }: FundManagementModalProps) {
  const { alert } = useAlert();
  const [activeTab, setActiveTab] = useState<'funds' | 'history' | 'create'>('funds');
  const [operationFund, setOperationFund] = useState<Fund | null>(null);
  const [operationType, setOperationType] = useState<'income' | 'expense'>('income');

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('funds');
      setOperationFund(null);
    }
  }, [isOpen]);

  const handleCreateFund = async (data: { name: string; type: string; targetAmount: number; description: string }) => {
    try {
      const res = await fetch('/api/funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          balance: 0,
        }),
      });
      if (!res.ok) throw new Error('Ошибка создания фонда');
      onCreateModal();
      window.location.reload();
    } catch (error: any) {
      alert(error.message || 'Ошибка при создании фонда');
    }
  };

  const handleOperation = async (data: { amount: number; description: string }) => {
    if (!operationFund) return;
    try {
      const res = await fetch('/api/funds/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fundId: parseInt(operationFund.id),
          type: operationType,
          amount: data.amount,
          description: data.description,
          date: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Ошибка операции');
      setOperationFund(null);
      window.location.reload();
    } catch (error: any) {
      alert(error.message || 'Ошибка при операции');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Управление фондами" height="h-[90vh]">
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <button
            onClick={() => { setActiveTab('funds'); setOperationFund(null); }}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'funds' && !operationFund ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
            }`}
          >
            <PiggyBank className="w-4 h-4" />Фонды
          </button>
          <button
            onClick={() => { setActiveTab('history'); setOperationFund(null); }}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'history' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
            }`}
          >
            <History className="w-4 h-4" />История операций
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`ml-auto px-4 py-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'create' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
            }`}
          >
            <Plus className="w-4 h-4" />Создать фонд
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'create' && !operationFund ? (
            <CreateFundForm onSubmit={handleCreateFund} onCancel={() => setActiveTab('funds')} />
          ) : operationFund ? (
            <OperationForm
              fund={operationFund}
              type={operationType}
              onSubmit={handleOperation}
              onCancel={() => setOperationFund(null)}
            />
          ) : activeTab === 'funds' ? (
            <div className="space-y-4">
              {funds.length === 0 ? (
                <div className="text-center py-12">
                  <PiggyBank className="w-16 h-16 text-gray-300 dark:text-slate-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-slate-400 text-lg mb-2">Фондов пока нет</p>
                  <p className="text-sm text-gray-400 dark:text-slate-500">Создайте первый целевой фонд</p>
                </div>
              ) : (
                funds.map(fund => {
                  const fundTxns = fundTransactions.filter(t => t.fundId === fund.id);
                  return (
                    <FundCard
                      key={fund.id}
                      fund={fund}
                      transactions={fundTxns}
                      onEdit={() => onEditFund(fund)}
                      onDelete={() => onDeleteFund(fund.id)}
                      onOperation={(type) => {
                        setOperationFund(fund);
                        setOperationType(type);
                      }}
                    />
                  );
                })
              )}
            </div>
          ) : (
            <HistoryTab funds={funds} transactions={fundTransactions} />
          )}
        </div>
      </div>
    </Modal>
  );
}
