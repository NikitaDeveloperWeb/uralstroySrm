'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DocumentCard } from '@/shared/components/documents/DocumentCard';
import { DocumentModal } from '@/shared/components/documents/DocumentModal';
import { CATEGORIES } from '@/shared/constants/documents';
import { useToast } from '@/shared/components/ui/Toast';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useAlert } from '@/shared/hooks/useAlert';

import { FileDownIcon, PlusIcon } from 'lucide-react';

type Category = (typeof CATEGORIES)[number]['value'];

interface Document {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  fileName: string;
  mimeType?: string | null;
  fileSize?: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<Category>('contracts');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const stableEditingDoc = useMemo(() => editingDoc, [editingDoc]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;
  const { confirm } = useAlert();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/documents?category=${activeCategory}&page=${page}&limit=${LIMIT}`;
      const res = await fetch(url);

      const data = await res.json();
      setDocuments(data.documents);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast('Ошибка загрузки документов', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, page, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleAddDocument = useCallback(async (formData: FormData) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || 'Ошибка добавления', 'error');
        return;
      }

      toast('Документ добавлен', 'success');
      fetchDocuments();
    } catch {
      toast('Ошибка сети', 'error');
    }
  }, [toast]);

  const handleEditDocument = useCallback(async (formData: FormData) => {
    if (!editingDoc) return;

    try {
      const res = await fetch(`/api/documents?id=${editingDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description') || null,
          category: formData.get('category'),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || 'Ошибка обновления', 'error');
        return;
      }

      toast('Документ обновлен', 'success');
      setEditingDoc(null);
      fetchDocuments();
    } catch {
      toast('Ошибка сети', 'error');
    }
  }, [toast, fetchDocuments]);

  const handleDeleteDocument = async (id: string) => {
    if (!(await confirm('Удалить документ?'))) return;

    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || 'Ошибка удаления', 'error');
        return;
      }

      toast('Документ удален', 'success');
      fetchDocuments();
    } catch {
      toast('Ошибка сети', 'error');
    }
  };

  const handleEditClick = (doc: Document) => {
    setEditingDoc(doc);
    setModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setEditingDoc(null);
    setModalOpen(false);
  }, []);

  const modalOnSubmit = useMemo(() => editingDoc ? handleEditDocument : handleAddDocument, [editingDoc, handleEditDocument, handleAddDocument]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Документы</h1>
        <button
          onClick={() => { setEditingDoc(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Загрузить</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => { setActiveCategory(cat.value); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeCategory === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 border border-gray-200 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Documents list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-slate-400 dark:text-slate-400">Загрузка...</div>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700">
          <FileDownIcon className="w-12 h-12 text-gray-300 dark:text-slate-500 dark:text-slate-500 mb-4" />
          <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 mb-4">Документы не найдены</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50"
          >
            Добавить первый документ
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onEdit={handleEditClick}
                onDelete={handleDeleteDocument}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            itemsPerPage={LIMIT}
          />
        </>
      )}

      {/* Modal */}
      <DocumentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={modalOnSubmit}
        document={stableEditingDoc}
      />
    </div>
  );
}
