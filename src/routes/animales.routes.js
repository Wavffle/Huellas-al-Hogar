import { Router } from "express";
import {crearAnimal,getAnimalPorId,getAnimales,actualizarAnimal,eliminarAnimal} from "../controllers/animales.controller.js"; 
//post para postear el animal, o sea uno nuevo en pag
//get para encontrar el animal
//patch para parchear, o sea cambiar unas 2 o 3 cosas del animal
//eliminar elimina ps
const router = Router();

router.get("/", getAnimales);
router.post("/", crearAnimal);
router.get("/:id", getAnimalPorId);
router.patch("/:id", actualizarAnimal);
router.delete("/:id", eliminarAnimal);
export default router;