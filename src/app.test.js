const request = require("supertest");
const app = require("./app");

describe("Test the contracts path", () => {
  test("It should respond to the GET method with 200 status code", async () => {
    const response = await request(app)
      .get("/contracts")
      .set({ profile_id: "2" });
    expect(response.statusCode).toBe(200);
  });

  test("It should respond to the GET method with 401 status code", async () => {
    const response = await request(app).get("/contracts");
    expect(response.statusCode).toBe(401);
  });
});

describe("Test the contracts/:id path", () => {
  test("It should respond to the GET method with 200 status code", async () => {
    const response = await request(app)
      .get("/contracts/6")
      .set({ profile_id: "3" });
    expect(response.statusCode).toBe(200);
  });

  test("It should respond to the GET method with 404 status code", async () => {
    const response = await request(app)
      .get("/contracts/6")
      .set({ profile_id: "4" });
    expect(response.statusCode).toBe(404);
  });
});
