module.exports = class ExceptionResponse {
    constructor(field, message) {
        this.field = field;
        this.code = "400";
        this.exception = "BusinessException";
        this.message = message;
    }

    toJson() {
        return {
            "field": this.field,
            "code": this.code,
            "exception": this.exception,
            "message": this.message
        };
    }
};