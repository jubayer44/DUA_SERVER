"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const PORT = config_1.default.PORT || 5000;
let server;
function startServer() {
    server = app_1.default.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    server.on("error", (error) => {
        console.error("Server error:", error);
        stopServer();
    });
}
function stopServer() {
    if (server) {
        server.close((err) => {
            if (err) {
                console.error("Error while closing server:", err);
            }
            else {
                console.log("Server stopped. Restarting...");
                startServer();
            }
        });
    }
}
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    stopServer();
});
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
    stopServer();
});
// Start the server for the first time
startServer();
