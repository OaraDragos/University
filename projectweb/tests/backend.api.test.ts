import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../backend/src/app";
import { clearStore } from "../backend/src/store/memoryStore";

async function getAdminHeaders() {
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ username: "admin", password: "admin123" })
    .expect(200);

  return { Authorization: `Bearer ${loginRes.body.token}` };
}

describe("TripBuddy backend REST API", () => {
  beforeEach(() => {
    clearStore();
  });

  it("supports token login, register and session validation", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin123" })
      .expect(200);

    expect(loginRes.body.user.username).toBe("admin");
    expect(loginRes.body.token).toBeTruthy();
    expect(loginRes.body.user.permissions).toContain("MANAGE_USERS");

    await request(app)
      .get("/api/auth/session")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .expect(200);

    const suffix = Date.now().toString(36);
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        username: `student_${suffix}`,
        email: `student_${suffix}@test.com`,
        password: "secret123",
      })
      .expect(201);

    expect(registerRes.body.user.roles).toContain("USER");
    expect(registerRes.body.token).toBeTruthy();

    const codeRes = await request(app)
      .post("/api/auth/login/code/request")
      .send({ identifier: "admin" })
      .expect(200);

    await request(app)
      .post("/api/auth/login/code/verify")
      .send({ identifier: "admin", code: codeRes.body.code })
      .expect(200);

    const recoveryRes = await request(app)
      .post("/api/auth/password-recovery/request")
      .send({ email: "admin@test.com" })
      .expect(200);

    await request(app)
      .post("/api/auth/password-recovery/reset")
      .send({
        email: "admin@test.com",
        code: recoveryRes.body.code,
        newPassword: "admin123",
      })
      .expect(200);
  });

  it("creates and lists groups with pagination", async () => {
    const headers = await getAdminHeaders();
    const payload = {
      name: "Cabana Team",
      joinPassword: "1234",
      location: { lat: 45.1, lng: 25.2, address: "Brasov" },
      cabinDetails: "Weekend trip",
    };

    const created = await request(app).post("/api/groups").set(headers).send(payload).expect(201);
    expect(created.body.id).toBeTruthy();

    await request(app).post("/api/groups").set(headers).send({ ...payload, name: "Second Team" }).expect(201);

    const listed = await request(app).get("/api/groups?page=1&limit=1").set(headers).expect(200);
    expect(listed.body.data).toHaveLength(1);
    expect(listed.body.totalItems).toBe(2);
    expect(listed.body.totalPages).toBe(2);
  });

  it("validates group payload on server side", async () => {
    const headers = await getAdminHeaders();
    const invalid = {
      name: "A",
      joinPassword: "1",
      location: { lat: 0, lng: 0, address: "x" },
      cabinDetails: "x",
    };

    await request(app).post("/api/groups").set(headers).send(invalid).expect(400);
  });

  it("supports full members and products CRUD", async () => {
    const headers = await getAdminHeaders();
    const group = await request(app)
      .post("/api/groups")
      .set(headers)
      .send({
        name: "Travel Squad",
        joinPassword: "pass1234",
        location: { lat: 46.7, lng: 23.6, address: "Cluj" },
        cabinDetails: "Cabin near lake",
      })
      .expect(201);

    const groupId = group.body.id as string;

    const member = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set(headers)
      .send({
        name: "Andrei",
        gender: "male",
        ageRange: "24-30",
        drinkLevel: 3,
        foodAppetite: 4,
      })
      .expect(201);

    const memberId = member.body.id as string;

    const product = await request(app)
      .post(`/api/groups/${groupId}/products`)
      .set(headers)
      .send({
        productName: "Burger buns",
        supermarket: "Lidl",
        price: 12.5,
        quantity: 2,
        unit: "buc",
        category: "Bakery",
        addedBy: memberId,
        addedByName: "Andrei",
      })
      .expect(201);

    const productId = product.body.id as string;
    expect(product.body.productName).toBe("Burger buns");

    await request(app)
      .put(`/api/groups/${groupId}/products/${productId}`)
      .set(headers)
      .send({ price: 10.75, quantity: 3 })
      .expect(200);

    const listedProducts = await request(app).get(`/api/groups/${groupId}/products?page=1&limit=5`).set(headers).expect(200);
    expect(listedProducts.body.data[0].price).toBe(10.75);
    expect(listedProducts.body.data[0].quantity).toBe(3);

    await request(app).delete(`/api/groups/${groupId}/products/${productId}`).set(headers).expect(200);
    await request(app).delete(`/api/groups/${groupId}/members/${memberId}`).set(headers).expect(200);

    const membersAfterDelete = await request(app).get(`/api/groups/${groupId}/members?page=1&limit=10`).set(headers).expect(200);
    expect(membersAfterDelete.body.totalItems).toBe(0);
  });

  it("exposes statistics endpoints", async () => {
    const headers = await getAdminHeaders();
    const group = await request(app)
      .post("/api/groups")
      .set(headers)
      .send({
        name: "Stats Team",
        joinPassword: "secure123",
        location: { lat: 44.4, lng: 26.1, address: "Bucharest" },
        cabinDetails: "Villa",
      })
      .expect(201);

    const groupId = group.body.id as string;

    const member = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set(headers)
      .send({
        name: "Maria",
        gender: "female",
        ageRange: "24-30",
        drinkLevel: 2,
        foodAppetite: 3,
      })
      .expect(201);

    await request(app)
      .post(`/api/groups/${groupId}/products`)
      .set(headers)
      .send({
        productName: "Soda",
        supermarket: "Mega Image",
        price: 5,
        quantity: 4,
        unit: "buc",
        category: "Drinks",
        addedBy: member.body.id,
        addedByName: member.body.name,
      })
      .expect(201);

    const globalStats = await request(app).get("/api/groups/statistics").set(headers).expect(200);
    expect(globalStats.body.totalGroups).toBe(1);

    const productStats = await request(app).get(`/api/groups/${groupId}/products/statistics`).set(headers).expect(200);
    expect(productStats.body.totalItems).toBe(1);
    expect(productStats.body.totalEstimatedCost).toBe(20);
  });

  it("starts and stops fake data generator", async () => {
    const headers = await getAdminHeaders();
    await request(app).post("/api/generator/start").set(headers).send({ intervalMs: 600 }).expect(200);
    const status = await request(app).get("/api/generator/status").set(headers).expect(200);
    expect(status.body.running).toBe(true);
    await request(app).post("/api/generator/stop").set(headers).expect(200);
  });

  it("serves GraphQL queries and mutations", async () => {
    const mutation = `
      mutation Create($input: GroupInput!) {
        createGroup(input: $input) {
          id
          name
          shareCode
        }
      }
    `;

    const createRes = await request(app)
      .post('/graphql')
      .send({
        query: mutation,
        variables: {
          input: {
            name: 'Graph Team',
            joinPassword: 'graphql1',
            location: { lat: 1, lng: 2, address: 'Remote' },
            cabinDetails: 'Graph cabin',
          },
        },
      })
      .expect(200);

    expect(createRes.body.data.createGroup.name).toBe('Graph Team');

    const query = `
      query {
        groups(page: 1, limit: 10) {
          totalItems
          data {
            id
            name
          }
        }
      }
    `;

    const groupsRes = await request(app).post('/graphql').send({ query }).expect(200);
    expect(groupsRes.body.data.groups.totalItems).toBe(1);
  });
});
