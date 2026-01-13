const MangaCard = ({ manga }) => {
    return (
        <div className="manga-card group bg-secondary flex w-fit flex-col gap-2 rounded-lg p-4 shadow-md transition-shadow duration-300 hover:shadow-xl">
            <div className="image overflow-hidden rounded-md hover:cursor-pointer">
                <img
                    src={manga.cover}
                    alt={manga.title}
                    className="cover-image object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <h3
                className="title text-snow hover:text-accent line-clamp-2 text-lg font-semibold hover:cursor-pointer hover:underline"
                title={manga.title}
            >
                {manga.title}
            </h3>
        </div>
    )
}

export default MangaCard
