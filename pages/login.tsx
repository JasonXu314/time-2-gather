import axios, { AxiosError } from 'axios';
import cookie from 'cookie';
import Cookies from 'js-cookie';
import { MongoClient } from 'mongodb';
import Head from 'next/head';
import router from 'next/router';
import { GetServerSideProps, NextPage } from 'next/types';
import { useCallback, useState } from 'react';

const Login: NextPage = () => {
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [err, setErr] = useState<string | null>(null);

	const login = useCallback(() => {
		if (username === '') {
			setErr('Username is required');
			return;
		}
		if (password === '') {
			setErr('Password is required');
			return;
		}

		axios
			.post<SigninSuccessResponse>('/api/login', { username, password })
			.then((res) => {
				Cookies.set('token', res.data.user.token, { sameSite: 'strict' });
				router.push('/');
			})
			.catch((res: AxiosError<SignupFailureResponse>) => {
				if (res.response) {
					setErr(res.response.data.reason);
				} else {
					setErr('An unknown error has occured');
				}
			});
	}, [username, password]);

	return (
		<div>
			<Head>
				<title>Calendar App | Log In</title>
				<style>{'html { margin: 0; }'}</style>
			</Head>
			<div>
				<h4>Username</h4>
				<input autoComplete="off" value={username} onChange={(evt) => setUsername(evt.target.value)} />
			</div>
			<div>
				<h4>Password</h4>
				<input
					autoComplete="off"
					value={password}
					type="password"
					onPaste={(evt) => evt.preventDefault()}
					onChange={(evt) => setPassword(evt.target.value)}
				/>
			</div>
			<button onClick={login}>Log In!</button>
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

export default Login;
