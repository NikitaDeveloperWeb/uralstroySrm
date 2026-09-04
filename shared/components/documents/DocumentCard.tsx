'use client';

import { useState } from 'react';
import { Eye, FileText, Image, Printer, X } from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/shared/constants/documents';

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    description?: string | null;
    category: string;
    fileName: string;
    mimeType?: string | null;
    fileSize?: number | null;
    createdAt: string;
    updatedAt: string;
  };
  onEdit?: (document: DocumentCardProps['document']) => void;
  onDelete?: (id: string) => void;
}

export function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const categoryLabel = CATEGORY_LABELS[document.category] || document.category;
  const categoryColor = CATEGORY_COLORS[document.category] || 'text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700';

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const getFileIcon = () => {
    const mimeType = document.mimeType || '';
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const canPreview = (mimeType?: string | null) => {
    if (!mimeType) return false;
    return mimeType.startsWith('image/') || mimeType === 'application/pdf';
  };

  const handlePreview = () => {
    if (canPreview(document.mimeType)) {
      setPreviewUrl(`/api/documents/download?file=${document.fileName}`);
      setIsPreviewOpen(true);
    }
  };

  const handlePrint = () => {
    if (canPreview(document.mimeType)) {
      const printUrl = `/api/documents/download?file=${document.fileName}`;
      const printWindow = window.open(printUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 dark:border-slate-700 hover:shadow-md transition-shadow">
        <FileText className="w-10 h-10 text-gray-400 dark:text-slate-500 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white dark:text-white truncate">{document.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor}`}>
              {categoryLabel}
            </span>
          </div>

          {document.description && (
            <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 mt-1 truncate">{document.description}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-slate-500">
            <span>{formatFileSize(document.fileSize)}</span>
            <span>•</span>
            <span>{new Date(document.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canPreview(document.mimeType) && (
            <>
              <button
                onClick={handlePreview}
                className="px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                title="Просмотр"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                title="Печать"
              >
                <Printer className="w-4 h-4" />
              </button>
            </>
          )}

          <a
            href={`/api/documents/download?file=${document.fileName}`}
            download={document.fileName}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Скачать
          </a>

          {onEdit && (
            <button
              onClick={() => onEdit(document)}
              className="p-2 text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(document.id)}
              className="p-2 text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">
                {document.name}
              </h3>
              <div className="flex items-center gap-2">
                {canPreview(document.mimeType) && (
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Печать
                  </button>
                )}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {document.mimeType?.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt={document.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border-0"
                  title={document.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
