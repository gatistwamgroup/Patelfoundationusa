const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function fixIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const Donation = mongoose.model('Donation', new mongoose.Schema({}, { strict: false }));
        
        console.log('Attempting to drop existing transactionId index...');
        try {
            await Donation.collection.dropIndex('transactionId_1');
            console.log('Successfully dropped transactionId_1 index');
        } catch (e) {
            console.log('Index transactionId_1 not found, skipping drop.');
        }

        console.log('Attempting to drop existing customId index...');
        try {
            await Donation.collection.dropIndex('customId_1');
            console.log('Successfully dropped customId_1 index');
        } catch (e) {
            console.log('Index customId_1 not found, skipping drop.');
        }

        // The model in the app will recreate them with the correct flags (unique+sparse) on next startup
        console.log('Migration complete. Restarting server will recreate correct indexes.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

fixIndexes();
