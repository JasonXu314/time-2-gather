import axios, { AxiosError } from 'axios';
import cookie from 'cookie';
import Cookies from 'js-cookie';
import { MongoClient } from 'mongodb';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps, NextPage } from 'next/types';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { Fetcher } from 'swr/dist/types';
import Button from '../components/Button/Button';
import Calendar from '../components/Calendar/Calendar';
import EventDetail from '../components/Calendar/EventDetail/EventDetail';
import EventEdit from '../components/Calendar/EventEdit/EventEdit';
import EventMenu from '../components/EventMenu/EventMenu';
import styles from '../sass/Index.module.scss';
import { parseDate } from '../utils/utils';

interface Props {
	token?: string;
}

const getEvtFn: Fetcher<CalendarEvent[]> = async (url: string) => {
	const res = await axios.get<EventsIndexSuccessResponse>(url).catch((err: AxiosError<EventsIndexFailureResponse>) => {
		if (err.response) {
			console.log(err.response.data);
			throw err.response.data;
		}
		console.log(err);
		throw err;
	});

	return res.data.events.map<CalendarEvent>(({ description, end, name, start, _id, ownerId }: DBCalendarEvent) => ({
		_id,
		ownerId,
		description,
		end: parseDate(end),
		name,
		start: parseDate(start)
	}));
};

const getUserFn: Fetcher<User> = async (url: string) => {
	const res = await axios.get<UsersSelfSuccessResponse>(url).catch((err: AxiosError<UsersSelfFailureResponse>) => {
		if (err.response) {
			console.log(err.response.data.reason);
			throw err.response.data.reason;
		}
		console.log(err);
		throw err;
	});

	return res.data.user;
};

const Index: NextPage<Props> = ({ token: initToken }) => {
	const [token, setToken] = useState<string | undefined>(initToken || Cookies.get('token'));
	const [creatingEvent, setCreatingEvent] = useState<boolean>(false);

	const { data: user, error: userError, revalidate: revalidateUser } = useSWR('/api/users/self', getUserFn);
	const { data: events, error: eventsError, revalidate, mutate } = useSWR('/api/events', getEvtFn);

	const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
	const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);

	useEffect(() => {
		revalidateUser();
	}, [token, revalidateUser]);

	const submitEvent = useCallback(
		async (event: PostCalendarEvent) => {
			axios
				.post<EventCreateSuccessResponse>('/api/events', event)
				.then(revalidate)
				.catch((err: AxiosError<EventCreateFailureResponse>) => {
					if (err.response) {
						console.log(err.response.data);
						throw err.response.data.reason;
					}
					console.log(err);
					throw 'Unknown error occured';
				});
			mutate((events) => [
				...(events || []),
				{
					_id: 'placeholder',
					description: event.description,
					end: new Date(event.end),
					name: event.name,
					ownerId: userError ? 'Something fucked up...' : user!._id,
					start: new Date(event.start)
				}
			]);
		},
		[userError, user, mutate, revalidate]
	);

	if (!token) {
		return (
			<div className={styles.main}>
				<Head>
					<title>Calendar App</title>
					<style>{'body { margin: 0; }'}</style>
				</Head>
				<Link href="/login">
					<a>Log In</a>
				</Link>
				<br />
				or
				<br />
				<Link href="/signup">
					<a>Sign Up</a>
				</Link>
			</div>
		);
	}

	return (
		<div className={styles.main}>
			<Head>
				<title>Calendar App</title>
				<style>{'body { margin: 0; }'}</style>
			</Head>
			<div className={styles['control-row']}>
				<Button
					onClick={() => {
						setToken(undefined);
						Cookies.remove('token');
					}}>
					Log Out
				</Button>
				<Button
					onClick={() => {
						setCreatingEvent(true);
					}}>
					Create Event
				</Button>
			</div>
			<div className={styles.body}>
				<Calendar events={events || []} viewDetails={(evt) => setDetailEvent(evt)} />
				{eventsError && <div>{eventsError}</div>}
			</div>
			{creatingEvent && <EventMenu submitEvent={submitEvent} close={() => setCreatingEvent(false)} />}
			{(creatingEvent || detailEvent || editEvent) && (
				<div
					className={styles.blur}
					onClick={() => {
						if (detailEvent) {
							setDetailEvent(null);
						}
						if (editEvent) {
							setEditEvent(null);
						}
						if (creatingEvent) {
							setCreatingEvent(false);
						}
					}}
				/>
			)}
			{detailEvent && (
				<EventDetail
					event={detailEvent}
					edit={() => {
						setEditEvent(detailEvent);
						setDetailEvent(null);
					}}
					del={() => {
						axios
							.delete<EventDeleteSuccessResponse>('/api/events', { data: { _id: detailEvent._id } })
							.then(() => {
								revalidate();
								setDetailEvent(null);
							})
							.catch((err: AxiosError<EventCreateFailureResponse>) => {
								if (err.response) {
									console.log(err.response.data);
									throw err.response.data.reason;
								}
								console.log(err);
								throw 'Unknown error occured';
							});
						mutate((events) => events?.filter((evt) => evt._id !== detailEvent._id));
					}}
				/>
			)}
			{editEvent && <EventEdit event={editEvent} mutator={mutate} revalidator={revalidate} close={() => setEditEvent(null)} />}
		</div>
	);
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
	const token = req.cookies.token;

	if (token) {
		const client = await MongoClient.connect(process.env.MONGODB_URL!);
		const collection = client.db('calendars').collection<DBUser>('users');

		const user = await collection.findOne({ token });

		await client.close();

		if (user) {
			return {
				props: {
					token
				}
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

export default Index;
