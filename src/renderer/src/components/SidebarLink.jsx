const SidebarLink = ({ icon: Icon, isActive, onClick, label, id, className = '' }) => {
    return (
        <li
            id={id}
            onClick={onClick}
            className={`hover:bg-primary-900/30 cursor-pointer rounded-sm p-2 transition-colors ${
                isActive ? 'text-pink-600 underline' : ' hover:underline'
            } ${className}`}
            title={label}
        >
            <Icon size={24} />
        </li>
    )
}

export default SidebarLink
