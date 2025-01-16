<template>
    <div>
      <h2>Información del Exchange</h2>
      <p><strong>Fiat:</strong> ARS</p>
      <p><strong>Volumen:</strong> 0.1</p>
  
      <!-- Selector de moneda -->
      <label for="currency-select"><strong>Seleccione la moneda:</strong></label>
      <select id="currency-select" v-model="selectedCoin" @change="fetchData">
        <option value="BTC">BTC</option>
        <option value="ETH">ETH</option>
        <option value="USDT">USDT</option>
      </select>
  
      <!-- Muestra los datos de la API -->
      <div v-if="data">
        <p><strong>Moneda:</strong> {{ selectedCoin }}</p>
        <p><strong>Precio Ask:</strong> {{ data.ask }}</p>
        <p><strong>Total Ask:</strong> {{ data.totalAsk }}</p>
        <p><strong>Precio Bid:</strong> {{ data.bid }}</p>
        <p><strong>Total Bid:</strong> {{ data.totalBid }}</p>
        <p><strong>Última actualización:</strong> {{ formattedTime }}</p>
      </div>
  
      <div v-else>
        <p>Cargando datos...</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ExchangeInfo",
    data() {
      return {
        selectedCoin: "BTC", // Moneda seleccionada
        data: null, // Datos obtenidos de la API
      };
    },
    computed: {
      formattedTime() {
        if (!this.data) return "";
        const date = new Date(this.data.time * 1000); // Convierte el timestamp
        return date.toLocaleString(); // Formato legible para la fecha
      },
    },
    methods: {
      fetchData() {
        const url = `https://criptoya.com/api/binance/${this.selectedCoin}/ARS/0.1`;
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            this.data = data;
          })
          .catch((error) => {
            console.error("Error al obtener datos de la API:", error);
          });
      },
    },
    mounted() {
      this.fetchData(); // Carga inicial con la moneda predeterminada
    },
  };
  </script>
  
  <style scoped>
  h2 {
    color: #2c3e50;
  }
  p {
    margin: 5px 0;
    color: #2c3e50;
  }
  label {
    display: block;
    margin: 10px 0;
    font-weight: bold;
    color: #2c3e50;
  }
  select {
    margin-bottom: 20px;
    padding: 5px;
  }
  </style>
  