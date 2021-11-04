import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const { Schema, model } = mongoose;
const authorSchema = new Schema(
	{
		name: { type: String, required: true },
		surName: { type: String, required: true },
		email: { type: String, required: true },
		avatar: { type: String },
		dateOfbirth: { type: String },
		password: { type: String },
		role: { type: String, default: 'User', enum: ['User', 'Admin'] },
		googleId: { type: String },
	},

	{
		timestamps: true,
	},
);
authorSchema.pre('save', async function (next) {
	const newAuthor = this;
	const password = newAuthor.password;
	if (newAuthor.isModified('password')) {
		newAuthor.password = await bcrypt.hash(password, 11);
	}
	next();
});

authorSchema.methods.toJSON = function () {
	const authorDocument = this;
	const authorobject = authorDocument.toObject();
	delete authorobject.password;
	return authorobject;
};

authorSchema.statics.checkCredentials = async function (email, plainPW) {
	// 1. find the user by email
	const author = await this.findOne({ email }); // "this" refers to authorModel

	if (author) {
		// 2. if the author is found we are going to compare plainPW with hashed one
		const isMatch = await bcrypt.compare(plainPW, author.password);
		// 3. Return a meaningful response
		if (isMatch) return author;
		else return null; // if the pw is not ok I'm returning null
	} else return null; // if the email is not ok I'm returning null as well
};
export default model('Author', authorSchema);
