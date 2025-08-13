const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String },
  hashedPassword: { type: String },
});

// * mongoose set() method takes 2 arguments
// Key: String - the option's name to set
// Value: Object - the option's value to set

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

module.exports = mongoose.model("User", userSchema);
