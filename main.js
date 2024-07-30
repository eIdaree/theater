const express = require('express');
const app = express();
const port = 3000;
const host = '127.0.0.1'; 
const bodyParser = require('body-parser');
const session = require('express-session');



const { sql, connectDB } = require('./connect');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); 
    next();
});

app.use(session({
    secret: 'secret-key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.post('/register', async (req, res) => {
    try {
        console.log(req.body)
        const { username, password, email,status } = req.body;
        if (!username) {
            throw new Error('Username cannot be empty');
        }
        const pool = await connectDB();
        const result = await pool.request()   
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .input('email',sql.VarChar,email)
            .input('status', sql.VarChar, status)
            .query('INSERT INTO Users (Username, Password, Email,Status) VALUES (@username, @password,@email, @status)');
        res.status(200).json({ message: 'Successful registration' });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error executing query' });
    }
});


app.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        const pool = await connectDB();
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query('SELECT * FROM Users WHERE Username = @username AND Password = @password');
        if (result.recordset.length > 0) {
            req.session.username = username;
            res.status(200).json({ message: 'Authentication successful', username: username });
        } else {
            res.status(401).json({ error: 'Incorrect credentials' });
        }
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Error executing query' });
    }
});


app.get('/performances', (req, res) => {
    const query = `
        SELECT p.PerformanceID, p.Date, p.StartTime, p.EndTime, pl.Title AS PlayTitle, th.Name AS TheaterName
        FROM Performance p
        JOIN Play pl ON p.PlayID = pl.PlayID
        JOIN Theater th ON p.TheaterID = th.TheaterID
    `;

    connectDB().then(pool => {
        pool.request()
            .query(query)
            .then(result => {
                res.json(result.recordset);
            })
            .catch(error => {
                console.error('Error executing query:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }).catch(error => {
        console.error('Error connecting to database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});


app.get('/airlines', async(req,res) =>{
    try{
        const pool = await connectDB();
        const result = await pool.query('SELECT * FROM Airline');
        const airlines = result.recordset; 

        res.json(airlines)
    }catch (err) {
        console.error('Error fetching airlines list:', err);
        res.status(500).send('Server error');
    }
})


app.get('/flights', async (req, res) => {
    try {
        const pool = await connectDB(); 
        const result = await pool.query(`
            SELECT
                f.FlightID,
                f.FlightNumber,
                a.AirlineName AS Airline,
                dep.AirportName AS DepartureAirport,
                arr.AirportName AS ArrivalAirport,
                f.DepartureDateTime,
                f.ArrivalDateTime
            FROM
                Flight f
                JOIN Airline a ON f.AirlineID = a.AirlineID
                JOIN Airport dep ON f.DepartureAirportID = dep.AirportID
                JOIN Airport arr ON f.ArrivalAirportID = arr.AirportID
        `);
        const airlines = result.recordset; 

        res.json(airlines); 
    } catch (err) {
        console.error('Error fetching airlines list:', err);
        res.status(500).send('Server error');
    }
});


app.get('/actors', async(req, res) => {
    const query = `
        SELECT 
            a.ActorID, 
            a.Name AS ActorName, 
            a.Age, 
            a.Gender, 
            a.Nationality,
            p.Date, 
            p.StartTime, 
            p.EndTime, 
            pl.Title AS PlayTitle, 
            th.Name AS TheaterName
        FROM Actor a
        JOIN Performance p ON a.PerformanceID = p.PerformanceID
        JOIN Play pl ON p.PlayID = pl.PlayID
        JOIN Theater th ON p.TheaterID = th.TheaterID
    `;
    const pool = await connectDB(); 
    pool.query(query, (error, result) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(result.recordset);
    });
});


app.get('/playtitles', async(req, res) => {
    const query = `
        SELECT DISTINCT Title AS PlayTitle
        FROM Play
    `;
    const pool = await connectDB()
    pool.query(query, (error, result) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(result.recordset);
    });
});


app.put('/actors/:id', async (req, res) => {
    const actorId = req.params.id;
    const { age, nationality } = req.body;

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('actorId', sql.Int, actorId)
            .input('age', sql.Int, age)
            .input('nationality', sql.VarChar, nationality)
            .query('UPDATE Actor SET Age = @age, Nationality = @nationality WHERE ActorID = @actorId');

        res.status(200).json({ message: 'Actor information updated successfully' });
    } catch (err) {
        console.error('Error updating actor information:', err);
        res.status(500).json({ error: 'Error updating actor information' });
    }
});


app.get('/checkAuth', (req, res) => {

    if (req.session.username) {
        res.status(200).json({ username: req.session.username });
    } else {
        res.status(401).json({ error: 'User not authenticated' });
    }
});


app.get('/checkAuthStatus', async (req, res) => {
    try {
        if (req.session.username) {
            const pool = await connectDB();
            const result = await pool.request()
                .input('username', sql.VarChar, req.session.username)
                .query('SELECT Status,Email FROM Users WHERE Username = @username');
            if (result.recordset.length > 0) {
                const userStatus = result.recordset[0].Status;
                const email = result.recordset[0].Email
                res.status(200).json({ status: userStatus, email: email });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } else {
            res.status(401).json({ error: 'User not authenticated' });
        }
    } catch (err) {
        console.error('Error fetching user status:', err);
        res.status(500).json({ error: 'Error fetching user status' });
    }
});


app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});



