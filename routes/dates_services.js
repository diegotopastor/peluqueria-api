const express = require("express");
const authtoken = require("../config/authtoken");
const db = require("../config/db");
const router = express.Router();

	// Añadimos la linea de servicios
		router.post('/add', [authtoken], async (req, res)=>{

			if(!req.body?.ID_date || !req.body?.ID_items){
				return res.json({status: false, error:"Faltan campos por rellenar"});
			}

			const sql = await db.select("customers.name", "dates.date_hour", "dates.duration")
								.from("customers")
								.leftJoin("dates", "customers.ID", "dates.ID_customer")
								.where("customers.ID_company", res.info.ID_company)
								.where("dates.ID", req.body.ID_date);

			if(sql.length == 0) {
				return res.json({ status: false, error: "No puedes agregar información a esta cita"});
			}
			
			const result = await db("date_services").insert({
				ID_date: req.body.ID_date,
				ID_items: req.body.ID_items,
				description: req.body.description
			});
		
			res.json({status: true,	data: result[0]});
			
		});	

	// Obtenemos el listado de todas las líneas de servicios de una cita
		router.get('/get_list_by_date/:id', [authtoken], async (req, res)=>{
			

			const result = await db.select("dates.date_hour", "dates.duration", "items.*", "date_services.description as desc_servicio")
									.from("date_services")
									.leftJoin('dates', 'date_services.ID_date', 'dates.ID')
									.leftJoin('items', 'date_services.ID_items', 'items.ID')
									.where("date_services.ID_date", req.params.id)
									.where("items.ID_company", res.info.ID_company);

			if(result.length == 0){
				return res.json({ status: false, error: "ID no encontrado" });
			}

			return res.json({ status: true, data: result });
		});

	// Eliminamos una línea de servicio
		router.post('/delete/:id', [authtoken], async (req, res)=>{

			const sql = await db.select("customers.name")
								.from("customers")
								.leftJoin("dates", "customers.ID", "dates.ID_customer")
								.leftJoin("date_services", "dates.ID", "date_services.ID_date")
								.where("customers.ID_company", res.info.ID_company)
								.where("date_services.ID", req.params.id);

			if(sql.length == 0) {
				return res.json({ status: false, error: "No puedes eliminar información a esta cita"});
			}

			const result = await db("date_services").where("ID",req.params.id).delete();

			res.json({status: true});
			
		});

	module.exports = router;