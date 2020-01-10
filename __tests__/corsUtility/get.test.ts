import init from '@app/server';
import request from 'supertest';
import { Server } from 'http';
import { blacklist, whitelist } from '@util/config';

describe('CORS', () => {
    let server: Server;
    beforeAll(async () => {
        process.env.NODE_ENV = 'DEV';
        process.env.NAMESPACE = 'mitchell-west.com';
        process.env.SERVER_PORT = '8008';
        process.env.DEFAULTLOGLEVEL = 'info';
        process.env.LOGCONSOLE = 'true';
        server = await init();
    });

    test('Whitelist - Positive Scenario', async (done) => {
        await whitelist.push('http://google.com');
        const response = await request(server).get('/').set('Origin', 'http://google.com');
        expect(response.status).toEqual(200);
        await whitelist.pop();
        done();
    });

    test('Whitelist - Negative Scenario', async (done) => {
        await whitelist.push('http://google.com');
        const response = await request(server).get('/').set('Origin', 'https://google.com');
        expect(response.status).toEqual(401);
        await whitelist.pop();
        done();
    });

    test('Blacklist - Positive Scenario', async (done) => {
        await blacklist.push('http://google.com');
        const response = await request(server).get('/').set('Origin', 'https://google.com');
        expect(response.status).toEqual(200);
        await blacklist.pop();
        done();
    });

    test('Blacklist - Negative Scenario', async (done) => {
        await blacklist.push('http://google.com');
        const response = await request(server).get('/').set('Origin', 'http://google.com');
        expect(response.status).toEqual(401);
        await blacklist.pop();
        done();
    });

    afterAll(() => {
        server.close();
    })
});
