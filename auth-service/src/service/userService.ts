import User, { IUser } from '../models/userModel';

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
    const user = new User(userData);
    return await user.save();
};

export const getUserById = async (userId: string): Promise<IUser | null> => {
    return await User.findById(userId);
};

export const updateUser = async (userId: string, updateData: Partial<IUser>): Promise<IUser | null> => {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

export const deleteUser = async (userId: string): Promise<IUser | null> => {
    return await User.findByIdAndDelete(userId);
};

export const getAllUsers = async (): Promise<IUser[]> => {
    return await User.find();
};
