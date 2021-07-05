import joi from "joi";
const { queryProm } = require("../../shared/mysql-conn");
const bcrypt = require("bcrypt");

const UserSchema = joi.object({
  username: joi.string().alphanum().min(3).max(50).required(),
  password: joi
    .string()
    .required() /*.pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),*/, // uncomment for prod
  email: joi.string().email().required(),
});

class User {
  /**
   * Constructor of the basic User object to be returned from the UserModel
   * @param {object} user - expected to be the user object from DB
   */
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.password = user.pass;
    this.email = user.email;
  }

  async checkPass(pass) {
    return await bcrypt.compare(pass, this.password);
  }
}

class UserModel {
  async create(user) {
    // NOTE: user = has been validated by UserSchema
    try {
      const hashedPassword = await bcrypt.hash(
        user.password,
        // process.env.BCRYPT_ROUNDS || 10 // defaults to string which is wrong :(
        10
      );

      await queryProm(
        "INSERT INTO users (username, pass, email) VALUES (?, ?, ?)",
        [user.username, hashedPassword, user.email]
      );
    } catch (err) {
      throw err;
    }
  }

  async getByUsername(username) {
    try {
      const results = await queryProm(
        "SELECT BIN_TO_UUID(id) id, username, pass, email FROM users WHERE username = ?",
        username
      );

      return results.map((user) => new User(user));
    } catch (err) {
      throw err;
    }
  }

  async getByID(id) {
    try {
      const results = await queryProm(
        "SELECT BIN_TO_UUID(id) id, username, pass, email FROM users WHERE id = UUID_TO_BIN(?)",
        id
      );

      if (results.length == 0) {
        throw new Error(`no user with id=${id}`);
      }

      return new User(results[0]);
    } catch (err) {
      throw err;
    }
  }

  async getByEmail(email) {
    try {
      const results = await queryProm(
        "SELECT BIN_TO_UUID(id) id, username, pass, email FROM users WHERE email = ?",
        email
      );

      return results.map((user) => new User(user));
    } catch (err) {
      throw err;
    }
  }
}

/**
 * Export schema to be used by services to validate incoming user data
 */
module.exports.UserSchema = UserSchema;

/**
 * Export the UserModel object to interact with the db
 */
module.exports.UserModel = new UserModel();
