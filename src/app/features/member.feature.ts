import mongoService from '@service/mongo.service';
import { IdentifiedRequestHandler } from '@model/request.model';
import Session from '@model/session.model';
import logger from '@service/logger.service';
import { okResponse } from '@service/response.service';
import { performance } from 'perf_hooks';
import amqpService from '@service/amqp.service';

const memberHandler: { post: IdentifiedRequestHandler; patch: IdentifiedRequestHandler; delete: IdentifiedRequestHandler } = {
    /* Adds a session member to session object in mongo. Updated session is posted to message queue and distributed to connected sockets */
    post: async (req, res, next) => {
        try {
            const t = performance.now();
            logger.info(`Request received | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Data: ${JSON.stringify(req.query)}`);
            const userId = req.query.userId;
            const connectionId = req.query.connectionId;
            const sessionId = req.query.sessionId;
            const nickName = req.query.nickName || null;
            const lat = req.query.lat ? Number(req.query.lat) : null;
            const long = req.query.long ? Number(req.query.long) : null;
            const now = new Date().getTime();

            if (!userId || !connectionId || !sessionId) {
                next(new Error(`Bad request. Params userId, connectionId, and sessionId are required.`));
                return;
            }

            const member: Session['members'][0] = {
                id: userId,
                connectionId: connectionId,
                nickName: nickName,
                lat: lat || null,
                long: long || null
            };

            let [session] = await mongoService.get('session', { id: sessionId });
            if (!session) next(new Error(`Not found. No session found for id: ${sessionId}`));
            await mongoService.update('session', { id: session.id }, { $push: { members: member }, $set: { lastActive: now } });
            const final = await mongoService.get('session', { id: sessionId });
            session = final[0];
            okResponse(req, res, session);
            logger.info(
                `Request processed | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Time: ${Number((performance.now() - t) / 1000).toPrecision(4)} seconds`
            );
            amqpService.send(session).catch(err => logger.error(err));
            logger.info(`Session update sent to queue.`);
        } catch (err) {
            next(err);
        }
    },
    /* Updates a session member on session object in mongo. Updated session is posted to message queue and distributed to connected sockets */
    patch: async (req, res, next) => {
        try {
            const t = performance.now();
            logger.info(`Request received | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Data: ${JSON.stringify(req.query)}`);
            const userId = req.query.userId;
            const connectionId = req.query.connectionId;
            const sessionId = req.query.sessionId;
            const nickName = req.query.nickName || null;
            const lat = req.query.lat ? Number(req.query.lat) : null;
            const long = req.query.long ? Number(req.query.long) : null;
            const now = new Date().getTime();

            if (!(userId || connectionId) || !sessionId) {
                next(new Error(`Bad request. Param sessionId and one of params userId or connectionId are required.`));
                return;
            }

            const whereValue = connectionId ? { id: sessionId, members: { $elemMatch: { connectionId: connectionId } } } : { id: sessionId, members: { $elemMatch: { id: userId } } };

            let [session] = await mongoService.get('session', { id: sessionId });
            if (!session) next(new Error(`Not found. No session found for id: ${sessionId}`));
            await mongoService.update('session', whereValue, {
                $set: { 'members.$.nickName': nickName, 'members.$.lat': lat, 'members.$.long': long, lastActive: now }
            });
            const final = await mongoService.get('session', { id: sessionId });
            session = final[0];
            okResponse(req, res, session);
            logger.info(
                `Request processed | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Time: ${Number((performance.now() - t) / 1000).toPrecision(4)} seconds`
            );
            amqpService.send(session).catch(err => logger.error(err));
            logger.info(`Session update sent to queue.`);
        } catch (err) {
            next(err);
        }
    },
    /* Removes a session member from session object in mongo. Updated session is posted to message queue and distributed to connected sockets */
    delete: async (req, res, next) => {
        try {
            const t = performance.now();
            logger.info(`Request received | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Data: ${JSON.stringify(req.query)}`);
            const userId = req.query.userId;
            const connectionId = req.query.connectionId;
            const sessionId = req.query.sessionId;
            const now = new Date().getTime();

            if (!(userId || connectionId) || !sessionId) {
                next(new Error(`Bad request. Param sessionId and one of params userId or connectionId are required.`));
                return;
            }

            const pullValue = connectionId ? { $pull: { members: { connectionId: connectionId } }, $set: { lastActive: now } } : { $pull: { members: { id: userId } }, $set: { lastActive: now } };

            let [session] = await mongoService.get('session', { id: sessionId });
            if (!session) next(new Error(`Not found. No session found for id: ${sessionId}`));
            await mongoService.update('session', { id: session.id }, pullValue);
            const final = await mongoService.get('session', { id: sessionId });
            session = final[0];
            okResponse(req, res, session);
            logger.info(
                `Request processed | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Time: ${Number((performance.now() - t) / 1000).toPrecision(4)} seconds`
            );
            amqpService.send(session).catch(err => logger.error(err));
            logger.info(`Session update sent to queue.`);
        } catch (err) {
            next(err);
        }
    }
};

export default memberHandler;
