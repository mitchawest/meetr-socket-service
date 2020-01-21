import express from 'express';
import swaggerService from '@service/swaggerui.service';
import sessionHandler from '@feature/session.feature';
import memberHandler from '@feature/member.feature';
import messageHandler from '@feature/message.feature';

const router = express.Router();

router.use('/', swaggerService.serve());
router.get('/', swaggerService.setup());
router.get('/api-docs', (req, res, next) => res.status(200).send(swaggerService.getJson()));

router.get('/session', sessionHandler.get);
router.post('/session', sessionHandler.post);
router.delete('/session', sessionHandler.delete);

router.post('/member', memberHandler.post);
router.patch('/member', memberHandler.patch);
router.delete('/member', memberHandler.delete);

router.post('/message', messageHandler.post);

export default router;
