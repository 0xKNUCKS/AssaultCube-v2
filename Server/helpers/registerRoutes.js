const res = require("express/lib/response")
const fs = require("fs")
const path = require("path")
const removeExtension = require("../utils/removeExtension")
const removeFirstFolder = require("../utils/removeFirstFolder")
const normalizeRoutePath = require("../utils/normalizeRoutePath")
// getting quite cluttered ik, TODO: Manage and handle util functions more properly.

module.exports = (expressApp, routesPath) => {
    // Parse all routes and use them
    const routesFolder = fs.readdirSync(routesPath)
    for (let routeFile of routesFolder)
    {
        let routePath = path.join(routesPath, routeFile);

        if (fs.lstatSync(routePath).isDirectory()) {
            module.exports(expressApp, routePath) // recursive call incase of sub-folders
        } else {
            const route = require(path.resolve(routePath));
    
            routeFile = removeExtension(routeFile == "index.js" ? "" : routeFile) // handle the index route to just be "", then remove the file extension too.
            let finalRoutePath = removeFirstFolder( // prevent adding the "route/" folder!
                                removeExtension(
                                normalizeRoutePath(path.join('/', routesPath, routeFile))
                                )); // not sure if this was even a good idea to make all of these funcions but well oh well. i hope its easier to read like this.
            expressApp.use(finalRoutePath, route);
            console.log(`> Registered Route "${finalRoutePath}"`)
        }
    }
}