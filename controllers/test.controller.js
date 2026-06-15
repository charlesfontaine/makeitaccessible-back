const User = require('../models/users');
const Test = require("../models/tests.js");
const { checkBody } = require("../modules/checkBody.js");

// Fonction qui valide un test
const testValidationAction = (req, res) => {
  if (!checkBody(req.body, ['token', 'testId'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Vérifie sur l'utilisateur est trouvé. Si l'utilisateur existe, il a l'autorisation de valider un test
  User.findOne({ token: req.body.token }).then(user => {
    if (user === null) {
      res.json({ result: false, error: 'User not found' });
      return;
    }

    // Vérifie si le test a été trouvé
    Test.findById(req.body.testId).then(test => {
      if (!test) {
        res.json({ result: false, error: 'Test not found' });
        return;
      }

      Test.updateOne(
        { _id: test._id },
        {
          $set: {
            status: "validated"
          }
        }
      ).then(() => {
        res.status(200).json({ result: true, test });
      });
    });
  });
}

module.exports = {testValidationAction};