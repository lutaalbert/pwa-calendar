import MONTH_NAMES from '../constants/monthNames';

export const calculateMonths = () => {
	const generateMonths = ({ year, start = 0, end = 12 }) => [
		...MONTH_NAMES.slice(start, end).map((monthName) => ({
			monthName,
			monthIndex: MONTH_NAMES.indexOf(monthName),
			year
		}))
	];

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();

	const months = [
		...generateMonths({ year: currentYear - 1, start: currentMonth }),
		...generateMonths({ year: currentYear }),
		...generateMonths({ year: currentYear + 1, end: currentMonth + 1 })
	];

	return months;
};

export const getCurrentMonth = () => {
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();

	return {
		monthName: MONTH_NAMES[currentMonth],
		monthIndex: currentMonth,
		year: currentYear
	};
};

export const generateMonthKey = ({ monthIndex, year }) => `${year}-${monthIndex}`;
