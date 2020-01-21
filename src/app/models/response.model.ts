interface ResponseBody {
    responseMetaData: {
        statusCode: number;
        requestIdentifier: string;
        api: string;
    };
    responsePayloadData: {
        data: object | string | number | object[] | string[] | number[];
    };
}

interface ErrorResponseBody {
    statusCode: number;
    requestIdentifier: string;
    api: string;
    message: string;
    stackTrace: string | object;
}

export class CustomResponse {
    public response: ResponseBody;

    constructor(statusCode: number, requestIdentifier: string, path: string, payload: ResponseBody['responsePayloadData']['data']) {
        this.response = {
            responseMetaData: {
                statusCode: statusCode,
                requestIdentifier: requestIdentifier,
                api: path
            },
            responsePayloadData: {
                data: payload
            }
        };
    }

    getResponse = () => this.response;
}

export class CustomErrorResponse {
    public errorResponse: ErrorResponseBody;

    constructor(statusCode: number, requestIdentifier: string, path: string, message: string, stackTrace: Error) {
        this.errorResponse = {
            statusCode: statusCode,
            requestIdentifier: requestIdentifier,
            api: path,
            message: message,
            stackTrace: stackTrace.stack
        };
    }

    getErrorResponse = () => this.errorResponse;
}
