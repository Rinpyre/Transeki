import { useState } from 'react'
import { handleSearch } from '@handlers'
import { MangaCard, MangaContainer, SearchBar } from '@components'
import { MangaPanel } from '@components'
import { sleep } from '@utils'
import { demoDatumManga } from '@components'

const BrowsePage = () => {
    const [mangaList, setMangaList] = useState([])
    const [selectedManga, setSelectedManga] = useState(demoDatumManga)
    const [isPanelOpen, setIsPanelOpen] = useState(true)
    const [isPanelLoading, setIsPanelLoading] = useState(false)

    const onSearch = async (query) => {
        const results = await handleSearch(query)
        setMangaList(results || [])
    }

    const handleMangaCardClick = async (mangaID) => {
        console.log('Manga Card Clicked:', mangaID)
        // Fetch manga data by ID (this is a placeholder, replace with actual data fetching logic)
        setIsPanelOpen(true)
        setIsPanelLoading(true)
        await sleep(500)
        const mangaListItem = mangaList.find((manga) => manga.id === mangaID)

        const mangaData = {
            ...demoDatumManga, // <- Copy all properties from demo
            ...(mangaListItem && {
                // <- If found in list, override these
                title: mangaListItem.title,
                cover: mangaListItem.cover,
                id: mangaListItem.id
            })
        }
        console.log('Selected Manga Data:', mangaData)
        setSelectedManga(mangaData)
        setIsPanelLoading(false)
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
            <MangaPanel
                className="-translate-y-[46%]"
                manga={selectedManga}
                onClose={() => setIsPanelOpen(false)}
                open={isPanelOpen}
                loading={isPanelLoading}
            />
            <MangaContainer>
                {mangaList.map((manga) => (
                    <MangaCard
                        key={manga.id}
                        manga={manga}
                        onClick={() => handleMangaCardClick(manga.id)}
                    />
                ))}
            </MangaContainer>
        </div>
    )
}

export default BrowsePage
