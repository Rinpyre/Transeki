import { useState } from 'react'
import { handleSearch } from '@handlers'
import { MangaCard, MangaContainer, SearchBar } from '@components'

const BrowsePage = () => {
    const [mangaList, setMangaList] = useState([])

    const onSearch = async (query) => {
        const results = await handleSearch(query)
        setMangaList(results || [])
    }

    return (
        <div className="browse-page flex h-screen flex-1 flex-col items-center space-y-4 overflow-y-auto p-6">
            <SearchBar onSearch={onSearch} className="w-1/2! max-w-3xl min-w-85" />
            <MangaContainer>
                {mangaList.map((manga) => (
                    <MangaCard key={manga.id} manga={manga} />
                ))}
            </MangaContainer>
        </div>
    )
}

export default BrowsePage
