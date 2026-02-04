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
    id: 'demo-manga-1',
    title: 'Demo Manga Title',
    cover: 'https://placehold.co/150x220.png?text=Demo+Manga+Cover',
    description: `This is a demo description for the manga. It provides an overview of the plot, characters, and setting. The story follows the adventures of a young hero as they navigate a world filled with magic, danger, and intrigue. Along the way, they encounter allies and enemies, uncover hidden secrets, and face challenges that test their resolve and courage. Will they rise to the occasion and fulfill their destiny? Read on to find out!`,
    status: 'Ongoing',
    author: 'Jane Doe',
    genres: ['Action', 'Adventure', 'Fantasy', 'Drama', 'Romance', 'Mystery', 'Comedy'],
    chapters: [
        { number: 1, title: 'Chapter 1: The Beginning', releaseDate: '2023-01-01' },
        { number: 2, title: 'Chapter 2: The Journey', releaseDate: '2023-01-15' },
        { number: 3, title: 'Chapter 3: The Encounter', releaseDate: '2023-02-01' },
        { number: 4, title: 'Chapter 4: The Challenge', releaseDate: '2023-02-15' },
        { number: 5, title: 'Chapter 5: The Revelation', releaseDate: '2023-03-01' }
    ],
    source: 'MangaDex'
}
