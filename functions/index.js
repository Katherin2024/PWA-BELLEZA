const functions = require("firebase-functions");

const mercadopago = require("mercadopago");

mercadopago.configure({

access_token:
"APP_USR-5821853689836653-050223-fa3d6fc76d90e75e3053cda79367d267-3373866680"

});

exports.crearPreferencia =
functions.https.onRequest(async(req,res)=>{

try{

const preference = {

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
"https://katherin2024.github.io/PWA-BELLEZA/mis-citas.html",

failure:
"https://katherin2024.github.io/PWA-BELLEZA/agendar.html",

pending:
"https://katherin2024.github.io/PWA-BELLEZA/agendar.html"

},

auto_return:"approved"

};

const respuesta =
await mercadopago.preferences.create(preference);

res.json({
id: respuesta.body.id
});

}catch(error){

console.log(error);

res.status(500).send(error);

}

});