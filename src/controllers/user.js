const next = require("../serializers/json-serializer"),
    Credentials = require("../models/credentials"),
    User = require("../models/user"),
    userService = require("../services/user"),
    controller = {};

controller.init = (app) => {
    userService.init(app);
};

controller.findByEmail = async (req, res) => {
    const email = req.params.email;
    req.data = await userService.findByEmail(email).catch(err => req.error = err);
    next(req, res);
};

controller.logIn = async (req, res) => {
    const credentials = new Credentials().fromJson(req.body);
    req.data = await userService.logIn(credentials).catch(err => req.error = err);
    next(req, res);
};


controller.signUp = async (req, res) => {
    const user = new User().fromJson(req.body);
    req.data = await userService.signUp(user).catch(err => req.error = err);
    next(req, res);
};

module.exports = controller;
