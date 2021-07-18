import cookie from 'cookie';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuid } from 'uuid';

export default async (req: NextApiRequest, res: NextApiResponse<EventsIndexResponse>): Promise<void> => {
	switch (req.method) {
		case 'GET': {
			const token = req.cookies.token;

			if (!token) {
				res.status(401).json({ type: 'failure', reason: 'Unauthorized' });
				return;
			}

			const client = await MongoClient.connect(process.env.MONGODB_URL!).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to connect to DB' });
				console.log(err);
			});
			if (!client) return;

			const db = client.db('calendars');
			const events = db.collection<DBCalendarEvent>('events');
			const users = db.collection<DBUser>('users');

			const user = await users.findOne({ token }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to get user' });
				console.log(err);
			});
			if (user === null) {
				res.setHeader('Set-Cookie', cookie.serialize('token', '', { expires: new Date(0), sameSite: true }))
					.status(401)
					.json({ type: 'failure', reason: 'No user with that token exists' });
				await client.close();
				return;
			}
			if (!user) {
				await client.close();
				return;
			}

			const eventsResult = await events
				.find({ ownerId: user._id })
				.toArray()
				.catch((err) => {
					res.status(500).json({ type: 'failure', reason: 'Failed to retrieve events' });
					console.log(err);
				});
			if (!eventsResult) {
				await client.close();
				return;
			}

			const result = eventsResult.map<TransferCalendarEvent>(({ name, description, end, start, _id, ownerId }) => ({
				description,
				end,
				name,
				start,
				_id,
				ownerId
			}));

			res.status(200).json({ type: 'success', events: result });
			await client.close();
			return;
		}
		case 'POST': {
			const token = req.cookies.token;
			const { name, start, end, description }: PostCalendarEvent = req.body;

			if (!token) {
				res.status(401).json({ type: 'failure', reason: 'Unauthorized' });
				return;
			}
			if (!name) {
				res.status(400).json({ type: 'failure', reason: 'Name is required' });
				return;
			}
			if (name.trim().length === 0) {
				res.status(400).json({ type: 'failure', reason: 'Name must not be empty!' });
				return;
			}
			if (!start) {
				res.status(400).json({ type: 'failure', reason: 'Start date is required' });
				return;
			}
			if (!end) {
				res.status(400).json({ type: 'failure', reason: 'End date is required' });
				return;
			}
			if (description === undefined) {
				res.status(400).json({ type: 'failure', reason: 'Description is required' });
				return;
			}
			if (new Date(start) > new Date(end)) {
				res.status(400).json({ type: 'failure', reason: 'Start date must be before end date' });
				return;
			}

			const client = await MongoClient.connect(process.env.MONGODB_URL!).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to connect to DB' });
				console.log(err);
			});
			if (!client) return;

			const db = client.db('calendars');
			const events = db.collection<DBCalendarEvent>('events');
			const users = db.collection<DBUser>('users');

			const user = await users.findOne({ token }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to retrieve user' });
				console.log(err);
			});
			if (user === null) {
				res.setHeader('Set-Cookie', cookie.serialize('token', '', { expires: new Date(0), sameSite: true }))
					.status(401)
					.json({ type: 'failure', reason: 'No user with that token exists' });
				await client.close();
				return;
			}
			if (!user) {
				await client.close();
				return;
			}

			const _id = uuid();

			const dbEvent: DBCalendarEvent = {
				_id,
				ownerId: user._id,
				name,
				description,
				start,
				end
			};

			const result = await events.insertOne(dbEvent).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to insert event' });
				console.log(err);
			});
			if (!result) {
				await client.close();
				return;
			}

			res.status(200).json({ type: 'success', event: dbEvent });
			await client.close();
			return;
		}
		case 'DELETE': {
			const token = req.cookies.token;
			const { _id }: EventIdentifier = req.body;

			if (!token) {
				res.status(401).json({ type: 'failure', reason: 'Unauthorized' });
				return;
			}
			if (!_id) {
				res.status(400).json({ type: 'failure', reason: 'Event ID is required' });
				return;
			}

			const client = await MongoClient.connect(process.env.MONGODB_URL!).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to connect to DB' });
				console.log(err);
			});
			if (!client) return;

			const db = client.db('calendars');
			const events = db.collection<DBCalendarEvent>('events');
			const users = db.collection<DBUser>('users');

			const user = await users.findOne({ token }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to retrieve user' });
				console.log(err);
			});
			if (user === null) {
				res.setHeader('Set-Cookie', cookie.serialize('token', '', { expires: new Date(0), sameSite: true }))
					.status(401)
					.json({ type: 'failure', reason: 'No user with that token exists' });
				await client.close();
				return;
			}
			if (!user) {
				await client.close();
				return;
			}

			const currEvt = await events.findOne({ _id }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to retrieve event' });
				console.log(err);
			});
			if (!currEvt) {
				await client.close();
				return;
			}

			if (currEvt.ownerId !== user._id) {
				res.status(403).json({ type: 'failure', reason: 'You are not the owner of this event' });
				await client.close();
				return;
			}

			const result = await events.deleteOne({ _id }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to delete event' });
				console.log(err);
			});
			if (!result) {
				await client.close();
				return;
			} else {
				const newEvts = await events
					.find()
					.toArray()
					.catch((err) => {
						res.status(500).json({ type: 'failure', reason: 'Failed to retrieve remaining events (event was successfully deleted)' });
						console.log(err);
					});
				if (!newEvts) {
					await client.close();
					return;
				}
				res.status(200).json({ type: 'success', events: newEvts });
				await client.close();
				return;
			}
		}
		case 'PATCH': {
			const token = req.cookies.token;
			const { _id, name, start, end, description }: { _id: string } & Partial<TransferCalendarEvent> = req.body;

			if (!token) {
				res.status(401).json({ type: 'failure', reason: 'Unauthorized' });
				return;
			}
			if (name && name.trim().length === 0) {
				res.status(400).json({ type: 'failure', reason: 'Name must not be empty!' });
				return;
			}
			if (start && end && new Date(start) > new Date(end)) {
				res.status(400).json({ type: 'failure', reason: 'Start date must be before end date' });
				return;
			}

			const client = await MongoClient.connect(process.env.MONGODB_URL!).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to connect to DB' });
				console.log(err);
			});
			if (!client) return;

			const db = client.db('calendars');
			const events = db.collection<DBCalendarEvent>('events');
			const users = db.collection<DBUser>('users');

			const user = await users.findOne({ token }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to retrieve user' });
				console.log(err);
			});
			if (user === null) {
				res.setHeader('Set-Cookie', cookie.serialize('token', '', { expires: new Date(0), sameSite: true }))
					.status(401)
					.json({ type: 'failure', reason: 'No user with that token exists' });
				await client.close();
				return;
			}
			if (!user) {
				await client.close();
				return;
			}

			const currEvt = await events.findOne({ _id }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to retrieve event' });
				console.log(err);
			});
			if (!currEvt) {
				await client.close();
				return;
			}

			if (currEvt.ownerId !== user._id) {
				res.status(403).json({ type: 'failure', reason: 'You are not the owner of this event' });
				await client.close();
				return;
			}

			if (start && new Date(start) > new Date(currEvt.end)) {
				res.status(400).json({ type: 'failure', reason: 'Start date must be before end date' });
				await client.close();
				return;
			}
			if (end && new Date(end) < new Date(currEvt.start)) {
				res.status(400).json({ type: 'failure', reason: 'End date must be after start date' });
				await client.close();
				return;
			}

			if (name) currEvt.name = name;
			if (description) currEvt.description = description;
			if (start) currEvt.start = start;
			if (end) currEvt.end = end;

			if (name || description || start || end) {
				const result = await events.findOneAndReplace({ _id }, currEvt).catch((err) => {
					res.status(500).json({ type: 'failure', reason: 'Failed to write updated event' });
					console.log(err);
				});
				if (!result) {
					await client.close();
					return;
				}
				res.status(200).json({ type: 'success', event: currEvt });
				return;
			} else {
				await client.close();
				res.status(200).json({ type: 'success', event: currEvt });
				return;
			}
		}
		default: {
			res.status(405).json({ type: 'failure', reason: 'Allowed methods are: GET, POST, DELETE, PATCH' });
		}
	}
};
