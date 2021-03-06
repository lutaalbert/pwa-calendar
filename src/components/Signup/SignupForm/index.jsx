import React, { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FormWrapperCss, LabelCss, InputWrapperCss, InputCss } from '../../shared/styles.css';
import { isValidEmail } from '../../shared/utils';
import { createAccount } from '../../../store/dispatchers/auth';
import { ButtonContainerCss } from './index.css';
import Button from '../../Button';
import Message from '../../Message';
import ERRORS from '../../../constants/errors';
import ROUTES from '../../../constants/routes';

const INITIAL_CREDENTIALS = {
	name: '',
	email: '',
	password: '',
	confirmPassword: ''
};
const INITIAL_ERRORS = {
	...INITIAL_CREDENTIALS,
	server: ''
};

const getErrors = ({ name, email, password, confirmPassword }) => {
	const errors = { ...INITIAL_ERRORS };

	if (!name) errors.name = ERRORS.NO_INPUT;

	if (!email) errors.email = ERRORS.NO_INPUT;
	else if (!isValidEmail(email)) errors.email = ERRORS.INVALID_INPUT;

	if (!password) errors.password = ERRORS.NO_INPUT;

	if (!confirmPassword) errors.confirmPassword = ERRORS.NO_INPUT;
	else if (confirmPassword !== password) errors.confirmPassword = ERRORS.INVALID_INPUT;

	return errors;
};

const SignupForm = memo(function SignupForm() {
	const [credentials, setCredentials] = useState({ ...INITIAL_CREDENTIALS });
	const handleChange = useCallback(
		({ target: { name, value } }) =>
			setCredentials((credentials) => ({ ...credentials, [name]: value })),
		[]
	);

	const [errors, setErrors] = useState({ ...INITIAL_ERRORS });
	const handleSubmit = useCallback(
		async (e) => {
			e.preventDefault();

			const errors = getErrors(credentials);
			setErrors(errors);
			if (Object.values(errors).filter(Boolean).length) return;

			try {
				const { confirmPassword, ...rest } = credentials;
				await createAccount(rest);
			} catch (error) {
				setErrors((errors) => ({ ...errors, server: error.message }));
			}
		},
		[credentials]
	);

	const userLoading = useSelector(({ auth }) => auth.userLoading);

	return (
		<FormWrapperCss onSubmit={handleSubmit}>
			<InputWrapperCss>
				<LabelCss htmlFor="name">Name</LabelCss>
				<InputCss
					id="name"
					name="name"
					placeholder="Enter your name"
					value={credentials.name}
					onChange={handleChange}
				/>
				<Message active={!!errors.name}>{errors.name}</Message>
			</InputWrapperCss>
			<InputWrapperCss>
				<LabelCss htmlFor="email">Email</LabelCss>
				<InputCss
					id="email"
					name="email"
					type="email"
					placeholder="Enter your email"
					value={credentials.email}
					onChange={handleChange}
				/>
				<Message active={!!errors.email}>{errors.email}</Message>
			</InputWrapperCss>
			<InputWrapperCss>
				<LabelCss htmlFor="password">Password</LabelCss>
				<InputCss
					id="password"
					name="password"
					type="password"
					placeholder="Enter your password"
					value={credentials.password}
					onChange={handleChange}
				/>
				<Message active={!!errors.password}>{errors.password}</Message>
			</InputWrapperCss>
			<InputWrapperCss>
				<LabelCss htmlFor="confirmPassword">Confirm password</LabelCss>
				<InputCss
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					placeholder="Confirm your password"
					value={credentials.confirmPassword}
					onChange={handleChange}
				/>
				<Message active={!!errors.confirmPassword}>{errors.confirmPassword}</Message>
			</InputWrapperCss>
			<Message active={!!errors.server}>{errors.server}</Message>

			<ButtonContainerCss>
				<Link to={ROUTES.LOGIN}>
					<Button back outline type="button">
						Back
					</Button>
				</Link>
				<Button loading={userLoading}>Sign-up</Button>
			</ButtonContainerCss>
		</FormWrapperCss>
	);
});

export default SignupForm;
