const { onRequest } = require("firebase-functions/v2/https");

const mercadopago = require("mercadopago");

/* =========================================
CONFIGURAR MERCADO PAGO
========================================= */
mercadopago.configure({

access_token:
"APP_USR-5821853689836653-050223-fa3d6fc76d90e75e3053cda79367d267-3373866680"

});

/* =========================================
CREAR PREFERENCIA
========================================= */
exports.crearPreferencia = onRequest(async(req,res)=>{

/* =========================================
CORS MANUAL
========================================= */
res.set("Access-Control-Allow-Origin", "*");

res.set(
"Access-Control-Allow-Methods",
"GET, POST, OPTIONS"
);

res.set(
"Access-Control-Allow-Headers",
"Content-Type"
);

/* PREFLIGHT */
if(req.method === "OPTIONS"){

res.status(204).send("");
return;

}

try{

const respuesta =
await mercadopago.preferences.create({

items:[
{
title:"Anticipo cita belleza",
quantity:1,
currency_id:"COP",
unit_price:Number(req.body.total)
}
],

back_urls:{

success:
`https://katherin2024.github.io/PWA-BELLEZA/mis-citas.html?estado=success&citaId=${req.body.citaId}`,

failure:
"https://katherin2024.github.io/PWA-BELLEZA/mis-citas.html?estado=failure",

pending:
"https://katherin2024.github.io/PWA-BELLEZA/mis-citas.html?estado=pending"

},

auto_return:"approved"

});

res.status(200).json({
id: respuesta.body.id
});

}catch(error){

console.log(error);

res.status(500).json({
error:error.message
});

}

});