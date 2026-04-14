/**
 * Builds a `transeki://` URL for internal resource handling by URL-encoding the provided target URL
 * (for example, HTTP(S) API endpoints or local `file:///` paths) and appending it to the custom scheme.
 *
 * The `route` segment is restricted to `"icon"` and `"proxy"` only.
 *
 * @param {"icon" | "proxy"} route - The proxy route type to use in the generated Transeki URL.
 * @param {string} targetUrl - The original URL to wrap (e.g., `https://...` or `file:///...`).
 * @returns {string} A `transeki://{type}/{encodedTargetUrl}` URL.
 */
export function getProxyUrl(route, targetUrl, pluginId) {
    const url = new URL(`transeki://${route}/`)

    // URLSearchParams automatically safely encodes the target URL
    if (pluginId) url.searchParams.set('plugin', pluginId)
    url.searchParams.set('url', targetUrl)

    return url.toString()
}
