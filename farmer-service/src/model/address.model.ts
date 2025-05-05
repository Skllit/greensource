import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const AddressSchema = new Schema({
    id: { type: String, default: uuidv4, unique: true, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, required: true },
    is_primary: { type: Boolean, default: false }, // Indicates if this is the primary address
}, { timestamps: true });

export default model('Address', AddressSchema);
