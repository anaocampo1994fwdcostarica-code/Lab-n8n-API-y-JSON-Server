const { Pedido, ZonaCobertura } = require("./clases");

const zona = new ZonaCobertura();

const ubicacionCR = { status: "success", countryCode: "CR", regionName: "San José" };
const ubicacionUSA = { status: "success", countryCode: "US", regionName: "Virginia" };

console.log("1)", zona.evaluar(new Pedido({ id: 1, cliente: "María", total: 32000 }), ubicacionCR));
console.log("2)", zona.evaluar(new Pedido({ id: 2, cliente: "Luis", total: 75000 }), ubicacionCR));
console.log("3)", zona.evaluar(new Pedido({ id: 3, cliente: "", total: 15000 }), ubicacionCR));
console.log("4)", zona.evaluar(new Pedido({ id: 5, cliente: "Pedro", total: 20000 }), ubicacionUSA));