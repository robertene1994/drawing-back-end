const drawController = require("./../controllers/draw"),
    root = "/draw";

module.exports = (app) => {
    drawController.init(app);
};