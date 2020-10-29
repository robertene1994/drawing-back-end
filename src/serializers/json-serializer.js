const ExceptionResponse = require("../models/exception/exception-response");

module.exports = (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.error) {
        const ex = new ExceptionResponse(req.error.field, req.error.message);
        res.status(ex.code).json(ex.toJson());
    } else {
        res.status(200).json(req.data);
    }
};