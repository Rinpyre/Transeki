import { useState } from 'react'
import { handleSearch } from '@handlers'
import { MangaCard, MangaContainer, SearchBar } from '@components'

const BrowsePage = () => {
    const [mangaList, setMangaList] = useState([])

    const onSearch = async (query) => {
        const results = await handleSearch(query)
        setMangaList(results || [])
    }

    const scrollableStyle = {
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    }

    return (
        <div
            className="browse-page relative flex h-screen w-full flex-1 flex-col items-center overflow-hidden overflow-y-auto p-6"
            style={scrollableStyle}
        >
            <SearchBar onSearch={onSearch} className="mb-2 w-1/2! max-w-3xl min-w-85" />
            <MangaContainer>
                {mangaList.map((manga) => (
                    <MangaCard key={manga.id} manga={manga} />
                ))}
            </MangaContainer>
        </div>
    )
}

export default BrowsePage
