import { dispatch } from '../../store';
import {
	UPDATE_SELECTED_MONTH,
	FETCH_MONTH_BEGIN,
	FETCH_MONTH_SUCCESS,
	FETCH_MONTH_ERROR,
	ADD_APPOINTMENT_BEGIN,
	ADD_APPOINTMENT_SUCCESS,
	ADD_APPOINTMENT_ERROR,
	DELETE_APPOINTMENT_BEGIN,
	DELETE_APPOINTMENT_SUCCESS,
	DELETE_APPOINTMENT_ERROR
} from '../actions/appointments';
import { apiFetchMonth, apiAddAppointment, apiDeleteAppointment } from '../../api/appointments';
import { generateMonthKey } from '../../utils/appointments';

export const updateSelectedMonth = (newlySelectedMonth) =>
	dispatch({ type: UPDATE_SELECTED_MONTH, payload: newlySelectedMonth });

export const fetchMonth = (monthKey) =>
	dispatch(async (dispatch) => {
		dispatch({ type: FETCH_MONTH_BEGIN, payload: monthKey });
		try {
			const month = await apiFetchMonth(monthKey);
			dispatch({ type: FETCH_MONTH_SUCCESS, payload: { month, monthKey } });
		} catch (error) {
			dispatch({ type: FETCH_MONTH_ERROR, payload: monthKey });
		}
	});

const correctSingleDigit = (digits) => (digits.length === 1 ? `0${digits}` : digits);
const correctTimeFormat = (time) => time.split(':').map(correctSingleDigit).join(':');
const generateHourString = ({ hours, minutes }) => correctTimeFormat(`${hours}:${minutes}`);
const isDeltaMax1Year = ({ year, monthIndex }) => {
	const currentDate = new Date();
	const currentMonthIndex = currentDate.getUTCMonth();
	const currentYear = currentDate.getUTCFullYear();

	if (Math.abs(currentYear - year) > 1) return false;
	if (year === currentYear - 1 && monthIndex < currentMonthIndex) return false;
	if (year === currentYear + 1 && monthIndex > currentMonthIndex) return false;

	return true;
};
export const addAppointment = (details) =>
	dispatch(async (dispatch) => {
		dispatch({ type: ADD_APPOINTMENT_BEGIN });

		try {
			await apiAddAppointment({
				...details,
				start: generateHourString(details.start),
				end: generateHourString(details.end)
			});
			dispatch({ type: ADD_APPOINTMENT_SUCCESS });

			if (isDeltaMax1Year(details.date)) fetchMonth(generateMonthKey(details.date));
		} catch (error) {
			dispatch({ type: ADD_APPOINTMENT_ERROR });
			throw error;
		}
	});

export const deleteAppointment = (appointment) =>
	dispatch(async (dispatch) => {
		dispatch({ type: DELETE_APPOINTMENT_BEGIN });

		try {
			await apiDeleteAppointment(appointment);
			dispatch({ type: DELETE_APPOINTMENT_SUCCESS });

			if (isDeltaMax1Year(appointment.date)) fetchMonth(generateMonthKey(appointment.date));
		} catch (error) {
			dispatch({ type: DELETE_APPOINTMENT_ERROR });
			throw error;
		}
	});
