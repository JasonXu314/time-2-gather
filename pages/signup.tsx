import axios, { AxiosError } from 'axios';
import { passwordStrength } from 'check-password-strength';
import cookie from 'cookie';
import Cookies from 'js-cookie';
import { MongoClient } from 'mongodb';
import Head from 'next/head';
import Router from 'next/router';
import { GetServerSideProps, NextPage } from 'next/types';
import { useCallback, useMemo, useState } from 'react';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import { makeStrengthStatus } from '../utils/utils';

const Signup: NextPage = () => {
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [err, setErr] = useState<string | null>(null);
	const strength = useMemo<Strength | null>(() => {
		if (password.length < 6) {
			return null;
		}

		const result = passwordStrength(password).value as Strength;
		return result;
	}, [password]);

	const signup = useCallback(() => {
		if (username === '') {
			setErr('Username is required');
			return;
		}
		if (password === '') {
			setErr('Password is required');
			return;
		}
		if (username.length > 20) {
			setErr('Username must be less than 20 characters');
			return;
		}
		if (username.length < 3) {
			setErr('Username must be at least 3 characters');
			return;
		}
		if (password.length < 6) {
			setErr('Password must be at least 6 characters');
			return;
		}
		if (strength === 'Too weak' || strength === 'Weak' || strength === 'Medium') {
			setErr('Password is weak');
			return;
		}

		axios
			.post<SignupSuccessResponse>('/api/signup', { username, password })
			.then((res) => {
				Cookies.set('token', res.data.token, { sameSite: 'strict' });
				Router.push('/');
			})
			.catch((res: AxiosError<SignupFailureResponse>) => {
				if (res.response) {
					setErr(res.response.data.reason);
				} else {
					setErr('An unknown error has occured');
				}
			});
	}, [username, password, strength]);

	return (
		<div>
			<Head>
				<title>Calendar App | Sign Up</title>
				<style>{'html { margin: 0; }'}</style>
			</Head>
			<Input label="Username" autoComplete="off" value={username} onChange={(evt) => setUsername(evt.target.value)} />
			<Input
				label="Password"
				autoComplete="off"
				value={password}
				onPaste={(evt) => evt.preventDefault()}
				onChange={(evt) => setPassword(evt.target.value)}
				onEnter={signup}
			/>
			{strength && (
				<div>
					<h4>Strength:</h4>
					<div>{makeStrengthStatus(strength)}</div>
				</div>
			)}
			<Button onClick={signup}>Sign Up!</Button>
			{err && <h4>{err}</h4>}
		</div>
	);
};

export const getServerSideProps: GetServerSideProps<any> = async ({ req, res }) => {
	const token = req.cookies.token;

	if (token) {
		const client = await MongoClient.connect(process.env.MONGODB_URL!);
		const collection = client.db('calendars').collection<DBUser>('users');

		const user = await collection.findOne({ token });

		await client.close();

		if (user) {
			res.writeHead(302, 'Token found', {
				Location: '/'
			});

			return {
				props: {}
			};
		} else {
			res.setHeader('Set-Cookie', cookie.serialize('token', '', { expires: new Date(0), sameSite: true }));

			return {
				props: {}
			};
		}
	} else {
		return {
			props: {}
		};
	}
};

export default Signup;
