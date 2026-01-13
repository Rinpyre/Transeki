import axios from 'axios'

// TODO: Remove debug console.log() after proper implementation

const baseUrl = 'https://api.mangadex.org'
const noCoverUrl = 'https://via.placeholder.com/128x192?text=No+Cover'

const getTitleForManga = (titles, altTitles = []) => {
    // Prefer default en title
    if (titles['en']) {
        return titles['en']
    }

    // Search altTitles for English title
    const enAltTitle = altTitles.find((alt) => alt.en)
    if (enAltTitle) {
        return enAltTitle.en
    }

    // Find the first title with a '-ro' suffix (e.g., ja-ro, ko-ro, etc.)
    const romanizedTitleKey = Object.keys(titles).find((key) => key.endsWith('-ro'))
    if (romanizedTitleKey) {
        return titles[romanizedTitleKey]
    }

    // Use any available title from the titles object
    const firstAvailableKey = Object.keys(titles)[0]
    return firstAvailableKey ? titles[firstAvailableKey] : 'No Title'
}

const getCoverUrlForManga = (mangaId, relationships) => {
    const coverArtRel = relationships.find((r) => r.type === 'cover_art')
    const coverFileName = coverArtRel?.attributes?.fileName

    return coverFileName
        ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}.256.jpg`
        : noCoverUrl
}

export const handleSearch = async (query) => {
    try {
        const resp = await axios({
            method: 'GET',
            url: `${baseUrl}/manga`,
            params: {
                title: query,
                includes: ['cover_art'],
                limit: 10
            }
        })
        console.log(`Received response for query "${query}":`, resp.data)
        const newMangaList = resp.data.data.map((manga) => {
            const titles = manga.attributes.title
            const altTitles = manga.attributes.altTitles || []

            return {
                id: manga.id,
                title: getTitleForManga(titles, altTitles),
                cover: getCoverUrlForManga(manga.id, manga.relationships)
            }
        })
        console.log(`Mapped manga list for query "${query}":`, newMangaList)
        return [...newMangaList]
    } catch (error) {
        console.error('Error occurred while fetching manga list from MangaDex API:', error)
        return []
    }
}
