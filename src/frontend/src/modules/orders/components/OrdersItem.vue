<template>
  <div class="sheet order">
    <div class="order__wrapper">
      <div class="order__number">
        <b>Заказ #{{ order.id }}</b>
      </div>

      <div class="order__sum">
        <span>Сумма заказа: {{ totalPriceOrder }} ₽</span>
      </div>

      <div class="order__button">
        <button
          type="button"
          class="button button--border"
          @click="deleteOrderMethod(order)"
          data-test="delete"
        >
          Удалить
        </button>
      </div>
      <div class="order__button">
        <button
          type="button"
          class="button"
          @click="repeatPizzaMethod()"
          data-test="repeat"
        >
          Повторить
        </button>
      </div>
    </div>

    <ul class="order__list" v-if="order.orderPizzas">
      <li
        is="OrdersPizzaItem"
        class="order__item"
        v-for="pizza in order.orderPizzas"
        :key="pizza.id"
        :pizza="pizza"
      />
    </ul>

    <ul class="order__additional" v-if="order.orderMisc">
      <li
        is="OrdersAdditionalItem"
        v-for="misc in order.orderMisc"
        :key="misc.id"
        :misc-item="misc"
      />
    </ul>

    <p class="order__address" v-if="order.orderAddress" key="order-address">
      {{ orderAddressText }}
    </p>
    <p class="order__address" v-else key="order-address">
      Адрес был удален или не указан
    </p>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import OrdersPizzaItem from "./OrdersPizzaItem.vue";
import OrdersAdditionalItem from "./OrdersAdditionalItem.vue";

export default {
  name: "OrdersItem",
  components: {
    OrdersAdditionalItem,
    OrdersPizzaItem,
  },
  props: {
    order: {
      type: Object,
    },
  },
  computed: {
    ...mapState("Orders", ["orders"]),

    orderAddressText() {
      let str = `Адрес доставки: `;
      let ord = this.orders.filter((order) => {
        return order.id === this.order.id;
      });
      if (ord[0].orderAddress.name) {
        str += ord[0].orderAddress.name;
      } else if (ord[0].orderAddress.name === null) {
        str += `${ord[0].orderAddress.street}, д.${ord[0].orderAddress.building}, кв.${ord[0].orderAddress.flat}`;
      } else if (!ord[0].orderAddress) {
        str = "Адрес был удален или не указан";
      }
      return str;
    },

    totalPriceOrder() {
      let sum = 0;
      if (
        this.order.orderPizzas !== "underfined" &&
        this.order.orderPizzas.length
      ) {
        this.order.orderPizzas.forEach((pizza) => {
          sum += pizza.totalPricePizza * pizza.quantity;
        });
      }
      if (
        this.order.orderMisc !== "underfined" &&
        this.order.orderMisc.length
      ) {
        this.order.orderMisc.forEach((misc) => {
          sum += misc.price * misc.quantity;
        });
      }
      return sum;
    },
  },
  methods: {
    ...mapActions("Orders", ["deleteOrder"]),

    ...mapActions("Cart", ["repeatPizza"]),

    deleteOrderMethod(order) {
      this.deleteOrder(order);
    },

    repeatPizzaMethod() {
      this.repeatPizza(this.order);
      this.$router.push({ name: "Cart" });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/mixins/mixins.scss";
@import "~@/assets/scss/blocks/order.scss";
@import "~@/assets/scss/blocks/button.scss";
</style>
