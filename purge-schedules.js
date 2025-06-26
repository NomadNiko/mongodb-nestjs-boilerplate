const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanupSchedules() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    const db = client.db('hostelshiftsV3');
    
    console.log('=== CLEANING UP SCHEDULES ===');
    
    // Get all schedules
    const schedules = await db.collection('scheduleschemaclasses').find({}).toArray();
    console.log('\nExisting schedules:');
    schedules.forEach(s => {
      console.log(`- ${s.name} (${s.startDate} to ${s.endDate}) - Status: ${s.status}`);
    });
    
    // Get all schedule shifts
    const shifts = await db.collection('scheduleshiftschemaclasses').find({}).toArray();
    console.log(`\nFound ${shifts.length} schedule shifts across all schedules`);
    
    // Clean up: Remove all existing schedules and shifts to start fresh
    console.log('\nRemoving all existing schedules and shifts...');
    await db.collection('scheduleschemaclasses').deleteMany({});
    await db.collection('scheduleshiftschemaclasses').deleteMany({});
    
    console.log('✅ Database cleaned successfully - all schedules and shifts removed');
    console.log('The frontend will now create a new schedule for the current week');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

cleanupSchedules();