// A client-side implementation for the WebsimSocket protocol
export default class WebsimSocketClient {
    constructor() {
        this.ws = null;
        this.clientId = null;
        this.peers = {};
        this.presence = {};
        this.collections = {};

        this.presenceSubscribers = new Set();
        this.presenceUpdateRequestsSubscribers = new Set();
    }

    connect(url) {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log("WebSocket connected");
            };

            this.ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                this.handleMessage(msg, resolve);
            };

            this.ws.onerror = (err) => {
                console.error("WebSocket error:", err);
                reject(new Error("WebSocket connection failed."));
            };

            this.ws.onclose = () => {
                console.log("WebSocket disconnected");
                // Implement reconnection logic if needed
            };
        });
    }

    handleMessage(msg, resolve) {
        switch (msg.type) {
            case 'welcome':
                this.clientId = msg.clientId;
                this.peers = msg.peers;
                console.log(`Welcome! Your client ID is ${this.clientId}`);
                resolve(this);
                break;
            case 'presence_update':
                this.presence = msg.presence;
                this.peers = msg.peers;
                this.presenceSubscribers.forEach(cb => cb(this.presence));
                break;
            case 'record_update':
                this.handleRecordUpdate(msg.collection, msg.records);
                break;
            case 'presence_update_request':
                 this.presenceUpdateRequestsSubscribers.forEach(cb => cb(msg.update, msg.from));
                 break;
        }
    }

    handleRecordUpdate(collectionName, records) {
        if (!this.collections[collectionName]) {
            this.collections[collectionName] = { data: {}, subscribers: new Set(), filters: [] };
        }
        const collection = this.collections[collectionName];

        const newRecords = {};
        records.forEach(r => newRecords[r.id] = r);
        collection.data = newRecords;

        // Notify all subscribers of this collection
        collection.subscribers.forEach(cb => cb(Object.values(collection.data)));

        // Notify subscribers of filtered lists
        collection.filters.forEach(filterInstance => {
            filterInstance.update();
        });
    }

    send(message) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    updatePresence(data) {
        this.send({ type: 'update_presence', payload: data });
    }

    subscribePresence(callback) {
        this.presenceSubscribers.add(callback);
        return () => this.presenceSubscribers.delete(callback);
    }

    subscribePresenceUpdateRequests(callback) {
        this.presenceUpdateRequestsSubscribers.add(callback);
        return () => this.presenceUpdateRequestsSubscribers.delete(callback);
    }

    collection(name) {
        if (!this.collections[name]) {
            this.collections[name] = { data: {}, subscribers: new Set(), filters: [] };
             // Request initial data for this collection
            this.send({ type: 'subscribe_collection', collection: name });
        }
        const collection = this.collections[name];

        return {
            create: (record) => {
                return new Promise((resolve, reject) => {
                    this.send({ type: 'create_record', collection: name, record });
                    // In a real implementation, we'd wait for a confirmation message
                    resolve();
                });
            },
            filter: (filterObj) => {
                const filterInstance = {
                    subscribers: new Set(),
                    subscribe: (callback) => {
                        filterInstance.subscribers.add(callback);
                        // immediately provide the current filtered list
                        callback(filterInstance.getList()); 
                        return () => filterInstance.subscribers.delete(callback);
                    },
                    getList: () => {
                        return Object.values(collection.data).filter(item => {
                            for (const key in filterObj) {
                                if (item[key] !== filterObj[key]) return false;
                            }
                            return true;
                        });
                    },
                    update: () => {
                         const list = filterInstance.getList();
                         filterInstance.subscribers.forEach(cb => cb(list));
                    }
                };
                collection.filters.push(filterInstance);
                return filterInstance;
            }
        };
    }
}