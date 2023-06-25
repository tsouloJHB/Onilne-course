const connectDb = require('./db');
const User = require('./models/usersModel');
const { MongoClient } = require('mongodb');
const faker = require('faker');

const uri = 'mongodb://localhost:27017';
const dbName = 'your-database-name';

async function createDummyData() {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      console.log('Connected to MongoDB');
  
      const db = client.db(dbName);
      const collection = db.collection('your-collection-name');
  
      const data = generateDummyData();
      const result = await collection.insertMany(data);
      console.log(`${result.insertedCount} documents inserted`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      client.close();
      console.log('Disconnected from MongoDB');
    }
  }


  function generateDummyData() {
    const data = [];
    for (let i = 0; i < 10; i++) {
      const item = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        phone: faker.phone.phoneNumber(),
      };
      data.push(item);
    }
    return data;
  }
  
  