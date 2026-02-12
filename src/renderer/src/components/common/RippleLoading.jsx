const RippleLoading = () => {
    return (
        <div className="loading-screen bg-secondary/70 absolute z-1 flex h-full w-full items-center justify-center rounded-xl">
            <div className="border-accent-dark bg-accent-dark absolute h-5 w-5 animate-ping rounded-full border-4"></div>
            <div className="border-accent bg-accent absolute h-10 w-10 animate-ping rounded-full border-4"></div>
            <div className="border-accent-light bg-accent-light absolute h-15 w-15 animate-ping rounded-full border-4"></div>
        </div>
    )
}

export default RippleLoading
