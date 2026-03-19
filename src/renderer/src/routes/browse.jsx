import { useState, useEffect } from 'react'
import { MangaPanel, MangaCard, SearchBar, SourceRow } from '@components'

export const BrowsePage = () => {
    const [searched, setSearched] = useState(false)
    const [searchState, setSearchState] = useState({})
    const [selectedManga, setSelectedManga] = useState({})
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [isPanelLoading, setIsPanelLoading] = useState(false)
    const [sources, setSources] = useState([])

    useEffect(() => {
        window.plugins.getPlugins().then((plugins) => {
            console.log('Available Plugins:', plugins)
            setSources(plugins)
        })
    }, [])

    const onSearch = async (query) => {
        if (!searched) setSearched(true)
        setIsPanelOpen(false)

        // Initialize state for all sources
        const initialState = {}
        sources.forEach((source) => {
            initialState[source.id] = { loading: true, results: [], error: null }
        })
        setSearchState(initialState)

        // Fire all searches in parallel
        sources.forEach((source) => {
            window.plugins
                .search(source.id, query)
                .then((sourceResults) => {
                    setSearchState((prev) => ({
                        ...prev,
                        [source.id]: { loading: false, results: sourceResults || [], error: null }
                    }))
                })
                .catch((err) => {
                    console.error(`Error searching ${source.name}:`, err)
                    setSearchState((prev) => ({
                        ...prev,
                        [source.id]: {
                            loading: false,
                            results: [],
                            error: err.message || 'Failed to search'
                        }
                    }))
                })
        })
    }

    // TODO: Remove all console.log statements after debugging
    const handleMangaCardClick = async (mangaId, sourceId) => {
        console.log('Manga Card Clicked:', { mangaId, sourceId })
        setIsPanelOpen(true)
        setIsPanelLoading(true)

        let mangaData = await window.plugins.getManga(sourceId, mangaId)
        mangaData.sourceId = sourceId // Ensure sourceId is included in mangaData for proxying
        console.log('Selected Manga Data:', mangaData)
        setSelectedManga(mangaData)
        setIsPanelLoading(false)
    }

    return (
        <div className="browse-page scroll-none relative flex h-screen w-full flex-1 flex-col items-center overflow-hidden overflow-y-auto p-6">
            <SearchBar onSearch={onSearch} className="mb-2 w-1/2! max-w-3xl min-w-85" />
            <MangaPanel
                className="-translate-y-[46%]"
                manga={selectedManga}
                onClose={() => setIsPanelOpen(false)}
                open={isPanelOpen}
                loading={isPanelLoading}
            />

            {searched ? (
                <div className="flex w-full flex-col gap-2 pt-4">
                    {sources.map((source) => {
                        const state = searchState[source.id]
                        if (!state) return null

                        return (
                            <SourceRow key={source.id} source={source}>
                                {state.loading ? (
                                    <div className="loading text-snow/70">Loading...</div>
                                ) : state.error ? (
                                    <div className="error text-error">Error: {state.error}</div>
                                ) : state.results && state.results.length > 0 ? (
                                    state.results.map((manga) => (
                                        <MangaCard
                                            key={manga.id}
                                            manga={manga}
                                            sourceId={source.id}
                                            onClick={() =>
                                                handleMangaCardClick(manga.id, source.id)
                                            }
                                        />
                                    ))
                                ) : (
                                    <div className="no-results text-error">No results found.</div>
                                )}
                            </SourceRow>
                        )
                    })}
                </div>
            ) : (
                <div className="welcome-message text-snow mt-20 text-center">
                    <h1 className="text-4xl font-bold">Welcome to Transeki!</h1>
                    <p className="text-snow/70 mt-4 text-lg">
                        Start by searching for a manga above.
                    </p>
                </div>
            )}
        </div>
    )
}
