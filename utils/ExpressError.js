class ExpressError extends Error{
    constructor(statusCode, Message){
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = ExpressError;