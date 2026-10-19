class Pedido {
  constructor(datos = {}) {
    const { id, cliente, total } = datos || {};
    this.id = id;
    this.cliente = cliente;
    this.total = total;
  }

  estaCompleto() {
    return (
      typeof this.cliente === "string" &&
      this.cliente.trim().length > 0 &&
      typeof this.total === "number" &&
      Number.isFinite(this.total) &&
      this.total > 0
    );
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
    const zonaPrincipal = this.zonasPrincipales.some((z) => r.includes(z));
    const zonaExtendida = this.zonasExtendidas.some((z) => r.includes(z));
    if (!zonaPrincipal && !zonaExtendida) return null;
    if (pedido.tieneEnvioGratis()) return 0;
    return zonaPrincipal ? 2500 : 4500;
  }

  evaluar(pedido, ubicacion) {
    if (
      !pedido ||
      typeof pedido.estaCompleto !== "function" ||
      !pedido.estaCompleto()
    ) {
      return { estado: "rechazado", motivo: "Datos incompletos" };
    }
    if (!ubicacion || !ubicacion.status) {
      return { estado: "rechazado", motivo: "Datos incompletos" };
    }
    if (ubicacion.status !== "success") {
      return { estado: "rechazado", motivo: "No se pudo verificar la ubicación" };
    }
    if (
      typeof ubicacion.countryCode !== "string" ||
      typeof ubicacion.regionName !== "string" ||
      !ubicacion.regionName.trim()
    ) {
      return { estado: "rechazado", motivo: "Datos incompletos" };
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