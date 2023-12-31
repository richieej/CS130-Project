const request = require("supertest");
const app = require("../server.js");
const { MappingDBProxy } = require('../db/mapping.js');


require("dotenv").config();

const map_db = new MappingDBProxy();

/* Connecting to the database before each test. */
beforeAll(async () => {
    await map_db.connect();
});

afterAll(async () => {
    await map_db.disconnect();
});


describe("GET /mappings", () => {
    it("should get all the mappings", async () => {
  
      const response = await request(app)
        .get("/mappings")
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBeGreaterThan(1);
    });
});


describe("GET /mappings/mapping", () => {
    it("should get all the mappings of user id", async () => {
  
      const response = await request(app)
        .get("/mappings/mapping")
        .query({uuid: "015ad7d4-502f-4032-b806-9f595e1646c1"})
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("uuid");
      expect(response.body.uuid).toEqual('015ad7d4-502f-4032-b806-9f595e1646c1');
    });
});


describe("POST /mappings/add", () => {
    it("add a mapping to the database", async () => {
  
      const response_post = await request(app)
        .post("/mappings/add")
        .send({name: "unit-test", owner_uuid: "PLACEHOLDER", read_query: "unit-read", write_query: "unit-write"})
        .set('Accept', 'application/json');

      const response_get = await request(app)
        .get("/mappings")
        .set('Accept', 'application/json');

      expect(response_post.statusCode).toBe(200);

      expect(response_get.body).toContainEqual(expect.objectContaining(
        {name: "unit-test", 
        owner_uuid: "PLACEHOLDER", 
        read_query: "unit-read", 
        write_query: "unit-write"}
      ));

    //   map_db.delete_mapping(response_post.body);

      const response_del = await request(app)
        .delete("/mappings")
        .query({uuid:response_post.body})
        .set('Accept', 'application/json');

    });
});


describe("GET /mappings/edit", () => {
    it("should delete the specified mapping and add a new one", async () => {
  
      const response_post = await request(app)
        .post("/mappings/add")
        .send({name: "unit-test", owner_uuid: "PLACEHOLDER", read_query: "unit-read", write_query: "unit-write"})
        .set('Accept', 'application/json');


      const response = await request(app)
        .post("/mappings/edit")
        .send({uuid: response_post.body,
               name: "unit-test-edit", 
               owner_uuid: "PLACEHOLDER", 
               read_query: "edit-read", 
               write_query: "edit-write"})
        .set('Accept', 'application/json');

      const response_get = await request(app)
        .get("/mappings")
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response_get.body).toContainEqual(expect.objectContaining(
            {name: "unit-test-edit", 
            owner_uuid: "PLACEHOLDER", 
            read_query: "edit-read", 
            write_query: "edit-write"}));

      const response_del = await request(app)
        .delete("/mappings")
        .query({uuid:response.body})
        .set('Accept', 'application/json');
    });
});


describe("DELETE /mappings", () => {
    it("should delete specified mapping", async () => {
  
      const response_post = await request(app)
        .post("/mappings/add")
        .send({name: "unit-test", owner_uuid: "PLACEHOLDER", read_query: "unit-read", write_query: "unit-write"})
        .set('Accept', 'application/json');

      const response = await request(app)
        .delete("/mappings")
        .query({uuid:response_post.body})
        .set('Accept', 'application/json');

      const response_get = await request(app)
        .get("/mappings")
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);
      expect(response_get.body).not.toContainEqual(expect.objectContaining(
        {_id: response_post.body}
      ));
    });
});


describe("GET /users", () => {
      it("should get all the users", async () => {
    
        const response = await request(app)
          .get("/users")
          .set('Accept', 'application/json');
  
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(6);
      });
});


describe("GET /users/user", () => {
  it("should get a user by id", async () => {

    const response = await request(app)
      .get("/users/user")
      .query({email: "contactrohans@gmail.com"})
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toEqual('Rohan');
  });
});

describe("POST /users/add", () => {
  it("should create a new user", async () => {

    const response = await request(app)
      .post("/users/add")
      .send({email: "test@email.com", 
            firstName: "felonius", 
            lastName: "gru", 
            admin: false})
      .set('Accept', 'application/json');

      const response_get = await request(app)
        .get("/users")
        .set('Accept', 'application/json');

      expect(response.statusCode).toBe(200);

      expect(response_get.body).toContainEqual(expect.objectContaining(
        {email: "test@email.com", 
        firstName: "felonius", 
        lastName: "gru", 
        admin: false}
      ));

      const response_del = await request(app)
        .delete("/users")
        .query({email:"test@email.com"})
        .set('Accept', 'application/json');
  })});


  describe("POST /users/update", () => {
    it("should edit a user by id", async () => {
  
      const response_post = await request(app)
      .post("/users/add")
      .send({email: "test@email.com", 
            firstName: "felonius", 
            lastName: "gru", 
            admin: false})
      .set('Accept', 'application/json');


      const response = await request(app)
        .post("/users/update")
        .query({email: "test@email.com"})
        .send({email: "updated@email.com", 
              firstName: "update_test", 
              lastName: "update_test", 
              admin: true})
        .set('Accept', 'application/json');
  
        const response_get = await request(app)
          .get("/users")
          .set('Accept', 'application/json');
  
        expect(response.statusCode).toBe(200);
  
        expect(response_get.body).toContainEqual(expect.objectContaining(
          {email: "updated@email.com", 
              firstName: "update_test", 
              lastName: "update_test", 
              admin: true}
        ));

        const response_del = await request(app)
          .delete("/users")
          .query({email:"updated@email.com"})
          .set('Accept', 'application/json');
    });


    describe("DELETE /users", () => {
      it("should delete specified user", async () => {
    
        const response_post = await request(app)
        .post("/users/add")
        .send({email: "test@email.com", 
              firstName: "felonius", 
              lastName: "gru", 
              admin: false})
        .set('Accept', 'application/json');
  
        const response = await request(app)
          .delete("/users")
          .query({email:"test@email.com"})
          .set('Accept', 'application/json');
  
        const response_get = await request(app)
          .get("/users")
          .set('Accept', 'application/json');
  
        expect(response.statusCode).toBe(200);
        expect(response_get.body).not.toContainEqual(expect.objectContaining(
          {email: "test@email.com"}
        ));
      });
  });
});
