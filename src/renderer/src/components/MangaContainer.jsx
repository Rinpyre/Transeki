const MangaContainer = ({ children }) => {
    return (
        <div
            className="manga-container grid w-full justify-start gap-4 p-4 px-8"
            style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, auto))'
            }}
        >
            {children}
        </div>
    )
}

export default MangaContainer
