class ErrorResponse extends Error {
    constructor(message, status_Code, name) {
        super(message);
        this.statusCode = status_Code;
        if (name) { this.name = name }
    }
}

module.exports = ErrorResponse;