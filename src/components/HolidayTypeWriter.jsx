import TypewriterComponent from "typewriter-effect";
import { Lunar } from "lunar-javascript";

const getHoliday = (date) => {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0 (Sun) - 6 (Sat)
  const year = date.getFullYear();

  // US Holidays
  if (month === 0 && day === 1) return `${year} Happy New Year!`;
  if (month === 0 && day === 20 && (year - 1) % 4 === 0)
    return "Happy Inauguration Day!";
  if (month === 5 && day === 19) return "Happy Juneteenth!";
  if (month === 6 && day === 4) return "Happy Independence Day!";
  if (month === 10 && day === 11) return "Happy Veterans Day!";
  if (month === 11 && day === 25) return "Merry Christmas!";

  // Variable US Holidays
  const isNthWeekday = (n, weekday) => {
    if (dayOfWeek !== weekday) return false;
    return Math.floor((day - 1) / 7) === n - 1;
  };
  const isLastWeekday = (weekday) => {
    if (dayOfWeek !== weekday) return false;
    const nextWeek = new Date(date);
    nextWeek.setDate(day + 7);
    return nextWeek.getMonth() !== month;
  };

  if (month === 0 && isNthWeekday(3, 1)) return "Happy MLK Day!";
  if (month === 1 && isNthWeekday(3, 1)) return "Happy Presidents' Day!";
  if (month === 4 && isLastWeekday(1)) return "Happy Memorial Day!";
  if (month === 8 && isNthWeekday(1, 1)) return "Happy Labor Day!";
  if (month === 9 && isNthWeekday(2, 1)) return "Happy Columbus Day!";
  if (month === 10 && isNthWeekday(4, 4)) return "Happy Thanksgiving!";

  // Chinese Holidays
  // Fixed Solar
  if (month === 4 && day === 1) return "Happy Chinese Labor Day!"; // CN Labor Day
  if (month === 9 && day >= 1 && day <= 7) return "Happy Golden Week Holiday!"; // CN National Day

  // Lunar
  const lunar = Lunar.fromDate(date);
  const lMonth = lunar.getMonth();
  const lDay = lunar.getDay();

  // Spring Festival (New Year)
  if (lMonth === 1 && lDay === 1) return "Happy Chinese New Year!";

  // Lantern Festival
  if (lMonth === 1 && lDay === 15) return "Happy Lantern Festival!";

  // Dragon Boat
  if (lMonth === 5 && lDay === 5) return "Happy Dragon Boat Festival!";

  // Mid-Autumn
  if (lMonth === 8 && lDay === 15) return "Happy Mid-Autumn Festival!";

  // Qingming (Solar Term)
  if (lunar.getJieQi() === "清明") return "Happy Qingming Festival!";

  return null;
};

const NewYearTypeWriter = () => {
  const now = new Date();
  const message = getHoliday(now);

  if (!message) return null;

  return (
    <div className="text-sm font-extrabold">
      <TypewriterComponent
        options={{}}
        onInit={(writer) => {
          writer
            .changeDelay(70)
            .pauseFor(800)
            .typeString(`${message}`)
            .pauseFor(3000)
            .callFunction((state) => {
              state.elements.cursor.style.visibility = "hidden";
            })
            .start();
        }}
      />
    </div>
  );
};
export default NewYearTypeWriter;
