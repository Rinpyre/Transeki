import { useNavigate, useLocation } from 'react-router-dom'
import { Search as Browse, LibraryBig as Library, Settings, UserRound as User } from 'lucide-react'
import SidebarLink from './SidebarLink'

const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const routes = [
        { type: 'page', path: '/', icon: Library, label: 'Library' },
        { type: 'divider' },
        { type: 'page', path: '/browse', icon: Browse, label: 'Browse' },
        { type: 'spacer' },
        { type: 'page', path: '/settings', icon: Settings, label: 'Settings' },
        { type: 'divider' },
        { type: 'page', path: '/profile', icon: User, label: 'Profile' }
    ]

    // Track type counts for generating semantic keys
    const typeCounts = {}

    return (
        <nav className="sidebar z-1 flex h-screen w-max flex-col bg-gray-900 p-2 text-white shadow-xl shadow-black/30">
            <ul className="top-nav flex h-full flex-col items-center gap-1">
                {routes.map((route) => {
                    if (!typeCounts[route.type]) {
                        typeCounts[route.type] = 0
                    }
                    const typeKey = `${route.type}-${typeCounts[route.type]}`
                    typeCounts[route.type]++

                    if (route.type === 'divider') {
                        return (
                            <div
                                key={typeKey}
                                id={typeKey}
                                className="divider my-2 h-px w-10/12 bg-gray-700"
                            ></div>
                        )
                    }
                    if (route.type === 'spacer') {
                        return <div key={typeKey} id={typeKey} className="spacer grow" />
                    }
                    return (
                        <SidebarLink
                            key={typeKey}
                            id={typeKey}
                            icon={route.icon}
                            isActive={location.pathname === route.path}
                            onClick={() => navigate(route.path)}
                            label={route.label}
                        />
                    )
                })}
            </ul>
        </nav>
    )
}

export default Sidebar
