module.exports = (path, slashType = '/') => {
    const out = path.split(slashType) // split everything between the slashes to an array
    // handle if theres also a slash at the beginning. e.g. "/Folder1/Folder2" -> "/Folder2"
    if (out[0] == '') {
        out.shift()
    }
    out.shift() // remove the first element
    return (path.startsWith(slashType) ? slashType : '') + out.join(slashType); // join everything back together with a slash between them.
}