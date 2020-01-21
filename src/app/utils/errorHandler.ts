import { ERROR_CODES } from '@util/config';
import { CustomErrorResponse } from '@model/response.model';
import { IdentifiedErrorHandler } from '@model/request.model';
import logger from '@service/logger.service';

/* Error handler used by the express router to make for easier error responding in the features. Any caught error in features can be passed to the express next function callback
    and this service will interpret based on error code/message or fall back to a server error if code/message cannot be identified */
const errorHandler: IdentifiedErrorHandler = (err, req, res, next) => {
    logger.debug(err);
    const errorCode: number | null = Number(err.statusCode) || Number(err.code) || Number(err.status) || null;
    const errorMessage = err.message || err.errorMessage || err.Error || null;
    const statusCodes = Object.keys(ERROR_CODES);
    const statusMessages = Object.values(ERROR_CODES);
    /* If error code identified and is present in the error constant generate response object and send */
    if (errorCode && statusCodes.includes(errorCode.toString())) {
        logger.error(`Request error | Method: ${req.method} | Path: ${req.path} | Identifier: ${req.requestIdentifier} | Message: ${errorMessage}`);
        res.status(errorCode).send(new CustomErrorResponse(errorCode, req.requestIdentifier, req.path, errorMessage || ERROR_CODES[errorCode], err).getErrorResponse());
        next();
        return;
    }
    /* If error code not present or identified, but error message present and contains a string from the error constant values, generate response object and send */
    if (errorMessage) {
        let isSent = false;
        statusMessages.forEach(message => {
            if (errorMessage.toUpperCase().includes(message.toUpperCase())) {
                isSent = true;
                logger.error(`Request error | Method: ${req.method} | Path: ${req.path} | Identifier: ${req.requestIdentifier} | Message: ${errorMessage}`);
                const status = Object.keys(ERROR_CODES).find(key => ERROR_CODES[Number(key)] === message);
                res.status(Number(status)).send(new CustomErrorResponse(Number(status), req.requestIdentifier, req.path, errorMessage, err));
            }
        });
        if (isSent) return;
    }
    /* If response not yet identified, send server error */
    logger.error(`Request error | Method: ${req.method} | Path: ${req.path} | Identifier: ${req.requestIdentifier} | Message: ${errorMessage || 'Internal Server Error'}`);
    res.status(500).send(new CustomErrorResponse(500, req.requestIdentifier, req.path, errorMessage || ERROR_CODES[500], err).getErrorResponse());
    next();
};

export default errorHandler;
