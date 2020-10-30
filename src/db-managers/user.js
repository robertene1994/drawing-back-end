const dbManager = {};

dbManager.init = (app) => {
    dbManager.client = app.get("mongo").MongoClient;
    dbManager.dbUri = app.get("dbUri");
    dbManager.dbOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };
};

dbManager.save = async (user) => {
    let client;
    try {
        client = await dbManager.client.connect(dbManager.dbUri, dbManager.dbOptions);
        return (await client.db("drawing").collection("users").insertOne(user)).ops[0]._id;
    } finally {
        if (client)
            client.close();
    }
};

dbManager.find = async (query) => {
    let client;
    try {
        client = await dbManager.client.connect(dbManager.dbUri, dbManager.dbOptions);
        return await client.db("drawing").collection("users").find(query).toArray();
    } finally {
        if (client)
            client.close();
    }
};

module.exports = dbManager;
