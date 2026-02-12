const SidebarLink = ({ icon: Icon, isActive, onClick, label, id, className = '' }) => {
    return (
        <li
            id={id}
            onClick={onClick}
            className={`hover:bg-accent-dark/25 text-snow flex w-full cursor-pointer flex-col items-center rounded-md p-2 underline-offset-5 transition-colors ${
                isActive ? 'text-accent! underline' : 'hover:underline'
            } ${className}`}
            title={label}
        >
            <Icon size={26} />
            <span className="mt-1 text-sm font-semibold">{label}</span>
        </li>
    )
}

export default SidebarLink
