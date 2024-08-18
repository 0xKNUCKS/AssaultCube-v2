import fs from 'fs';
import path from 'path';
import removeExtension from '../utils/removeExtension';
import normalizeRoutePath from '../utils/normalizeRoutePath';
import * as express from 'express';

const registerRoutes = async (expressApp: express.Express, targetPath: string, routesTag: string = "") => {
    // Parse all routes and use them
    const routesFolder = fs.readdirSync(targetPath)

    for (let routeFile of routesFolder) {
        let routePath = path.join(targetPath, routeFile);

        // check if the given path is a 'folder'.
        if (fs.lstatSync(routePath).isDirectory()) {
            await registerRoutes(expressApp, routePath) // recursive call incase of sub-folders
        } else {
            try {
                const module = await import(path.resolve(routePath))
                const route = module.default as express.Router

                // handle the index route name to be empty, and remove the file extension too: '.js'
                routeFile = removeExtension(routeFile == "index.js" ? "" : routeFile)

                // swap all the file slashes '\' to route slashes '/'
                let finalRoutePath = normalizeRoutePath(path.join('/', routesTag, routeFile));

                // assign the route function to the route path.
                expressApp.use(finalRoutePath, route);
                console.log(`> Registered Route "${finalRoutePath}"`)
            } catch (error) {
                console.log(`> Failed to register ${routeFile}\n\t= Reason: ${error}\n`)
            }
        }
    }
}

export default registerRoutes;