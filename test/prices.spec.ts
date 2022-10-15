import { assert, expect } from 'chai';
import request from 'supertest-as-promised';
import { createApp } from "../src/prices";

describe('prices', () => {

  let app, connection;

  beforeEach(async () => {
    ({ app, connection } = await createApp());
  });

  afterEach(async () => {
    await connection.end();
  });

  it("given age below threshold, the cost is 0", async () => {
    const ANY_TYPE = '1jour';
    const response = await request(app)
      .get(`/prices?type=${ANY_TYPE}&age=5`);

    var expectedResult = { cost: 0 };

    expect(response.body).deep.equal(expectedResult);
  });

  describe('day time cost', () => {
    it('does something', async () => {

      const response = await request(app)
        .get('/prices?type=1jour');

      var expectedResult = { cost: 35 }; // change this to make the test pass
      expect(response.body).deep.equal(expectedResult);
    });
  });

  describe('night time cost', async () => {
    it('given no age', async () => {
      const response = await request(app)
        .get('/prices?type=night');

      var expectedResult = { cost: 0 };

      expect(response.body).deep.equal(expectedResult);
    });

    it('given an age matching the first threshold', async () => {
      const response = await request(app)
        .get('/prices?type=night&age=6');

      var expectedResult = { cost: 19 };

      expect(response.body).deep.equal(expectedResult);
    });

    it('given an age above the first threshold', async () => {
      const response = await request(app)
        .get('/prices?type=night&age=7');

      var expectedResult = { cost: 19 };

      expect(response.body).deep.equal(expectedResult);
    });

    it('given an age matching the second threshold', async () => {
      const response = await request(app)
        .get('/prices?type=night&age=64');

      var expectedResult = { cost: 19 };

      expect(response.body).deep.equal(expectedResult);
    });

    it('given an age above the second threshold', async () => {
      const response = await request(app)
        .get('/prices?type=night&age=65');

      var expectedResult = { cost: 8 };

      expect(response.body).deep.equal(expectedResult);
    });
  });
});
