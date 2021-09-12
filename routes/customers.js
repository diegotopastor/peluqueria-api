const express = require("express");
const db = require("../config/db");
const authtoken = require("../config/authtoken");
const router = express.Router();

	// Añadimos un nuevo cliente
		router.post('/add', [authtoken], async (req, res)=>{
			
			if(!req.body?.name || !req.body?.surname || !req.body?.email|| !req.body?.phone){
				return res.json({status: false, error:"Faltan campos por rellenar"});
			}
		
			const result = await db("customers").insert({
				ID_company: res.info.ID_company,
				name: req.body.name,
				surname: req.body.surname,
				email: req.body.email,
				phone: req.body.phone,
				notes: req.body.notes,
				customer_type: req.body.customer_type
			});
		
			res.json({status: true,	data: result[0]});

		});

	// Obtenemos un cliente en concreto
		router.get('/get/:id', [authtoken], async (req, res)=>{
			
			const result = await db.select("*").from("customers").where({ID: req.params.id, ID_company: res.info.ID_company});

			if(result.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			return res.json({ status: true, data: result[0] });

		});

	// Obtenemos un listado de todos los clientes
		router.get('/get_list', [authtoken], async (req, res)=>{

			const result = await db.select('ID', 'name', 'phone', 'email', db.raw('DATE_FORMAT(created, "%d-%m-%Y") as created')).from("customers").where("ID_company", res.info.ID_company);

			if(result.length == 0){
				return res.json({ status: false, error: "No existe registros todavía" });
			}

			return res.json({ status: true, data: result });

		});

	// Obtenemos un listado de los clientes según su tipo
		router.get('/get_list_type/:type?', [authtoken], async (req, res)=>{

			if(!req.params?.type){

				const result = await db.select("*").from("customers").where("ID_company", res.info.ID_company);
				return res.json({ status: true, data: result });

			}
			
			const result = await db.select("*").from("customers").where({customer_type: req.params.type, ID_company: res.info.ID_company});
			return res.json({ status: true, data: result });

		});

	// Editamos un cliente existente
		router.post('/edit/:id', [authtoken], async (req, res)=>{

			// Comprobamos que el cliente pertenece a la compañia antes de editarlo
				const sql = await db.select("*").from("customers")
									.where("ID", req.params.id)
									.where("ID_company", res.info.ID_company);
				
				if (sql.length == 0){
					return res.json({status: false, error: "No puedes editar este cliente" });
				}

			// Comprobamos que datos se van a editar y los actualizamos				
				var tochange = {};

				if(req.body?.name){ tochange.name = req.body.name; }
				if(req.body?.surname){ tochange.surname = req.body.surname; }
				if(req.body?.email){ tochange.email = req.body.email; }
				if(req.body?.phone){ tochange.phone = req.body.phone; }
				if(req.body?.content_type){ tochange.content_type = req.body.content_type; }
				if(req.body?.notes){ tochange.notes = req.body.notes; }

				const result = await db('customers')
									.update(tochange)
									.where({ID: req.params.id, ID_company: res.info.ID_company});

				res.json({status: true, data: "Modificado correctamente"});

		});

	// Eliminamos un cliente
		router.post('/delete/:id', [authtoken], async (req, res)=>{

			// Comprobamos los permisos del usuario antes de eliminar
				if(res.info.rol == 'employee'){
					return res.json({ status: false, error: 'No tienes suficientes permisos.' });
				}
				
				const result = await db("customers").where({ID: req.params.id, ID_company: res.info.ID_company}).delete();

				res.json({status: true});

		});

	// Buscamos un cliente
		router.get('/search', [authtoken], async (req, res)=>{
			
			const result = await db("customers")
								.where("ID_company", res.info.ID_company)
								.where("name","like", `%${req.body.name}%`);

			res.json({status: true, data: result});

		});

	module.exports = router;