const order = {
    items: [],
    getTotalPrice() {
        return this.items.reduce((total, item) => total + item.price, 0);
    }
};

let ingredients = [];

async function fetchPizzaData() {
    try {
        const response = await fetch('http://192.168.126.9:5177/api/Pizza/GetAllPizzas', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }
        const data = await response.json();
        const fetchedPizzas = data.pizzas;
        ingredients = data.ingredients;
        // console.log('Fetched pizzas:', fetchedPizzas);

        if (Array.isArray(fetchedPizzas)) {
            const groupedPizzas = groupPizzasByName(fetchedPizzas);
            displayPizzas(groupedPizzas);
        } else {
            console.error('Fetched data is not an array:', fetchedPizzas);
        }
    } catch (error) {
        console.error('Error fetching pizza data:', error);
    }
}

function groupPizzasByName(pizzas) {
    const grouped = {};

    pizzas.forEach((pizza) => {
        if (!grouped[pizza.name]) {
            grouped[pizza.name] = {
                id: pizza.id,
                name: pizza.name,
                basePrice: pizza.price,
                ingredients: pizza.ingredients,
                sizes: []
            };
        }
        grouped[pizza.name].sizes.push({
            id: pizza.size.id,
            name: pizza.size.name,
            price: pizza.price,
            ingredients: pizza.ingredients
        });
    });

    return Object.values(grouped);
}

function displayPizzas(groupedPizzas) {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = '';
    
    // console.log(groupedPizzas);
    groupedPizzas.forEach((pizza) => {
        const pizzaDiv = document.createElement('div');
        pizzaDiv.className = 'pizza-item';
        const title = document.createElement('h3');
        title.textContent = pizza.name;
        pizzaDiv.appendChild(title);
        const PizzaEdit = document.createElement('button');
        PizzaEdit.className = 'Edit_Button';
        PizzaEdit.textContent = 'Edit';
        PizzaEdit.addEventListener('click', (e) => {

            const editPizza = {
                ingredients: pizza.ingredients,
            };

            const editFlex = document.createElement('div');
            editFlex.style.position = "absolute";
            editFlex.style.top = e.y;
            editFlex.style.left = e.x;
            editFlex.style.width = "100vw";
            editFlex.style.display = "flex";
            editFlex.style.flexDirection = "column";
            editFlex.style.alignItems = "center";
            const EditPopup = document.createElement('div');
            EditPopup.classname = 'pizza-item';
            EditPopup.style.position = "absolute";
            EditPopup.style.width = "auto";
            EditPopup.style.maxWidth = "40vw";
            EditPopup.style.height = "auto";
            EditPopup.style.backgroundColor = "grey";
            
            ingredients.forEach(ingredient => {
                const ingredientCheckbox = document.createElement("input");
                ingredientCheckbox.className = "ingredient-checkbox";
                ingredientCheckbox.value = JSON.stringify(ingredient);
                ingredientCheckbox.type = "checkbox";
                editPizza.ingredients.forEach(pizzaIngredient => {
                    // console.log(pizzaIngredient);
                    if (pizzaIngredient.id == ingredient.id)
                    {
                        ingredientCheckbox.checked = true;
                    }
                });
                const ingredientLabel = document.createElement("label");
                ingredientLabel.className = "ingredient-label";
                ingredientLabel.innerHTML = ingredient.name;
                EditPopup.appendChild(ingredientCheckbox);
                EditPopup.appendChild(ingredientLabel);
            });

            const addEditedButton = document.createElement("button");
            addEditedButton.classname = "add-to-order";
            addEditedButton.innerHTML = "Add to Order";
            addEditedButton.addEventListener('click', () => {  
            const sizeOption = sizeSelect.options[sizeSelect.selectedIndex];
            // console.log(sizeOption);
            const pizzaSize = sizeOption.text.split(' - ')[0];
            const pizzaPrice = parseFloat(sizeOption.value);
            const sizeId = sizeOption.getAttribute('data-size-id');

            const selectedIngredients = Array.from(document.getElementsByClassName("ingredient-checkbox"))
            .filter(checkbox => checkbox.checked)
            .map(checkbox => JSON.parse(checkbox.value));
            
            const newPizza = {
                id: pizza.id + parseFloat(sizeId) - 1,
                name: pizza.name,
                price: pizza.basePrice + parseFloat(sizeId) - 1,
                ingredients: selectedIngredients,
                size: { id: sizeId, name: pizzaSize }
            };
            // console.log(newPizza);
            order.items.push(newPizza);
            updateOrderSummary();
                editFlex.remove();
            })
            const EditClose = document.createElement('button');
            EditClose.classname = "close-edit";
            EditClose.innerHTML = "Close";
            EditClose.addEventListener('click', () =>{
              editFlex.remove();
            })

            EditPopup.appendChild(addEditedButton);
            const maincontainer = document.getElementById("main-container");
            maincontainer.appendChild(editFlex);
            editFlex.appendChild(EditPopup);
            EditPopup.appendChild(EditClose);
        });
        pizzaDiv.appendChild(PizzaEdit);
        const sizeSelect = document.createElement('select');
        sizeSelect.className = 'size-select';
        sizeSelect.setAttribute('data-name', pizza.name);
        pizza.sizes.forEach((size) => {
            const option = document.createElement('option');
            option.value = size.price;
            option.setAttribute('data-size-id', size.id);
            option.textContent = `${size.name} - €${size.price.toFixed(2)}`;
            sizeSelect.appendChild(option);
        });

        pizzaDiv.appendChild(sizeSelect);
        const addButton = document.createElement('button');
        addButton.className = 'add-to-order';
        addButton.textContent = 'Add to Order';
        addButton.addEventListener('click', () => {
            const sizeOption = sizeSelect.options[sizeSelect.selectedIndex];
            // console.log(sizeOption);
            const pizzaSize = sizeOption.text.split(' - ')[0];
            const pizzaPrice = parseFloat(sizeOption.value);
            const sizeId = sizeOption.getAttribute('data-size-id');
            const newPizza = {
                id: pizza.id + parseFloat(sizeId) -1,
                name: pizza.name,
                price: pizza.basePrice + parseFloat(sizeId) -1,
                ingredients: pizza.ingredients,
                size: {id: sizeId, name: pizzaSize}
            };
            // console.log(newPizza);
            order.items.push(newPizza);
            updateOrderSummary();
        });
        

        pizzaDiv.appendChild(addButton);
        menuContainer.appendChild(pizzaDiv);
    });
}



function updateOrderSummary() {
    const RemovePizzaButton = document.createElement('button');
    RemovePizzaButton.className = 'remove_pizza'    ;
    RemovePizzaButton.textContent = 'Remove';
   
    // console.log(order);
    const orderList = document.getElementById('order-list');
    const totalPriceElem = document.getElementById('total-price');
    orderList.innerHTML = '';
    order.items.forEach((pizza, index) => {
        RemovePizzaButton.addEventListener('click', () => {
        order.items.splice(index, 1);
        updateOrderSummary();
        })
        const listItem = document.createElement('li');
        listItem.textContent = `${pizza.name} (${pizza.size.name}) - €${pizza.price.toFixed(2)} - Ingredients: ${pizza.ingredients.map(ingredient => ingredient.name).join(', ')}`;
        orderList.appendChild(listItem);
        orderList.appendChild(RemovePizzaButton);
    });
    totalPriceElem.textContent = order.getTotalPrice().toFixed(2);
}

async function submitOrder() {
    const apiEndpoint = 'http://192.168.126.9:5177/api/order/create';

    // console.log(order.items);
    const orderData = order.items.map((item, index) => ({
        ID: item.id,
        Name: item.name,
        Price: item.price,
        Ingredients: item.ingredients,
        Size: item.size
    }));

    // console.log('Submitting order:', JSON.stringify(orderData, null, 2));

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error(`Failed to submit order: ${response.status}`);
        }

        const result = await response.json();
        console.log('Order submitted successfully:', result);
        alert('Your order has been placed successfully!');
        order.items = [];
        updateOrderSummary();
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Failed to submit the order. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchPizzaData();
    const checkoutButton = document.getElementById('checkout-btn');
    checkoutButton.addEventListener('click', (e) => {
        e.preventDefault(); 
        submitOrder(); 
    });
});
