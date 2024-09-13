const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const port = 3000; // You can choose any port

app.use(bodyParser.json());

const GITHUB_TOKEN = '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';
const REPO_OWNER = 'ezzeldinaly';
const TEMPLATE_REPO = 'store-website-template';
const MAIN_REPO = 'GitHub-updates'; // Updated repository name
const BRANCH_NAME = 'main'; // Replace with your branch name

app.post('/', async (req, res) => {
  const { storeName, googleReviewsLink, yelpLink, email } = req.body;

  if (!storeName || !googleReviewsLink || !yelpLink || !email) {
    return res.status(400).send('Missing required fields');
  }

  try {
    // Create a new repository for the store
    const newRepoName = `store-${storeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    await createRepository(newRepoName);

    // Update repository with provided links
    await updateRepository(newRepoName, googleReviewsLink, yelpLink);

    res.status(200).send('Repository created and updated successfully');
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request');
  }
});

async function createRepository(repoName) {
  await axios.post('https://api.github.com/user/repos', {
    name: repoName,
    private: false,
    auto_init: true,
    from_template: TEMPLATE_REPO
  }, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
}

async function updateRepository(repoName, googleReviewsLink, yelpLink) {
  const filePath = 'happy.html';

  const response = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${repoName}/contents/${filePath}?ref=${BRANCH_NAME}`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });

  const sha = response.data.sha;
  const currentContent = Buffer.from(response.data.content, 'base64').toString('utf8');
  const updatedContent = currentContent
    .replace(/PLACEHOLDER_GOOGLE_REVIEWS/g, googleReviewsLink)
    .replace(/PLACEHOLDER_YELP/g, yelpLink);

  await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${repoName}/contents/${filePath}`, {
    message: 'Update file content',
    content: Buffer.from(updatedContent).toString('base64'),
    sha: sha,
    branch: BRANCH_NAME
  }, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
