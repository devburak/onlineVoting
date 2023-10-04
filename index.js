const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./db');
const memberRoutes = require('./routes/members');
const userRoutes = require('./routes/users')

const app = express();
app.use(express.json());
// CORS OK
app.use(cors());
connectToDatabase();

app.get('/', (req, res) => {
    res.send('Hello word');
});

app.use('/members', memberRoutes);
app.use('/users', userRoutes );

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server http://127.0.0.1:${port} portunda çalışıyor.`);
});