const Util = require("../util/util"),
    userService = require("../services/user"),
    service = {};

let draws = [],
    users = [];

service.init = (app) => {
    service.uuid = app.get("uuid");
    service.wss = app.get("wss");

    service.wss.broadcastAll = (operation, content, data) => {
        service.wss.clients.forEach((client) => {
            client.send(JSON.stringify({
                operation: operation,
                content: content,
                data: data
            }));
        });
    };

    service.wss.broadcastOthers = (operation, content, data, current) => {
        service.wss.clients.forEach((client) => {
            if (client !== current) {
                client.send(JSON.stringify({
                    operation: operation,
                    content: content,
                    data: data
                }));
            }
        });
    };

    service.wss.on('connection', (ws) => {
        ws.on('message', async (message) => {
            if (Util.isJson(message)) {
                const data = JSON.parse(message);
                if (data.operation === 'open') {
                    await processOpen(ws, data);
                } else if (data.operation === 'close') {
                    await processClose(data);
                } else if (data.operation === 'delete') {
                    processDelete(data);
                } else if (data.operation === 'create') {
                    processCreate(data);
                } else if (data.operation === 'modify') {
                    processModify(data);
                }
            }
        });
    });
};

async function processOpen(ws, data) {
    if (!users.includes(data.email)) {
        users.push(data.email);
        if (draws.length > 0) {
            ws.send(JSON.stringify({
                operation: 'list',
                content: 'draws',
                data: draws
            }));
        }
        if (users.length > 0)
            service.wss.broadcastAll('list', 'users', await getUsers());
    }
}

async function processClose(data) {
    for (let i = 0; i < users.length; i++) {
        if (users[i] === data.email) {
            users.splice(i, 1);
            service.wss.broadcastAll('list', 'users', await getUsers());
        }
    }
}

function processDelete(data) {
    for (let i = 0; i < draws.length; i++) {
        if (draws[i].id === data.id) {
            draws.splice(i, 1);
            service.wss.broadcastAll('delete', 'draw', data.id);
            return;
        }
    }
}

function processCreate(data) {
    let draw = data.draw;
    draw.id = service.uuid();
    draws.push(draw);
    service.wss.broadcastAll("list", 'draw', draw);
}

function processModify(data) {
    let draw = data.draw;
    for (let i = 0; i < draws.length; i++) {
        if (draws[i].id === draw.id) {
            for (const prop in draw.data)
                draws[i].data[prop] = draw.data[prop];
            draw = draws[i];
        }
    }
    service.wss.broadcastOthers('modify', 'draw', draw, this);
}

async function getUsers() {
    let connectedUsers = [];
    const usersDb = await userService.findAll();

    for (let i = 0; i < usersDb.length; i++) {
        let user = usersDb[i];
        if (users.includes(user.email)) {
            delete user.password;
            connectedUsers.push(user);
        }
    }

    return new Promise(resolve => resolve(connectedUsers));
}

module.exports = service;
