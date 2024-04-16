document.addEventListener('DOMContentLoaded', function() {
    fetchItems();

    //Enable adding items with enter key press
    document.getElementById('itemName').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addItem();
        }
    });

    //Adding highlighted class to clicked LI
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
    
    //Removing the highlightrd class when clicked away from LI
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        if (target.tagName !== 'LI' && !list.contains(target)) {
            list.querySelectorAll('li').forEach(function(li) {
                li.classList.remove('highlighted');
            });
        }
    });

    //On double click add line-through text decoration
    list.addEventListener('dblclick', function(event) {
        const target = event.target;
        
        if (target.tagName === 'LI') {
            if (target.style.textDecoration === 'line-through') {
                target.style.textDecoration = 'none';
            } else {
                target.style.textDecoration = 'line-through';
            }
        }
        
        list.querySelectorAll('li').forEach(function(li) {
            if (li !== target) {
                li.classList.remove('highlighted');
            }
        });
    });
});

//Function to add items
function addItem() {
    const input = document.getElementById('itemName');
    const itemName = input.value.trim();
    let alert = document.getElementById('alert');
    if (!itemName) {
        alert.textContent = 'Input should not be empty';
        return  
    } else {
        alert.textContent = ''
    }; 

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
        listItem.setAttribute('data-id', data.id);
        list.appendChild(listItem);
        input.value = '';
    })
    .catch(error => console.error('Error:', error));
}

//Function to get items
function fetchItems() {
    fetch('/get-items')
    .then(response => response.json())
    .then(items => {
        const listElement = document.querySelector('.list ul');
        listElement.innerHTML = ''; 
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.name}`;
            listItem.setAttribute('data-id', item.id);
            listElement.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error fetching items:', error));
}

//Function to delete items
function deleteHighlightedItem() {
    const highlightedItem = document.querySelector('.highlighted');
    let alert = document.getElementById('alert');
    if (!highlightedItem) {
        alert.textContent = 'Please select an item to delete';
        return;
    } else {
        alert.textContent = ''
    }; 

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
        highlightedItem.remove(); 
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Delete') {
        deleteHighlightedItem();
    }
});

//Function to edit items
let isEditing = false;
let currentlyEditingItem = null;

function editHighlightedItem() {
    const editButton = document.getElementById('editButton');
    if (!isEditing) {
        const highlightedItem = document.querySelector('.highlighted');
        let alert = document.getElementById('alert');

        if (!highlightedItem) {
            alert.textContent = 'Please select an item to edit';
            return;
        } else {
            alert.textContent = ''
        }; 

        currentlyEditingItem = highlightedItem;

        const input = document.createElement('input');
        
        input.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#3B2C5B';
            this.style.color = '#E4E0E9';
        });

        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                confirmEdit();
            }
        });

        input.type = 'text';
        input.value = highlightedItem.textContent;
        highlightedItem.textContent = '';
        highlightedItem.appendChild(input);
        input.focus();

        editButton.textContent = 'Confirm';
        isEditing = true;
    } else {
        confirmEdit(); 
    }
}

function confirmEdit() {
    const input = currentlyEditingItem.querySelector('input');
    const newText = input.value.trim();
    let alert = document.getElementById('alert');

    if (!newText) {
        alert.textContent = 'Edited text cannot be empty';
        return;
    } else {
            alert.textContent = ''
        }; 

    const itemId = currentlyEditingItem.getAttribute('data-id');
    fetch(`/update-item/${itemId}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: newText })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update item');
        }
        return response.json();
    })
    .then(data => {
        currentlyEditingItem.textContent = newText;
        currentlyEditingItem.classList.remove('highlighted');
        document.getElementById('editButton').textContent = 'Edit';
        isEditing = false;
        currentlyEditingItem = null;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update the item. See console for details.');
    });
}