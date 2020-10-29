module.exports = (app, express) => {
    const sessionSecret = app.get("sessionSecret"),
        jwt = app.get("jwt"),
        userToken = express.Router();

    userToken.use((req, res, next) => {
        const token = req.body.authorization ||
            req.query.authorization ||
            req.headers.authorization;

        if (token !== null) {
            jwt.verify(token, sessionSecret, (err, token) => {
                if (err || (Date.now() / 1000 - token.valid) > 24 * 60 * 60) {
                    res.status(403).json({
                        acceso: false,
                        error: "Token invalido o caducado"
                    });
                    return;
                } else {
                    res.user = token.user;
                    next();
                }
            });
        } else {
            res.status(403).json({
                acceso: false,
                mensaje: "No hay Token"
            });
        }
    });

    app.get("/user/findByEmail/:email", userToken);
    app.get("/draw", userToken);
};