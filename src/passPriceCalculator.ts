import { PassRepository } from './passRepository';
import { HolidaysRepository } from './holidaysRepository';

export interface PassPriceParams {
  type: string;
  age: number;
  date: string;
}

interface PassPriceDependencies {
  passRepository: PassRepository;
  holidaysRepository: HolidaysRepository;
}

export async function calculatePassPrice(
  { passRepository, holidaysRepository }: PassPriceDependencies,
  params: PassPriceParams) {
  const { type, age, date }: PassPriceParams = params;

  const result = await passRepository.getByType(type);

  if (age as any < 6) {
    return ({ cost: 0 });
  } else {
    if (type !== 'night') {
      const holidays = await holidaysRepository.getAll();

      let isHoliday;
      let reduction = 0;
      for (let row of holidays) {
        let holiday = row.holiday;
        let d = new Date(date as string);
        if (d.getFullYear() === holiday.getFullYear()
          && d.getMonth() === holiday.getMonth()
          && d.getDate() === holiday.getDate()) {

          isHoliday = true;
        }

      }

      if (!isHoliday && new Date(date as string).getDay() === 1) {
        reduction = 35;
      }

      // TODO apply reduction for others
      if (age as any < 15) {
        return ({ cost: Math.ceil(result.cost * .7) });
      } else {
        if (age === undefined) {
          let cost = result.cost * (1 - reduction / 100);
          return ({ cost: Math.ceil(cost) });
        } else {
          if (age as any > 64) {
            let cost = result.cost * .75 * (1 - reduction / 100);
            return ({ cost: Math.ceil(cost) });
          } else {
            let cost = result.cost * (1 - reduction / 100);
            return ({ cost: Math.ceil(cost) });
          }
        }
      }
    } else {
      if (age as any >= 6) {
        if (age as any > 64) {
          return ({ cost: Math.ceil(result.cost * .4) });
        } else {
          return (result);
        }
      } else {
        return ({ cost: 0 });
      }
    }
  }
}
