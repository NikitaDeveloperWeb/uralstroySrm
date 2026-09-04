'use client';

import { Modal } from '@/shared/components/ui/Modal';
import { FormField } from '@/shared/components/ui/FormField';
import type { Project } from '@/shared/types/project';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editForm: Partial<Project>;
  setEditForm: (form: Partial<Project> | ((prev: Partial<Project>) => Partial<Project>)) => void;
  onSave: () => void;
}

export function ProjectObjectCardEditModal({ isOpen, onClose, editForm, setEditForm, onSave }: Props) {
  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Карта объекта">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Количество этажей">
            <input
              type="number"
              value={editForm.floors ?? ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, floors: e.target.value ? Number(e.target.value) : null }))}
              placeholder="1"
              min="1"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
          <FormField label="Тип крыши">
            <select
              value={editForm.roofType || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, roofType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="">Не выбрано</option>
              <option value="односкатная">Односкатная</option>
              <option value="двускатная">Двускатная</option>
              <option value="вальмовая">Вальмовая</option>
              <option value="шатровая">Шатровая</option>
              <option value="другое">Другое</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Цвет крыши">
            <input
              type="text"
              value={editForm.roofColor || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, roofColor: e.target.value }))}
              placeholder="Красный, коричневый..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
          <FormField label="Тип фундамента">
            <select
              value={editForm.foundations || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, foundations: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="">Не выбрано</option>
              <option value="ленточный">Ленточный</option>
              <option value="свайный">Свайный</option>
              <option value="плитный">Плитный</option>
              <option value="столбчатый">Столбчатый</option>
              <option value="другой">Другой</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Тип стен">
            <select
              value={editForm.walls || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, walls: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="">Не выбрано</option>
              <option value="кирпич">Кирпич</option>
              <option value="газобетон">Газобетон</option>
              <option value="дерево">Дерево</option>
              <option value="каркас">Каркас</option>
              <option value="SIP-панели">SIP-панели</option>
              <option value="другой">Другой</option>
            </select>
          </FormField>
          <FormField label="Тип утепления">
            <select
              value={editForm.insulation || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, insulation: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="">Не выбрано</option>
              <option value="минеральная вата">Минеральная вата</option>
              <option value="пенополистирол">Пенополистирол (ПС)</option>
              <option value="экструдированный пенополистирол">Экструдированный (ЭППС)</option>
              <option value="пенополиуретан">Пенополиуретан (ППУ)</option>
              <option value="эковата">Эковата</option>
              <option value="пенофол">Пенофол</option>
              <option value="другой">Другой</option>
            </select>
          </FormField>
        </div>

        <FormField label="Толщина утепления">
          <input
            type="text"
            value={editForm.insulationThickness || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, insulationThickness: e.target.value }))}
            placeholder="50мм, 100мм, 150мм..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Тип окон">
            <select
              value={editForm.windows || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, windows: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="">Не выбрано</option>
              <option value="пластиковые">Пластиковые (ПВХ)</option>
              <option value="деревянные">Деревянные</option>
              <option value="деревянно-алюминиевые">Деревянно-алюминиевые</option>
              <option value="другие">Другие</option>
            </select>
          </FormField>
          <FormField label="Тип двери">
            <input
              type="text"
              value={editForm.doorType || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, doorType: e.target.value }))}
              placeholder="Металлическая, деревянная..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Основание">
            <select
              value={editForm.baseType || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, baseType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="">Не выбрано</option>
              <option value="ленточный">Ленточный</option>
              <option value="свайный">Свайный</option>
              <option value="плитный">Плитный</option>
              <option value="столбчатый">Столбчатый</option>
              <option value="свайно-винтовой">Свайно-винтовой</option>
              <option value="другое">Другое</option>
            </select>
          </FormField>
          <FormField label="Тип дома">
            <select
              value={editForm.homeType || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, homeType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="">Не выбрано</option>
              <option value="круглогодичный">Круглогодичный</option>
              <option value="сезонный">Сезонный</option>
            </select>
          </FormField>
        </div>

        <FormField label="Тип кровли">
          <select
            value={editForm.roofMaterial || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, roofMaterial: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          >
            <option value="">Не выбрано</option>
            <option value="металлочерепица">Металлочерепица</option>
            <option value="soft roof">Мягкая кровля (Soft Roof)</option>
            <option value="профнастил">Профнастил</option>
            <option value="ондулин">Ондулин</option>
            <option value="еврорубероид">Еврорубероид</option>
            <option value="деревянная">Деревянная</option>
            <option value="другая">Другая</option>
          </select>
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
            <input
              type="checkbox"
              checked={editForm.hasMansard || false}
              onChange={(e) => setEditForm((prev) => ({ ...prev, hasMansard: e.target.checked }))}
              className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
            />
            <span className="text-gray-700 dark:text-slate-300 font-medium">Мансарда</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
            <input
              type="checkbox"
              checked={editForm.hasVeranda || false}
              onChange={(e) => setEditForm((prev) => ({ ...prev, hasVeranda: e.target.checked }))}
              className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
            />
            <span className="text-gray-700 dark:text-slate-300 font-medium">Веранда</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
            <input
              type="checkbox"
              checked={editForm.hasPorhch || false}
              onChange={(e) => setEditForm((prev) => ({ ...prev, hasPorhch: e.target.checked }))}
              className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
            />
            <span className="text-gray-700 dark:text-slate-300 font-medium">Крыльцо</span>
          </label>
        </div>

        {(editForm.hasVeranda || editForm.verandaSize) && (
          <FormField label="Размер веранды">
            <input
              type="text"
              value={editForm.verandaSize || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, verandaSize: e.target.value }))}
              placeholder="Например: 2x4 м"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </FormField>
        )}

        <FormField label="Коммуникации">
          <textarea
            value={editForm.communication || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, communication: e.target.value }))}
            placeholder="Газ, вода, электричество, канализация..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
          />
        </FormField>

        <FormField label="Планировка">
          <textarea
            value={editForm.layout || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, layout: e.target.value }))}
            placeholder="1 этаж: прихожая, кухня, гостиная...\n2 этаж: спальни, ванные..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
          />
        </FormField>

        <FormField label="Описание">
          <textarea
            value={editForm.description || ''}
            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Дополнительное описание объекта..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
          />
        </FormField>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  );
}


