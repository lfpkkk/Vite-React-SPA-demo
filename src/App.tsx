import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import './App.css'

function Home() {
  return (
    <div className="home">
      <h1>Welcome to the SPA</h1>
      <ul className="entry-list">
        <li>
          <Link to="/upload">Large File Upload</Link>
        </li>
      </ul>
    </div>
  )
}

function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
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

  const handleUpload = () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100
        setProgress(percentComplete)
      }
    })

    xhr.addEventListener('load', () => {
      setUploading(false)
      alert('Upload complete!')
      setFile(null)
      setProgress(0)
    })

    xhr.addEventListener('error', () => {
      setUploading(false)
      alert('Upload failed!')
    })

    xhr.open('POST', 'http://localhost:3000/upload')
    const formData = new FormData()
    formData.append('file', file)
    xhr.send(formData)
  }

  return (
    <div className="upload">
      <h1>Large File Upload</h1>
      <Link to="/" className="back-link">← Back to Home</Link>
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
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
        {file ? (
          <div className="file-info">
            <p>Selected file: <strong>{file.name}</strong></p>
            <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button onClick={handleUpload} disabled={uploading} className="upload-btn">
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        ) : (
          <div className="dropzone-content">
            <div className="icon">📁</div>
            <p>{isDragOver ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}</p>
            <small>Supports images, videos, audio, documents, and more</small>
          </div>
        )}
      </div>
      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{progress.toFixed(1)}%</span>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </Router>
  )
}

export default App
