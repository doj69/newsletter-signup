const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const { response } = require("express");
const ejs = require("ejs");

const app = express();
const port = process.env.PORT || 3000;
const apiKey = "6e3ec42ca3bfe61e4a2e03fb62a37ec2-us1";
const uniqueId = "1bfea6b2ab";
const server = "us1";
// const username = "doju69";

//Set Config
app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

mailchimp.setConfig({
  apiKey: apiKey,
  server: server,
});

app.set("view engine", "ejs");

//Main
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/signup.html`);
});

app.post("/", async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  /* old style 
  const json = JSON.stringify(data);
  const url = `https://us1.api.mailchimp.com/3.0/lists/${uniqueId}`;
  const options = {
    method: "POST",
    auth: `${username}:${apiKey}`,
  };

  const request = https.request(url, options, (response) => {
    console.log(response.statusCode);
    if (response.statusCode === 200) {
      res.sendFile(`${__dirname}/success.html`);
    } else {
      res.sendFile(`${__dirname}/failure.html`);
    }
    response.on("data", (data) => {
      var member = JSON.parse(data);
      console.log(member);
    });
  });
  // request.write(json);
  request.end(); 
  */
  var title = "";
  var heading = "";
  var message = "";
  var errorCount = 0;

  const response = await mailchimp.lists.batchListMembers(uniqueId, data);
  errorCount = response.error_count;
  if (response.error_count > 0) {
    title = "Failure";
    heading = "Uh oh!";
    message = "Something get wrong when you subscribing the newsletter.";
    // res.sendFile(`${__dirname}/failure.html`);
  } else {
    title = "Success";
    heading = "Yeah! awesome";
    message = "Thanks for your subscribe to our newsletter.";
    // res.sendFile(`${__dirname}/success.html`);
  }

  res.render("status", {
    title: title,
    heading: heading,
    message: message,
    errorCount: errorCount,
  });
});

app.post("/failure", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
