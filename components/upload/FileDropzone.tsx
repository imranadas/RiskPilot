"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  onFileCleared?: () => void;
  disabled?: boolean;
}

export function FileDropzone({
  onFileAccepted,
  onFileCleared,
  disabled,
}: FileDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setDropError(null);

      if (rejectedFiles.length > 0) {
        const code = rejectedFiles[0].errors[0]?.code;
        if (code === "file-too-large") {
          setDropError("File exceeds 10 MB. Please use a smaller PDF.");
        } else if (code === "file-invalid-type") {
          setDropError("Only PDF files are accepted.");
        } else {
          setDropError("Invalid file. Upload a PDF under 10 MB.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileAccepted(file);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled,
  });

  function clearFile(e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedFile(null);
    setDropError(null);
    onFileCleared?.();
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors",
          !disabled && "cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/20",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium leading-tight">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · PDF
              </p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={clearFile}
                className="ml-2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={cn(
                "mb-3 rounded-full p-3",
                isDragActive ? "bg-primary/10" : "bg-muted"
              )}
            >
              <Upload
                className={cn(
                  "h-6 w-6",
                  isDragActive ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
            <p className="text-sm font-medium">
              {isDragActive ? "Drop your PDF here" : "Drag & drop your credit report"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse &middot; PDF only &middot; max 10 MB
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Supports CIBIL, CRIF, Experian, Equifax
            </p>
          </>
        )}
      </div>

      {dropError && (
        <p className="text-xs text-destructive">{dropError}</p>
      )}
    </div>
  );
}
