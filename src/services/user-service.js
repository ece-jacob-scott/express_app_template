const { UserSchema, UserModel } = require("./models/user");
const { APIError } = require("../shared/error-handling");

const validateUserObject = async (obj) => {
  try {
    const user = UserSchema.validate(obj); // NOTE: maybe can use validateAsync

    if ("error" in user && Object.keys(user.value) === 0) {
      throw new APIError(422, "Validation error on User");
    }
    return user.value;
  } catch (err) {
    throw err;
  }
};

class UserService {
  async register(userObj) {
    try {
      const user = await validateUserObject(userObj);

      const usersWSameInformation = await Promise.all([
        UserModel.getByUsername(user.username),
        UserModel.getByEmail(user.email),
      ]);

      if (usersWSameInformation[0].length != 0) {
        throw new APIError(409, "a user already exists with that username");
      }

      if (usersWSameInformation[1].length != 0) {
        throw new APIError(409, "a user already exists with that email");
      }

      await UserModel.create(user);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new UserService();
