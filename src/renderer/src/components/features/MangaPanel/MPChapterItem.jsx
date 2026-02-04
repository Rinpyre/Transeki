import { BookCheck as Read } from 'lucide-react'

const MangaChapterItem = ({ name, date, read = false }) => {
    return (
        <div
            className={`chapter-item hover:bg-primary/50 border-b-tertiary ${read ? 'opacity-60' : ''} flex cursor-pointer items-center justify-between border-b px-1 py-3 transition-colors`}
        >
            <div className="ch-info flex flex-col justify-between">
                <span className={`chapter-title ${read ? 'text-gray-500' : 'text-snow'}`}>
                    {name}
                </span>
                <span
                    className={`chapter-date text-sm ${read ? 'text-gray-600' : 'text-metadata'}`}
                >
                    {date}
                </span>
            </div>
            {read && (
                <div className="ch-read mr-2">
                    <Read className="text-accent-light/80" size={21} />
                </div>
            )}
        </div>
    )
}

export default MangaChapterItem
