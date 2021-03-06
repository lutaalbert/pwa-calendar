import { db, firestore } from './config';
import store from '../store';
import { generateMonthKey } from '../utils/appointments';

// Useful data from the store, so i don't need to pass it down on every api call
let prevUser = null;
let dbAppointmentsRef = null;
let months = null;

store.subscribe(() => {
	const {
		auth: { user },
		appointments
	} = store.getState();

	if (months !== appointments.months) months = appointments.months;

	if (user === prevUser) return;

	if (!user) dbAppointmentsRef = null;
	else dbAppointmentsRef = db.collection('users').doc(user.email).collection('appointments');

	prevUser = user;
});

export const apiFetchMonth = async (monthKey) => {
	const month = await dbAppointmentsRef.doc(monthKey).get();
	if (month.exists) return month.data();
	else return {};
};

// Transform hour string in total minutes, so it can be compared
const transformInTotalMinutes = (time) => {
	const [hours, minutes] = time.split(':').map((a) => parseInt(a));

	return hours * 60 + minutes;
};
const sortAppointments = (appointments) =>
	[...appointments].sort(
		(a, b) => transformInTotalMinutes(a.start) - transformInTotalMinutes(b.start)
	);
export const apiAddAppointment = async ({ title, date, start, end, group }) => {
	const monthKey = generateMonthKey(date);
	const appointment = {
		title,
		start,
		end,
		group: group || null,
		completed: false
	};

	const month = await dbAppointmentsRef.doc(monthKey).get();
	if (month.exists) {
		const day = month.data()[date.day];
		if (day) {
			// Update the day appointments
			await dbAppointmentsRef.doc(monthKey).update({
				[date.day]: sortAppointments([...day, appointment])
			});
		} else {
			// Create a new array with a single appointment
			await dbAppointmentsRef.doc(monthKey).update({
				[date.day]: [appointment]
			});
		}
	}
	// Create a new month document
	else {
		await dbAppointmentsRef.doc(monthKey).set({
			[date.day]: [appointment]
		});
	}
};

const areEqualShallow = (a, b) => {
	for (const key in a) {
		if (!(key in b) || a[key] !== b[key]) {
			return false;
		}
	}
	for (const key in b) {
		if (!(key in a) || a[key] !== b[key]) {
			return false;
		}
	}
	return true;
};
export const apiDeleteAppointment = async ({ date, details }) => {
	const monthKey = generateMonthKey(date);
	const filteredAppointments = months[monthKey][date.day].filter(
		(appointment) => !areEqualShallow(appointment, details)
	);

	if (filteredAppointments.length) {
		// Update the day with the filtered appointments
		await dbAppointmentsRef.doc(monthKey).update({
			[date.day]: filteredAppointments
		});
	}
	// Delete the entire day field if there are no appointments left
	else {
		await dbAppointmentsRef.doc(monthKey).update({
			[date.day]: firestore.FieldValue.delete()
		});
	}
};

export const apiEditAppointment = async ({ old, updated }) => {
	await apiDeleteAppointment(old);
	await apiAddAppointment(updated);
};

export const apiToggleCompleted = async ({ date, details }) => {
	const updatedAppointments = months[generateMonthKey(date)][date.day].map((appointment) => {
		if (areEqualShallow(appointment, details))
			return { ...appointment, completed: !appointment.completed };

		return appointment;
	});

	await dbAppointmentsRef.doc(generateMonthKey(date)).update({
		[date.day]: updatedAppointments
	});
};
