document.addEventListener('DOMContentLoaded', function() {
    fetchItems();

    document.getElementById('itemName').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addItem();
        }
    });
});

function addItem() {
    const itemName = document.getElementById('itemName').value;
    if (!itemName) return;

    fetch('/add-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: itemName, date: new Date().toISOString().split('T')[0] }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Item added:', data);
        const list = document.querySelector('.list ul');
        const listItem = document.createElement('li');
        listItem.textContent = itemName;
        list.appendChild(listItem);
        document.getElementById('itemName').value = '';
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    fetchItems();
});

function fetchItems() {
    fetch('/get-items')
    .then(response => response.json())
    .then(items => {
        const listElement = document.querySelector('.list ul');
        listElement.innerHTML = ''; 
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.name}`;
            listElement.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error fetching items:', error));
}
