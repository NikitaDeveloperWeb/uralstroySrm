import ProgressIndicator from './ProgressIndicator';

interface ProjectSummary {
  planId: number;
  projectId: number;
  projectName: string;
  projectCode: string;
  plannedAmount: number;
  actualAmount: number;
  progress: number;
  comment: string | null;
}

interface ProjectsTableProps {
  projects: ProjectSummary[];
  totalPlanned: number;
  totalActual: number;
  onEdit: (project: ProjectSummary) => void;
  onDelete: (planId: number) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProjectsTable({ projects, totalPlanned, totalActual, onEdit, onDelete }: ProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-500">
          Нет планов на этот период. Нажмите "Создать план" чтобы добавить.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Проект
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              План
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Факт
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Выполнение
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.planId} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                <div className="text-sm text-gray-500">{project.projectCode}</div>
              </td>
              <td className="px-6 py-4 text-right text-sm text-gray-900">
                {formatCurrency(project.plannedAmount)}
              </td>
              <td className="px-6 py-4 text-right text-sm text-gray-900">
                {formatCurrency(project.actualAmount)}
              </td>
              <td className="px-6 py-4">
                <ProgressIndicator progress={project.progress} />
              </td>
              <td className="px-6 py-4 text-right text-sm">
                <button
                  onClick={() => onEdit(project)}
                  className="text-blue-600 hover:text-blue-800 mr-3"
                >
                  Изменить
                </button>
                <button
                  onClick={() => onDelete(project.planId)}
                  className="text-red-600 hover:text-red-800"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td className="px-6 py-4 text-sm font-bold text-gray-900">
              ИТОГО
            </td>
            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
              {formatCurrency(totalPlanned)}
            </td>
            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
              {formatCurrency(totalActual)}
            </td>
            <td className="px-6 py-4">
              <ProgressIndicator progress={totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0} />
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
