import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
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
    })

    xhr.addEventListener('error', () => {
      setUploading(false)
      alert('Upload failed!')
    })

    xhr.open('POST', 'http://localhost:3000/upload') // Local backend endpoint
    const formData = new FormData()
    formData.append('file', file)
    xhr.send(formData)
  }

  return (
    <div className="app">
      <h1>Large File Upload</h1>
      <input type="file" onChange={handleFileChange} />
      {file && (
        <div>
          <p>Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
      {uploading && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
          <span>{progress.toFixed(2)}%</span>
        </div>
      )}
    </div>
  )
}

export default App
