import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const commentSchema = new Schema({
	text: { type: String, required: true },
	rate: { type: Number, required: true },
});
export default model('Comment', commentSchema);
