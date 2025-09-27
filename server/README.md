# The Grid - Local Server

This is a basic Node.js WebSocket server to power your local instance of The Grid metaverse.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)

## Running the Server

1.  **Open your terminal or command prompt.**

2.  **Navigate to this `server` directory.**
    ```bash
    cd path/to/your/project/server
    ```

3.  **Install the required dependencies.**
    This will read the `package.json` file and download the necessary libraries (`ws` for WebSockets and `uuid` for generating unique IDs).
    ```bash
    npm install
    ```

4.  **Start the server.**
    ```bash
    node server.js
    ```

You should see a message confirming that the server is running:
`Grid Server is running on ws://localhost:8080`

The server is now active and waiting for clients to connect. You can now go back to the web application and connect to `ws://localhost:8080` to enter the world.

