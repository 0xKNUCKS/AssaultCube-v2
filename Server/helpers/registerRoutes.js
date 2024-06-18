const res = require("express/lib/response")
const fs = require("fs")
const path = require("path")
const removeExtension = require("../utils/removeExtension")
const removeFirstFolder = require("../utils/removeFirstFolder")
const normalizeRoutePath = require("../utils/normalizeRoutePath")
// getting quite cluttered ik, TODO: Manage and handle util functions more properly.

module.exports = (expressApp, targetPath, routesTag = "") => {
    // Parse all routes and use them
    const routesFolder = fs.readdirSync(targetPath)

    for (let routeFile of routesFolder)
    {
        let routePath = path.join(targetPath, routeFile);

        // check if the given path is a 'folder'.
        if (fs.lstatSync(routePath).isDirectory()) {
            module.exports(expressApp, routePath) // recursive call incase of sub-folders
        } else {
            // retrieve the route's function from its file.
            const route = require(path.resolve(routePath));
    
            // handle the index route name to be empty, and remove the file extension too: '.js'
            routeFile = removeExtension(routeFile == "index.js" ? "" : routeFile)

            // swap all the file slashes '\' to route slashes '/'
            let finalRoutePath = normalizeRoutePath(path.join('/', routesTag, routeFile));

            // assign the route function to the route path.
            expressApp.use(finalRoutePath, route);
            console.log(`> Registered Route "${finalRoutePath}"`)
        }
    }
}