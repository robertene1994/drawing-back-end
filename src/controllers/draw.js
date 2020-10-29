const drawService = require("../services/draw"),
    controller = {};

controller.init = (app) => {
    drawService.init(app);
};

module.exports = controller;