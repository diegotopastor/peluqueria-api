const db = require("./db");

const authtoken = async (req, res, next) => {

		// console.log(req.headers.token);
		// console.log(req.body);

	// COMPROBACIÓN EXISTE TOKEN
		if( req.headers.token != undefined){
			var token = req.headers.token;
		}else{
			return res.status(401).json({ status: false, error: "No has mandado el token" });
		}

	// COMPROBACIÓN TOKEN VÁLIDO
		const result = await db
			.select(["users.ID","users.email","users.name", "users.rol", "companies.ID as ID_company"])
			.from("users")
			.leftJoin("companies","companies.ID","users.ID_company")
			.where("token", token);

		if(result.length == 0){
			return res.status(401).json({ status: false, error: "Token caducado" });
		}

		res.info = result[0];

		console.log(result);
		next();

}

module.exports = authtoken;