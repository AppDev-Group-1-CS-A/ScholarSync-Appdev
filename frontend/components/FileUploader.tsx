"use client";

import React, { useRef, useState } from "react";
import {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";
import { LucideIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FileUploaderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  acceptTypes: string[];
  icon: LucideIcon;
  placeholder: string;
  hint: string;
  disabled?: boolean;
}

const FileUploader = React.forwardRef<HTMLDivElement, FileUploaderProps>(
  (
    {
      control,
      name,
      label,
      acceptTypes,
      icon: Icon,
      placeholder,
      hint,
      disabled = false,
    },
    ref,
  ) => {
    const { field } = useController({ control, name });
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const file = field.value as File | undefined;

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
        const acceptTypesArray = acceptTypes.filter((type) => type !== "*/*");
        const isAccepted =
          acceptTypes.includes("*/*") ||
          acceptTypesArray.some((type) => {
            if (type.endsWith("/*")) {
              const mainType = type.split("/")[0];
              return droppedFile.type.startsWith(mainType);
            }
            return droppedFile.type === type;
          });

        if (isAccepted) {
          field.onChange(droppedFile);
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        field.onChange(e.target.files[0]);
      }
    };

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      field.onChange(undefined);
    };

    return (
      <FormItem ref={ref}>
        <FormLabel className="form-label">{label}</FormLabel>
        <FormControl>
          <div
            className={cn(
              "upload-dropzone",
              isDragActive && "bg-gray-100",
              file && "upload-dropzone-uploaded",
              disabled && "opacity-50 cursor-not-allowed",
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
              accept={acceptTypes.join(",")}
              onChange={handleChange}
              className="hidden"
              disabled={disabled}
            />

            {!file ? (
              <>
                <Icon className="upload-dropzone-icon" />
                <p className="upload-dropzone-text">{placeholder}</p>
                <p className="upload-dropzone-hint">{hint}</p>
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
                {!disabled && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="upload-dropzone-remove"
                    aria-label="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  },
);

FileUploader.displayName = "FileUploader";

export default FileUploader;
