const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();
const bodyParser = require('body-parser');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); //Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

// Create MySQL connection
const connection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '',
database: 'mycagpharm'
});
connection.connect((err) => {
if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
}
console.log('Connected to MySQL database');
});

//set up view engine
app.set('view engine', 'ejs');
//enable static files
app.use(express.static('public'));
//enable form processing
app.use(express.urlencoded({
    extended: false
}));

//enable static files
app.use(express.static('public'));

//Define routes
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM random';
    //fetch data from MySQL 
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:' , error.message);
            return res.status(500).send('Error Retrieving products');
        }
        //Render HTML page with data 
        res.render('home',{random: results});
    });
});

app.post('/', upload.single('randomImage'), (req, res) => {
  //Extract product date from the request body
  const {randomName, randomDesc} = req.body;
  let image;
  if (req.file) {
      image = req.file.filename;
  } else {
      image = null;
  }
  const sql = 'INSERT INTO random (randomName,  randomImage, randomDesc) VALUES (?, ?, ?)'; 
  // Insert the new product into the database
  connection.query( sql, [randomName, randomeImage, randomDesc], (error, results) => {
      if (error) {
          // Handle any error that occurs during the database operation 
          console.error("Error adding product:", error); 
          res.status(500).send('Error adding product');
      } else {
          // Send a success response 
          res.redirect('/');
      }
  });
});

app.get('/random/:id', (req, res) => {
  // Extract the student ID from the request parameters
  const randomId = req.params.id;
  const sql = 'SELECT * FROM random WHERE randomId = ?';
  // Fetch data from MySQL based on the student ID
  connection.query(sql, [randomId], (error, results) => {
      if (error) {
          console.error('Database query error:', error.message);
          return res.status(500).send('Error retrieving random by ID');
      }
      // Check if any student with the given ID was found
      if (results.length > 0) {
          // Render HTML page with the student data
          res.render('randoms', { random: results[0] });
      } else {
          // If no student with the given ID was found, render a 404 page or handle it accordingly
          res.status(404).send('Product not found');
      }
  });
});


app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    const { signupName, signupContact, signupEmail, signupUsername, signupPassword } = req.body;
    console.log("Form Data received:", req.body);

    const sql = "INSERT INTO signup (signupName, signupContact, signupEmail, signupUsername, signupPassword) VALUES (?, ?, ?, ?, ?)";
    
    connection.query(sql, [signupName, signupContact, signupEmail, signupUsername, signupPassword], (error, results) => {
        if (error) {
            console.error("Error creating account", error);
            res.status(500).send("Error creating account");
        } else {
            res.redirect("/");
        }
    });
});


app.get('/partners', function(req, res) {
  //TODO: Insert code to render a view called "index" and pass the variable 'students' to the view for rendering
  res.render('partners');
});

app.get('/contact', function(req, res) {
  //TODO: Insert code to render a view called "index" and pass the variable 'students' to the view for rendering
  res.render('contact');
});

app.get('/addtocart', (req, res) => {
    res.render('addcart');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));