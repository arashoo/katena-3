import { useState } from 'react'
import './SearchBar.css'

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  const clearSearch = () => {
    setSearchTerm('')
    onSearch('')
  }

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search by dimensions (inches), color, project, or rack number..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        {searchTerm && (
          <button onClick={clearSearch} className="clear-search">
            ×
          </button>
        )}
      </div>
      <div className="search-tips">
        Search tips: Try searching by dimensions in inches (e.g., "48"), color, project name, or rack number
      </div>
    </div>
  )
}

export default SearchBar
