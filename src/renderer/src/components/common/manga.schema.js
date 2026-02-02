// Manga base schema with demo data
export const mangaSchema = {
    id: '',
    title: '',
    cover: '',
    description: '',
    status: 'Ongoing', // 'Ongoing', 'Completed', 'Hiatus'
    author: '',
    genres: [],
    chapters: [],
    source: '' // MangaDex, MangaPlus, etc
}

// Demo manga data
export const demoDatumManga = {
    id: 'solo-leveling-1',
    title: 'Solo Leveling',
    cover: 'https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/e90bdc47-c8b9-4df7-b2c0-17641b645ee1.jpg.256.jpg',
    description: `In a world where hunters with magical abilities fight deadly monsters to protect humanity, an E-rank hunter named Sung Jin-Woo embarks on a journey to become the strongest hunter after a near-death experience in a dangerous dungeon. With newfound powers, he must navigate a world of powerful beings, hidden dungeons, and mysterious gates while uncovering the secrets behind his sudden rise to strength.`,
    status: 'Ongoing',
    author: 'Chugong',
    genres: ['Action', 'Adventure', 'Fantasy', 'Supernatural'],
    chapters: [
        { number: 250, title: 'The Awakening', date: '2024-06-20', read: false },
        { number: 249, title: 'The Final Battle', date: '2024-06-13', read: true },
        { number: 248, title: 'Rise of the Monarchs', date: '2024-06-06', read: true },
        { number: 247, title: 'Shadows of the Past', date: '2024-05-30', read: false },
        { number: 246, title: 'The Lost City', date: '2024-05-23', read: true }
    ],
    source: 'MangaDex'
}
