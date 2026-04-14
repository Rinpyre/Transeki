import { useEffect, useState } from 'react'
import {
    SelectAllOff16Regular as RestoreIcon,
    Subtract16Regular as MinimizeIcon,
    Maximize16Regular as MaximizeIcon,
    Dismiss16Regular as CloseIcon
} from '@fluentui/react-icons'
import { TitlebarItem } from './TitlebarItem'

export const Titlebar = () => {
    const [isMaximized, setIsMaximized] = useState(false)

    useEffect(() => {
        let isMounted = true

        window.windowControls
            .isMaximized()
            .then((maximized) => {
                if (isMounted) {
                    setIsMaximized(Boolean(maximized))
                }
            })
            .catch(() => {})

        const unsubscribeMaximize = window.windowControls.onMaximize(() => setIsMaximized(true))
        const unsubscribeRestore = window.windowControls.onRestore(() => setIsMaximized(false))

        return () => {
            isMounted = false
            unsubscribeMaximize()
            unsubscribeRestore()
        }
    }, [])

    const handleMinimize = () => window.windowControls.minimize()
    const handleToggleWindowSize = () => {
        if (isMaximized) {
            window.windowControls.restore()
            return
        }

        window.windowControls.maximize()
    }
    const handleClose = () => window.windowControls.close()

    const WindowSizeIcon = isMaximized ? RestoreIcon : MaximizeIcon
    const windowSizeTitle = isMaximized ? 'Restore' : 'Maximize'
    const windowSizeIconClassName = isMaximized ? '-rotate-90' : ''

    return (
        <div className="titlebar fixed top-0 right-0 z-10 flex w-full items-center justify-end gap-1 [-webkit-app-region:drag]">
            <TitlebarItem icon={MinimizeIcon} onClick={handleMinimize} title="Minimize" />
            <TitlebarItem
                icon={WindowSizeIcon}
                onClick={handleToggleWindowSize}
                iconClassName={windowSizeIconClassName}
                title={windowSizeTitle}
            />
            <TitlebarItem
                icon={CloseIcon}
                onClick={handleClose}
                className="hover:bg-error/80"
                title="Close"
            />
        </div>
    )
}
