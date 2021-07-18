import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
	switch (req.method) {
		case 'GET': {
			res.send('GET users');
			return;
		}
		default: {
			res.status(405).json({ type: 'failure', reason: 'Only GET requests are allowed' });
		}
	}
};
