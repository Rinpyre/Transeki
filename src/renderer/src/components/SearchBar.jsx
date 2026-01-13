import { useState } from 'react'
import { Search } from 'lucide-react'

const SearchBar = ({ onSearch, className = '' }) => {
    const [searchInput, setSearchInput] = useState('')
    const [underlineFocused, setUnderlineFocused] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        onSearch(searchInput)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={
                'search-bar bg-secondary sticky -top-3.5 z-2 flex h-13.5 w-full items-center gap-2 rounded-4xl p-2 shadow-xl shadow-black/30' +
                ` ${className}`
            }
        >
            <div className="search-wrapper bg-tertiary relative flex h-full grow flex-col items-center overflow-hidden rounded-md rounded-s-4xl">
                <input
                    autoFocus
                    type="text"
                    placeholder="Search for new manga..."
                    onChange={(e) => setSearchInput(e.target.value)}
                    value={searchInput}
                    className="text-snow h-full w-full p-1.5 pl-2.5 placeholder-gray-400 focus:outline-none"
                    onFocus={() => setUnderlineFocused(true)}
                    onBlur={() => setUnderlineFocused(false)}
                />
                <div
                    className={`${underlineFocused ? 'bg-accent-dark scale-x-100' : 'scale-x-0 bg-transparent'} absolute bottom-px h-0.5 w-full origin-center rounded-b-xl transition-transform duration-300`}
                    id="underline"
                ></div>
            </div>
            <button
                type="submit"
                className="bg-accent-dark hover:bg-accent text-snow flex h-full items-center justify-center rounded-md rounded-e-4xl px-2 py-2 transition-colors duration-300 hover:cursor-pointer"
            >
                <Search size={20} className="mr-1" />
            </button>
        </form>
    )
}

export default SearchBar
