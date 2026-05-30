import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useTranslation } from "react-i18next";

interface FileDropzoneProps {
  accept: string[];
  onFileSelect: (file: File) => void;
  label: string;
  isLoading: boolean;
  selectedFile?: File | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropzone({
  accept,
  onFileSelect,
  label,
  isLoading,
  selectedFile,
}: FileDropzoneProps) {
  const { t } = useTranslation();

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) return;
      if (accepted[0]) onFileSelect(accepted[0]);
    },
    [onFileSelect]
  );

  const acceptObj = accept.reduce<Record<string, string[]>>((acc, ext) => {
    const mimeMap: Record<string, string[]> = {
      ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      ".xls": ["application/vnd.ms-excel"],
      ".pdf": ["application/pdf"],
    };
    const mimes = mimeMap[ext] ?? [];
    mimes.forEach(m => { acc[m] = [...(acc[m] ?? []), ext]; });
    return acc;
  }, {});

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptObj,
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl px-8 py-6 text-center cursor-pointer transition-colors
          ${isDragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-gray-800"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {isDragActive ? (
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">{t("drop_file_here")}</p>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 font-medium">{t("drop_or_click")}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
            </>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-2 text-sm text-red-500">
          {t("wrong_file_format", { formats: accept.join(", ") })}
        </p>
      )}

      {selectedFile && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="truncate max-w-[200px]">{selectedFile.name}</span>
          <span className="text-gray-400 shrink-0">({formatSize(selectedFile.size)})</span>
        </div>
      )}
    </div>
  );
}
