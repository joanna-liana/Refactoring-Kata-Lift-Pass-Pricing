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

  describe('single pass price', () => {
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

      describe('for ages equal to the first threshold on any date', () => {
        [
          { date: "2022-01-03", caseName: 'the first day of the week', cost: 23 },
          { date: "2022-01-02", caseName: 'a non-first day of the week', cost: 35 },
          { date: undefined, caseName: 'date unspecificed', cost: 35 }
        ].forEach(({ date, caseName, cost }) => {
          it(caseName, async () => {
            const response = await request(app)
              .get(`/prices?type=1jour&date=${date}&age=15`);

            var expectedResult = { cost };

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

  describe('multiple pass price', () => {
    it("returns prices of multiple passes", async () => {
      // given
      const NIGHT_TYPE = 'night';
      const DAY_TYPE = '1jour';

      const FIRST_DAY_OF_WEEK = "2022-01-03";
      const NON_FIRST_DAY_OF_WEEK_HOLIDAY = "2019-02-19";

      const AGE_ABOVE_YOUNGSTER_THRESHOLD = 7;
      const AGE_ABOVE_SENIOR_THRESHOLD = 65;

      // when
      const response = await request(app)
        .post(`/prices`)
        .send({
          passes: [
            {
              type: DAY_TYPE,
              date: FIRST_DAY_OF_WEEK,
              age: AGE_ABOVE_YOUNGSTER_THRESHOLD,
            },
            {
              type: NIGHT_TYPE,
              date: NON_FIRST_DAY_OF_WEEK_HOLIDAY,
              age: AGE_ABOVE_SENIOR_THRESHOLD,
            }
          ]
        });

      // then
      var expectedResult = { result: [{ cost: 25 }, { cost: 8 }] };

      expect(response.body).deep.equal(expectedResult);
    });
  });

  describe('update', () => {
    const TYPE_TO_UPDATE = "testType";
    const INITIAL_COST = 100;
    const UPDATED_COST = 150;

    beforeEach(async () => {
      await connection.query(
        "DELETE FROM lift_pass.base_price WHERE type = ?;",
        [TYPE_TO_UPDATE]
      );

      await connection.query(
        "INSERT INTO lift_pass.base_price (type, cost) VALUES (?, ?);",
        [TYPE_TO_UPDATE, INITIAL_COST]
      );
    });

    it('updates the lift type cost', async () => {
      // given
      const { body: resultBeforeUpdate } = await request(app)
        .get(`/prices?type=${TYPE_TO_UPDATE}`);

      var expectedResult = { cost: INITIAL_COST };

      expect(resultBeforeUpdate).deep.equal(expectedResult);

      // when
      await request(app)
        .put(`/prices?type=${TYPE_TO_UPDATE}&cost=${UPDATED_COST}`);

      // given
      const { body: resultAfterUpdate } = await request(app)
        .get(`/prices?type=${TYPE_TO_UPDATE}`);

      var expectedResult = { cost: UPDATED_COST };

      expect(resultAfterUpdate).deep.equal(expectedResult);
    });
  });
});
