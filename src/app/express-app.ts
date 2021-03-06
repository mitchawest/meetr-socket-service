import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import multer from 'multer';

import router from '@app/routes';
import { identifyRequest, corsHandler } from '@util/utils';
import errorHandler from '@util/errorHandler';

const expressInit = (): Promise<express.Application> =>
    new Promise((resolve, reject) => {
        try {
            /* Initialize express app */
            const app = express();

            /* for parsing application/json, www-form-urlencoded, and multipart/form-data */
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(bodyParser.json());
            app.use(multer().fields([]));

            /* Add request identifier if not present */
            app.use(identifyRequest);

            /* Allow or disallow origins */
            app.use(corsHandler);

            /* use to protect with strict transport security */
            app.use(
                helmet.hsts({
                    maxAge: 10886400000, // Must be at least 18 weeks to be approved
                    includeSubDomains: true, // Must be enabled to be approved
                    preload: true
                })
            );

            /* X-XSS-Protection prevent reflected XSS attacks */
            app.use(helmet.xssFilter());

            app.use(router);

            /* Handle any errors generated by routes or previous handlers */
            app.use(errorHandler);

            resolve(app);
        } catch (err) {
            reject(err);
        }
    });

export default expressInit;
