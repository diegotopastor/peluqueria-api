const express = require("express");
const sha1 = require("sha1");
const db = require("../config/db");
const authtoken = require("../config/authtoken");
const router = express.Router();
const salt = "EnUnLugarDeLaMancha"

	// Añadimos un nuevo usuario
		router.post('/add', async (req, res)=>{

			// console.log(typeof res.info);

			// Miramos que tengan datos
				if( !req.body?.name || !req.body?.email || !req.body?.password ){
					return res.json({status:false, error:"faltan datos"});
				}

			// 1º la petición a la DDBB
				const result = await db("users").insert({
					ID_company: 1,
					name: req.body.name,
					email: req.body.email,
					password: sha1(req.body.password),
					token: sha1(Math.random()+salt)
				});

			// 2º Le devolvemos el return
				res.json({status: true,	data: result[0]});
			
		});

	// Obtenemos un usuario en concreto
		router.get('/get/:id', [authtoken], async (req, res)=>{

			const result = await db.select("*").from("users").where({ID: req.params.id, ID_company: res.info.ID_company});

			if(result.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			return res.json({ status: true, data: result[0] });

		});

	// Obtenemos un listado de usuarios (empleados)
		router.get('/get_list', [authtoken], async (req, res)=>{

			const result = await db.select("*").from("users").where("ID_company", res.info.ID_company);

			if(result.length == 0){
				return res.json({ status: false, error: "No existe registros todavía" });
			}

			return res.json({ status: true, data: result });

		});

	// Editamos un usuario en concreto
		router.post('/edit/:id', [authtoken], async (req, res)=>{

			// Comprobamos que el usuario pertenece a la compañia antes de editarlo
				const sql = await db.select("*").from("users")
									.where("ID", req.params.id)
									.where("ID_company", res.info.ID_company);
									
				if (sql.length == 0){
					return res.json({status: false, error: "No puedes editar este usuario" });
				}

			// Comprobamos que datos se van a editar y los actualizamos	
				var tochange = {};

				if(req.body?.name){ tochange.name = req.body.name; }
				if(req.body?.email){ tochange.email = req.body.email; }
				if(req.body?.rol){ tochange.rol = req.body.rol; }
				if(req.body?.password){ tochange.password = req.body.password; }

				const result = await db('users')
					//.update('name', req.body.name)
					.update(tochange)
					.where({ID: req.params.id, ID_company: res.info.ID_company});

				res.json({
					status: true
				});

		});

	// Eliminamos a un usuario en concreto
		router.post('/delete/:id', [authtoken], async (req, res)=>{

			// Comprobamos los permisos del usuario antes de eliminar
				if(res.info.rol == 'employee'){
					return res.json({ status: false, error: 'No tienes suficientes permisos.' });
				}

				const result = await db("users").where({ID: req.params.id, ID_company: res.info.ID_company}).delete();

				res.json({ status: true });

		});

	// Nos logueamos en la app comprobando que existe el usuario
		router.post('/login/', async (req, res)=>{

			if(!req.body?.email || !req.body?.password){
				return res.json({status:false, error:"faltan datos"});
			}

			const result = await db.select(["ID", "name", "token"]).from("users")
									.where("email", req.body.email)
									.where("password", sha1(req.body.password));

			if(result.length == 0){
				return res.json({ status: false, error: "usuario no válido" });
			}

			return res.json({ status: true, data: result[0] });

		});

	// Se edita la password de un usuario en concreto
		router.post('/edit_pass/:id', [authtoken], async (req, res)=>{
			
			if(!req.body?.current_pass || !req.body?.password){
				return res.json({status:false, error:"faltan datos"});
			}

			const sql = await db.select("*").from("users")
									.where({
										ID: req.params.id, 
										ID_company: res.info.ID_company, 
										password: sha1(req.body.current_pass)
									});
		

			if(sql.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			const result = await db('users').update("password", sha1(req.body.password)).where('ID', req.params.id);

			res.json({status: true, message: "contraseña actualizada correctamente"});			

		});

	// Recuperación de password, comprobando el mail y enviando una nueva...
		router.post('/recovery_pass/', async (req, res)=>{
			
			if(!req.body?.email){
				return res.json({status:false, error:"faltan datos"});
			}

			const result = await db.select("*").from("users").where("email", req.body.email);							

			if(result.length == 0){
				return res.json({ status: false, error: "revisa el email introducido" });
			}

			return res.json({ status: true, message: "Enviar email con nueva clave generada..." });

		});

	module.exports = router;