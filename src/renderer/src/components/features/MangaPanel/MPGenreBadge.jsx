const MPGenreBadge = ({ name, id }) => {
    return (
        <span
            id={id}
            className="genre-badge bg-accent-dark/70 hover:bg-accent-dark/85 text-snow mr-1 mb-1 inline-block cursor-default rounded-md px-2.5 py-1.5 text-[.8em] font-semibold transition-colors duration-200"
        >
            {name}
        </span>
    )
}

export default MPGenreBadge
