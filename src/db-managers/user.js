const dbManager = {};

dbManager.init = (app) => {
    dbManager.client = app.get("mongo").MongoClient;
    dbManager.dbUri = app.get("dbUri");
    dbManager.dbOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };
};

dbManager.save = (user, callback) => {
    dbManager.client.connect(dbManager.dbUri, dbManager.dbOptions, (err, client) => {
        if (err) {
            callback(err);
            return;
        }

        client.db("drawing").collection("users").insertOne(user, (err, result) => {
            if (err)
                callback(err);
            else
                callback(undefined, result.ops[0]._id);
            client.close();
        });
    });
};

dbManager.find = (query, callback) => {
    dbManager.client.connect(dbManager.dbUri, dbManager.dbOptions, (err, client) => {
        if (err) {
            callback(err);
            return;
        }

        client.db("drawing").collection("users").find(query).toArray(function (err, users) {
            if (err)
                callback(err);
            else
                callback(undefined, users);
            client.close();
        });
    });
};

module.exports = dbManager;
