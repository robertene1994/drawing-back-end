const BusinessException = require("../models/exception/business-exception"),
    User = require("../models/user"),
    Util = require("../util/util"),
    userDbManager = require("../db-managers/user"),
    service = {};

service.init = (app) => {
    service.crypto = app.get("crypto");
    service.mongo = app.get("mongo");
    service.jwt = app.get("jwt");
    service.sessionSecret = app.get("sessionSecret");
    userDbManager.init(app);
};

service.findAll = (callback) => {
    userDbManager.find({}, (err, usersDb) => {
        if (err) {
            callback(new BusinessException("user", `¡Ha ocurrido un problema 
                inesperado durante el proceso de recuperación de usuarios!`));
            return;
        }

        let users = [];

        usersDb.forEach((userDb) => {
            let user = new User().fromDb(userDb);
            user.password = undefined;
            users.push(user);

            if (users.length === usersDb.length)
                callback(undefined, users);
        });

        if (usersDb.length === 0)
            callback(undefined, users);
    });
};

service.findByEmail = (email, callback) => {

    if (Util.isNotNullOrEmpty(email) || !Util.isValidEmail(email)) {
        callback(new BusinessException("email", "¡El email del usuario " +
            "debe segurir el formato string@string.string!"));
        return;
    }

    const query = {
        email: email
    };

    userDbManager.find(query, (err, users) => {
        if (err)
            callback(new BusinessException("user", `¡Ha ocurrido un problema 
                inesperado durante el proceso de recuperación del usuario!`));
        else if (!users || users.length === 0)
            callback(new BusinessException("user", "¡El email no se corresponde " +
                "con ningún usuario de la base de datos!"));
        else {
            const user = users[0];
            delete user.password;
            callback(undefined, new User().fromDb(user));
        }
    });
};

service.logIn = (credentials, callback) => {
    validateCredentials(credentials, (err) => {
        if (err) {
            callback(err);
            return;
        }

        authenticateUser(credentials, (err, user) => {
            if (err) {
                callback(err);
                return;
            }

            let token = service.jwt.sign({
                user: credentials.email,
                valid: Date.now() / 1000
            }, service.sessionSecret);
            callback(undefined, token);
        });
    });
};

function authenticateUser(credentials, callback) {
    let encrPassword = service.crypto.createHmac("sha256", service.sessionSecret)
        .update(credentials.password).digest("hex");

    let query = {
        email: credentials.email,
        password: encrPassword
    };

    userDbManager.find(query, (err, users) => {
        if (err)
            callback(new BusinessException("user", `¡Ha ocurrido un problema 
                inesperado durante el proceso autenticación del usuario!`));
        else if (!users || users.length === 0)
            callback(new BusinessException("user",
                "¡El correo electrónico y/o la contraseña son inválidos!"));
        else
            callback(undefined, users[0]);
    });
}

service.signUp = (user, callback) => {
    validateUser(user, (err) => {
        if (err) {
            callback(err);
            return;
        }

        checkIfUniqueEmail(user, (err) => {
            if (err) {
                callback(err);
                return;
            }

            user.password = service.crypto
                .createHmac("sha256", service.sessionSecret)
                .update(user.password).digest("hex");

            userDbManager.save(user, (err, id) => {
                if (err)
                    callback(new BusinessException("user", `¡Ha ocurrido un problema 
                        inesperado durante el proceso de creación del usuario!`));
                else if (!id)
                    callback(new BusinessException("id", `¡Ha ocurrido un problema 
                        inesperado durante el proceso de almacenamiento del usuario!`));
                else {
                    let query = {
                        "_id": service.mongo.ObjectID(id)
                    };

                    userDbManager.find(query, (err, users) => {
                        if (err || !users || users.length === 0)
                            callback(new BusinessException("user", `¡Ha ocurrido un problema 
                                inesperado durante el proceso de creación del usuario!`));
                        else
                            callback(undefined, new User().fromDb(users[0]));
                    });
                }
            });
        });
    });
};

function checkIfUniqueEmail(user, callback) {
    const query = {
        email: user.email
    };

    userDbManager.find(query, (err, users) => {
        if (err)
            callback(new BusinessException("user", `¡Ha ocurrido un problema 
                insesperado durante el proceso de creación de la cuenta del usuario!`));
        else if (users.length > 0)
            callback(new BusinessException("email",
                "¡Ya existe en el sistema un usuario con el email introducido!"));
        else
            callback(undefined);
    });
}

function validateCredentials(credentials, callback) {
    let error;
    if (Util.isNotNullOrEmpty(credentials.email))
        error = new BusinessException("email", "¡El email del usuario es obligatorio!");
    else if (!Util.isValidEmail(credentials.email))
        error = new BusinessException("email", "¡El email del usuario debe segurir el formato string@string.string!");
    else if (Util.isNotNullOrEmpty(credentials.password))
        error = new BusinessException("password", "¡La contraseña es obligatoria!");
    callback(error);
}

function validateUser(user, callback) {
    let error;

    if (Util.isNotNullOrEmpty(user.firstName))
        error = new BusinessException("firstName", "¡El nombre del usuario es obligatorio!");
    else if (Util.isNotNullOrEmpty(user.lastName))
        error = new BusinessException("lastName", "¡Los apellidos del usuario son obligatorios!");
    else if (Util.isNotNullOrEmpty(user.email))
        error = new BusinessException("email", "¡El email del usuario es obligatorio!");
    else if (!Util.isValidEmail(user.email))
        error = new BusinessException("email", "¡El email del usuario debe segurir el formato string@string.string!");
    else if (Util.isNotNullOrEmpty(user.password))
        error = new BusinessException("email", "¡El email del usuario es obligatorio!");
    callback(error);
}

module.exports = service;
