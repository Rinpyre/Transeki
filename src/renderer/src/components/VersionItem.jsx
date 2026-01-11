export function VersionItem({ label, version }) {
    return (
        <li className="rounded-4xl bg-gray-500 px-4 py-2 font-semibold text-white">
            {label} v{version}
        </li>
    )
}
