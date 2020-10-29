module.exports = class BusinessException extends Error {
    constructor(field, message) {
        super(message);
        this.field = field;
    }
};