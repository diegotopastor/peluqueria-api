const express = require("express");
const authtoken = require("../config/authtoken");
const db = require("../config/db");
const router = express.Router();

	// Añadimos la cita
		router.post('/add', [authtoken], async (req, res)=>{
			
			if(!req.body?.date_hour || !req.body?.duration){
				return res.json({status: false, error:"Faltan campos por rellenar"});
			}			
		
			const result = await db("dates").insert({
				ID_user: res.info.ID, //req.body.ID_user,
				ID_customer: req.body.ID_customer,
				date_hour: req.body.date_hour,
				duration: req.body.duration
			});
		
			res.json({status: true,	data: result[0]});

		});

	// Obtenemos una cita concreta por su id 
		router.get('/get/:id', [authtoken], async (req, res)=>{
			
			const result = await db.select("dates.id", "users.name as empleado", "customers.name as cliente", "customers.ID_company as company", "dates.date_hour", "dates.duration")
									.from("dates")
									.leftJoin('users', 'dates.ID_user', 'users.ID')
									.leftJoin('customers', 'dates.ID_customer', 'customers.ID')
									.where('dates.id', req.params.id)
									.where('customers.ID_company', res.info.ID_company);
									//.where({ID: req.params.id, company: res.info.ID_company });

			if(result.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			return res.json({ status: true, data: result[0] });

		});

	// Obtenemos el listado completo de citas
		router.get('/get_list', [authtoken], async (req, res)=>{

			const result = await db.select("dates.id", "users.name as empleado", "customers.name as cliente", "customers.ID_company as company", "dates.date_hour", "dates.duration")
									.from("dates")
									.leftJoin('users', 'dates.ID_user', 'users.ID')
									.leftJoin('customers', 'dates.ID_customer', 'customers.ID')
									.where('customers.ID_company', res.info.ID_company);

			if(result.length == 0){
				return res.json({ status: false, error: "No existe registros todavía" });
			}

			return res.json({ status: true, data: result });
			
		});

	// Mostramos el listado de citas que tiene el usuario(empleado)
		router.get('/get_list_by_employee/:ID_user', [authtoken], async (req, res)=>{

			const result = await db.select("dates.id", "users.name as empleado", "customers.name as cliente",  "dates.date_hour", "dates.duration")
									.from("dates")
									.leftJoin('users', 'dates.ID_user', 'users.ID')
									.leftJoin('customers', 'dates.ID_customer', 'customers.ID')
									.where("dates.ID_user", req.params.ID_user)
									.where("users.ID_company", res.info.ID_company);
									//.andwhere("users.ID_company", res.info.ID_company);

			if(result.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			return res.json({ status: true, data: result });
			
		});

	// Mostramos el listado de citas que tiene el cliente
		router.get('/get_list_by_customer/:ID_customer', [authtoken], async (req, res)=>{

			const result = await db.select("dates.id", "users.name as empleado", "customers.name as cliente",  "dates.date_hour", "dates.duration")
									.from("dates")
									.leftJoin('users', 'dates.ID_user', 'users.ID')
									.leftJoin('customers', 'dates.ID_customer', 'customers.ID')
									.where("dates.ID_customer", req.params.ID_customer)
									.where("customers.ID_company", res.info.ID_company);

			if(result.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			return res.json({ status: true, data: result });
			
		});

	// Mostramos el listado de citas que hay en un dia concreto u hora
		router.get('/get_list/:date_hour', [authtoken], async (req, res)=>{

			const result = await db.select("dates.id", "users.name as empleado", "customers.name as cliente",  "dates.date_hour", "dates.duration")
									.from("dates")
									.leftJoin('users', 'dates.ID_user', 'users.ID')
									.leftJoin('customers', 'dates.ID_customer', 'customers.ID')
									.where("dates.date_hour", req.params.date_hour)
									.where("users.ID_company", res.info.ID_company);

			if(result.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			return res.json({ status: true, data: result });
			
		});

	// Mostramos el listado de citas que hay entre dos fechas
		router.get('/get_list/:date_since/:date_to', [authtoken], async (req, res)=>{

			const result = await db.select("dates.id", "users.name as empleado", "customers.name as cliente",  "dates.date_hour", "dates.duration")
									.from("dates")
									.leftJoin('users', 'dates.ID_user', 'users.ID')
									.leftJoin('customers', 'dates.ID_customer', 'customers.ID')
									.whereBetween('dates.date_hour', [req.params.date_since, req.params.date_to])
									.where("users.ID_company", res.info.ID_company);

			if(result.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			return res.json({ status: true, data: result });
			
		});

	// Editamos la cita
		router.post('/edit/:id', [authtoken], async (req, res)=>{

			const sql = await db.select("*")
								.from("customers")
								.leftJoin("dates", "customers.ID", "dates.ID_customer")
								.where("ID_user", req.params.id)
								.where("ID_company", res.info.ID_company);
								
			if (sql.length == 0){
				return res.json({status: false, error: "No puede editar esta cita" });
			}

			var tochange = {};

			if(req.body?.ID_user){ tochange.ID_user = req.body.ID_user; }
			if(req.body?.ID_customer){ tochange.ID_customer = req.body.ID_customer; }
			if(req.body?.date_hour){ tochange.date_hour = req.body.date_hour; }
			if(req.body?.duration){ tochange.duration = req.body.duration; }	

			const result = await db('dates')
								.update(tochange)
								.where('ID', req.params.id);

			res.json({status: true, data: "Modificado correctamente"});
			
		});

	// Eliminamos la cita
		router.post('/delete/:id', [authtoken],async (req, res)=>{

			const sql = await db.select("*")
								.from("customers")
								.leftJoin("dates", "customers.ID", "dates.ID_customer")
								.where("dates.ID", req.params.id)
								.where("ID_company", res.info.ID_company);
								
			if (sql.length == 0){
				return res.json({status: false});
			}

			const result = await db("dates").where("ID",req.params.id).delete();

			res.json({status: true});
			
		});

	module.exports = router;