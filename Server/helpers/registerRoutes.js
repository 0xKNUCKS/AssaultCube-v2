const res = require("express/lib/response")
const fs = require("fs")
const path = require("path")
const removeExtension = require("../utils/removeExtension")

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
            let finalRoutePath = path.join('/', routesPath, routeFile).replace(/\\/g, '/'); // replace back slashes '\' to forward-slashes '/' for the final route.
            expressApp.use(finalRoutePath, route);
            console.log(`> Registered Route "${finalRoutePath}"`)
        }
    }
}