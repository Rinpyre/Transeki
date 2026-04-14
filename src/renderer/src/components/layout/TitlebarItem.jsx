export const TitlebarItem = ({
    icon: Icon,
    onClick,
    className = '',
    iconClassName = '',
    title = ''
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title || undefined}
            className={`hover:bg-accent/20 text-snow flex h-8 w-11 cursor-pointer items-center justify-center transition-colors [-webkit-app-region:no-drag] ${className}`}
        >
            <Icon className={`text-snow h-4 w-4 ${iconClassName}`} />
        </button>
    )
}
