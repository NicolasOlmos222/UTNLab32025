<template>
  <header>
    <h1>CRIPTO STORE</h1>
    <ul>
      <li v-if="!autenticado">
        <a @click="asignarComponente(sesion)">Iniciar Sesión</a>
      </li>
      <li v-else>
        <a @click="asignarComponente(cuenta)">Ver Cuenta</a>
      </li>
      <li v-if="autenticado">
        <a @click="asignarComponente(compra)">Comprar</a>
      </li>
      <li v-if="autenticado">
        <a @click="asignarComponente(venta)">Vender</a>
      </li>
    </ul>
  </header>
  <main>
    <div v-if="autenticado">
      <h4>Bienvenido {{ userId }}</h4>
    </div>
    <component :is="dataComponente" @sesionIniciada="handleSesionIniciada"></component>
  </main>
</template>

<script>
import comprar from "./components/comprar.vue";
import vender from "./components/vender.vue";
import verCuenta from "./components/verCuenta.vue";
import iniciarSesion from "./components/iniciarSesion.vue";

export default {
  name: "App",
  data() {
    return {
      sesion: iniciarSesion,
      cuenta: verCuenta,
      compra: comprar,
      venta: vender,
      dataComponente: null, 
      autenticado: false,
      userId: localStorage.getItem('userId') || null,
    };
  },
  components: {
    comprar,
    vender,
    verCuenta,
    iniciarSesion,
  },
  methods: {
    asignarComponente(componente) {
      this.dataComponente = componente;
    },
    handleSesionIniciada(id) {
      this.autenticado = true;
      this.userId = id; 
      localStorage.setItem('userId', id); 
      this.dataComponente = this.cuenta; },
  },
};
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px;
}

h1 {
  margin: 0;
}

h4 {
  margin: 0;
  margin-left: auto; /* Empuja el mensaje a la derecha */
  text-align: right; /* Alinea el texto a la derecha */
}

ul {
  display: flex;
  margin: 0;
  padding: 0;
}

li {
  margin-right: 15px;
  list-style: none;
}

li:last-child {
  margin-right: 0;
}

a {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
a:hover {
  color: blue;
}
</style>
