const mongoose = require('mongoose');

const connectDatabase = () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI is not set. Please verify backend/config/.env or project .env');
    } else {
        const hostInfo = uri.includes('localhost') ? 'local mongodb' : 'remote mongodb';
        console.log(`Attempting to connect to ${hostInfo}`);
    }

    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Mongoose Connected to', mongoose.connection.host || 'unknown-host');
    }).catch((error) => {
        console.error('Mongoose connection error:', error && error.stack ? error.stack : error);
    });
}

module.exports = connectDatabase;