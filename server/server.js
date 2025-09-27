import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ port: 8080 });
console.log("Grid Server is running on ws://localhost:8080");

// --- In-memory Data Store ---
const clients = new Map();
const presence = {}; // Maps clientId to presence data
const collections = {
    // Stores persistent world data
    'region_v1': {},
    'prim_v1': {}
};

// Seed initial data if store is empty
function initializeWorldData() {
    if (Object.keys(collections.region_v1).length === 0) {
        console.log("Seeding initial world data...");
        const regionId = uuidv4();
        collections.region_v1[regionId] = {
            id: regionId,
            x: 0,
            y: 0,
            name: "Welcome Sim",
            ground_color: 0x44AA44,
        };
    }
}
initializeWorldData();

// --- Broadcasting ---
function broadcast(message) {
    const stringifiedMessage = JSON.stringify(message);
    for (const client of clients.values()) {
        if (client.ws.readyState === client.ws.OPEN) {
            client.ws.send(stringifiedMessage);
        }
    }
}

function broadcastPresence() {
    const peers = {};
    Object.keys(presence).forEach(id => {
        peers[id] = { username: clients.get(id)?.username || 'Anonymous' };
    });
    broadcast({ type: 'presence_update', presence, peers });
}

function broadcastCollection(collectionName) {
    broadcast({
        type: 'record_update',
        collection: collectionName,
        records: Object.values(collections[collectionName])
    });
}

// --- WebSocket Connection Handling ---
wss.on('connection', (ws) => {
    const clientId = uuidv4();
    const clientInfo = { ws, id: clientId, username: `Avatar_${clientId.substring(0, 4)}`, subscribed_collections: new Set() };
    clients.set(clientId, clientInfo);

    console.log(`Client ${clientId} connected.`);

    // 1. Welcome message with client ID
    ws.send(JSON.stringify({
        type: 'welcome',
        clientId,
        peers: Object.fromEntries(Array.from(clients.values()).map(c => [c.id, { username: c.username }]))
    }));

    // 2. Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleClientMessage(clientId, data);
        } catch (error) {
            console.error(`Error processing message from ${clientId}:`, error);
        }
    });

    // 3. Handle disconnection
    ws.on('close', () => {
        console.log(`Client ${clientId} disconnected.`);
        clients.delete(clientId);
        delete presence[clientId];
        broadcastPresence();
    });

    ws.onerror = (err) => {
        console.error(`WebSocket error for client ${clientId}:`, err);
    }
});

function handleClientMessage(clientId, message) {
    switch (message.type) {
        case 'update_presence':
            presence[clientId] = { ...presence[clientId], ...message.payload };
            broadcastPresence();
            break;

        case 'subscribe_collection':
            const { collection } = message;
            if (collections[collection]) {
                const client = clients.get(clientId);
                if (client) client.subscribed_collections.add(collection);
                // Send full collection data on first subscription
                client.ws.send(JSON.stringify({
                    type: 'record_update',
                    collection: collection,
                    records: Object.values(collections[collection])
                }));
            }
            break;

        case 'create_record':
            const { collection: collectionName, record } = message;
            if (collections[collectionName]) {
                const newRecord = { ...record, id: uuidv4(), owner: clientId };
                collections[collectionName][newRecord.id] = newRecord;
                console.log(`Client ${clientId} created a record in ${collectionName}:`, newRecord.id);
                // Broadcast the updated collection to all subscribed clients
                broadcastCollection(collectionName);
            }
            break;
    }
}