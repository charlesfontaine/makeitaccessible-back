import mongoose from "mongoose";
import config from "../config/config";

/**
 * Script pour vider les collections Sites, Audits et Tests
 */

// Appel des modèles topics et criterias
import Sites from "../models/sites.js";
import Audits from "../models/audits.js";
import Tests from "../models/tests.js";

//
const cleanBdd = async () => {
  try {
    // 0. Connection à la base de données
    // async/await ajouté car mongoose.connect est asynchrone et les actions qui
    // suivent sont appelées les unes après les autres (elles-même en asynchrone...)
    // donc on attend avant tout que la bdd réponde avant de faire quoique ce soit.
    await mongoose
      .connect(config.connectionString, { connectTimeoutMS: 2000 })
      .then(() => console.log("Database connected"))
      .catch((error) => console.error(error));

    // 1. Nettoyage des collections existantes
    await Sites.deleteMany();
    await Audits.deleteMany();
    await Tests.deleteMany();

    console.log("Collections dropped!");
  } catch (error) {
    console.error("Erreur when trying to drop collections :", error);
  } finally {
    // On se déconnecte de MongoDB
    await mongoose.disconnect();
  }
};

cleanBdd().then(() => {
  console.log("Collections have been cleaned!");
});
