function MangaCard({ manga }) {
    return (
        <div className="manga-card group flex w-fit flex-col gap-2 rounded-lg bg-gray-800 p-4 shadow-md transition-shadow duration-300 hover:shadow-xl">
            <div className="image overflow-hidden rounded-md hover:cursor-pointer">
                <img
                    src={manga.cover}
                    alt={manga.title}
                    className="cover-image object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <h3
                className="title line-clamp-2 text-lg font-semibold text-white hover:cursor-pointer hover:text-pink-600 hover:underline"
                title={manga.title}
            >
                {manga.title}
            </h3>
        </div>
    )
}

export default MangaCard
