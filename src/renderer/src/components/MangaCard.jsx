const MangaCard = ({ manga }) => {
    return (
        <div
            className="manga-card group bg-secondary flex w-full flex-col rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl"
            style={{ fontSize: 'clamp(12px, 8vw, 20px)' }}
        >
            <div className="image overflow-hidden rounded-t-md hover:cursor-pointer">
                <img
                    src={manga.cover}
                    alt={manga.title}
                    className="cover-image h-64 w-full transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="info p-2">
                <h3
                    className="title text-snow hover:text-accent line-clamp-2 text-[0.8em] font-semibold hover:cursor-pointer hover:underline"
                    title={manga.title}
                >
                    {manga.title}
                </h3>
            </div>
        </div>
    )
}

export default MangaCard
