// Custom class to handle http Errors better
interface HttpErrorOptions {
    message: string;
    status: number;
    details?: string;
    errorCode?: string;
}

export default class HttpError extends Error {
    public status: number;
    public details?: string;
    public errorCode?: string;

    constructor({ message, status, details, errorCode }: HttpErrorOptions) {
        super(message); // init Error with message
        this.status = status;
        this.details = details;
        this.errorCode = errorCode;
        this.name = 'HttpError';
    }
}
