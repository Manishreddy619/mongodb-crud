import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import authermodel from '../services/authors/schema.js';
import { JWTAuthenticate } from './tools.js';

const googleStrategy = new GoogleStrategy(
	{
		clientID: process.env.GOOGLE_OAUTH_ID,
		clientSecret: process.env.GOOGLE_OAUTH_SECRET,
		callbackURL: `${process.env.API_URL}/users/googleRedirect`,
	},
	async (accessToken, refreshToken, googleProfile, passportNext) => {
		try {
			// callback function executed when Google gives us a response

			// We are receiving some profile information from Google
			console.log(googleProfile);

			// 1. Check if user is already in our database
			const user = await UserModel.findOne({ googleId: googleProfile.id });

			if (user) {
				// 2. If user is already there --> create tokens for him/her
				const tokens = await JWTAuthenticate(user);
				passportNext(null, { tokens });
			} else {
				// 3. If it is not there --> add user to our db and create tokens for him/her

				const newUser = {
					name: googleProfile.name.givenName,
					surname: googleProfile.name.familyName,
					email: googleProfile.emails[0].value,
					googleId: googleProfile.id,
				};

				const createdUser = new authermodel(newUser);
				const savedUser = await createdUser.save();

				const tokens = await JWTAuthenticate(savedUser);
				console.log(tokens);
				passportNext(null, { tokens }); // This function is very similar to middlewares' next function. It helps us passing data to what is coming next (googleRedirect route handler). First parameter of passportNext should be err, second parameter is whatever you want to pass
			}
		} catch (error) {
			passportNext(error);
		}
	},
);

passport.serializeUser(function (data, passportNext) {
	passportNext(null, data); // MANDATORY, otherwise you will receive the "Failed to serialize user into session" error
});

export default googleStrategy;
