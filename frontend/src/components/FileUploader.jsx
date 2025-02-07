import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUploader = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    onFileUpload(acceptedFiles);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="border-dashed border-2 border-gray-400 p-4 rounded-lg text-center">
      <input {...getInputProps()} accept="image/*,video/*,application/pdf" />
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <p>Drag & drop some files here, or click to select files</p>
      )}
    </div>
  );
};

export default FileUploader;