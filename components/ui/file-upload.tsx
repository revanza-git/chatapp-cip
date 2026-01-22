import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { 
  Upload, 
  File, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Loader2
} from 'lucide-react';

interface FileUploadProps {
  onFileUploaded?: (data: {
    fileName: string;
    fileSize: number;
    fileId: string;
    webViewLink: string;
  }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

interface UploadedFile {
  file: File;
  fileId?: string;
  webViewLink?: string;
  uploading: boolean;
  error?: string;
  success: boolean;
}

export function FileUpload({
  onFileUploaded,
  onError,
  disabled = false,
  maxSize = 25 * 1024 * 1024, // 25MB default
  acceptedFileTypes = ['.pdf', '.txt', '.md']
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const uploadFile = async (file: File) => {
    try {
      const { uploadFile: apiUploadFile } = await import('@/lib/api');
      const data = await apiUploadFile(file);
      
      // Local storage response format: { fileId, webViewLink }
      if (data.fileId && onFileUploaded) {
        onFileUploaded({
          fileName: file.name,
          fileSize: file.size,
          fileId: data.fileId,
          webViewLink: data.webViewLink,
        });
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;

    for (const file of acceptedFiles) {
      // Add file to the list as uploading
      const fileId = Math.random().toString(36).substr(2, 9);
      const uploadedFile: UploadedFile = {
        file,
        uploading: true,
        success: false,
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      try {
        const result = await uploadFile(file);
        
        // Update file status with Google Cloud Storage info
        setUploadedFiles(prev => 
          prev.map((f, index) => 
            index === prev.length - 1 
              ? { 
                  ...f, 
                  uploading: false, 
                  success: true, 
                  fileId: result.fileId,
                  webViewLink: result.webViewLink
                }
              : f
          )
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        // Update file status with error
        setUploadedFiles(prev => 
          prev.map((f, index) => 
            index === prev.length - 1 
              ? { 
                  ...f, 
                  uploading: false, 
                  success: false, 
                  error: errorMessage 
                }
              : f
          )
        );

        if (onError) {
          onError(errorMessage);
        }
      }
    }
  }, [disabled, onFileUploaded, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxSize,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    multiple: false, // Only allow one file at a time for simplicity
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadedFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return <File className="w-4 h-4 text-red-500" />;
      case 'txt':
      case 'md':
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported: PDF, TXT, MD files (max {formatFileSize(maxSize)})
                </p>
                <Button variant="outline" disabled={disabled}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Uploaded Files</h4>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
            
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getFileIcon(uploadedFile.file.name)}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {uploadedFile.uploading && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <Badge variant="secondary">Uploading...</Badge>
                        </>
                      )}
                      
                      {uploadedFile.success && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Uploaded Successfully
                          </Badge>
                        </>
                      )}
                      
                      {uploadedFile.error && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <Badge variant="destructive">Failed</Badge>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Show uploaded files with download links */}
            {uploadedFiles.some(f => f.success && f.webViewLink) && (
              <div className="mt-4 pt-4 border-t">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Files:
                </h5>
                {uploadedFiles
                  .filter(f => f.success && f.webViewLink)
                  .map((file, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-white p-3 rounded border">
                      <div className="font-medium mb-1">{file.file.name}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        File ID: {file.fileId}
                      </div>
                      <a 
                        href={`http://localhost:8080${file.webViewLink}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                        download
                      >
                        Download file →
                      </a>
                    </div>
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 