module.exports = (app) => {
    app.use((err, _req, res, _next) => {
        console.log("Error: " + err);
        if (!res.headersSent)
            res.status(400).send("Recurso no disponible");
    });
};
