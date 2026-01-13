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
        <div className="content flex h-screen w-10/12 max-w-7xl flex-1 flex-col items-center space-y-4 overflow-y-auto p-6">
            <SearchBar onSearch={onSearch} />
            <MangaContainer>
                {mangaList.map((manga) => (
                    <MangaCard key={manga.id} manga={manga} />
                ))}
            </MangaContainer>
        </div>
    )
}

export default BrowsePage
