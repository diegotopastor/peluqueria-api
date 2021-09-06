const express = require("express");
const db = require("../config/db");
const authtoken = require("../config/authtoken");
const router = express.Router();

	// Añadimos una nueva compañía
		router.post('/add', async (req, res)=>{
			
			if(!req.body?.legal_name || !req.body?.legal_CIF){
				return res.json({status: false, error:"Faltan campos por rellenar"});
			}
		
			const result = await db("companies").insert({
				legal_name: req.body.legal_name,
				legal_CIF: req.body.legal_CIF
			});
		
			res.json({status: true,	data: result[0]});

		});

	// Obtenemos una compañía en concreto
		router.get('/get/:id', async (req, res)=>{
			
			const result = await db.select("*").from("companies").where("ID", req.params.id);

			if(result.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			return res.json({ status: true, data: result[0] });

		});

	// Obtenemos un listado de todas las compañías
		router.get('/get_list', async (req, res)=>{

			const result = await db.select("*").from("companies");

			if(result.length == 0){
				return res.json({ status: false, error: "No existe registros todavía" });
			}

			return res.json({ status: true, data: result });

		});

	// Obtenemos un listado de las compañías según su tipo
		router.get('/get_list_type/:type?', async (req, res)=>{

			if(!req.params?.type){

				const result = await db.select("*").from("companies")
				return res.json({ status: true, data: result });

			}
			
			const result = await db.select("*").from("companies").where("type", req.params.type);
			return res.json({ status: true, data: result });

		});

	// Editamos una compañía existente
		router.post('/edit/:id', async (req, res)=>{
			
			var tochange = {};

			if(req.body?.legal_name){ tochange.legal_name = req.body.legal_name; }
			if(req.body?.legal_CIF){ tochange.legal_CIF = req.body.legal_CIF; }
			if(req.body?.type){ tochange.type = req.body.type; }

			const result = await db('companies')
								.update(tochange)
								.where('ID', req.params.id);

			res.json({status: true, data: "Modificado correctamente"});

		});

	// Eliminamos una compañía
		router.post('/delete/:id', async (req, res)=>{
			
			const result = await db("companies").where("ID",req.params.id).delete();

			res.json({status: true});

		});

	// Buscamos una compañía
		router.get('/search', async (req, res)=>{
			
			const result = await db("companies").where("legal_name","like", `%${req.body.legal_name}%`);

			res.json({status: true, data: result});

		});

	module.exports = router;