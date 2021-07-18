import crypto from 'crypto';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { commonPasswords, PasswordStrength, trigraphs } from 'tai-password-strength';
import { v4 as uuid } from 'uuid';

export default async (req: NextApiRequest, res: NextApiResponse<SignupResponse>): Promise<void> => {
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
			}
			if (username.length > 20) {
				res.status(400).json({ type: 'failure', reason: 'Username must be less than 20 characters' });
				return;
			}
			if (username.length < 3) {
				res.status(400).json({ type: 'failure', reason: 'Username must be at least 3 characters' });
				return;
			}
			if (password.length < 6) {
				res.status(400).json({ type: 'failure', reason: 'Password must be at least 6 characters' });
				return;
			}
			const ps = new PasswordStrength();
			ps.addCommonPasswords(commonPasswords);
			ps.addTrigraphMap(trigraphs);
			const strength = ps.check(password).strengthCode;
			if (strength === 'WEAK' || strength === 'VERY_WEAK' || strength === 'REASONABLE') {
				res.status(400).json({ type: 'failure', reason: 'Password is weak' });
				return;
			}

			const client = await MongoClient.connect(process.env.MONGODB_URL!, { useNewUrlParser: true, useUnifiedTopology: true }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to connect to DB' });
				console.log(err);
			});
			if (!client) return;

			const db = client.db('calendars');
			const users = db.collection<DBUser>('users');
			const _id: string = uuid(),
				token: string = uuid();

			const user = await users.findOne({ username }).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to find user' });
				console.log(err);
			});
			if (user === undefined) {
				await client.close();
				return;
			}
			if (user) {
				res.status(409).json({ type: 'failure', reason: 'A user with that username already exists' });
				await client.close();
				return;
			}

			const salt = crypto.randomBytes(32).toString();
			const hash = crypto.createHash('sha256');
			const saltedPass = hash
				.update(salt + password)
				.digest()
				.toString();

			const newUser: DBUser = {
				_id,
				token,
				friends: [],
				username,
				password: saltedPass,
				salt
			};

			const insertUser = await users.insertOne(newUser).catch((err) => {
				res.status(500).json({ type: 'failure', reason: 'Failed to create user' });
				console.log(err);
			});
			if (!insertUser) {
				await client.close();
				return;
			}

			res.status(201).json({ type: 'success', token });
			await client.close();
			break;
		}
		default: {
			res.status(405).json({ type: 'failure', reason: 'Only POST requests are allowed' });
		}
	}
};