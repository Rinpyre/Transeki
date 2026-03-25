export const SidebarLink = ({ icon: Icon, isActive, onClick, _label, id, className = '' }) => {
    return (
        <li
            id={id}
            onClick={onClick}
            className={`hover:bg-accent/20 text-snow flex w-full cursor-pointer flex-col items-center rounded-r-md px-2.5 py-2 pl-5 underline-offset-5 transition-colors ${
                isActive ? 'bg-accent hover:bg-accent/80' : 'bg-transparent'
            } ${className}`}
        >
            <Icon size={20} className={`${isActive ? 'text-primary' : 'text-snow'}`} />
        </li>
    )
}
