"use client";

import { useRef, useState } from "react";
import { LucideIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadDropzoneProps {
  accept: string;
  onChange: (file: File | undefined) => void;
  file?: File;
  icon: LucideIcon;
  mainText: string;
  hintText: string;
  onRemove: () => void;
  error?: string;
  optional?: boolean;
}

const FileUploadDropzone = ({
  accept,
  onChange,
  file,
  icon: Icon,
  mainText,
  hintText,
  onRemove,
  error,
  optional = false,
}: FileUploadDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        accept === ".pdf" ||
        (accept === "image/*" && droppedFile.type.startsWith("image/"))
      ) {
        onChange(droppedFile);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <div
        className={cn(
          "upload-dropzone",
          isDragActive && "bg-gray-100",
          file && "upload-dropzone-uploaded",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          aria-invalid={error ? "true" : "false"}
        />

        {!file ? (
          <>
            <Icon className="upload-dropzone-icon" />
            <p className="upload-dropzone-text">{mainText}</p>
            <p className="upload-dropzone-hint">{hintText}</p>
          </>
        ) : (
          <div className="flex items-center justify-between w-full px-6">
            <div className="flex items-center gap-3">
              <Icon className="upload-dropzone-icon" />
              <div className="text-left">
                <p className="upload-dropzone-text text-sm">{file.name}</p>
                <p className="upload-dropzone-hint text-xs">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="upload-dropzone-remove"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      {error && !optional && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default FileUploadDropzone;
