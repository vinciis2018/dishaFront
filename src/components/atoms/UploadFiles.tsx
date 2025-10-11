import React, { useState, useRef } from 'react';
// import { useAppDispatch } from '../../store';
// import { getS3Url } from '../../utilities/awsUtils';
import { readExcelHeaders } from '../../utilities/excelUtils';
import { getS3Url } from '../../utilities/awsUtils';


interface excelFile {
  fileType: string;
  fileName: string;
  url: string;
  headers: string[];
}
interface UploadExcelFileProps {
  setExcel: (excel: excelFile[]) => void;
}


export function UploadExcelFile({ setExcel }: UploadExcelFileProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const dispatch = useAppDispatch();

  const handleSubmit = async (files: File[]) => {
    if (files.length === 0) return;

    const fileUploadResults = [];

    for (const file of files) {
      try {
        const headers = await readExcelHeaders(file);
        console.log('Extracted headers from', file.name, ':', headers);
        
         // Upload the file to S3
        const s3Url = await getS3Url(file);
        
        fileUploadResults.push({
          fileType: file.type,
          fileName: file.name,
          url: s3Url,
          headers: headers
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        throw error;
      }
    }
    setExcel(fileUploadResults)
  };


  const handleDropZoneClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  
  const handleDrop = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if ((e as React.DragEvent<HTMLDivElement>).dataTransfer.files && (e as React.DragEvent<HTMLDivElement>).dataTransfer.files.length > 0) {
      const newFiles = Array.from((e as React.DragEvent<HTMLDivElement>).dataTransfer.files).filter(file => 
        ['.xlsx', '.xls', '.csv'].some(ext => file.name.toLowerCase().endsWith(ext))
      );

      if (newFiles.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
        setError(null);
        setSuccess(null);
        handleSubmit([...files, ...newFiles]);
        // setExcel(newFiles.map(file => file.name));
      } else {
        setError('Please upload a valid Excel file (.xlsx, .xls, .csv)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length == 1) {
      const newFiles = Array.from(e.target.files).filter(file => 
        ['.xlsx', '.xls', '.csv'].some(ext => file.name.toLowerCase().endsWith(ext))
      );
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setError(null);
      setSuccess(null);
      handleSubmit([...files, ...newFiles]);
    } else {
      alert("Please upload a single valid Excel file (.xlsx, .xls, .csv)")
      setError('Please upload a single valid Excel file (.xlsx, .xls, .csv)...');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setExcel([]);
  };

  return (
      <div className="w-full max-w-2xl relative p-2">
        <form onSubmit={() => handleSubmit(files)} className="space-y-4">
          {files.length > 0 ? (
            <div className="">
            <ul className="pt-4 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="bg-violetLight border border-green border-dashed px-6 py-5 rounded"
                >
                  <span className="flex items-center gap-1">
                    <i className="fi fi-sr-add-document text-sm flex items-center text-violet" />
                    <h1 className="text-sm font-semibold text-violet truncate">Uploaded Excel File ({files.length})</h1>

                  </span>
                  <span className="flex items-center justify-between ">
                    <span className="text-xs text-gray-500 text-wrap p-2 max-w-xs truncate">
                      {file.name}
                    </span>
                    <button
                      title='remove'
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <i className="fi fi-sr-trash text-sm" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          ) : (
            <div
              className={`my-1 px-6 pt-5 pb-6 border border-violet border-dashed bg-violetLight rounded-lg ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
            >
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                onClick={handleFileInputClick}
                accept=".xlsx,.xls,.csv"
                ref={fileInputRef}
                multiple
              />
               <label
                htmlFor="file-upload"
                className="cursor-pointer flex items-center justify-center gap-1"
              >
                <i className="fi fi-sr-add-document text-sm flex items-center text-violet" />
                <p className="text-sm text-violet dark:text-gray-300 font-medium hover:text-[var(--primary-dark)] truncate">
                  Upload Log Report Excel
                </p>
              </label>
              <p className="text-xs text-gray-500">
                Excel files up to 10MB (.xlsx, .xls, .csv)
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 text-sm text-green-600">
              {success}
            </div>
          )}
        </form>
      </div>
  );
}



interface mediaFile {
  fileType: string;
  fileName: string;
  url: string;
}

interface UploadMediaFilesProps {
  setImages: (images: mediaFile[]) => void;
}

export function UploadMediaFiles({ setImages }: UploadMediaFilesProps) {
  // const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    // files.forEach(file => {
    //   imageExt.push(file.type.split("/")[-1]);
    // });
    const fileUploadPromises = files.map(async (file) => {
      const s3Url = await getS3Url(file);
      console.log('Uploading file:', file.name);
      return {
        fileType: file.type,
        fileName: file.name,
        url: s3Url,
      };
    });

    // Wait for all file uploads to complete
    const fileUrls = await Promise.all(fileUploadPromises);

    setImages(fileUrls)
  };

  const handleDropZoneClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        ['.jpeg', '.png', '.jpg'].some(ext => file.name.toLowerCase().endsWith(ext))
      );

      if (newFiles.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
        setError(null);
        setSuccess(null);
      } else {
        setError('Please upload a valid media file (.jpeg, .png, .jpg)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files)
    if (e.target.files && e.target.files.length == 1) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
      const newFiles = Array.from(e.target.files).filter(file => 
        validTypes.includes(file.type)
      );
      setFiles(prev => [...prev, ...newFiles]);
      handleSubmit([...files, ...newFiles])
    } else {
      alert("Please upload a single valid media file (.jpeg, .png, .jpg)")
      setError('Please upload a single valid media file (.jpeg, .png, .jpg)');

    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setImages([]);
    setIsUploading(false);
    fileInputRef.current = null;
  };

  return (
    <div className="w-full max-w-2xl p-2 relative">
      <form onSubmit={() => handleSubmit(files)} className="">
        {files.length > 0 ? (
          <div className="">
            <ul className="pt-4 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="bg-violetLight border border-green border-dashed px-6 py-5 rounded"
                >
                  <span className="flex items-center gap-1">
                    <i className="fi fi-sr-add-image text-sm flex items-center text-violet" />
                    <h1 className="text-sm font-semibold text-violet truncate">Uploaded Media File ({files.length})</h1>

                  </span>
                  <span className="flex items-center justify-between ">
                    <span className="text-xs text-gray-500 text-wrap p-2 max-w-xs truncate">
                      {file.name}
                    </span>
                    <button
                      title='remove'
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <i className="fi fi-sr-trash text-sm" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div
            className={`my-1 flex flex-col justify-center px-6 pt-5 pb-6 border border-violet border-dashed bg-violetLight  rounded-lg ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} ${isUploading ? 'opacity-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDropZoneClick}
          >
            <input
              type="file"
              id="media-upload"
              multiple
              accept="image/jpeg, image/png, image/jpg, video/mp4"
              onChange={handleFileChange}
              onClick={handleFileInputClick}
              ref={fileInputRef}
              disabled={isUploading}
              className="hidden"
            />
            <label
              htmlFor="media-upload"
              className="cursor-pointer flex items-center justify-center gap-1"
            >
              <i className="fi fi-sr-add-image text-sm flex items-center text-violet" />
              <p className="text-sm text-violet dark:text-gray-300 font-medium hover:text-[var(--primary-dark)] truncate">
                Upload Monitoring Picture
              </p>
              
            </label>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              MP4, JPEG, JPG, PNG (MAX. 100MB)
            </p>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        {success && (
          <div className="mt-4 text-sm text-green-600">
            {success}
          </div>
        )}
      </form>
    </div>
  );
}


export function UploadFiles({ type = 'media', setImages, setExcel }: { type?: string, setImages: (images: mediaFile[]) => void, setExcel: (excel: excelFile[]) => void }) {
  
  return (
    <div className='w-full'>
      {type === "media" && (
        <UploadMediaFiles setImages={setImages} />
      )}
      {type === "excel" && (
        <UploadExcelFile setExcel={setExcel} />
      )}
    </div>
  )
}