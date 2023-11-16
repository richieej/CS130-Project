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
        expect(write_result.error).toBeFalsy();
        expect(write_result.results).toBe(true);
        const read_result = await fuseki.read_data(read_test);
        expect(read_result.error).toBeFalsy();
        expect(read_result.headers).toStrictEqual(["name", "schoolName"]);
        expect(read_result.data).toBeTruthy();
        expect(read_result.data[0].name).toBeTruthy();
        expect(read_result.data[0].schoolName).toBeTruthy();
        expect(read_result.data[0].name.value).toBe("Joe Bruin");
        expect(read_result.data[0].schoolName.value).toBe("University of California - Los Angeles");
    } finally {
        const delete_result = await fuseki.write_data(delete_test);
        expect(delete_result.error).toBeFalsy();
        expect(delete_result.results).toBe(true);
        const read_result = await fuseki.read_data(read_test);
        expect(read_result.error).toBeFalsy();
        expect(read_result.headers).toStrictEqual(["name", "schoolName"]);
        expect(read_result.data).toStrictEqual([]);
    }
});

test('Write query with bad syntax returns false and no change', async () => {
    const write_test = `
        PREFIX eql: <http://excql.org/relations/#>
        INSERT DATA
        {
            <http://students/GeneBlock>
                eql:name "Gene Block";
                eql:school <http://schools/UCLA> 
            <http://schools/UCLA>
                eql:name "University of California - Los Angeles" 
        }
    `; // missing '.' at end of rows

    const read_test = `
        PREFIX eql: <http://excql.org/relations/#>
        SELECT ?name ?schoolName
        WHERE {
            ?student eql:school ?school.
            ?student eql:name ?name.
            ?school eql:name ?schoolName.
            FILTER (?name="Gene Block").
        }
    `;

    const delete_test = `
        PREFIX eql: <http://excql.org/relations/#>
        DELETE DATA
        {
            <http://students/GeneBlock>
                eql:name "Gene Block";
                eql:school <http://schools/UCLA> .
            <http://schools/UCLA>
                eql:name "University of California - Los Angeles" .
        }
    `;

    try {
        const write_result = await fuseki.write_data(write_test);
        expect(write_result.error).toBeTruthy();
        expect(write_result.results).toBe(false);
        const read_result = await fuseki.read_data(read_test);
        expect(read_result.error).toBeFalsy();
        expect(read_result.data).toStrictEqual([]);
        expect(read_result.headers).toStrictEqual(["name", "schoolName"]);
    } finally {
        const delete_result = await fuseki.write_data(delete_test);
        expect(delete_result.error).toBeFalsy(); // When nothing to delete, no error
        expect(delete_result.results).toBe(true);
    }
});

test('Read query with bad syntax returns error', async () => {
    const write_test = `
        PREFIX eql: <http://excql.org/relations/#>
        INSERT DATA
        {
            <http://students/TracyZhao>
                eql:name "Tracy Zhao";
                eql:school <http://schools/UCLA> .
            <http://schools/UCLA>
                eql:name "University of California - Los Angeles" .
        }
    `;
    const read_test = `
        PREFIX eql: <http://excql.org/relations/#>
        SELECT ?name ?schoolName
        WHERE {
            ?student eql:school ?school
            ?student eql:name ?name
            ?school eql:name ?schoolName
            FILTER (?name="Tracy Zhao")
        }
        LIMIT 1
    `;
    const delete_test = `
        PREFIX eql: <http://excql.org/relations/#>
        DELETE DATA
        {
            <http://students/TracyZhao>
                eql:name "Tracy Zhao";
                eql:school <http://schools/UCLA> .
            <http://schools/UCLA>
                eql:name "University of California - Los Angeles" .
        }
    `;
    
    try {
        const write_result = await fuseki.write_data(write_test);
        expect(write_result.error).toBeFalsy();
        expect(write_result.results).toBe(true);
        const read_result = await fuseki.read_data(read_test);
        expect(read_result.error).toBeTruthy();
        expect(read_result.data).toStrictEqual([]);
        expect(read_result.headers).toStrictEqual([]);
    } finally {
        const delete_result = await fuseki.write_data(delete_test);
        expect(delete_result.error).toBeFalsy();
        expect(delete_result.results).toBe(true);
    }
});
