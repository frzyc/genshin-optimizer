import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongod = await MongoMemoryServer.create();

export async function connectDB() {
  const uri = await mongod.getUri()
  await mongoose.connect(uri)
}

export async function closeDB() {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
}

export async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections)
    await collections[key].deleteMany({})
}
