import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface UploadedFile {
  filename: string
  size: number
  mimetype: string
  uploadDate: string
}

function Upload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchUploadedFiles()
  }, [])

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch('http://localhost:3000/files')
      if (response.ok) {
        const files = await response.json()
        setUploadedFiles(files)
      }
    } catch (error) {
      console.error('Failed to fetch uploaded files:', error)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      setSelectedFiles(prev => [...prev, ...Array.from(files)])
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    handleFileSelect(event.dataTransfer.files)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    const formData = new FormData()
    selectedFiles.forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        alert('Files uploaded successfully!')
        setSelectedFiles([])
        fetchUploadedFiles()
      } else {
        alert('Upload failed!')
      }
    } catch (error) {
      alert('Upload failed!')
    } finally {
      setUploading(false)
    }
  }

  const downloadFile = (filename: string) => {
    window.open(`http://localhost:3000/files/${filename}`)
  }

  const deleteFile = async (filename: string) => {
    try {
      const response = await fetch(`http://localhost:3000/files/${filename}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchUploadedFiles()
      } else {
        alert('Delete failed!')
      }
    } catch (error) {
      alert('Delete failed!')
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(selectedFiles)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedFiles(items)
  }

  const renderPreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <img src={URL.createObjectURL(file)} alt={file.name} className="preview-image" />
    }
    return <div className="file-icon">📄</div>
  }

  return (
    <div className="upload">
      <h1>Large File Upload</h1>
      <Link to="/" className="back-link">← Back to Home</Link>

      <div className="upload-section">
        <h2>Select Files</h2>
        <div
          className={`dropzone ${isDragOver ? 'active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
          <div className="dropzone-content">
            <div className="icon">📁</div>
            <p>{isDragOver ? 'Drop the files here...' : 'Drag & drop files here, or click to select'}</p>
            <small>Supports multiple files</small>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h3>Selected Files ({selectedFiles.length})</h3>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="selected-files">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="file-list">
                    {selectedFiles.map((file, index) => (
                      <Draggable key={index} draggableId={index.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="file-item"
                          >
                            {renderPreview(file)}
                            <div className="file-details">
                              <p><strong>{file.name}</strong></p>
                              <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button onClick={() => removeSelectedFile(index)} className="remove-btn">×</button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button onClick={handleUpload} disabled={uploading} className="upload-btn">
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>

      <div className="uploaded-section">
        <h2>Uploaded Files</h2>
        <div className="file-list">
          {uploadedFiles.map((file) => (
            <div key={file.filename} className="file-item">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <p><strong>{file.filename}</strong></p>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="file-actions">
                <button onClick={() => downloadFile(file.filename)} className="download-btn">↓</button>
                <button onClick={() => deleteFile(file.filename)} className="delete-btn">×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Upload