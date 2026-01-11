import { useState } from 'react'
import { VersionItem } from './VersionItem'

function Versions({ className = '' }) {
    const [versions] = useState(window.electron.process.versions)

    return (
        <ul className={`flex items-center gap-4 rounded-4xl bg-gray-800 p-2 ${className}`}>
            <VersionItem label="Electron" version={versions.electron} />
            <VersionItem label="Chromium" version={versions.chrome} />
            <VersionItem label="Node" version={versions.node} />
        </ul>
    )
}

export default Versions
