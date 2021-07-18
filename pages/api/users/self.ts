import cookie from 'cookie';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse<UsersSelfResponse>): Promise<void> => {
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
			const users = db.collection<DBUser>('users');

			const dbUser = await users.findOne({ token }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to get user' });
				console.log(err);
			});
			if (dbUser === null) {
				res.setHeader('Set-Cookie', cookie.serialize('token', '', { expires: new Date(0), sameSite: true }))
					.status(401)
					.json({ type: 'failure', reason: 'No user with that token exists' });
				await client.close();
				return;
			}
			if (!dbUser) {
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
				username: dbUser.username,
				token: dbUser.token,
				friends
			};

			res.status(200).json({ type: 'success', user });
			await client.close();
			return;
		}
		case 'PATCH': {
			res.status(501).json({ type: 'failure', reason: 'Not Implemented' });
			return;
		}
		case 'DELETE': {
			res.status(501).json({ type: 'failure', reason: 'Not Implemented' });
			return;
		}
		default: {
			res.status(405).send({
				type: 'failure',
				reason: 'Allowed methods are: GET, PATCH, DELETE'
			});
			return;
		}
	}
};
