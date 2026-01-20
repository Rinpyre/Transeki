const MangaCard = ({ manga }) => {
    return (
        <div className="manga-card group flex w-full flex-col rounded-lg transition-all duration-300 will-change-transform hover:-translate-y-1">
            <div className="image overflow-hidden rounded-md hover:cursor-pointer">
                <img
                    src={manga.cover}
                    alt={manga.title}
                    className="cover-image h-64 w-full transition-transform duration-300"
                />
            </div>
            <div className="info p-1">
                <h3
                    className="title text-snow hover:text-accent line-clamp-2 text-[1em] hover:cursor-pointer hover:underline"
                    title={manga.title}
                >
                    {manga.title}
                </h3>
            </div>
        </div>
    )
}

export default MangaCard
