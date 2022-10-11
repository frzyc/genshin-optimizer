import { describe, expect } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Character } from '../models/Character';
import { Database } from '../models/Database';
import { User } from '../models/User';

describe("DB test", () => {
  let mongod: MongoMemoryServer
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri()
    await mongoose.connect(uri)
  })
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections)
      await collections[key].deleteMany({})
  })
  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongod.stop()
  })
  it("test", async () => {
    let user = await (new User({
      username: "123",
      email: "123@email.com",
      password: "123456",
    })).save()
    expect(user).toBeTruthy()
    const database = await (new Database({
      index: 2,
      name: "db2",
      uid: 1234,
      gender: "M"
    })).save()
    expect(database).toBeTruthy()
    console.log(database)
    console.log(await User.findByIdAndUpdate(user._id, { database: database._id }).exec())
    user = await User.findById(user._id).populate({ path: "database", options: { retainNullValues: true } }).exec()
    expect(database._id).toEqual(user.database._id)

    let char = await (new Character({
      database: database._id,
      key: "Albedo",
    })).save()
    expect(char.database).toEqual(user.database._id)
    console.log(char)
  })
})
