import jwt from 'jsonwebtoken';
const generateJwt = (payload) =>
	new Promise((resove, reject) =>
		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: '1 week' },
			(err, token) => {
				if (err) reject(err);
				else resove(token);
			},
		),
	);
export const verifyJWT = (token) =>
	new Promise((res, rej) =>
		jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
			if (err) rej(err);
			else res(decodedToken);
		}),
	);
export const JWTAuthenticate = async (user) => {
	// given the user the function gives us back the access token
	const accessToken = await generateJwt({ _id: user._id });

	return accessToken;
};
