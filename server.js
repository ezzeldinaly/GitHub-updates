const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.json());

app.post('/update-repo', (req, res) => {
  // Extract data from the form submission
  const { storeName, googleReviewsLink, yelpLink } = req.body;

  // Run the update-repo.js script with the form data
  exec(`node update-repo.js ${storeName} ${googleReviewsLink} ${yelpLink}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send('Error updating repository');
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.send('Repository updated successfully');
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
