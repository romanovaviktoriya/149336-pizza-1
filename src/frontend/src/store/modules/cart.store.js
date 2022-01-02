import uniqueId from "lodash/uniqueId";
import cloneDeep from "lodash/cloneDeep";
import {
  SET_ENTITY,
  CREATE_PIZZA,
  REPEAT_PIZZA,
  UPDATE_PIZZA,
  UPDATE_TOTAL_PRICE_ORDER,
  RESET_PIZZAS,
  UPDATE_USER_ADDRESS,
  UPDATE_RECIPIENT,
  RESET_USER_ADDRESS,
  UPDATE_PHONE,
} from "@/store/mutation-types";

// const entity = "cart";
// const module = capitalize(entity);
// const namespace = { entity, module };

export default {
  namespaced: true,
  state: {
    phone: "",
    pizzas: [],
    misc: [],
    totalPriceOrder: 0,
    address: {
      street: "",
      house: "",
      apartment: "",
    },
    recipient: "myself",
  },
  getters: {
    pizzas: (state) => {
      return state.pizzas;
    },

    misc: (state) => {
      return state.misc;
    },

    address: (state) => {
      return state.address;
    },
  },
  mutations: {
    [CREATE_PIZZA]: (state, payload) => {
      const data = cloneDeep(payload.rootData.Builder.composition);
      let fillings = "";
      payload.rootData.Builder.composition.pizzaFilling.forEach((item) => {
        fillings += `${item.title}, `;
      });
      let pizza = {
        composition: data,
        id: uniqueId(),
        count: 1,
        title: payload.rootData.Builder.composition.namePizza,
        size:
          payload.rootData.Builder.composition.size.value === "normal"
            ? 32
            : payload.rootData.Builder.composition.size.value === "big"
            ? 45
            : 23,
        dough:
          payload.rootData.Builder.composition.dough.value === "large"
            ? "толстом"
            : "тонком",
        sauce:
          payload.rootData.Builder.composition.sauce.value === "tomato"
            ? "томатный"
            : "сливочный",
        fillings: fillings.slice(0, -2),
        price: payload.rootData.Builder.composition.totalPrice,
      };
      state.pizzas.push(pizza);
    },
    [REPEAT_PIZZA]: (state, payload) => {
      const data = cloneDeep(payload.data);

      data.orderPizzas.forEach((item) => {
        //class Pizza
        let myClass = "pizza--foundation--";
        switch (item.doughId) {
          case 1:
            myClass += "small";
            break;
          case 2:
            myClass += "big";
            break;
        }
        switch (item.sauceId) {
          case 1:
            myClass += "-tomato";
            break;
          case 2:
            myClass += "-creamy";
            break;
        }

        //dough
        let myDough = payload.rootData.Builder.doughs
          .filter((dough) => {
            return dough.id === item.doughId;
          })
          .map((item) => {
            let dough = {
              id: item.id,
              price: item.price,
              value: item.type,
            };
            return dough;
          });

        //ingr
        let myIngr = payload.rootData.Builder.ingredients.filter((ingr) => {
          item.ingredients.forEach((item) => {
            if (ingr.id === item.ingredientId) {
              ingr.count = item.quantity;
            }
          });
          return ingr;
        });

        //sauce
        let mySauce = payload.rootData.Builder.sauces
          .filter((sauce) => {
            return sauce.id === item.sauceId;
          })
          .map((item) => {
            let sauce = {
              id: item.id,
              price: item.price,
              value: item.value,
            };
            return sauce;
          });

        //size
        let mySize = payload.rootData.Builder.sizes
          .filter((size) => {
            return size.id === item.sizeId;
          })
          .map((item) => {
            let size = {
              id: item.id,
              multiplier: item.multiplier,
              value: item.size,
            };
            return size;
          });

        //filing
        let myFilling = myIngr
          .filter((ingr) => {
            return ingr.count > 0;
          })
          .map((item) => {
            let filling = {
              id: item.id,
              count: item.count,
              name: item.label,
              title: item.name.toLowerCase(),
            };
            return filling;
          });

        let fillings = "";
        myFilling.forEach((item) => {
          fillings += `${item.title}, `;
        });

        let myComposition = {
          id: item.id,
          classPizza: myClass,
          dough: myDough[0],
          ingr: myIngr,
          namePizza: item.name,
          pizzaFilling: myFilling,
          sauce: mySauce[0],
          size: mySize[0],
          totalPrice: item.totalPricePizza,
        };

        let pizza = {
          composition: myComposition,
          id: +uniqueId(),
          count: item.quantity,
          title: item.name,
          size:
            item.sizeMultiplier === 2
              ? 32
              : item.sizeMultiplier === 3
              ? 45
              : 23,
          dough: myDough.value === "large" ? "толстом" : "тонком",
          sauce: mySauce.value === "tomato" ? "томатный" : "сливочный",
          fillings: fillings.slice(0, -2),
          price: item.totalPricePizza,
        };
        state.pizzas.push(pizza);
      });

      //miscs
      if (data.orderMisc.length) {
        let myMiscs = payload.rootData.Cart.misc.map((item) => {
          let n = data.orderMisc
            .filter((misc) => {
              return item.id === misc.miscId;
            })
            .map((misc) => {
              let i = { ...item, count: misc.quantity };
              return i;
            });
          return n.length ? n[0] : item;
        });
        // state.misc.splice(0, state.misc.length);
        // state.misc.push(myMiscs);
        state.misc = myMiscs;
      }
    },
    [UPDATE_PIZZA]: (state, payload) => {
      payload.rootData.Builder.composition = payload.data.composition;
    },
    [UPDATE_TOTAL_PRICE_ORDER]: (state, payload) => {
      let pizzasPrice = 0,
        miscsPrice = 0;
      payload.rootData.Cart.pizzas
        .filter((pizza) => {
          return pizza.count > 0;
        })
        .forEach((pizza) => {
          pizzasPrice += pizza.count * pizza.price;
        });
      payload.rootData.Cart.misc
        .filter((misc) => {
          return misc.count > 0;
        })
        .forEach((misc) => {
          miscsPrice += misc.count * misc.price;
        });
      state.totalPriceOrder = pizzasPrice + miscsPrice;
    },
    [RESET_PIZZAS]: (state) => {
      state.misc.forEach((misc) => (misc.count = 0));
      state.pizzas = [];
      state.totalPriceOrder = 0;
    },

    [UPDATE_USER_ADDRESS]: (state, payload) => {
      if (payload.data.street) {
        state.address.street = payload.data.street;
      }
      if (payload.data.house) {
        state.address.house = payload.data.house;
      }
      if (payload.data.apartment) {
        state.address.apartment = payload.data.apartment;
      }
    },

    [RESET_USER_ADDRESS]: (state) => {
      state.address.street = "";
      state.address.house = "";
      state.address.apartment = "";
    },

    [UPDATE_RECIPIENT]: (state, payload) => {
      state.recipient = payload.data.recipient;
    },

    [UPDATE_PHONE]: (state, payload) => {
      state.phone = payload.data.phone;
    },
  },
  actions: {
    async query({ commit }) {
      const data = await this.$api.misc.query();
      commit(
        SET_ENTITY,
        {
          module: "Cart",
          entity: "misc",
          value: data,
        },
        { root: true }
      );
    },

    createPizza({ commit, rootState }) {
      commit(
        CREATE_PIZZA,
        {
          //data,
          rootData: rootState,
        },
        { root: false }
      );
    },

    repeatPizza({ commit, rootState }, data) {
      commit(
        REPEAT_PIZZA,
        {
          data,
          rootData: rootState,
        },
        { root: false }
      );
    },

    updatePizza({ commit, rootState }, data) {
      commit(
        UPDATE_PIZZA,
        {
          data,
          rootData: rootState,
        },
        { root: false }
      );
    },

    updateTotalPriceOrder({ commit, rootState }) {
      commit(
        UPDATE_TOTAL_PRICE_ORDER,
        {
          rootData: rootState,
        },
        { root: false }
      );
    },

    resetPizzas({ commit }) {
      commit(RESET_PIZZAS);
    },

    updateUserAddress({ commit, rootState }, data) {
      commit(
        UPDATE_USER_ADDRESS,
        {
          data,
          rootData: rootState,
        },
        { root: false }
      );
    },

    updateUserRecipient({ commit }, data) {
      commit(
        UPDATE_RECIPIENT,
        {
          data,
        },
        { root: false }
      );
    },

    resetUserAddress({ commit }) {
      commit(RESET_USER_ADDRESS, { root: false });
    },

    updatePhone({ commit }, data) {
      commit(
        UPDATE_PHONE,
        {
          data,
        },
        { root: false }
      );
    },
  },
};
