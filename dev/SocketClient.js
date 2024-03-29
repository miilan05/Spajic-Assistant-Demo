import { io } from "socket.io-client";

// singleton pattern
export default class SocketClient {
    static instance;

    static socketInstance;

    constructor() {
        if (SocketClient.socketInstance) {
            this.socket = SocketClient.socketInstance;
        } else {
            this.connect();
            SocketClient.socketInstance = this.socket;
        }
    }

    connect() {
        this.socket = io("https://spajic-assistant-demo.fly.dev", {
            withCredentials: true,
            extraHeaders: {
                "my-custom-header": "abcd",
            },
        });

        // Listen for server disconnection
        this.socket.on("disconnect", () => {
            console.log("Disconnected from the server");
        });
    }

    sendMessage(type, message) {
        this.socket.emit(`${type}`, message);
    }
}
