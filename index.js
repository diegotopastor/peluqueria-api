// CONFIG - Iniciamos express
	const cors = require("cors");
	const express = require("express");
	const app = express();
	const port = 3000;
	app.use(express.json()); // parsea el body de la petición
	app.use(cors()); // Nos permite hacer peticiones desde el navegador

// ROUTES
	const companies = require("./routes/companies");
	const users = require("./routes/users");
	const customers = require("./routes/customers");
	const items = require("./routes/items");
	const dates = require("./routes/dates");
	const dates_services = require("./routes/dates_services");

// Creando los endpoints
	app.use("/companies", companies);
	app.use("/users", users);
	app.use("/customers", customers);
	app.use("/items", items);
	app.use("/dates", dates);
	app.use("/dates_services", dates_services);	

// Le decimos que escuche
	app.listen(port, ()=>{
		// console.log("Funcionando en el puerto: "+port);
		console.log(`Funcionando en el puerto: ${port}`);
	});