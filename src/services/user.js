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

service.findAll = () => {
    return new Promise(async (resolve, reject) => {
        const usersDb = await userDbManager.find({}).catch(_err => {
            reject(new BusinessException("user",
                "¡Ha ocurrido un problema inesperado durante el proceso de recuperación de usuarios!"));
        });

        let users = [];
        if (usersDb.length === 0)
            resolve(users);
        else {
            usersDb.forEach((userDb) => {
                let user = new User().fromDb(userDb);
                user.password = undefined;
                users.push(user);

                if (users.length === usersDb.length)
                    resolve(users);
            });
        }
    });

};

service.findByEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        if (Util.isNotNullOrEmpty(email) || !Util.isValidEmail(email)) {
            reject(new BusinessException("email",
                "¡El email del usuario debe segurir el formato string@string.string!"));
        }

        const users = await userDbManager.find({
            email: email
        }).catch(_err => {
            reject(new BusinessException("user",
                "¡Ha ocurrido un problema inesperado durante el proceso de recuperación del usuario!"));
        });

        if (!users || users.length === 0)
            reject(new BusinessException("user",
                "¡El email no se corresponde con ningún usuario de la base de datos!"));
        else {
            const user = users[0];
            delete user.password;
            resolve(new User().fromDb(user));
        }
    });
};


service.logIn = async (credentials) => {
    await validateCredentials(credentials);
    if (await authenticateUser(credentials))
        return service.jwt.sign({
            user: credentials.email,
            valid: Date.now() / 1000
        }, service.sessionSecret);
};

function authenticateUser(credentials) {
    return new Promise(async (resolve, reject) => {
        const encrPassword = service.crypto.createHmac("sha256", service.sessionSecret)
            .update(credentials.password).digest("hex");

        const users = await userDbManager.find({
            email: credentials.email,
            password: encrPassword
        }).catch(_err => {
            reject(new BusinessException("user",
                `¡Ha ocurrido un problema inesperado durante el proceso autenticación del usuario!`));
        });

        if (!users || users.length === 0)
            reject(new BusinessException("user", "¡El correo electrónico y/o la contraseña son inválidos!"));
        else
            resolve(users[0]);
    });
}

service.signUp = async (user) => {
    return new Promise(async (resolve, reject) => {
        await validateUser(user);

        if (await checkIfUniqueEmail(user)) {
            user.password = service.crypto
                .createHmac("sha256", service.sessionSecret)
                .update(user.password).digest("hex");

            const id = await userDbManager.save(user).catch(_err => {
                console.log("asdas");
                console.log(_err);
                reject(new BusinessException("user",
                    "¡Ha ocurrido un problema inesperado durante el proceso de creación del usuario!"));
            });
            if (!id)
                reject(new BusinessException("id",
                    "¡Ha ocurrido un problema inesperado durante el proceso de almacenamiento del usuario!"));
            else {
                const users = await userDbManager.find({
                    "_id": service.mongo.ObjectID(id)
                }).catch(_err => {
                    reject(new BusinessException("user",
                        "¡Ha ocurrido un problema inesperado durante el proceso de creación del usuario!"));
                });

                if (!users || users.length === 0)
                    reject(new BusinessException("user",
                        "¡Ha ocurrido un problema inesperado durante el proceso de creación del usuario!"));
                else
                    resolve(new User().fromDb(users[0]));
            }
        }
    });
};

function checkIfUniqueEmail(user) {
    return new Promise(async (resolve, reject) => {
        const users = await userDbManager.find({
            email: user.email
        }).catch(_err => {
            reject(new BusinessException("user",
                "¡Ha ocurrido un problema insesperado durante el proceso de creación de la cuenta del usuario!"));
        });

        if (users.length > 0)
            reject(new BusinessException("email",
                "¡Ya existe en el sistema un usuario con el email introducido!"));
        else
            resolve(true);
    });
}

function validateCredentials(credentials) {
    return new Promise((resolve, reject) => {
        if (Util.isNotNullOrEmpty(credentials.email))
            reject(new BusinessException("email", "¡El email del usuario es obligatorio!"));
        else if (!Util.isValidEmail(credentials.email))
            reject(new BusinessException("email", "¡El email del usuario debe segurir el formato string@string.string!"));
        else if (Util.isNotNullOrEmpty(credentials.password))
            reject(new BusinessException("password", "¡La contraseña es obligatoria!"));
        else
            resolve();
    });
}

function validateUser(user) {
    return new Promise((resolve, reject) => {
        if (Util.isNotNullOrEmpty(user.firstName))
            reject(new BusinessException("firstName", "¡El nombre del usuario es obligatorio!"));
        else if (Util.isNotNullOrEmpty(user.lastName))
            reject(new BusinessException("lastName", "¡Los apellidos del usuario son obligatorios!"));
        else if (Util.isNotNullOrEmpty(user.email))
            reject(new BusinessException("email", "¡El email del usuario es obligatorio!"));
        else if (!Util.isValidEmail(user.email))
            reject(new BusinessException("email", "¡El email del usuario debe segurir el formato string@string.string!"));
        else if (Util.isNotNullOrEmpty(user.password))
            reject(new BusinessException("email", "¡El email del usuario es obligatorio!"));
        else
            resolve(true);
    });
}

module.exports = service;
