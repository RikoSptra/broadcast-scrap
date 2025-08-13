const { MongoClient } = require("mongodb");
const bcrypt = require('bcryptjs');

const uri = "mongodb://localhost:27017";
const dbName = "broadcast-ini";

let dbInstance = null;

const getDB = () => {
  if (!dbInstance) {
    throw new Error('Database belum diinisialisasi. Panggil initializeDB() terlebih dahulu.');
  }
  return dbInstance;
};

const initializeDB = async () => {
  try {
    if (dbInstance) return dbInstance;
    
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected successfully to MongoDB');

    dbInstance = client.db(dbName);

    // Check if Users collection exists and create admin if not exists
    const users = dbInstance.collection('users');
    const adminExists = await users.findOne({ username: 'root' });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('toor', salt);

      await users.insertOne({
        name: 'Admin',
        username: 'root',
        password: hashedPassword,
        role: 'admin',
        _createdAt: new Date()
      });
      console.log('Admin user created successfully');
    }

    return dbInstance;
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    throw error;
  }
};

module.exports = { initializeDB, getDB }; 