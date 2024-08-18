export default (path: string) => {
    return path.replace(/\\/g, '/'); // replace back slashes '\' to forward-slashes '/'
}