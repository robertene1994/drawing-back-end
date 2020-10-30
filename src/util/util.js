const emailRegExp = new RegExp("^([_a-zA-Z0-9-]+(\\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*(\\.[a-zA-Z]{1,6}))?$"),
    util = {};

util.isInt = (value) => {
    if (isNaN(value))
        return false;
    var x = parseFloat(value);
    return (x | 0) === x;
};

util.isNotNullOrEmpty = (value) => {
    return !value || value.trim().length === 0;
};

util.isValidEmail = (value) => {
    return emailRegExp.test(value);
};

util.isJson = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

module.exports = util;
