<template>
    <div class="container">
      <h2>Historial de Movimientos</h2>
  
      <div v-if="movements.length === 0" class="no-movements">
        <p>No tienes movimientos registrados.</p>
      </div>
  
      <!-- Mostrar el análisis de inversiones -->
      <div class="investment-analysis">
        <h3>Análisis de Inversiones</h3>
        <table>
          <thead>
            <tr>
              <th>Criptomoneda</th>
              <th>Resultado (ARS)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(result, crypto) in investmentAnalysis" :key="crypto">
              <td>{{ crypto.toUpperCase() }}</td>
              <td :class="{'positive': result >= 0, 'negative': result < 0}">
                ${{ result.toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Mostrar el dinero total -->
      <div v-if="totalMoney !== null" class="total-money">
        <p><strong>Total en ARS:</strong> {{ totalMoney }} ARS</p>
      </div>
  
      <table v-if="movements.length > 0">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Acción</th>
            <th>Criptomoneda</th>
            <th>Cantidad</th>
            <th>Pago (ARS)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movement in movements" :key="movement._id">
            <td>{{ formatDate(movement.datetime) }}</td>
            <td>{{ movement.action === 'purchase' ? 'Compra' : 'Venta' }}</td>
            <td>{{ movement.crypto_code.toUpperCase() }}</td>
            <td>{{ movement.crypto_amount }}</td>
            <td>{{ movement.money }} ARS</td>
            <td>
              <button @click="viewMovement(movement._id)">Ver</button>
              <button @click="editMovement(movement._id)">Editar</button>
              <button @click="deleteMovement(movement._id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  // Importa el cliente de la API
  import apiClient from "../api/apiClient";
  
  export default {
    name: "VerCuenta",
    data() {
      return {
        movements: [],
        userId: this.$root.userId, // Obtener el ID del usuario desde la aplicación principal
        investmentAnalysis: {}, // Almacenará los resultados de las inversiones
      };
    },
    computed: {
      totalMoney() {
        if (this.movements.length === 0) return null;
        return this.movements.reduce((total, movement) => {
          if (movement.action === 'purchase') {
            return total - parseFloat(movement.money); // Resta si es una compra
          } else if (movement.action === 'sale') {
            return total + parseFloat(movement.money); // Suma si es una venta
          }
          return total;
        }, 0).toFixed(2); // Devolvemos el total con dos decimales
      }
    },
    mounted() {
      this.fetchMovements();
    },
    methods: {
      async fetchMovements() {
        try {
          const response = await apiClient.get(`transactions?q={"user_id":"${this.userId}"}`);
          this.movements = response.data;
          this.calculateInvestmentResults();
        } catch (error) {
          console.error("Error al obtener los movimientos:", error);
        }
      },
  
      async calculateInvestmentResults() {
        let investmentResults = {};
  
        // Filtramos por criptomonedas
        const cryptos = Array.from(new Set(this.movements.map(m => m.crypto_code)));
  
        for (const crypto of cryptos) {
          // Obtenemos las transacciones de compra y venta para la criptomoneda actual
          const purchases = this.movements.filter(m => m.crypto_code === crypto && m.action === 'purchase');
          const sales = this.movements.filter(m => m.crypto_code === crypto && m.action === 'sale');
  
          let totalPurchaseAmount = 0;
          let totalPurchaseMoney = 0;
          purchases.forEach(purchase => {
            totalPurchaseAmount += parseFloat(purchase.crypto_amount);
            totalPurchaseMoney += parseFloat(purchase.money);
          });
  
          // Obtener el precio actual de la criptomoneda
          const currentPrice = await this.getCurrentCryptoPrice(crypto);
  
          // Calcular el valor actual de las compras
          const currentValue = currentPrice * totalPurchaseAmount;
          const result = currentValue - totalPurchaseMoney;
          
          investmentResults[crypto] = result;
        }
  
        this.investmentAnalysis = investmentResults;
      },
  
      async getCurrentCryptoPrice(crypto) {
        try {
          const response = await fetch(`https://criptoya.com/api/binance/${crypto}/ARS/0.1`);
          const data = await response.json();
          return data.bid; // Precio de compra (Bid)
        } catch (error) {
          console.error("Error al obtener el precio actual de la criptomoneda:", error);
          return 0; // Retornamos 0 en caso de error
        }
      },
  
      async viewMovement(id) {
        try {
          const response = await apiClient.get(`transactions/${id}`);
          alert(
            `Detalles de la transacción:\n\nCriptomoneda: ${response.data.crypto_code.toUpperCase()}\n` +
            `Cantidad: ${response.data.crypto_amount}\n` +
            `Pago: ${response.data.money} ARS\n` +
            `Fecha: ${this.formatDate(response.data.datetime)}`
          );
        } catch (error) {
          console.error("Error al obtener los detalles del movimiento:", error);
        }
      },
  
      async editMovement(id) {
        try {
          const response = await apiClient.get(`transactions/${id}`);
          this.movementToEdit = response.data; // Almacenar el movimiento en el formulario de edición
        } catch (error) {
          console.error("Error al obtener el movimiento para editar:", error);
        }
      },
  
      async saveEditedMovement() {
        if (this.movementToEdit) {
          try {
            const updatedMovement = {
              money: this.movementToEdit.money, // Aquí debes obtener los valores actualizados de tu formulario
            };
            await apiClient.patch(`transactions/${this.movementToEdit._id}`, updatedMovement);
            alert("Movimiento actualizado con éxito.");
            this.fetchMovements(); // Vuelve a cargar los movimientos
          } catch (error) {
            console.error("Error al actualizar el movimiento:", error);
          }
        }
      },
  
      async deleteMovement(id) {
        const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este movimiento?");
        if (confirmDelete) {
          try {
            // Usamos el apiClient para eliminar el movimiento
            await apiClient.delete(`transactions/${id}`);
            this.movements = this.movements.filter((movement) => movement._id !== id);
            alert("Movimiento eliminado exitosamente.");
          } catch (error) {
            console.error("Error al eliminar el movimiento:", error);
          }
        }
      },
  
      formatDate(datetime) {
        const date = new Date(datetime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      },
    }
  };
  </script>
  <style scoped>
  .positive {
  color: green;
}
.negative {
  color: red;
}
  .container {
    padding: 20px;
  }
  
  h2 {
    margin-bottom: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
  }
  
  th {
    background-color: #2c3e50;
  }
  
  button {
    padding: 5px 10px;
    margin-right: 10px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  button:last-child {
    background-color: #f44336;
  }
  
  button:last-child:hover {
    background-color: #e53935;
  }
  
  .no-movements {
    text-align: center;
    font-size: 1.2em;
  }
  </style>
  