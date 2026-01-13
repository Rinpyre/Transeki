const SidebarLink = ({ icon: Icon, isActive, onClick, label, id, className = '' }) => {
    return (
        <li
            id={id}
            onClick={onClick}
            className={`hover:bg-accent-dark/30 text-snow flex w-full cursor-pointer items-center rounded-sm p-2 underline-offset-5 transition-colors ${
                isActive ? 'text-accent! underline' : 'hover:underline'
            } ${className}`}
            title={label}
        >
            <Icon size={24} />
        </li>
    )
}

export default SidebarLink
