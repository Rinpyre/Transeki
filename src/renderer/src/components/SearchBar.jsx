import { useState } from 'react'
import logo from '@assets/logo.png'

const SearchBar = ({ onSearch }) => {
    const [searchInput, setSearchInput] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        onSearch(searchInput)
        setSearchInput('')
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="search-bar bg-secondary sticky -top-3.5 z-2 flex h-fit w-full items-center gap-3.5 rounded-2xl p-4 shadow-lg shadow-black/30"
        >
            <img src={logo} alt="Logo" className="h-8 w-8" />
            <input
                type="text"
                placeholder="Search..."
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
                className="bg-tertiary focus:ring-accent-dark text-snow grow rounded p-2 placeholder-gray-400 focus:ring-2 focus:outline-none"
            />
            <button
                type="submit"
                className="bg-accent-dark hover:bg-accent text-snow rounded px-4 py-2 transition-colors duration-300 hover:cursor-pointer"
            >
                Add
            </button>
        </form>
    )
}

export default SearchBar
