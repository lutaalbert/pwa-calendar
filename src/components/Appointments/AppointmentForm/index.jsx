import React, { memo, useState, useCallback, useEffect } from 'react';
import { FormWrapperCss, InputWrapperCss, LabelCss, InputCss } from '../../shared/styles.css';
import Message from '../../Message';
import Button from '../../Button';
import { TitleCss, ButtonContainerCss } from './index.css';
import ERRORS from '../../../constants/errors';

const EMPTY_CREDENTIALS = {
	title: '',
	date: { value: '' },
	start: { value: '' },
	end: { value: '' },
	group: ''
};

const AppointmentForm = memo(function AppointmentForm({
	title,
	buttonText,
	active,
	loading,
	action,
	initialCredentials,
	onSuccess = () => {},
	successText = ''
}) {
	const [credentials, setCredentials] = useState({
		...(initialCredentials ?? EMPTY_CREDENTIALS)
	});
	const handleChange = useCallback(({ target: { name, type, value, valueAsDate } }) => {
		let newValue;
		switch (type) {
			case 'date':
				newValue = {
					value,
					day: valueAsDate.getUTCDate(),
					monthIndex: valueAsDate.getUTCMonth(),
					year: valueAsDate.getUTCFullYear()
				};
				break;
			case 'time':
				newValue = {
					value,
					hours: valueAsDate.getUTCHours(),
					minutes: valueAsDate.getUTCMinutes()
				};
				break;
			default:
				newValue = value;
		}

		setCredentials((credentials) => ({ ...credentials, [name]: newValue }));
	}, []);

	const [serverError, setServerError] = useState('');
	const [serverSuccess, setServerSuccess] = useState('');
	const resetServerMessages = useCallback(() => {
		setServerError('');
		setServerSuccess('');
	}, []);
	const handleSubmit = useCallback(
		async (e) => {
			e.preventDefault();

			try {
				await action(credentials);
				onSuccess();
				setServerSuccess(successText);
				setCredentials({ ...EMPTY_CREDENTIALS });
			} catch (error) {
				setServerError(ERRORS.SERVER);
			}
		},
		[action, credentials, onSuccess, successText]
	);
	useEffect(() => {
		if (!active) resetServerMessages();
	}, [active, resetServerMessages]);

	return (
		<FormWrapperCss onSubmit={handleSubmit} onClick={resetServerMessages}>
			{title && <TitleCss>{title}</TitleCss>}

			<InputWrapperCss>
				<LabelCss htmlFor="title">Title</LabelCss>
				<InputCss
					id="title"
					name="title"
					placeholder="Title"
					value={credentials.title}
					onChange={handleChange}
					required
				/>
			</InputWrapperCss>
			<InputWrapperCss>
				<LabelCss htmlFor="date">Date</LabelCss>
				<InputCss
					id="date"
					name="date"
					type="date"
					placeholder="Date"
					value={credentials.date.value}
					onChange={handleChange}
					required
				/>
			</InputWrapperCss>
			<InputWrapperCss>
				<LabelCss htmlFor="start">Start</LabelCss>
				<InputCss
					id="start"
					name="start"
					type="time"
					placeholder="Start"
					value={credentials.start.value}
					onChange={handleChange}
					required
				/>
			</InputWrapperCss>
			<InputWrapperCss>
				<LabelCss htmlFor="end">End</LabelCss>
				<InputCss
					id="end"
					name="end"
					type="time"
					placeholder="End"
					value={credentials.end.value}
					min={credentials.start.value}
					onChange={handleChange}
					required
				/>
			</InputWrapperCss>
			<InputWrapperCss>
				<LabelCss htmlFor="group">Group</LabelCss>
				<InputCss
					id="group"
					name="group"
					placeholder="Group"
					value={credentials.group ?? ''}
					onChange={handleChange}
				/>
			</InputWrapperCss>
			<Message
				type={serverError ? 'error' : 'success'}
				active={!!(serverError || serverSuccess)}
			>
				{serverError || serverSuccess}
			</Message>

			<ButtonContainerCss>
				<Button loading={loading} noIcon>
					{buttonText}
				</Button>
			</ButtonContainerCss>
		</FormWrapperCss>
	);
});

export default AppointmentForm;
