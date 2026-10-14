import { Request, Response } from "express";
import User from "../models/users.js";
import Test from "../models/tests.js";
import { checkBody } from "../modules/checkBody.js";
import { type RulesType } from "../models/types/TestInterface";

type StatusType = 'validated' | 'ignored' | 'reviewed';

type TestBodyKeys = {
  token: string; 
  testId: string; 
  ruleId: string; 
  type: RulesType;
  comment?: string;
}

/**
 * 
 * @param status 
 * @param commentIsRequired 
 * @returns 
 */

const makeUpdateRuleAction = (status: StatusType, commentIsRequired: boolean = false) => {
  return (req: Request<{}, any, TestBodyKeys>, res: Response) => {
    if (!checkBody(req.body, ['token', 'testId', 'ruleId', 'type'])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }

    if (commentIsRequired && !checkBody(req.body, ['comment'])) {
      res.status(403).json({ result: false, error: 'Comment is required'})
      return;
    }

    // Vérifie sur l'utilisateur est trouvé. Si l'utilisateur existe, il a l'autorisation de valider un test
    User.findOne({ token: req.body.token }).then(async user => {
      if (user === null) {
        res.json({ result: false, error: 'User not found' });
        return;
      }

      // Vérifie si le test a été trouvé
      const testDoc = await Test.findById(req.body.testId);
      // Récupère la rule concernée pour mettre à jour le status de la rule
      if (testDoc) {
        // Récupère les keys ruleId et type depuis req.body et stocke dans des variables du même nom
        const { ruleId, type } = req.body;

        const rule = testDoc[type].find(r => r.id === ruleId);
        if (rule) {
          // Mets à jour le status
          rule.status = status;
          // Mets à jour le commentaire
          rule.comment = req.body.comment ?? '';
          // Dis explicitement que l'array type (violations, incomplete, passes, inapplicable) à été modifié et doit persisté
          testDoc.markModified(type);
          // Mets à jour le document
          await testDoc.save().then((testDocUpdated) => {
            console.log('Test updated');
            res.status(200).json({ result: true, testDoc: testDocUpdated });
          });
        } else {
          res.status(403).json({ result: false, error: 'Unable to find a matched rule' });
        }
      } else {
        res.status(403).json({ result: false, error: 'Unable to find a test' });
      }
    });
  }
}

// Fonction qui valide une rule axe-core
const testValidationAction = makeUpdateRuleAction('validated')
const testIgnoreAction = makeUpdateRuleAction('ignored');
const testReviewAction = makeUpdateRuleAction('reviewed', true);

export {testValidationAction, testIgnoreAction, testReviewAction};