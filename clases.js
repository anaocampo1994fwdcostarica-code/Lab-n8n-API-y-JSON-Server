class Pedido {
  constructor({ id, cliente, total }) {
    this.id = id;
    this.cliente = cliente;
    this.total = total;
  }

  estaCompleto() {
    return Boolean(this.cliente) && this.total > 0;
  }

  tieneEnvioGratis() {
    return this.total >= 50000;
  }
}

class ZonaCobertura {
  constructor() {
    this.zonasPrincipales = ["san jose", "heredia", "alajuela", "cartago"];
    this.zonasExtendidas = ["guanacaste", "puntarenas", "limon"];
  }

  limpiar(texto) {
    return (texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  estaEnCobertura(codigoPais) {
    return codigoPais === "CR";
  }

  calcularCostoEnvio(region, pedido) {
    const r = this.limpiar(region);
    if (pedido.tieneEnvioGratis()) return 0;
    if (this.zonasPrincipales.some((z) => r.includes(z))) return 2500;
    if (this.zonasExtendidas.some((z) => r.includes(z))) return 4500;
    return null;
  }

  evaluar(pedido, ubicacion) {
    if (!pedido.estaCompleto()) {
      return { estado: "rechazado", motivo: "Datos incompletos" };
    }
    if (ubicacion.status !== "success") {
      return { estado: "rechazado", motivo: "No se pudo verificar la ubicación" };
    }
    if (!this.estaEnCobertura(ubicacion.countryCode)) {
      return { estado: "rechazado", motivo: "Fuera de zona de cobertura" };
    }
    const costo = this.calcularCostoEnvio(ubicacion.regionName, pedido);
    if (costo === null) {
      return { estado: "rechazado", motivo: "Zona no reconocida" };
    }
    return { estado: "aceptado", motivo: "", costoEnvio: costo };
  }
}

module.exports = { Pedido, ZonaCobertura };