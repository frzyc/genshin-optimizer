import mongoose from "mongoose";

export const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    name: String
  })
);

export async function initRole() {
  const count = await Role.estimatedDocumentCount()
  if (!count) {
    Role.bulkSave([
      new Role({
        name: "user"
      }),
      new Role({
        name: "moderator"
      }),
      new Role({
        name: "admin"
      })
    ])
  }
}
