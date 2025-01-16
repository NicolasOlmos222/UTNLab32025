<template>
    <div class="container">
      <!-- Mitad izquierda: Información del Exchange -->
      <div class="left-panel">
        <ExchangeInfo />
      </div>
  
      <!-- Mitad derecha: Formulario para realizar la venta -->
      <div class="right-panel">
        <h2>Realizar Venta</h2>
        <form @submit.prevent="handleSale">
          <label for="money"><strong>Monto en ARS:</strong></label>
          <input
            type="number"
            id="money"
            v-model="saleMoney"
            min="0"
            step="0.01"
            required
          />
  
          <label for="currency"><strong>Moneda:</strong></label>
          <select id="currency" v-model="selectedCurrency">
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
          </select>
  
          <div v-if="cryptoPrice">
            <p><strong>Precio de la criptomoneda:</strong> {{ cryptoPrice }} ARS</p>
            <p><strong>Cantidad que puedes vender:</strong> {{ sellableAmount }} {{ selectedCurrency }}</p>
          </div>
  
          <button type="submit">Vender</button>
        </form>
  
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import ExchangeInfo from "./exchange.vue";
  
  export default {
    name: "App",
    components: {
      ExchangeInfo,
    },
    data() {
      return {
        saleMoney: 0,
        selectedCurrency: "BTC",
        cryptoPrice: null,
        sellableAmount: 0,
        successMessage: null,
        userId: this.$root.userId, // Obtener el ID del usuario desde la aplicación principal
      };
    },
    watch: {
      saleMoney(newValue) {
        if (newValue > 0) {
          this.calculateSellableAmount();
        }
      },
      selectedCurrency() {
        this.fetchCryptoPrice();
      }
    },
    methods: {
      async fetchCryptoPrice() {
        try {
          const response = await axios.get(
            `https://criptoya.com/api/argenbtc/${this.selectedCurrency.toLowerCase()}/ars/1`
          );
          this.cryptoPrice = response.data.ask;
          this.calculateSellableAmount();
        } catch (error) {
          console.error('Error al obtener el precio de la criptomoneda:', error);
          this.cryptoPrice = null;
        }
      },
  
      calculateSellableAmount() {
        if (this.cryptoPrice && this.saleMoney > 0) {
          this.sellableAmount = (this.saleMoney / this.cryptoPrice).toFixed(6); // Limitar a 6 decimales
        }
      },
  
      async handleSale() {
        // Validar que el monto sea mayor a 0
        if (this.saleMoney <= 0 || this.sellableAmount <= 0) {
          this.successMessage = "El monto debe ser mayor a 0 y suficiente para vender la criptomoneda.";
          return;
        }
  
        // Obtener la fecha actual
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(
          now.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${now.getFullYear()} ${now
          .getHours()
          .toString()
          .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
        // Crear el objeto con los datos de la venta
        const saleData = {
          user_id: this.userId,
          action: "sale",
          crypto_code: this.selectedCurrency.toLowerCase(),
          crypto_amount: this.sellableAmount,
          money: this.saleMoney,
          datetime: formattedDate,
        };
  
        try {
          // Enviar la solicitud POST a la API
          const response = await axios.post(
            'https://laboratorio3-f36a.restdb.io/rest/transactions',
            saleData,
            {
              headers: {
                'x-apikey': '60eb09146661365596af552f',
              },
            }
          );
          this.successMessage = `¡Venta realizada exitosamente! Cantidad: ${this.sellableAmount} ${this.selectedCurrency}`;
          console.log('Venta registrada:', response.data);
  
          // Reiniciar el formulario después de la venta
          this.saleMoney = 0;
          this.sellableAmount = 0;
        } catch (error) {
          this.successMessage = "Error al registrar la venta.";
          console.error('Error:', error);
        }
      },
    },
    mounted() {
      this.fetchCryptoPrice(); // Al montar el componente, obtener el precio de la criptomoneda por defecto (BTC)
    },
  };
  </script>
  
  <style scoped>
  h2 {
    color: #2c3e50;
  }
  p{
    color: #2c3e50;
  }
  .container {
    display: flex;
    height: 100vh; /* Ocupa toda la altura de la pantalla */
  }
  
  .left-panel,
  .right-panel {
    flex: 1; /* Ocupa la mitad del espacio */
    padding: 20px;
    overflow-y: auto; /* Permite desplazamiento si el contenido es largo */
  }
  
  .left-panel {
    background-color: #f5f5f5; /* Color de fondo opcional para diferenciación */
    border-right: 1px solid #ccc; /* Línea divisoria */
  }
  
  .right-panel {
    background-color: #ffffff; /* Color de fondo opcional */
  }
  
  form {
    display: flex;
    flex-direction: column;
  }
  
  label {
    margin: 10px 0 5px;
    color: #2c3e50;
  }
  
  input,
  select,
  button {
    margin-bottom: 15px;
    padding: 10px;
    font-size: 16px;
  }
  
  button {
    background-color: #2c3e50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #1a252f;
  }
  
  .success-message {
    color: green;
    font-weight: bold;
    margin-top: 10px;
  }
  </style>
  