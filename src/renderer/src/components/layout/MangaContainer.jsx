export const MangaContainer = ({ children }) => {
    return (
        <div className="relative flex h-full w-full flex-1">
            <div className="bg-accent-light pointer-events-none fixed top-0 left-0 h-50 w-50 rounded-full opacity-0 blur-2xl transition-opacity duration-300"></div>
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
