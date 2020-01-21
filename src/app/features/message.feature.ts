import mongoService from '@service/mongo.service';
import { IdentifiedRequestHandler } from '@model/request.model';
import Session from '@model/session.model';
import logger from '@service/logger.service';
import { okResponse } from '@service/response.service';
import { performance } from 'perf_hooks';
import amqpService from '@service/amqp.service';

const messageHandler: { post: IdentifiedRequestHandler } = {
    /* Adds a message to session object in mongo. Updated session is posted to message queue and distributed to connected sockets */
    post: async (req, res, next) => {
        try {
            const t = performance.now();
            logger.info(`Request received | Method: ${req.method} | Route: ${req.path} | Identifier: ${req.requestIdentifier} | Data: ${JSON.stringify(req.query)}`);
            const userId = req.query.userId;
            const sessionId = req.query.sessionId;
            const nickName = req.query.nickName || null;
            const subject = req.query.subject;
            const content = req.query.content;
            const now = new Date().getTime();

            if (!userId || !sessionId || !content) {
                next(new Error(`Bad request. Params userId, content, and sessionId are required.`));
                return;
            }

            const message: Session['messages'][0] = {
                fromId: userId,
                fromNickName: nickName,
                sent: now,
                subject: subject,
                content: content
            };

            let [session] = await mongoService.get('session', { id: sessionId });
            if (!session) next(new Error(`Not found. No session found for id: ${sessionId}`));
            await mongoService.update('session', { id: session.id }, { $push: { messages: message }, $set: { lastActive: now } });
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

export default messageHandler;
