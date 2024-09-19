
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import {
  UploadCloud,
  TrashIcon,
  DownloadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type FileUploadProps = {
  acceptedTypes: Accept
  maxFiles?: number
  maxSize: number;
  onDrop: (acceptedFiles: File[]) => void;
  withPreview?: boolean;
  submittedFiles?: File[];
  error?: string;
  isMultiple?: boolean;
  onRemove?: (index: number) => void;
  previewMode?: 'INSIDE' | 'OUTSIDE'
  disabled?: boolean;
  customAcceptTypesLabel?: string;
  maxDimensions?: {
    width: number;
    height: number;
  }
}

enum FileTypes {
  Image = "image",
  Pdf = "pdf",
  Audio = "audio",
  Video = "video",
  Other = "other",
}

const errorCodeToMessage = {
  'generic': 'Arquivo inválido',
  'file-invalid-type': 'Formato não aceito',
  'file-too-large': 'Tamanho máximo excedido',
  'too-many-files': 'Máximo de arquivos excedido'
}

export const FileUpload = ({ disabled, acceptedTypes, maxSize, maxFiles = 1, onDrop, submittedFiles, error, withPreview, isMultiple, onRemove, previewMode = 'OUTSIDE', customAcceptTypesLabel, maxDimensions }: FileUploadProps) => {

  const isDisabled = submittedFiles && submittedFiles?.length >= maxFiles || disabled;

  const [inputError, setInputError] = useState<string | null>(null);

  const hasError = !!error || !!inputError;

  useEffect(() => {
    setInputError(null)
  }, [disabled])

  function getImageSizeAsync(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = url;
    });
  }

  const handleOnDrop = async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setInputError(null)
    if(fileRejections.length > 0) {
      setInputError(errorCodeToMessage[(fileRejections?.[0]?.errors?.[0]?.code ?? 'generic') as keyof typeof errorCodeToMessage])
      return
    }
    if(maxDimensions) {
      const { width, height } = maxDimensions;

      const invalidImages: File[] = [];

      await Promise.all(
        acceptedFiles.map(async (file) => {
          const size = await getImageSizeAsync(URL.createObjectURL(file))
          if (size.width > width && size.height > height) {
            invalidImages.push(file)
          }
        })
      )

      if(invalidImages.length > 0) {
        setInputError(`Dimensões máximas de ${width}x${height} pixels`)
        return
      }
    }
    onDrop(acceptedFiles)
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: handleOnDrop,
    accept: acceptedTypes,
    maxFiles,
    maxSize,
    multiple: isMultiple,
    disabled: isDisabled
  });

  const supportedTypesText = useMemo(() => {
    if(customAcceptTypesLabel) return customAcceptTypesLabel;
    return Object.values(acceptedTypes).flatMap((format) => format.map(x => x.split("/")[1].toUpperCase())).join(', ');
  }, [acceptedTypes, customAcceptTypesLabel])

  const previewArray = useMemo(() => {
    if (submittedFiles) {
      return submittedFiles.map((file) => URL.createObjectURL(file))
    }
  }, [submittedFiles])

  const limitText = `Tamanho máximo de ${Math.round(maxSize / 1000000)}MB${maxFiles > 1 ? ' por arquivo' : ''}. Máximo de ${maxFiles} arquivo(s).`

  // const handleClear = () => {
  //   if (onRemove) onDrop([])
  // }

  return (
    <>
      <div className="flex flex-col">
        <div className={clsx("w-full border-border border-2 border-dashed text-center py-4 rounded-xl text-muted-foreground transition-all duration-200", {
          "hover:border-primary cursor-pointer": !disabled,
          "!border-red-400 text-red-400": hasError || isDragReject,
          "opacity-80 hover:!border-red-400 !cursor-not-allowed": isDisabled && previewMode === 'OUTSIDE',
          "bg-slate-100/70": disabled
        })}>
          
            <div className="justify-center items-center flex flex-col focus:outline-none" {...getRootProps()}>
              <UploadCloud className="size-9" />
              <span className="py-2">
                <input type="file" {...getInputProps()} />
                {isDragActive ? (
                  isDragReject ? (
                    <p className="text-red font-semiBold">Formato não aceito</p>
                  ) : (
                    <p className="font-semiBold">Solte o arquivo aqui...</p>
                  )
                ) : (
                  <p className="text-charcoal font-semiBold">
                    Arraste e solte ou clique para selecionar
                  </p>
                )}
              </span>
              <p className="text-xs text-slate-500 font-light">{limitText}</p>
              <p className="text-xs text-slate-500 font-light">
                {`Formatos aceitos: ${supportedTypesText}`}
              </p>
            </div>
        </div>

        {hasError && (
          <span className="text-red-400 text-xs mt-2 mx-auto">{inputError ?? error}</span>
        )}
      </div>

      {submittedFiles && submittedFiles?.length > 0 && withPreview && onRemove && (
        <div className="grid gap-2 mt-4">
          {previewArray?.map((file, index) => {
            return (
              <div key={`preview-${index}`} className="relative flex justify-between items-center">
                {submittedFiles[index].type.includes('image') ? <img src={file} className="size-12" /> : <><DownloadCloud className="my-2 size-10" />
                <span className="flex-1 ml-2 text-sm block">{submittedFiles[index].name}</span></>}
                <Button 
                  onClick={() => onRemove(index)} 
                  type="button" 
                  size='icon'
                  variant="outline"
                >
                  <TrashIcon className="size-5" />
                </Button>
              </div>
          )})}
        </div>
      )}
    </>
  )
}
