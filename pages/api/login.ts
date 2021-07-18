import crypto from 'crypto';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse<SigninResponse>): Promise<void> => {
	switch (req.method) {
		case 'POST': {
			const username: string = req.body.username,
				password: string = req.body.password;

			if (!username) {
				res.status(400).json({ type: 'failure', reason: 'Username is required' });
				return;
			}
			if (!password) {
				res.status(400).json({ type: 'failure', reason: 'Password is required' });
				return;
			}

			const client = await MongoClient.connect(process.env.MONGODB_URL!).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to connect to DB' });
				console.log(err);
			});
			if (!client) return;

			const db = client.db('calendars');
			const users = db.collection<DBUser>('users');

			const dbUser = await users.findOne({ username }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to get user' });
				console.log(err);
			});
			if (dbUser === null) {
				res.status(401).json({ type: 'failure', reason: 'Username or password is incorrect!' });
				await client.close();
				return;
			}
			if (!dbUser) {
				await client.close();
				return;
			}

			const salt = dbUser.salt;
			const hash = crypto.createHash('sha256');
			const saltedPass = hash
				.update(salt + password)
				.digest()
				.toString();

			if (saltedPass !== dbUser.password) {
				res.status(401).json({ type: 'failure', reason: 'Username or password is incorrect!' });
				await client.close();
				return;
			}

			const friends = await Promise.all(
				dbUser.friends.map<Promise<Friend>>(async (_id) => {
					const friendUser = await users.findOne({ _id }).catch((err) => {
						throw err;
					});
					if (!friendUser) throw new Error('Friend not found');

					return {
						_id: _id,
						username: friendUser.username
					};
				})
			).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to resolve one or more friends' });
				console.log(err);
			});
			if (!friends) {
				await client.close();
				return;
			}

			const user: User = {
				_id: dbUser._id,
				username,
				token: dbUser.token,
				friends
			};

			res.status(201).json({ type: 'success', user });
			await client.close();
			break;
		}
		default: {
			res.status(405).json({ type: 'failure', reason: 'Only POST requests are allowed' });
		}
	}
};
