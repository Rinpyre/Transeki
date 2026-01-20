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
import { MangaChapterItem } from '@components'

const MangaPanel = ({ className = '' }) => {
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
                `manga-panel bg-secondary fixed top-1/2 right-6 z-2 h-9/12 w-[28%] min-w-88 -translate-y-1/2 overflow-y-scroll rounded-xl py-4 shadow-xl transition-all duration-800` +
                ` ${className}`
            }
            style={scrollableStyle}
        >
            <div className="close">
                <button
                    className="close-btn bg-primary/70 hover:bg-accent-dark/30 absolute top-3 right-3 z-1 cursor-pointer rounded-full p-1.5 transition-colors duration-200"
                    title="Close Panel"
                >
                    <Close className="text-snow transition-colors duration-200" size={20} />
                </button>
            </div>
            <div className="info text-snow relative h-auto w-full">
                <div
                    id="backdrop"
                    className="absolute -z-1 h-full w-full rounded-md bg-cover bg-center bg-no-repeat opacity-10 blur-xs"
                    style={{
                        backgroundImage:
                            'url(https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/e90bdc47-c8b9-4df7-b2c0-17641b645ee1.jpg.256.jpg)'
                    }}
                ></div>
                <div className="cover-and-metadata flex px-4 pb-1">
                    <div className="cover flex h-auto w-2/5 min-w-40 items-center overflow-hidden rounded-md shadow-md">
                        <img
                            src="https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/e90bdc47-c8b9-4df7-b2c0-17641b645ee1.jpg.256.jpg"
                            alt="Solo Leveling Cover"
                            className="transition-transform duration-300 will-change-transform hover:scale-105 hover:cursor-pointer"
                        />
                    </div>
                    <div className="metadata flex flex-col pl-4">
                        <h2 className="title text-3xl font-bold">Solo Leveling</h2>
                        <div className="spacer grow"></div>
                        <p className="details-author">Author: Chugong</p>
                        <p className="details-source">Source: Webtoon</p>
                        <p className="details-status">Status: Ongoing</p>
                    </div>
                </div>
            </div>
            <div className="action-buttons flex gap-2 px-4 py-2 text-sm">
                <button className="add-to-library bg-tertiary/70 hover:bg-accent-dark/30 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 transition-colors duration-200">
                    <Favorite className="text-snow transition-colors duration-200" size={18} />
                    <span>Add to Library</span>
                </button>
                <button className="external-tracking bg-tertiary/70 hover:bg-accent-dark/30 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 transition-colors duration-200">
                    <Tracking className="text-snow transition-colors duration-200" size={18} />
                    <span>Tracking</span>
                </button>
                <button
                    className="open-in-browser bg-tertiary/70 hover:bg-accent-dark/30 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 transition-colors duration-200"
                    title="Open in WebView"
                >
                    <Link className="text-snow transition-colors duration-200" size={18} />
                </button>
                <button
                    className="share-manga bg-tertiary/70 hover:bg-accent-dark/30 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 transition-colors duration-200"
                    title="Share"
                >
                    <Share className="text-snow transition-colors duration-200" size={18} />
                </button>
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
                <div className="description flex flex-col">
                    <h3 className="description-title text-metadata cursor-default text-lg font-semibold underline underline-offset-3">
                        Description:
                    </h3>
                    <p className="description-text mt-1 text-sm">
                        In a world where hunters with magical abilities fight deadly monsters to
                        protect humanity, an E-rank hunter named Sung Jin-Woo embarks on a journey
                        to become the strongest hunter after a near-death experience in a dangerous
                        dungeon. In a world where hunters with magical abilities fight deadly
                        monsters to protect humanity, an E-rank hunter named Sung Jin-Woo embarks on
                        a journey to become the strongest hunter after a near-death experience in a
                        dangerous dungeon. In a world where hunters with magical abilities fight
                        deadly monsters to protect humanity, an E-rank hunter named Sung Jin-Woo
                        embarks on a journey to become the strongest hunter after a near-death
                        experience in a dangerous dungeon. In a world where hunters with magical
                        abilities fight deadly monsters to protect humanity, an E-rank hunter named
                        Sung Jin-Woo embarks on a journey to become the strongest hunter after a
                        near-death experience in a dangerous dungeon. In a world where hunters with
                        magical abilities fight deadly monsters to protect humanity, an E-rank
                        hunter named Sung Jin-Woo embarks on a journey to become the strongest
                        hunter after a near-death experience in a dangerous dungeon. In a world
                        where hunters with magical abilities fight deadly monsters to protect
                        humanity, an E-rank hunter named Sung Jin-Woo embarks on a journey to become
                        the strongest hunter after a near-death experience in a dangerous dungeon.
                        In a world where hunters with magical abilities fight deadly monsters to
                        protect humanity, an E-rank hunter named Sung Jin-Woo embarks on a journey
                        to become the strongest hunter after a near-death experience in a dangerous
                        dungeon.
                    </p>
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
                <div className="details-genres pb-4">
                    <span className="genre-badge bg-accent-dark/70 hover:bg-accent-dark/85 text-snow mr-1 mb-1 inline-block cursor-default rounded-md px-2.5 py-1.5 text-[.8em] font-semibold transition-colors duration-200">
                        Action
                    </span>
                    <span className="genre-badge bg-accent-dark/70 hover:bg-accent-dark/85 text-snow mr-1 mb-1 inline-block cursor-default rounded-md px-2.5 py-1.5 text-[.8em] font-semibold transition-colors duration-200">
                        Adventure
                    </span>
                    <span className="genre-badge bg-accent-dark/70 hover:bg-accent-dark/85 text-snow mr-1 mb-1 inline-block cursor-default rounded-md px-2.5 py-1.5 text-[.8em] font-semibold transition-colors duration-200">
                        Fantasy
                    </span>
                    <span className="genre-badge bg-accent-dark/70 hover:bg-accent-dark/85 text-snow mr-1 mb-1 inline-block cursor-default rounded-md px-2.5 py-1.5 text-[.8em] font-semibold transition-colors duration-200">
                        Supernatural
                    </span>
                </div>
            </div>
            <div className="read-btn my-2 px-4">
                <button className="bg-accent-dark hover:bg-accent-dark/70 w-full cursor-pointer rounded-full px-4 py-2 transition-colors duration-200">
                    Start Reading
                </button>
            </div>
            <div className="chapter-list px-4">
                <div className="chapter-list-header text-metadata border-b-tertiary cursor-default border-b px-1 py-1">
                    <h3 className="chapter-list-title">250 chapters</h3>
                </div>
                <div className="chapter-list-content mt-1 flex flex-col">
                    <MangaChapterItem
                        name="Chapter 250: The Awakening"
                        date="2024-06-20"
                        read={false}
                    />
                    <MangaChapterItem
                        name="Chapter 249: The Final Battle"
                        date="2024-06-13"
                        read={true}
                    />
                    <MangaChapterItem
                        name="Chapter 248: Rise of the Monarchs"
                        date="2024-06-06"
                        read={true}
                    />
                    <MangaChapterItem
                        name="Chapter 247: Shadows of the Past"
                        date="2024-05-30"
                        read={false}
                    />
                    <MangaChapterItem
                        name="Chapter 246: The Lost City"
                        date="2024-05-23"
                        read={true}
                    />
                </div>
            </div>
        </div>
    )
}

export default MangaPanel
