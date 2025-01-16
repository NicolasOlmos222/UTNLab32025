<template>
  <div>
    <input v-model="id" type="text" placeholder="Ingresa tu ID alfanumérico">
    <button @click="iniciarSesion">Iniciar Sesión</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: "",
    };
  },
  methods: {
    iniciarSesion() {
      if (this.id) {
        this.$emit('sesionIniciada', this.id);
      } else {
        alert("Por favor, ingrese un ID válido.");
      }
    },
  },
};
</script>


<style scoped>
.login-container {
  width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
}
input {
  width: 98.5%;
  padding: 8px;
  margin: 10px 0;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #2c3e50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #1a252f;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
