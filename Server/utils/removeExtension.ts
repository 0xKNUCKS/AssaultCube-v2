module.exports = (path) => {
    return path.replace(/(.*)\.(.*?)$/, "$1");
    // Creds: https://stackoverflow.com/a/4250402
}