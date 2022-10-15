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
    describe('for ages below the first threshold on any date', () => {
      [
        { date: "2022-01-03", caseName: 'the first day of the week' },
        { date: "2022-01-02", caseName: 'a non-first day of the week' },
        { date: undefined, caseName: 'date unspecificed' }
      ].forEach(({ date, caseName }) => {
        it(caseName, async () => {
          const response = await request(app)
            .get(`/prices?type=1jour&date=${date}&age=14`);

          var expectedResult = { cost: 25 };

          expect(response.body).deep.equal(expectedResult);
        });
      });
    });

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

    describe('on a holiday date', () => {
      describe('on the first day of the week', async () => {
        const FIRST_DAY_OF_WEEK_HOLIDAY = "2019-02-18";

        it('given no age', async () => {
          const response = await request(app)
            .get(`/prices?type=1jour&date=${FIRST_DAY_OF_WEEK_HOLIDAY}`);

          var expectedResult = { cost: 35 };

          expect(response.body).deep.equal(expectedResult);
        });

        it('given age below threshold', async () => {
          const response = await request(app)
            .get(`/prices?type=1jour&date=${FIRST_DAY_OF_WEEK_HOLIDAY}&age=63`);

          var expectedResult = { cost: 35 };

          expect(response.body).deep.equal(expectedResult);
        });

        it('given age equal to threshold', async () => {
          const response = await request(app)
            .get(`/prices?type=1jour&date=${FIRST_DAY_OF_WEEK_HOLIDAY}&age=64`);

          var expectedResult = { cost: 35 };

          expect(response.body).deep.equal(expectedResult);
        });

        it('given age above threshold', async () => {
          const response = await request(app)
            .get(`/prices?type=1jour&date=${FIRST_DAY_OF_WEEK_HOLIDAY}&age=65`);

          var expectedResult = { cost: 27 };

          expect(response.body).deep.equal(expectedResult);
        });
      });

      describe('on a non-first day of the week', async () => {
        const NON_FIRST_DAY_OF_WEEK_HOLIDAY = "2019-02-19";

        beforeEach(async () => {
          await connection.query(
            "DELETE FROM lift_pass.holidays WHERE holiday = ?;",
            [NON_FIRST_DAY_OF_WEEK_HOLIDAY]
          );

          await connection.query(
            "INSERT INTO lift_pass.holidays (holiday, description) VALUES (?, 'TEST');",
            [NON_FIRST_DAY_OF_WEEK_HOLIDAY]
          );
        });

        it('given no age', async () => {
          const response = await request(app)
            .get(`/prices?type=1jour&date=${NON_FIRST_DAY_OF_WEEK_HOLIDAY}`);

          var expectedResult = { cost: 35 };

          expect(response.body).deep.equal(expectedResult);
        });

        it('given age below threshold', async () => {
          const response = await request(app)
            .get(`/prices?type=1jour&date=${NON_FIRST_DAY_OF_WEEK_HOLIDAY}&age=63`);

          var expectedResult = { cost: 35 };

          expect(response.body).deep.equal(expectedResult);
        });

        it('given age equal to threshold', async () => {
          const response = await request(app)
            .get(`/prices?type=1jour&date=${NON_FIRST_DAY_OF_WEEK_HOLIDAY}&age=64`);

          var expectedResult = { cost: 35 };

          expect(response.body).deep.equal(expectedResult);
        });

        it('given age above threshold', async () => {
          const response = await request(app)
            .get(`/prices?type=1jour&date=${NON_FIRST_DAY_OF_WEEK_HOLIDAY}&age=65`);

          var expectedResult = { cost: 27 };

          expect(response.body).deep.equal(expectedResult);
        });
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
