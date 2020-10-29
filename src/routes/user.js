const userController = require("./../controllers/user"),
    root = "/user";

module.exports = (app) => {
    userController.init(app);

    app.get(`${root}/findByEmail/:email`, userController.findByEmail);
    app.post(`${root}/login`, userController.logIn);
    app.post(`${root}/signup`, userController.signUp);
};