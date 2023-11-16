const { FusekiProxy } = require('../db/fuseki.js');

const fuseki = new FusekiProxy('Test', 'localhost', 3030);

test('Jest install', () => {
    expect(true).toBeTruthy();
});

test('Fuseki database connection', async () => {
    const connection = await fuseki.test_connection();
    expect(connection).toBe(true);
});

test('Write and read to Fuseki database', async () => {
    const write_test = `
        PREFIX eql: <http://excql.org/relations/#>
        INSERT DATA
        {
            <http://students/JoeBruin>
                eql:name "Joe Bruin";
                eql:school <http://schools/UCLA> .
            <http://schools/UCLA>
                eql:name "University of California - Los Angeles" .
        }
    `;
    const read_test = `
        PREFIX eql: <http://excql.org/relations/#>
        SELECT ?name ?schoolName
        WHERE {
            ?student eql:school ?school.
            ?student eql:name ?name.
            ?school eql:name ?schoolName.
            FILTER (?name="Joe Bruin").
        }
        LIMIT 1
    `;
    const delete_test = `
        PREFIX eql: <http://excql.org/relations/#>
        DELETE DATA
        {
            <http://students/JoeBruin>
                eql:name "Joe Bruin";
                eql:school <http://schools/UCLA> .
            <http://schools/UCLA>
                eql:name "University of California - Los Angeles" .
        }
    `;

    try {
        const write_result = await fuseki.write_data(write_test);
        expect(write_result).toBe(true);
        const read_result = await fuseki.read_data(read_test);
        console.log(read_result)
        expect(read_result).toBeTruthy();
        expect(read_result.headers).toStrictEqual(["name", "schoolName"]);
        expect(read_result.data).toBeTruthy();
        expect(read_result.data[0].name).toBeTruthy();
        expect(read_result.data[0].schoolName).toBeTruthy();
        expect(read_result.data[0].name.value).toBe("Joe Bruin");
        expect(read_result.data[0].schoolName.value).toBe("University of California - Los Angeles");
    } finally {
        const delete_result = await fuseki.write_data(delete_test);
        expect(delete_result).toBeTruthy();
        const read_result = await fuseki.read_data(read_test);
        expect(read_result).toBeTruthy();
        expect(read_result.headers).toStrictEqual(["name", "schoolName"]);
        expect(read_result.data).toStrictEqual([]);
    }
});