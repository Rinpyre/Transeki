import { useState } from 'react'
import logo from '../assets/logo.png'

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
            className="search-bar flex h-fit w-full items-center gap-3.5 rounded-2xl bg-gray-800 p-4 shadow-lg"
        >
            <img src={logo} alt="Logo" className="h-8 w-8" />
            <input
                type="text"
                placeholder="Search..."
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
                className="grow rounded bg-gray-700 p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-800 focus:outline-none"
            />
            <button
                type="submit"
                className="rounded bg-pink-800 px-4 py-2 text-white hover:bg-pink-700"
            >
                Add
            </button>
        </form>
    )
}

export default SearchBar
