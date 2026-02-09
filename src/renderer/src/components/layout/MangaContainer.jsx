import { useRef, useEffect } from 'react'

const MangaContainer = ({ children }) => {
    const glowRef = useRef(null)
    const glowDimensionsRef = useRef({ width: 0, height: 0 })

    // Calculate glow dimensions once on mount to avoid layout thrashing
    // Layout thrashing occurs when accessing offsetWidth/offsetHeight repeatedly in high-frequency events
    // This causes the browser to recalculate layouts on every mouse move, killing performance
    // By storing dimensions in a ref, we only calculate once when the component mounts
    useEffect(() => {
        if (glowRef.current) {
            glowDimensionsRef.current = {
                width: glowRef.current.offsetWidth,
                height: glowRef.current.offsetHeight
            }
        }
    }, [])

    const handleMouseMove = (e) => {
        const glow = glowRef.current
        if (glow) {
            glow.style.left = `${e.clientX - glowDimensionsRef.current.width / 2}px`
            glow.style.top = `${e.clientY - glowDimensionsRef.current.height / 2}px`
        }
    }

    const handleMouseEnter = () => {
        const glow = glowRef.current
        if (glow) {
            glow.style.opacity = '0.3'
        }
    }

    const handleMouseLeave = () => {
        const glow = glowRef.current
        if (glow) {
            glow.style.opacity = '0'
        }
    }

    return (
        <div
            className="relative flex h-full w-full flex-1"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={glowRef}
                className="bg-accent-light pointer-events-none fixed top-0 left-0 h-50 w-50 rounded-full opacity-0 blur-2xl transition-opacity duration-300"
            ></div>
            <div
                className="manga-container grid h-fit w-full justify-start gap-4 p-4 px-8"
                style={{
                    // repeat(<number of columns>, <column width>) | minmax(<min>, <max>)
                    // auto-fit: fit as many columns as possible in the container
                    // auto-fill: fill the row with as many columns as possible, even if they are empty
                    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, auto))'
                }}
            >
                {children}
            </div>
        </div>
    )
}

export default MangaContainer
