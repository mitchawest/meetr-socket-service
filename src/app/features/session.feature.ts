import uuidv4 from 'uuid/v4';

import mongoService from '@service/mongo.service';
import { IdentifiedRequestHandler } from '@model/request.model';
import Session from '@model/session.model';
import logger from '@service/logger.service';
import { okResponse, createdResponse } from '@service/response.service';
import { performance } from 'perf_hooks';

const sessionHandler: { get: IdentifiedRequestHandler; post: IdentifiedRequestHandler; delete: IdentifiedRequestHandler } = {
    get: async (req, res, next) => {
        try {
            const t = performance.now();
            logger.info(`Request received | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Data: ${JSON.stringify(req.query)}`);
            const sessionId = req.query.sessionId;
            if (!sessionId) {
                next(new Error(`Bad request. Param sessionId is required.`));
                return;
            }

            const [session] = await mongoService.get('session', { id: sessionId });
            if (!session) next(new Error(`Not found. No session found for id: ${sessionId}`));
            okResponse(req, res, session);
            logger.info(
                `Request processed | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Time: ${Number((performance.now() - t) / 1000).toPrecision(4)} seconds`
            );
        } catch (err) {
            next(err);
        }
    },
    post: async (req, res, next) => {
        try {
            const t = performance.now();
            logger.info(`Request received | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Data: ${JSON.stringify(req.query)}`);
            const userId = req.query.userId;
            const nickName = req.query.nickName || null;
            const now = new Date().getTime();
            if (!userId) {
                next(new Error(`Bad request. Param userId is required.`));
                return;
            }

            const session: Session = {
                id: uuidv4(),
                owner: userId,
                ownerNickName: nickName,
                created: now,
                lastActive: now,
                members: [],
                messages: [],
                active: true
            };

            let response = await mongoService.set('session', session);
            createdResponse(req, res, response.ops);
            logger.info(
                `Request processed | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Time: ${Number((performance.now() - t) / 1000).toPrecision(4)} seconds`
            );
        } catch (err) {
            next(err);
        }
    },
    delete: async (req, res, next) => {
        try {
            const t = performance.now();
            logger.info(`Request received | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Data: ${JSON.stringify(req.query)}`);
            const sessionId = req.query.sessionId;
            if (!sessionId) next(new Error('Bad request. Param sessionId is required.'));

            await mongoService.update('session', { id: sessionId }, { $set: { active: false } });
            const [session] = await mongoService.get('session', { id: sessionId });
            okResponse(req, res, session);
            logger.info(
                `Request processed | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Time: ${Number((performance.now() - t) / 1000).toPrecision(4)} seconds`
            );
        } catch (err) {
            next(err);
        }
    }
};

export default sessionHandler;
