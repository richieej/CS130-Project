const { FusekiProxy } = require('../db/fuseki.js');

const fuseki = new FusekiProxy('Test', 'localhost', 3030);

test('Jest install', () => {
    expect(true).toBeTruthy();
});

test('Fuseki database connection', async () => {
    const connection = await fuseki.test_connection();
    expect(connection).toBe(true);
});