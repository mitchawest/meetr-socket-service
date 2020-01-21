import uuidv4 from 'uuid/v4';
import { Validator, ValidationError } from 'jsonschema';
import { IdentifiedRequestHandler } from '@model/request.model';
import { whitelist, blacklist } from '@util/config';
// import jwtService from '@service/jwt.service';

/* Set the request identifier if included in body, headers, or query. If not included set random value. */
export const identifyRequest: IdentifiedRequestHandler = (req, res, next) => {
    if (req.body && req.body.requestMetaData && req.body.requestMetaData.requestIdentifier) {
        req.requestIdentifier = req.body.requestMetaData.requestIdentifier;
        next();
        return;
    }

    if (req.headers && (req.headers.requestIdentifier || req.headers.requestidentifier || req.headers.REQUESTIDENTIFIER)) {
        req.requestIdentifier = (req.headers.requestIdentifier as string) || (req.headers.requestidentifier as string) || (req.headers.REQUESTIDENTIFIER as string);
        next();
        return;
    }

    if (req.query && req.query.requestIdentifier) {
        req.requestIdentifier = req.query.requestIdentifier;
        next();
        return;
    }
    req.requestIdentifier = uuidv4();
    next();
};

/* CORS options. Configure whitelist if desired behavior is to only allow specified origins.
    Configure blacklist if desired behavior is to only disallow specified origins.
    Configure neither if origin filter is not required. */
export const corsHandler: IdentifiedRequestHandler = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    let origin = (req.headers.Origin as string) || (req.headers.ORIGIN as string) || (req.headers.origin as string) || null;

    if (origin && whitelist && whitelist.length) {
        if (whitelist.indexOf(origin) !== -1 || whitelist.indexOf(origin.toUpperCase()) !== -1) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            next();
            return;
        } else {
            next(new Error(`Unauthorized. Origin ${origin} not allowed by CORS policy.`));
            return;
        }
    }
    if (origin && blacklist && blacklist.length) {
        if (blacklist.indexOf(origin) !== -1 || blacklist.indexOf(origin.toUpperCase()) !== -1) {
            next(new Error(`Unauthorized. Origin ${origin} not allowed by CORS policy.`));
            return;
        } else {
            res.setHeader('Access-Control-Allow-Origin', origin);
            next();
            return;
        }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
};

// export const checkAuth: IdentifiedRequestHandler = (req, res, next) => {
//     const authHeader = (req.headers.Authorization as string) || (req.headers.authorization as string) || (req.headers.AUTHORIZATION as string) || null;
//     if (!authHeader) {
//         req.authorized = false;
//         next();
//         return;
//     }
//     const token = authHeader.replace('Bearer ', '').replace('BEARER ', '');
//     jwtService
//         .verify(token)
//         .then((verified: { identifier: string; permissions: [{ namespace: string; scopes: any[] }] }) => {
//             req.authorized = true;
//             req.authorizationLevel = 4;
//             const authPermission = verified.permissions.find(permission => permission.namespace === process.env.NAMESPACE);
//             if (authPermission && authPermission.scopes.length) {
//                 const writeLevel = authPermission.scopes.find(scope => scope.level === 6);
//                 if (writeLevel) req.authorizationLevel = 6;
//                 next();
//                 return;
//             }
//             next();
//         })
//         .catch(err => {
//             req.authorized = false;
//             next();
//         });
// };

export const validateSchema = (instance: any, schema: any) =>
    new Promise(resolve => {
        const validator = new Validator();
        let response = validator.validate(instance, schema);
        if (response.errors && response.errors.length) {
            let errors = response.errors.map(e => e.property.replace('instance.', '') + ` ${e.message}`);
            resolve(JSON.stringify(errors));
        } else {
            resolve();
        }
    });

export const decodeParams = (url: string) => {
    const params: { [key: string]: string } = {};
    if (!url.split('?')[1]) return {};
    url.split('?')[1]
        .split('&')
        .forEach((param, i) => {
            params[param.split('=')[0]] = param.split('=')[1];
        });
    return params;
};
