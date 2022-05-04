import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
// import user from '@/static/user';
import { CREATE_PIZZA, ADD_ENTITY } from '@/store/mutation-types';
import { generateMockStore } from '@/store/mocks';
import Cart from '@/views/Cart.vue';
import { authenticateUser } from '@/common/helpers';

// Создаём локальный тестовый экземпляр Vue.
const localVue = createLocalVue();
// Добавляем в него Vuex.
localVue.use(Vuex);

const pizza = {
  "composition":{
    "dough":{
      "id":1,
      "value":"large",
      "price":300
    },
    "size":{
      "id":2,
      "value":"normal",
      "multiplier":2
    },
    "sauce":{
      "id":1,
      "value":"creamy",
      "price":50
    },
    "ingr":[
      {"id":1,"name":"Грибы","image":"/public/img/filling/mushrooms.svg","price":33,"label":"mushrooms","count":0},
      {"id":2,"name":"Чеддер","image":"/public/img/filling/cheddar.svg","price":42,"label":"cheddar","count":0},
      {"id":3,"name":"Салями","image":"/public/img/filling/salami.svg","price":42,"label":"salami","count":1},
      {"id":4,"name":"Томаты","image":"/public/img/filling/tomatoes.svg","price":35,"label":"tomatoes","count":1},
      {"id":5,"name":"Маслины","image":"/public/img/filling/olives.svg","price":25,"label":"olives","count":0},
      {"id":6,"name":"Лук","image":"/public/img/filling/onion.svg","price":21,"label":"onion","count":0},
      {"id":7,"name":"Бекон","image":"/public/img/filling/bacon.svg","price":42,"label":"bacon","count":0},
      {"id":8,"name":"Ананас","image":"/public/img/filling/ananas.svg","price":25,"label":"ananas","count":0},
      {"id":9,"name":"Чили","image":"/public/img/filling/chile.svg","price":21,"label":"chile","count":0},
      {"id":10,"name":"Ветчина","image":"/public/img/filling/ham.svg","price":42,"label":"ham","count":0},
      {"id":11,"name":"Лосось","image":"/public/img/filling/salmon.svg","price":50,"label":"salmon","count":0},
      {"id":12,"name":"Моцарелла","image":"/public/img/filling/mozzarella.svg","price":35,"label":"mozzarella","count":0},
      {"id":13,"name":"Халапеньо","image":"/public/img/filling/jalapeno.svg","price":25,"label":"jalapeno","count":0},
      {"id":14,"name":"Пармезан","image":"/public/img/filling/parmesan.svg","price":35,"label":"parmesan","count":0},
      {"id":15,"name":"Блю чиз","image":"/public/img/filling/blue_cheese.svg","price":50,"label":"blue_cheese","count":0}
    ],
    "classPizza":"pizza--foundation--small-creamy",
    "pizzaFilling":[
      {"id":3,"count":1,"name":"salami","price":42,"title":"салями"},
      {"id":4,"count":1,"name":"tomatoes","price":35,"title":"томаты"}
    ],
    "namePizza":"Салями",
    "id":1
  },
  "id":1,
  "count":1,
  "title":"Салями",
  "size":32,
  "dough":"толстом",
  "sauce":"сливочный",
  "fillings":"салями, томаты",
  "price":854
};

const createPizza = store => {
  // store.state.Cart.pizzas.push(pizza);
  
  store.commit(
    "Cart/" + CREATE_PIZZA,
    {
      composition: pizza.composition,
      getTotalPrice: pizza.price,
    }
  );
};

// let url = '';
// let body = {};
// let mockError = false;

// jest.mock('axios', () => ({
//   post: (_url, _body) => { 
//     return new Promise((resolve) => {
//       if (mockError) 
//         throw Error("Mock error")

//       url = _url
//       body = _body
//       resolve(true)
//     })
//   }
// }));

// Начало блока тестов
describe('Cart', () => {
    // Заглушка вместо реального router-view
    const stubs = ['router-view'];

    // Переменные, которые будут переопределяться заново для каждого теста
    let actions;
    let store;
    let wrapper;
    const createComponent = options => {
      wrapper = mount(Cart, options);
    };
  
    // Перед каждым тестом заменяем хранилище на новое,
    // а также его действия свежими jest-функциями.
    beforeEach(() => {
      actions = {
        Auth: {
          queryAddresses: jest.fn(),
          newAddresses: jest.fn(),
        },
        Builder: {
          resetBuilder: jest.fn(),
        },
        Cart: {
          query: jest.fn(),
          createPizza: jest.fn(),
          updatePizza: jest.fn(),
          updateUserRecipient: jest.fn(),
          resetUserAddress: jest.fn(),
        },
        Orders: {
          newOrder:jest.fn(),
        }
      };
      store = generateMockStore(actions);
    });
  
    // Удаляем тест-обёртку после каждого теста.
    afterEach(() => {
      wrapper.destroy();
    });
  
    it ('is rendered', () => {
      createComponent({ localVue, store, stubs });
      expect(wrapper.exists()).toBeTruthy();
    });

    it ('is empty cart', () => {
      createComponent({ localVue, store, stubs });
      expect(wrapper.find('.cart__empty').text()).toBe('В корзине нет ни одного товара');
    });

    it ('calls newAddresses action', async () => {
      authenticateUser(store);
      createPizza(store);
      // const address = {
      //   street:"Молодежная",
      //   house:"9",
      //   apartment:"2"
      // };
      createComponent({ localVue, store, stubs });
      await wrapper.vm.$nextTick();
      // const select = wrapper.find('.select').element;
      // select.value = 'new';
      // select.dispatchEvent(new Event('change'));
      const options = wrapper.find('.select').findAll('option');
      await options.at(1).setSelected();
      expect(wrapper.find('option:checked').element.value).toBe('new');
      await wrapper.vm.$nextTick();
      console.log(wrapper.html());
      
      let input = wrapper.find('input[name="street"]');
      input.element.value = 'Абракадабра';
      await input.trigger('input');
        
      const addr = wrapper.find('[data-test="new-addresses"]');
      // console.log(store.state.Cart.pizzas.length);
      await addr.trigger('click');
      console.log(input.html());
      // expect(actions.Auth.newAddresses).toHaveBeenCalled();
      // expect(actions.Auth.newAddresses).toHaveBeenCalledWith(
      //   expect.any(Object), // The Vuex context
      //   { }
      // );
      // expect(spyOnMutation).toHaveBeenCalledWith(
      //   { 
      //     composition: pizza.composition,
      //     getTotalPrice: pizza.price,
      //   }
      // );
    });

    it ('calls newOrder action', async () => {
      authenticateUser(store);
      createPizza(store);
      createComponent({ localVue, store, stubs });

      const commit = jest.fn();
      const order = {
        userId: null,
        phone: "",
        pizzas: [],
        misc: [],
        address: {
          id: null,
          name: `ул., д., кв.`,
          street: "",
          building: "",
          flat: "",
          comment: "",
        }
      };

      await actions.Orders.newOrder({ commit }, { order })

      // expect(url).toBe("/api/orders")
      // expect(body).toEqual({ order })
      // expect(commit).toHaveBeenCalledWith(
      //   ADD_ENTITY, true
      // )
    });
});


// Список элементов для тестирования
/*
  + ...mapActions("Builder", ["resetBuilder"]),
  + ...mapActions("Cart", [
  +   "query",
  +   "createPizza",
  +   "updatePizza",
  + ]),

  +  ...mapActions("Auth", ["queryAddresses", "newAddresses"]),
  +  ...mapActions("Orders", ["newOrder"]),
*/

// Данные из тест хранилища
/*
  ...mapState("Auth", {
    user: (state) => state.user,
  }),
  ...mapState("Builder", {
    composition: (state) => state.composition,
  }),
  ...mapState("Cart", {
    pizzas: (state) => state.pizzas,
    misc: (state) => state.misc,
    address: (state) => state.address,
    recipient: (state) => state.recipient,
    phone: (state) => state.phone,
  }),
 */
