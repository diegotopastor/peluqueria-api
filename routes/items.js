const express = require("express");
const authtoken = require("../config/authtoken");
const db = require("../config/db");
const router = express.Router();

	// Añadimos un nuevo producto o servicio
		router.post('/add', [authtoken], async (req, res)=>{

			if(!req.body?.name){
				return res.json({status: false, error:"Faltan campos por rellenar"});
			}
		
			const result = await db("items").insert({
				ID_company: res.info.ID_company,
				name: req.body.name,
				description: req.body.description,
				brands: req.body.brands,
				price: req.body.price,
				iva: req.body.iva,
				stock: req.body.stock,
				duration: req.body.duration,
				type: req.body.type
			});
		
			res.json({status: true,	data: result[0]});

		});	

	// Obtenemos un producto o servicio concreto
		router.get('/get/:id', [authtoken], async (req, res)=>{

			const result = await db.select("*").from("items").where({ID: req.params.id, ID_company: res.info.ID_company});

			if(result.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			return res.json({ status: true, data: result[0] });
		});

	// Obtenemos todos los productos o servicios
		router.get('/get_list', [authtoken], async (req, res)=>{
			
			const result = await db.select("*").from("items").where("ID_company", res.info.ID_company);

			if(result.length == 0){
				return res.json({ status: false, error: "No existe registros todavía" });
			}

			return res.json({ status: true, data: result });

		});

	// Listamos los productos o servicios por su tipo (product o service)
		router.get('/get_list_type/:type?', [authtoken], async (req, res)=>{			

			if(!req.params?.type){

				const result = await db.select("*").from("items").where("ID_company", res.info.ID_company);
				return res.json({ status: true, data: result });

			}
			
			const result = await db.select("*").from("items").where({type: req.params.type, ID_company: res.info.ID_company});
			return res.json({ status: true, data: result });

		});

	// Editamos un producto o servicio concreto
		router.post('/edit/:id', [authtoken], async (req, res)=>{
			
			// Comprobamos que el item pertenece a la compañia antes de editarlo
				const sql = await db.select("*").from("items")
									.where("ID", req.params.id)
									.where("ID_company", res.info.ID_company);

				if (sql.length == 0){
					return res.json({status: false, error: "No puedes editar este item" });
				}

			// Comprobamos que datos se van a editar y los actualizamos
				var tochange = {};

				if(req.body?.name){ tochange.name = req.body.name; }
				if(req.body?.description){ tochange.description = req.body.description; }
				if(req.body?.brands){ tochange.brands = req.body.brands; }
				if(req.body?.price){ tochange.price = req.body.price; }
				if(req.body?.iva){ tochange.iva = req.body.iva; }
				if(req.body?.stock){ tochange.stock = req.body.stock; }
				if(req.body?.duration){ tochange.duration = req.body.duration; }
				if(req.body?.type){ tochange.type = req.body.type; }			

				const result = await db('items')
									.update(tochange)
									.where({ID: req.params.id, ID_company: res.info.ID_company});

				res.json({status: true, data: "Modificado correctamente"});

		});

	// Eliminamos un producto o servicio concreto
		router.post('/delete/:id', [authtoken], async (req, res)=>{

			// Comprobamos los permisos del usuario antes de eliminar
			if(res.info.rol == 'employee'){
				return res.json({ status: false, error: 'No tienes suficientes permisos.' });
			}
			
			const result = await db("items").where({ID: req.params.id, ID_company: res.info.ID_company}).delete();

			res.json({status: true});

		});

	// Buscamos un producto o servicio
		router.get('/search', [authtoken], async (req, res)=>{
						
			const result = await db("items")
								.where("ID_company", res.info.ID_company)
								.where("name","like", `%${req.body.name}%`);

			res.json({status: true, data: result});

		});

	module.exports = router;