import { useState, useRef, useEffect } from 'react'
import {
    Heart as Favorite,
    RefreshCcw as Tracking,
    Earth as Link,
    Share2 as Share,
    ChevronDown as ShowMoreDown,
    ChevronUp as ShowMoreUp,
    X as Close
} from 'lucide-react'
import {
    MPActionBtn,
    MPChapterItem,
    MPGenreBadge,
    MPMetadataItem,
    RippleLoading
} from '@components'

const MangaPanel = ({ manga, onClose, open = false, loading = false, className = '' }) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [contentHeight, setContentHeight] = useState(0)
    const contentRef = useRef(null)

    const scrollableStyle = {
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    }

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight)
        }
    }, [isDescriptionExpanded])

    return (
        <div
            className={
                `manga-panel bg-secondary fixed top-1/2 ${open ? 'right-6' : '-right-150'} z-2 h-9/12 w-[28%] min-w-88 -translate-y-1/2 overflow-visible rounded-xl pb-4 shadow-xl transition-all duration-300 ease-in-out` +
                ` ${className}`
            }
        >
            {loading && <RippleLoading />}
            <div
                className={`manga-panel-content ${loading ? 'overflow-hidden' : 'overflow-y-scroll'} h-full w-full`}
                style={scrollableStyle}
            >
                <div className="close">
                    <button
                        className="close-btn hover:bg-accent-dark/30 bg-secondary absolute -top-2.5 -right-2.5 z-1 cursor-pointer rounded-full p-1.5 transition-colors duration-200"
                        title="Close Panel"
                        onClick={onClose}
                    >
                        <Close
                            className="text-snow bg-primary/70 box-content rounded-full p-1.5 transition-colors duration-200"
                            size={16}
                        />
                    </button>
                </div>
                <div className="info text-snow relative h-auto w-full">
                    <div
                        id="backdrop"
                        className="absolute -z-1 h-full w-full rounded-md bg-cover bg-center bg-no-repeat opacity-10 blur-xs"
                        style={{
                            backgroundImage: `url(${manga.cover})`
                        }}
                    ></div>
                    <div className="flex px-4 pt-4 pb-2">
                        {/* Fixed the width of the cover */}
                        <div className="cover flex h-auto w-2/5 items-center overflow-hidden rounded-md shadow-md">
                            <img
                                src={manga.cover}
                                alt={manga.title}
                                className="transition-transform duration-300 will-change-transform hover:scale-105 hover:cursor-pointer"
                            />
                        </div>
                        <div className="flex w-full flex-col pl-4">
                            <h2 className="title line-clamp-3 text-2xl font-semibold text-ellipsis">
                                {manga.title}
                            </h2>
                            <div className="spacer grow"></div>
                            <div className="metadata">
                                <MPMetadataItem type="Status" value={manga.status} />
                                <MPMetadataItem type="Author" value={manga.author} />
                                <MPMetadataItem type="Source" value={manga.source} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="action-buttons flex gap-2 px-4 py-2 text-sm">
                    {/* Disabled for now until functionality is implemented */}
                    <MPActionBtn
                        name="Add to Library"
                        icon={Favorite}
                        id="addToLibraryBtn"
                        disabled
                    />
                    <MPActionBtn name="Tracking" icon={Tracking} id="trackingBtn" disabled />
                    <MPActionBtn
                        name="Open in WebView"
                        icon={Link}
                        id="openInWebViewBtn"
                        iconOnly
                        disabled
                    />
                    <MPActionBtn name="Share" icon={Share} id="shareBtn" iconOnly disabled />
                </div>
                <div
                    className="additional-info text-snow relative flex flex-col gap-2 overflow-hidden px-4 transition-all duration-300"
                    ref={contentRef}
                    style={{ maxHeight: isDescriptionExpanded ? `${contentHeight}px` : '116px' }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isDescriptionExpanded}
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setIsDescriptionExpanded((prev) => !prev)
                        }
                    }}
                >
                    <div className="description flex flex-col pb-2.5">
                        <h3 className="description-title text-metadata cursor-default text-lg font-semibold underline underline-offset-3">
                            {manga.type} Description:
                        </h3>
                        <p className="description-text mt-1 text-sm">{manga.description}</p>
                    </div>
                    {contentHeight > 120 && (
                        <button className="show-more absolute right-3 bottom-1 flex h-5 cursor-pointer px-1.5">
                            <span className="show-more-shadow from-secondary h-full w-10 bg-linear-to-l to-transparent"></span>
                            {isDescriptionExpanded ? (
                                <ShowMoreUp
                                    className="text-accent-light bg-secondary h-full"
                                    size={16}
                                />
                            ) : (
                                <ShowMoreDown
                                    className="text-accent-light bg-secondary h-full"
                                    size={16}
                                />
                            )}
                            <span
                                id="showMore"
                                className="text-accent-light bg-secondary text-sm font-semibold hover:underline"
                            >
                                {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                            </span>
                        </button>
                    )}
                    <div className="details-genres flex flex-wrap pb-7">
                        {manga.genres.map((genre) => {
                            const id = genre.toLowerCase().replace(/\s+/g, '-')
                            return <MPGenreBadge key={id} id={id} name={genre} />
                        })}
                    </div>
                </div>
                <div className="read-btn my-2 px-4">
                    <button className="bg-accent-dark hover:bg-accent-dark/70 w-full cursor-pointer rounded-full px-4 py-2 transition-colors duration-200">
                        Start Reading
                    </button>
                </div>
                <div className="chapter-list px-4">
                    <div className="chapter-list-header text-metadata border-b-tertiary cursor-default border-b px-1 py-1">
                        <h3 className="chapter-list-title">
                            {manga.chapters?.length || 0} chapters
                        </h3>
                    </div>
                    <div className="chapter-list-content mt-1 flex flex-col">
                        {manga.chapters?.map((chapter, idx) => (
                            <MPChapterItem
                                key={`${manga.id}-ch-${idx}`}
                                name={chapter.title}
                                date={chapter.releaseDate}
                                read={chapter.read}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MangaPanel
