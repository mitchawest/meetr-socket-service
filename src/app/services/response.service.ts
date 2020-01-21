import { IdentifiedRequest } from '@model/request.model';
import { CustomResponse } from '@model/response.model';
import { Response } from 'express';

/* Individual repsonse functions can be imported and will send the appropriate response status when used. */
export const okResponse = (req: IdentifiedRequest, res: Response, payload: object | string | number | object[] | string[] | number[]) => {
    res.status(200).send(new CustomResponse(200, req.requestIdentifier, req.path, payload).getResponse());
};

export const createdResponse = (req: IdentifiedRequest, res: Response, payload: object | string | number | object[] | string[] | number[]) => {
    res.status(201).send(new CustomResponse(201, req.requestIdentifier, req.path, payload).getResponse());
};

export const acceptedResponse = (req: IdentifiedRequest, res: Response, payload: object | string | number | object[] | string[] | number[]) => {
    res.status(202).send(new CustomResponse(202, req.requestIdentifier, req.path, payload).getResponse());
};

export const nonAuthoritativeResponse = (req: IdentifiedRequest, res: Response, payload: object | string | number | object[] | string[] | number[]) => {
    res.status(203).send(new CustomResponse(202, req.requestIdentifier, req.path, payload).getResponse());
};

export const noContentResponse = (req: IdentifiedRequest, res: Response, payload: object | string | number | object[] | string[] | number[]) => {
    res.status(204).send(new CustomResponse(204, req.requestIdentifier, req.path, payload).getResponse());
};

export const resetContentResponse = (req: IdentifiedRequest, res: Response, payload: object | string | number | object[] | string[] | number[]) => {
    res.status(205).send(new CustomResponse(205, req.requestIdentifier, req.path, payload).getResponse());
};

export const partialContentResponse = (req: IdentifiedRequest, res: Response, payload: object | string | number | object[] | string[] | number[]) => {
    res.status(206).send(new CustomResponse(206, req.requestIdentifier, req.path, payload).getResponse());
};

export const multiStatusResponse = (req: IdentifiedRequest, res: Response, payload: object | string | number | object[] | string[] | number[]) => {
    res.status(207).send(new CustomResponse(207, req.requestIdentifier, req.path, payload).getResponse());
};

export const alreadyReportedResponse = (req: IdentifiedRequest, res: Response, payload: object | string | number | object[] | string[] | number[]) => {
    res.status(208).send(new CustomResponse(208, req.requestIdentifier, req.path, payload).getResponse());
};

export const imUsedResponse = (req: IdentifiedRequest, res: Response, payload: object | string | number | object[] | string[] | number[]) => {
    res.status(226).send(new CustomResponse(226, req.requestIdentifier, req.path, payload).getResponse());
};
