import { getProxyUrl } from '@utils'

export const MangaCard = ({ manga, onClick }) => {
    return (
        <div
            className="manga-card group flex w-30 shrink-0 flex-col rounded-lg transition-all duration-300 will-change-transform hover:-translate-y-1 xl:w-40"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick?.()
                }
            }}
        >
            <div className="image aspect-2/3 overflow-hidden rounded-md hover:cursor-pointer">
                <img
                    src={getProxyUrl('proxy', manga.cover)}
                    alt={manga.title}
                    className="cover-image h-full w-full transition-transform duration-300"
                    draggable="false"
                />
            </div>
            <div className="info p-1">
                <h3
                    className="title text-snow group-hover:text-accent line-clamp-2 text-sm transition-colors duration-300 hover:cursor-pointer xl:text-base"
                    title={manga.title}
                >
                    {manga.title}
                </h3>
            </div>
        </div>
    )
}
