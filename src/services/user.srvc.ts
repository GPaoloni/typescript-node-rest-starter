import { User } from "../models/user";
import * as bcrypt from "bcrypt-nodejs";
import * as util from "util";
import UserRepository, { UserType } from "../schemas/user.schema";

/**
 * @description Fetches single user from the storage by email
 * @param email
 * @returns {Promise<User>}
 */
export const findByEmail = async (email): Promise<User> => {
  const user: UserType = await UserRepository.findOne({ email: email });
  return user;
};

/**
 * @description Fetches single user from the storage by email or username
 * @param username
 * @param email
 * @returns {Promise<User>}
 */
export const findByUsernameOrEmail = async (username, email): Promise<User> => {
  const user: User = await UserRepository.findOne({
    $or: [{ email: email }, { username: username }]
  });
  return user;
};

/**
 * @description Saves the user in the storage
 * @param {User} user
 * @returns {Promise<User>}
 */
export const save = async (user: User): Promise<User> => {
  return (await new UserRepository(user).save()).toObject({ virtuals: true });
};

/**
 * @description Fetches single user by activationToken and sets active flag
 * @param activationToken
 * @returns {Promise<User>}
 */
export const findOneAndUpdate = async (activationToken): Promise<User> => {
  const user: User = await UserRepository.findOneAndUpdate(
    { activationToken: activationToken },
    { active: true },
    { new: true }
  );
  return user;
};

/**
 * @description Fetches all users from the storage
 * @returns {Promise<User[]>}
 */
export const findAll = async (): Promise<User[]> => {
  return (await UserRepository.find()) as User[];
};

/**
 * @description Deletes a single user from storage
 * @returns {Promise<void>}
 */
export const deleteOne = async (username: string): Promise<void> => {
  await UserRepository.deleteOne({ username: username });
};

/**
 * @description Compares encrypted and decrypted passwords
 * @param {string} candidatePassword
 * @param storedPassword
 * @returns {boolean}
 */
export const comparePassword = (
  candidatePassword: string,
  storedPassword
): boolean => {
  const qCompare = (util as any).promisify(bcrypt.compare);
  return qCompare(candidatePassword, storedPassword);
};

export default {
  findByEmail,
  findByUsernameOrEmail,
  save,
  findOneAndUpdate,
  findAll,
  deleteOne,
  comparePassword
};
