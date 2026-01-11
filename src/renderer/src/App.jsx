import { useState } from 'react'
import axios from 'axios'
import MangaCard from './components/MangaCard'
import MangaContainer from './components/MangaContainer'
import SearchBar from './components/SearchBar'

function App() {
    const [mangaList, setMangaList] = useState([])

    const handleSearch = async (query) => {
        if (query.trim()) {
            const baseUrl = 'https://api.mangadex.org'
            const resp = await axios({
                method: 'GET',
                url: `${baseUrl}/manga`,
                params: {
                    title: query,
                    includes: ['cover_art'],
                    limit: 10
                }
            })
            console.log(resp.data)
            const newMangaList = resp.data.data.map((manga) => {
                const titles = manga.attributes.title
                // Find the first title with a '-ro' suffix (e.g., ja-ro, ko-ro, etc.)
                const romanizedTitleKey = Object.keys(titles).find((key) => key.endsWith('-ro'))
                return {
                    id: manga.id,
                    title:
                        titles['en'] ||
                        (romanizedTitleKey && titles[romanizedTitleKey]) ||
                        'No Title',
                    cover: `https://uploads.mangadex.org/covers/${manga.id}/${manga.relationships.find((r) => r.type === 'cover_art').attributes.fileName}.256.jpg`
                }
            })
            console.log(newMangaList)
            setMangaList(newMangaList)
        }
    }

    return (
        <div className="app relative flex min-h-screen flex-col items-center justify-center bg-gray-900">
            <div className="content w-10/12 max-w-7xl space-y-8">
                <SearchBar onSearch={handleSearch} />
                <MangaContainer>
                    {mangaList.map((manga) => (
                        <MangaCard key={manga.id} manga={manga} />
                    ))}
                </MangaContainer>
            </div>
        </div>
    )
}

export default App
