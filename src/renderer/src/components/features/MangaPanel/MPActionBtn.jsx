const MPActionBtn = ({
    name,
    icon: Icon,
    iconOnly = false,
    disabled = false,
    active = false,
    type = 'button',
    id
}) => {
    return (
        <button
            id={id}
            type={type}
            className={`${active ? 'bg-accent-dark/60' : 'bg-tertiary/70'} hover:bg-accent-dark/30 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={disabled}
            title={name + (disabled ? ' (Coming Soon)' : '')}
        >
            <Icon className="text-snow transition-colors duration-200" size={18} />
            {!iconOnly && <span>{name}</span>}
        </button>
    )
}

export default MPActionBtn
