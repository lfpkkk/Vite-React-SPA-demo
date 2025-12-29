import { Link } from 'react-router-dom'

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

export default Home