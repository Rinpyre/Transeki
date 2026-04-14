import { useRef, useState, useEffect } from 'react'
import { getProxyUrl } from '@utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const SourceRow = ({ source, children, className }) => {
    const scrollRef = useRef(null)
    const [showLeft, setShowLeft] = useState(false)
    const [showRight, setShowRight] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [hasDragged, setHasDragged] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    const handleScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeft(scrollLeft > 0)
        // give 2px buffer for floating point widths
        setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2)
    }

    useEffect(() => {
        handleScroll()
        window.addEventListener('resize', handleScroll)
        return () => window.removeEventListener('resize', handleScroll)
    }, [children])

    const scroll = (direction) => {
        if (!scrollRef.current) return
        const { clientWidth } = scrollRef.current
        const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }

    const onMouseDown = (e) => {
        setIsDragging(true)
        setHasDragged(false)
        setStartX(e.pageX - scrollRef.current.offsetLeft)
        setScrollLeft(scrollRef.current.scrollLeft)
    }

    const onMouseLeave = () => {
        setIsDragging(false)
    }

    const onMouseUp = () => {
        setIsDragging(false)
    }

    const onMouseMove = (e) => {
        if (!isDragging) return
        e.preventDefault()
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = x - startX
        if (Math.abs(walk) > 5) {
            setHasDragged(true)
        }
        scrollRef.current.scrollLeft = scrollLeft - walk
    }

    const onClickCapture = (e) => {
        if (hasDragged) {
            e.stopPropagation()
            e.preventDefault()
            setHasDragged(false)
        }
    }

    return (
        <div className={'source-row w-full p-2' + (className ? ` ${className}` : '')}>
            <div className="flex">
                <div className="info flex items-center gap-2">
                    {source.icon && (
                        <img
                            src={getProxyUrl('icon', source.icon)}
                            alt={`${source.name} icon`}
                            className="h-6 w-6 rounded-sm object-cover"
                        />
                    )}
                    <span className="text-snow">{source.name}</span>
                </div>
                <div className="spacer flex grow"></div>
                <div className="actions text-metadata flex items-center gap-2">
                    <a
                        href="#"
                        className="view-more hover:text-accent flex items-center gap-1 text-sm transition-colors duration-300"
                    >
                        View More
                    </a>
                </div>
            </div>
            <div className="group/row relative mt-2 w-full">
                {showLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="from-primary via-primary/80 text-snow hover:text-accent absolute top-0 bottom-0 left-0 z-1 flex w-12 cursor-pointer items-center justify-start bg-linear-to-r to-transparent opacity-0 transition-opacity duration-300 group-hover/row:opacity-100"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-8 w-8 drop-shadow-md" />
                    </button>
                )}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseLeave}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                    onClickCapture={onClickCapture}
                    className={`results scroll-none flex w-full gap-2 overflow-x-auto py-2 ${
                        isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
                    }`}
                >
                    {children}
                </div>
                {showRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="from-primary via-primary/80 text-snow hover:text-accent absolute top-0 right-0 bottom-0 z-1 flex w-12 cursor-pointer items-center justify-end bg-linear-to-l to-transparent opacity-0 transition-opacity duration-300 group-hover/row:opacity-100"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-8 w-8 drop-shadow-md" />
                    </button>
                )}
            </div>
        </div>
    )
}
