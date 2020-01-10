import init from '@app/server';
import request from 'supertest';
import { Server } from 'http';

describe('Test routes for response and error coverage', () => {
    let server: Server;
    beforeAll(async () => {
        process.env.NODE_ENV = 'DEV';
        process.env.NAMESPACE = 'mitchell-west.com';
        process.env.SERVER_PORT = '8008';
        process.env.DEFAULTLOGLEVEL = 'info';
        process.env.LOGCONSOLE = 'true';
        server = await init();
    });

    test('GET Swagger UI', async (done) => {
        const response = await request(server).get('/');
        expect(response.status).toEqual(200);
        done();
    });

    test('GET - (200) Scenario', async (done) => {
        const response = await request(server).get('/test/ok');
        expect(response.status).toEqual(200);
        done();
    });

    test('GET - (201) Scenario', async (done) => {
        const response = await request(server).get('/test/created');
        expect(response.status).toEqual(201);
        done();
    });

    test('GET - (202) Scenario', async (done) => {
        const response = await request(server).get('/test/accepted');
        expect(response.status).toEqual(202);
        done();
    });

    test('GET - (203) Scenario', async (done) => {
        const response = await request(server).get('/test/nonAuthoritative');
        expect(response.status).toEqual(203);
        done();
    });

    test('GET - (204) Scenario', async (done) => {
        const response = await request(server).get('/test/noContent');
        expect(response.status).toEqual(204);
        done();
    });

    test('GET - (205) Scenario', async (done) => {
        const response = await request(server).get('/test/resetContent');
        expect(response.status).toEqual(205);
        done();
    });

    test('GET - (206) Scenario', async (done) => {
        const response = await request(server).get('/test/partialContent');
        expect(response.status).toEqual(206);
        done();
    });

    test('GET - (207) Scenario', async (done) => {
        const response = await request(server).get('/test/multiStatus');
        expect(response.status).toEqual(207);
        done();
    });

    test('GET - (208) Scenario', async (done) => {
        const response = await request(server).get('/test/alreadyReported');
        expect(response.status).toEqual(208);
        done();
    });

    test('GET - (226) Scenario', async (done) => {
        const response = await request(server).get('/test/imUsed');
        expect(response.status).toEqual(226);
        done();
    });

    test('GET - Negative Error by code', async (done) => {
        const response = await request(server).get('/test/errorByCode')
        expect(response.status).toEqual(500);
        done();
    });

    test('GET - Negative Error by message', async (done) => {
        const response = await request(server).get('/test/errorByMessage')
        expect(response.status).toEqual(400);
        done();
    });

    test('GET - Negative Error with none', async (done) => {
        const response = await request(server).get('/test/errorWithNone')
        expect(response.status).toEqual(500);
        done();
    });

    afterAll(() => {
        server.close();
    })
});
