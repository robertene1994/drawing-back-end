module.exports = class Credentials {
    constructor(email = undefined, password = undefined) {
        this.email = email;
        this.password = password;
    }

    fromJson(obj) {
        this.email = obj.email;
        this.password = obj.password;
        return this;
    }

    toJson() {
        return {
            "email": this.email,
            "password": this.password
        };
    }
};