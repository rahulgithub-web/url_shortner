const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

var admin = require("firebase-admin");
var serviceAccount = require("./urlshorts2022-e748b-firebase-adminsdk-z422x-e0a5b4c087.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const static = express.static("public");

const urlsdb = admin.firestore().collection("urlsdb");
const usersdb = admin.firestore().collection("usersdb");

app.use(static);
app.use(bodyParser.json());

app.get("/:short", (req, res) => {
  console.log(req.params);
  const short = req.params.short;

  const doc = urlsdb.doc(short);

  doc.get().then((response) => {
    const data = response.data();
    console.log(data);
    if (data && data.url) {
      res.redirect(301, data.url);
    } else {
      res.redirect(301, "https://www.google.com");
    }
  });
  // res.send("We will redirect you to short " + short);
});

app.post("/admin/urls/", (req, res) => {
  const { email, password, short, url } = req.body;

  usersdb
    .doc(email)
    .get()
    .then((response) => {
      const user = response.data();
      console.log(user);

      if (user && user.email == email && user.password == password) {
        const doc = urlsdb.doc(short);
        doc.set({ url: url });
        res.send("Done");
      } else {
        res.send(403, "Invalid email or password");
      }
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
