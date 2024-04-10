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
    const input = document.getElementById('itemName');
    const itemName = input.value.trim();
    if (!itemName) return;

    fetch('/add-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: itemName, date: new Date().toISOString().split('T')[0] }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add item');
        }
        return response.json();
    })
    .then(data => {
        console.log('Item added:', data);
        const list = document.querySelector('.list ul');
        const listItem = document.createElement('li');
        listItem.textContent = itemName;
        listItem.setAttribute('data-id', data.id);//
        list.appendChild(listItem);
        input.value = '';
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
            listItem.setAttribute('data-id', item.id);//
            listElement.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error fetching items:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    const list = document.querySelector('.list ul');

    list.addEventListener('click', function(event) {
        const target = event.target;
        
        if (target.tagName === 'LI') {
            target.classList.toggle('highlighted');
        }
        
        list.querySelectorAll('li').forEach(function(li) {
            if (li !== target) {
                li.classList.remove('highlighted');
            }
        });
    });

    document.addEventListener('click', function(event) {
        const target = event.target;
        
        if (target.tagName !== 'LI' && !list.contains(target)) {
            list.querySelectorAll('li').forEach(function(li) {
                li.classList.remove('highlighted');
            });
        }
    });
});

function deleteHighlightedItem() {
    const highlightedItem = document.querySelector('.highlighted');
    if (!highlightedItem) {
        return; // No item is highlighted, so do nothing
    }

    const itemId = highlightedItem.getAttribute('data-id');
    fetch(`/delete-item/${itemId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete item');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message);
        highlightedItem.remove(); // Remove the item visually from the list
    })
    .catch(error => console.error('Error:', error));
}
