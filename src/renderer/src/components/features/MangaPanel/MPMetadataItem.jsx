const MPMetadataItem = ({ type, value }) => {
    return (
        <p className="metadata-item">
            <span className="type text-gray-400">{type}: </span>
            <span className="value">{value}</span>
        </p>
    )
}

export default MPMetadataItem
