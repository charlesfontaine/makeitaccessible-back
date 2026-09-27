import express, { Request, Response } from "express";
const router = express.Router();

import { Types, type HydratedDocument } from "mongoose";
import { type SignupUserType } from "./types/users/SignupUserType";
import { type SigninUserType } from "./types/users/SigninUserType";
import { type UserType } from "./types/users/UserType";
import { type PublicUser } from "./types/users/PublicUserType";
import { type UserUpdatePayload } from "./types/users/UserUpdatePayload";
import { IUser } from "../models/types/UserInterface";

import User from "../models/users";
import Audit from "../models/audits";
import Test from "../models/tests.js";

import { checkBody } from "../modules/checkBody";
import uid2 from "uid2";
import bcrypt from "bcrypt";

/**
 * Attach an existing audit to a user
 * @param {string|import('mongoose').Types.ObjectId} auditId - Audit id to attach
 * @param {import('mongoose').HydratedDocument<IUsers>} userDoc - User doc targeted
 * @returns {Promise<boolean>} `false` if no doc modified — Audit does not exist, or it is already attached to the user
 */
const updateAuditForUser: (auditId: string | Types.ObjectId, userDoc: HydratedDocument<IUser>) => Promise<boolean> =
  async (auditId, userDoc) => {
    return Audit.updateOne(
      { _id: auditId },
      { $set: { user: userDoc._id } }
    ).then(auditDoc => auditDoc.modifiedCount > 0);
}

/**
 * POST - Register a user
 */
router.post("/signup", (req: Request<{}, any, SignupUserType>, res: Response) => {
  if (!checkBody(req.body, ["firstName", "lastName", "email", "username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.email }],
  }).then((data) => {
    if (data !== null) {
      res.json({ result: false, error: "L'utilisateur existe déjà" });
      return;
    }
    const hash = bcrypt.hashSync(req.body.password, 10);

    const newUser = new User({
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      username: req.body.username.trim(),
      email: req.body.email.trim(),
      password: hash,
      token: uid2(32),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    newUser.save().then(async (newDoc) => {
      // Si un audit a précédemment été créé en tant qu'utilisateur anonyme
      const { auditId } = req.body;

      // On relie l'utilisateur connecté à un audit
      if (auditId) {
        // Enregistrement d'un audit pour l'utilisateur connecté
        await updateAuditForUser(auditId, newDoc);

        // On retourne les données utilisateurs et l'id de l'audit pour le front pour appeler /audit/:id et récupérer les tests de l'audit
        res.status(200).json({
          result: true,
          token: newDoc.token,
          auditId: auditId
        });
      } else {
        res.status(200).json({ result: true, token: newDoc.token });
      }
    })
      .catch((err) => {
        res.status(403).json({ result: false, error: err.message });
      });
  });
});

/**
 * POST - Loggedin a user
 */
router.post("/signin", (req: Request<{}, any, SigninUserType>, res: Response) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Les champs requis sont manquants ou invalides" });
    return;
  }

  User.findOne({ username: { $regex: new RegExp(req.body.username, 'i') } }).then(async (userDoc) => {
    if (userDoc && bcrypt.compareSync(req.body.password, userDoc.password)) {

      // Si un audit a précédemment été créé en tant qu'utilisateur anonyme
      const { auditId } = req.body;

      // On relie l'utilisateur connecté à un audit
      if (auditId) {
        // Enregistrement d'un audit pour l'utilisateur connecté
        await updateAuditForUser(auditId, userDoc);
        console.log('User is added to the audit');

        // On retourne les données utilisateurs et l'id de l'audit pour le front pour appeler /audit/:id et récupérer les tests de l'audit
        res.status(200).json({
          result: true,
          token: userDoc.token,
          username: userDoc.username,
          firstName: userDoc.firstName,
          auditId: auditId
        });
      } else {
        res.status(200).json({
          result: true,
          token: userDoc.token,
          username: userDoc.username,
          firstName: userDoc.firstName
        });
      }
    } else {
      res.status(403).json({ result: false, error: "Utilisateur non trouvé ou mot de passe incorrect" });
    }
  });
});

/**
 * GET - Get a user
 */
router.get("/:token", (req: Request<{token: string}, any, {}>, res: Response) => {
  const token = req.params.token;

  if (!token) {
    res.json({ result: false, error: "missing token" });
    return;
  }

  User.findOne({ token }).then(userDoc => {
    if (userDoc === null) {
      res.json({ result: false, error: 'User not found' });
      return;
    } else {
      const user: PublicUser = {
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        email: userDoc.email,
        username: userDoc.username,
      } 
      res.json({ result: true, user });
    }
  });
});

/**
 * PUT - Update a user
 */
router.put("/user", (req: Request<{}, any, UserType>, res: Response) => {
  const {token, firstName, lastName, username, email, password} = req.body;

  if (!token) {
    res.json({ result: false, error: "missing token" });
    return;
  }

  const updatedUser: UserUpdatePayload = {
    firstName: firstName && firstName.trim(),
    lastName: lastName && lastName.trim(),
    username: username && username.trim(),
    email: email && email.trim(),
    password: password && bcrypt.hashSync(password.trim(), 10)
  }

  if (!Object.values(updatedUser).some(val => val)) {
    res.json({ result: false, error: "No fields to update" });
    return;
  }

  User.findOneAndUpdate({ token: token }, updatedUser, { new: true })
    .then((userDoc) => {
      if (!userDoc) {
        return res.json({ result: false, error: "User not found" });
      }

      const user: PublicUser = {
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        username: userDoc.username,
        email: userDoc.email,
      } 

      res.json({ result: true, user });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

/**
 * DELETE - Delete a user
 */
router.delete("/",  async(req: Request<{}, any, {token: string}>, res: Response)  => {
  if (!checkBody(req.body, ['token'])) {
    return res.json({ result: false, error: 'Missing or empty fields' });
  }

  const user = await User.findOne({ token: req.body.token });
  if (!user) {
    return res.json({ result: false, error: 'User not found' });
  }

  // 1. Find all the users' audits
  const audits = await Audit.find({ user: user._id }, '_id');
  const auditIds = audits.map(a => a._id);

  // 2. Delete all the tests' audits
  await Test.deleteMany({ audit: { $in: auditIds } });

  // 3. Delete audits
  await Audit.deleteMany({ user: user._id });

  // 4. Delete user
  User.deleteOne({ _id: user._id }).then(() => {
    res.json({ result: true, message: 'Deleted user' });
  });
});

export { router };
