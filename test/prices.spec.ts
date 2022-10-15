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
    describe('on the first day of the week (non-holiday)', async () => {
      const FIRST_DAY_OF_WEEK = "2022-01-03";

      it('given no age', async () => {
        const response = await request(app)
          .get(`/prices?type=1jour&date=${FIRST_DAY_OF_WEEK}`);

        var expectedResult = { cost: 23 };

        expect(response.body).deep.equal(expectedResult);
      });

      it('given age below threshold', async () => {
        const response = await request(app)
          .get(`/prices?type=1jour&date=${FIRST_DAY_OF_WEEK}&age=63`);

        var expectedResult = { cost: 23 };

        expect(response.body).deep.equal(expectedResult);
      });

      it('given age equal to threshold', async () => {
        const response = await request(app)
          .get(`/prices?type=1jour&date=${FIRST_DAY_OF_WEEK}&age=64`);

        var expectedResult = { cost: 23 };

        expect(response.body).deep.equal(expectedResult);
      });

      it('given age above threshold', async () => {
        const response = await request(app)
          .get(`/prices?type=1jour&date=${FIRST_DAY_OF_WEEK}&age=65`);

        var expectedResult = { cost: 18 };

        expect(response.body).deep.equal(expectedResult);
      });
    });

    describe('on a non-first day of the week (non-holiday)', async () => {
      const NON_FIRST_DAY_OF_WEEK = "2022-01-04";

      it('given no age', async () => {
        const response = await request(app)
          .get(`/prices?type=1jour&date=${NON_FIRST_DAY_OF_WEEK}`);

        var expectedResult = { cost: 35 };

        expect(response.body).deep.equal(expectedResult);
      });

      it('given age below threshold', async () => {
        const response = await request(app)
          .get(`/prices?type=1jour&date=${NON_FIRST_DAY_OF_WEEK}&age=63`);

        var expectedResult = { cost: 35 };

        expect(response.body).deep.equal(expectedResult);
      });

      it('given age equal to threshold', async () => {
        const response = await request(app)
          .get(`/prices?type=1jour&date=${NON_FIRST_DAY_OF_WEEK}&age=64`);

        var expectedResult = { cost: 35 };

        expect(response.body).deep.equal(expectedResult);
      });

      it('given age above threshold', async () => {
        const response = await request(app)
          .get(`/prices?type=1jour&date=${NON_FIRST_DAY_OF_WEEK}&age=65`);

        var expectedResult = { cost: 27 };

        expect(response.body).deep.equal(expectedResult);
      });
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
