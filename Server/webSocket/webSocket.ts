import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage, Server } from "http";
import redisClient from "../shared/redisClient";
import queryString from "node:querystring"
import User from "../interfaces/userData";
import Session from "../interfaces/sessionData";

interface WebSocketQueryParams {
    id: string;
    token: string;
}
export default class webSocketApp {
    // webSocket Server
    private Server: WebSocketServer;

    // Socket Variables
    protected socketID!: string;
    protected socketSessionID!: string;
    protected socketTokenID!: string;

    // Main function
    constructor(wsServer: WebSocketServer) {
        this.Server = wsServer;

        this.Server.on('connection', (socket: WebSocket, req: IncomingMessage) => {
            const socketID = `${req.socket.remoteAddress}:${req.socket.remotePort}`
            console.log(`\n> A new connection established (ip:port):\n\t${socketID}\n`);

            // Parse the query params from the URL
            const parsedURL = new URL(req.url || "", `http://${req.headers.host}`)
            const parsedParams = queryString.parse(parsedURL.searchParams.toString())
            const socketParams = parsedParams as unknown as Partial<WebSocketQueryParams>

            if (!socketParams.id || !socketParams.token) {
                return socket.close(4000, "Session and Token are required to continue!")
            }

            // Extract data from it
            this.socketSessionID = socketParams.id;
            this.socketTokenID = socketParams.token

            console.log(`> Session:\n\t${this.socketSessionID}\n> Token:\n\t${this.socketTokenID}`)

            redisClient.hExists("sessions", this.socketSessionID).then((sessionExists: boolean) => {
                if (!sessionExists) {
                    return socket.close(4001, "Session Provided is invalid");
                }

                redisClient.hGet("sessions", this.socketSessionID).then((session) => {
                    const sessionData = Session.fromJSON(session || "");
                    const sessionOwner = sessionData.owner;

                    redisClient.hGet("users", sessionOwner).then((user) => {
                        const userData = User.fromJSON(user || "")

                        const userTokenID = userData.token?.key
                        const userTokenExpiryDate = new Date(userData.token?.expiry || "")
                        const timeStamp = new Date()

                        // check the size of the token & if its the same one the user has.
                        if (userTokenID?.length != 32 || userTokenID != this.socketTokenID) {
                            return socket.close(4000, "Token provided is invalid!")
                        }

                        // check if the token expiry time has passed today
                        if (userTokenExpiryDate.getTime() < timeStamp.getTime()) {
                            return socket.close(4000, "Token provided is expired!")
                        }

                        console.log(`> Socket "${socketID}":\n\tsuccessfully logged in as "${sessionOwner}"\n`)
                    })
                })
            })

            socket.on('message', (message: string) => {
                console.log(`Recieved Message: ${message}`);

                socket.send(`You fr said ${message}? how typical smh.`)
            })

            socket.on('close', (code: number, reasonBuffer: string) => {
                console.log(`Socket Has been closed!\n\tCode: ${code}\n\treason: ${reasonBuffer}`)
            })

            socket.on('error', (err: Error) => {
                console.log(`Error Recieved from socket\n\tError: ${err.message}\n${err.stack}`)
            })
        })
    }
}