import { X, Calendar, Building2, DollarSign, FileText } from 'lucide-react';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    projectId: number;
    periodFrom: Date;
    periodTo: Date;
    plannedAmount: number;
    comment: string;
  }) => Promise<void>;
  periodFrom: Date;
  periodTo: Date;
  projects: Array<{ id: number; name: string; code: string; status?: string }>;
  editingProject?: {
    planId: number;
    projectId: number;
    plannedAmount: number;
    comment: string | null;
  } | null;
}

export default function PlanModal({
  isOpen,
  onClose,
  onSubmit,
  periodFrom,
  periodTo,
  projects,
  editingProject,
}: PlanModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    await onSubmit({
      projectId: Number(formData.get('projectId')),
      periodFrom,
      periodTo,
      plannedAmount: Number(formData.get('plannedAmount')),
      comment: formData.get('comment') as string,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProject ? 'Редактировать план' : 'Создать план'}
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {editingProject ? 'Обновите параметры плана' : 'Запланируйте бюджет на проект'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/60 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="plan-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Building2 className="w-4 h-4 text-blue-600" />
                Проект
              </label>
              <select
                name="projectId"
                defaultValue={editingProject?.projectId || ''}
                required
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all bg-white hover:border-gray-400"
              >
                <option value="">Выберите проект</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} — {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Planned Amount */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DollarSign className="w-4 h-4 text-green-600" />
                Запланированная сумма
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="plannedAmount"
                  defaultValue={editingProject?.plannedAmount || ''}
                  min="0"
                  required
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all pr-12 hover:border-gray-400"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₽</span>
              </div>
            </div>

            {/* Period Display */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-purple-600" />
                Период
              </label>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl px-4 py-3">
                <p className="text-base font-medium text-gray-800">
                  {periodFrom.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}{' — '}
                  {periodTo.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4 text-orange-600" />
                Комментарий
              </label>
              <textarea
                name="comment"
                defaultValue={editingProject?.comment || ''}
                rows={3}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none hover:border-gray-400"
                placeholder="Дополнительная информация о плане (необязательно)"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-semibold border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
          >
            Отмена
          </button>
          <button
            type="submit"
            form="plan-form"
            className="px-8 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            {editingProject ? 'Сохранить изменения' : 'Создать план'}
          </button>
        </div>
      </div>
    </div>
  );
}
