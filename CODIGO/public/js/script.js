let lastCommand = "";
let userToEdit = null;

$(document).ready(function () {
    addMessage('🤖CRUD', './imagens/ROBO.jpg', "😃CLIQUE NO MENU DE BOTÕES PARA EXPLORAR O CRUD!", 'sender-2');
    showMenuButtons(["LISTAR", "CRIAR", "EDITAR", "APAGAR"]);
    $('.input-container').hide();

    $(document).on('click', '.button-container button', function () {
        processUserInput($(this).text());
    });

    $('#send-btn').on('click', function () {
        let userInput = $('#user-input').val();
        $('#user-input').val('');
        if (userInput) {
            processUserInput(userInput);
        }
    });

    $(document).on('click', '.inline-button', function () {
        processUserInput($(this).text());
    });
});

function processUserInput(userInput) {
    addMessage('👤VOCÊ', './imagens/VOCE.jpg', userInput, 'sender-1');

    setTimeout(async function () {
        let botResponse = await getBotResponse(userInput);
        addMessage('🤖CRUD', './imagens/ROBO.jpg', botResponse.text, 'sender-2');

        if (botResponse.buttons) {
            showMenuButtons(botResponse.buttons);
        } 
        else if (botResponse.inlineButtons) {
            showInlineButtons(botResponse.inlineButtons);
        } 
        else {
            clearButtons();
            $('.input-container').show();
        }
    }, 1000);
}

function addMessage(senderName, avatarUrl, text, senderClass) {
    $('#chat-container').append(`
        <div class="message ${senderClass}">
            <div class="avatar"><img src="${avatarUrl}" alt="${senderName}"></div>
            <div class="arrow ${senderClass === 'sender-1' ? 'arrow-left' : 'arrow-right'}"></div>
            <div class="message-bubble">
                <div class="sender-name">${senderName}</div>
                <p>${text}</p>
            </div>
        </div>
    `);
    $('#chat-container').scrollTop($('#chat-container')[0].scrollHeight);
}

function showMenuButtons(buttons) {
    $('#button-container').html(buttons.map(button => `<button>${button}</button>`).join(''));
    $('.input-container').hide();
}

function showInlineButtons(buttons) {
    $('#chat-container').append(`<div class="inline-buttons-container">${buttons.map(button => `<button class="inline-button">${button.toUpperCase()}</button>`).join('')}</div>`);
    $('#chat-container').scrollTop($('#chat-container')[0].scrollHeight);
}

function clearButtons() {
    $('#button-container').empty();
    $('.input-container').show();
}

async function getBotResponse(userInput) {
    let lowerCaseInput = userInput.toLowerCase().trim();

    switch (lowerCaseInput) {
        case "listar":
            return listUsers();

        case "criar":
            return { text: "DIGITE O NOME E A IDADE (Ex: Nome, Idade):" };

        case "editar":
            return listUsersForEditing();

        case "apagar":
            return listUsersForDeleting();

        default:
            if (/^[a-zA-Z]+,\s*\d+$/.test(lowerCaseInput)) {
                let [name, age] = lowerCaseInput.split(',').map(s => s.trim());
                if (lastCommand === "editar" && userToEdit) {
                    return await editUser(userToEdit.id, name, age);
                } else {
                    return await createUser(name, age);
                }
            }

            let foundUser = await findUserByName(lowerCaseInput);
            if (foundUser) {
                if (lastCommand === "editar") {
                    userToEdit = foundUser;
                    return { text: `Digite o novo nome e idade para ${foundUser.name} (Ex: Nome, Idade):` };
                } 
                else if (lastCommand === "apagar") {
                    return await deleteUser(foundUser.id);
                }
            }

            return { text: "Desculpe, não entendi.", buttons: ["LISTAR", "CRIAR", "EDITAR", "APAGAR"] };
    }
}

async function listUsers() {
    let response = await fetch('/api/users');
    let users = await response.json();

    if (users.length === 0) {
        return { text: "Nenhum usuário cadastrado.", buttons: ["LISTAR", "CRIAR", "EDITAR", "APAGAR"] };
    } 
    else {
        return { text: "Usuários cadastrados:", inlineButtons: users.map(user => `${user.name}, ${user.age}`) };
    }
}

async function listUsersForEditing() {
    let response = await fetch('/api/users');
    let users = await response.json();

    if (users.length === 0) {
        return { text: "Nenhum usuário para editar.", buttons: ["LISTAR", "CRIAR", "EDITAR", "APAGAR"] };
    } 
    else {
        return { text: "CLIQUE NO BOTÃO INLINE PARA EDITAR O USUÁRIO:", inlineButtons: users.map(user => `${user.name}`) };
    }
}

async function listUsersForDeleting() {
    let response = await fetch('/api/users');
    let users = await response.json();

    if (users.length === 0) {
        return { text: "Nenhum usuário para apagar.", buttons: ["LISTAR", "CRIAR", "EDITAR", "APAGAR"] };
    } 
    else {
        return { text: "CLIQUE NO BOTÃO INLINE PARA APAGAR O USUÁRIO:", inlineButtons: users.map(user => `${user.name}`) };
    }
}

async function createUser(name, age) {
    let response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age })
    });

    let result = await response.json();
    return { text: `Usuário ${name}, ${age} anos foi cadastrado com sucesso!`, buttons: ["LISTAR", "CRIAR", "EDITAR", "APAGAR"] };
}

async function editUser(id, name, age) {
    let response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age })
    });

    let result = await response.json();
    userToEdit = null;
    return { text: `Usuário atualizado: ${name}, ${age} anos.`, buttons: ["LISTAR", "CRIAR", "EDITAR", "APAGAR"] };
}

async function deleteUser(id) {
    let response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    let result = await response.json();
    return { text: `Usuário removido com sucesso.`, buttons: ["LISTAR", "CRIAR", "EDITAR", "APAGAR"] };
}

async function findUserByName(name) {
    let response = await fetch('/api/users');
    let users = await response.json();
    return users.find(user => user.name.toLowerCase() === name.toLowerCase());
}

$(document).on('click', '.button-container button', function () {
    lastCommand = $(this).text().toLowerCase();
});
