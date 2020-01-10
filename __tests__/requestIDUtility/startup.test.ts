import init from '@app/server';
import request from 'supertest';
import { Server } from 'http';
import { bodyWithIdentifier, bodyWithoutIdentifier } from '@mock/post.mock';

describe('Request Identifier', () => {
    let server: Server;
    beforeAll(async () => {
        process.env.NODE_ENV = 'DEV';
        process.env.NAMESPACE = 'mitchell-west.com';
        process.env.SERVER_PORT = '8008';
        process.env.DEFAULTLOGLEVEL = 'info';
        process.env.LOGCONSOLE = 'true';
        server = await init();
    });

    test('Identifier in header', async (done) => {
        const response = await request(server)
            .post('/test?requestIdentifier=abc123')
            .set('requestIdentifier', 'abc123')
            .send(bodyWithoutIdentifier);
        expect(response.status).toEqual(200);
        done();
    });

    test('Identifier in query', async (done) => {
        const response = await request(server)
            .post('/test?requestIdentifier=abc123')
            .send(bodyWithoutIdentifier);
        expect(response.status).toEqual(200);
        done();
    });

    test('Identifier in body', async (done) => {
        const response = await request(server).post('/test')
            .send(bodyWithIdentifier);
        expect(response.status).toEqual(200);
        done();
    });

    afterAll(() => {
        server.close();
    })
});
