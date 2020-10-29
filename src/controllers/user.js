const next = require("../serializers/json-serializer"),
    Credentials = require("../models/credentials"),
    User = require("../models/user"),
    userService = require("../services/user"),
    controller = {};

controller.init = (app) => {
    userService.init(app);
};


controller.findByEmail = (req, res) => {
    const email = req.params.email;

    userService.findByEmail(email, (err, user) => {
        if (err)
            req.error = err;
        else
            req.data = user;
        next(req, res);
    });
};

controller.logIn = (req, res) => {
    const credentials = new Credentials().fromJson(req.body);

    userService.logIn(credentials, (err, token) => {
        if (err)
            req.error = err;
        else
            req.data = token;
        next(req, res);
    });
};


controller.signUp = (req, res) => {
    const user = new User().fromJson(req.body);

    userService.signUp(user, (err, user) => {
        if (err)
            req.error = err;
        else
            req.data = user;
        next(req, res);
    });
};

module.exports = controller;
