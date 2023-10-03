// const express = require("express");
// const cors = require('cors');
// const app = express();

// app.use(express.json());
// app.use(cors());

// app.listen(3001, () => {
//     console.log("listening");
// });

// const mysql = require("mysql");
// require('dotenv').config();

// const db = mysql.createConnection({
//   host: "127.0.0.1", // Update to your MySQL server host and port
//   port:3307,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD || '', 
//   database: "react_nodejs_mysql", // Verify that this is the correct database name
// });

// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//   } else {
//     console.log('Connected to the database');
//   }
// });

// app.get("/products", (req, res) => {
//     const q = "SELECT * FROM product";
//     db.query(q, (err, data) => {
//       if (err) {
//         console.error(err);
//         return res.json({ error: err.sqlMessage });
//       } else {
//         return res.json({ data });
//       }
//     });
// });

// app.post("/products", (req, res) => {
//     const { productId, productTitle, productDescription, productPrice, availableQuantity, productThumbnail } = req.body;
//     const q = "INSERT INTO product (productId, productTitle, productDescription, productPrice, availableQuantity, productThumbnail) VALUES (?, ?, ?, ?, ?, ?)";
//     const values = [productId, productTitle, productDescription, productPrice, availableQuantity, productThumbnail];
    
//     db.query(q, values, (err, data) => {
//       if (err) {
//         console.error(err);
//         return res.json({ error: err.sqlMessage });
//       } else {
//         return res.json({ data });
//       }
//     });
// });

// app.get("/products/:productId", (req, res) => {
//     const id = req.params.productId;
//     const q = "SELECT * FROM product WHERE productId = ?";
    
//     db.query(q, [id], (err, data) => {
//       if (err) {
//         console.error(err);
//         return res.json({ error: err.sqlMessage });
//       } else {
//         return res.json({ data });
//       }
//     });
// });

// app.put("/products/:productId", (req, res) => {
//     const id = req.params.productId;
//     const data = req.body;
//     const columns = Object.keys(data);
//     const values = Object.values(data);
    
//     const q = `UPDATE product SET ${columns.map(col => `${col} = ?`).join(', ')} WHERE productId = ?`;
//     values.push(id);
    
//     db.query(q, values, (err, data) => {
//       if (err) {
//         console.error(err);
//         return res.json({ error: err.sqlMessage });
//       } else {
//         return res.json({ data });
//       }
//     });
// });

// app.delete("/products/:productId", (req, res) => {
//     const id = req.params.productId;
//     const q = "DELETE FROM product WHERE productId = ?";
    
//     db.query(q, [id], (err, data) => {
//       if (err) {
//         console.error(err);
//         return res.json({ error: err.sqlMessage });
//       } else {
//         return res.json({ data });
//       }
//     });
// });

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
require('dotenv').config()
console.log(process.env)
console.log(process.env.DB_PASSWORD)

const db = mysql.createConnection({
  host: "127.0.0.1", // Update to your MySQL server host and port
  port:3307,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD || '', 
  database: "react_nodejs_mysql", // Verify that this is the correct database name
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(req.body, "in");
    cb(null, `${req.body.productId}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname ,'uploads')));


app.post("/thumbnailUpload", upload.single("productThumbnail"), (req, res) => {
  try {
    console.log(req.file) ;
    return res.json({ data: req.file.filename });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/products", (req, res) => {
    const q = "select * from product";
    db.query(q, (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else return res.json({ data });
    });
  });
  app.post("/products", (req, res) => {
    const q = `insert into product(productId, productTitle, productDescription, productPrice, availableQuantity, productThumbnail)
      values(?)`;
    const values = [...Object.values(req.body)];
    console.log("insert", values);
    db.query(q, [values], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else return res.json({ data });
    });
  });
  
  app.get("/products/:productId", (req, res) => {
    const id = req.params.productId;
    const q = "SELECT * FROM product where productId=?";
    db.query(q, [id], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else return res.json({ data });
    });
  });
  
  app.put("/products/:productId", (req, res) => {
    const id = req.params.productId;
    console.log("updated " + req.body);
    const data = req.body;
    if (data.productPrice) data.productPrice = Number.parseInt(data.productPrice);
    if (data.availableQuantity)
      data.availableQuantity = Number.parseInt(data.availableQuantity);
    const q =
      "update product set " +
      Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(",") +
      " where productId='" +
      id +
      "'";
    console.log(q);
    db.query(q, [...Object.values(data)], (err, out) => {
      console.log(err, out);
      if (err) return res.json({ error: err.message });
      else {
        return res.json({ data: out });
      }
    });
  });
  
  app.delete("/products/:productId", (req, res) => {
    const id = req.params.productId;
    console.log("deleting " + id, req.body);
    const { productThumbnail } = req.body;
    console.log(req.body);
    const q = `DELETE FROM product WHERE productId= ?`;
    db.query(q, [id], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else res.json({data})
    })
});


app.listen(3001, () => {
  console.log("listening");
});