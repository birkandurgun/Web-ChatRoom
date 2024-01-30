const btnSend = document.getElementById("btnSend");
const inputMessage = document.getElementById("inputMessage");
const messages = document.getElementById("messages");


const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7268/chathub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

const setUsername = async () => {
    const username = prompt("Enter username: ");
    if (username) {
        sessionStorage.setItem("username", username);
        await joinChat(username);
    }
}

const joinChat = async (username) => {
    if (!username) {
        return;
    }
    try {
        await connection.invoke("JoinChat", username, `${username} joined chat`);
    } catch (error) {
        console.log(error);
    }
}

const receiveMessage = async () => {
    const currentUsername = sessionStorage.getItem("username");
    if (!currentUsername) return;
    try {
        await connection.on("ReceiveMessage", (username, message) => {
            let classOfDiv;
            if (currentUsername === username) {
                classOfDiv = "d-flex flex-row justify-content-end mb-4";
            } else {
                classOfDiv = "d-flex flex-row justify-content-start mb-4";
            }
            addMessageToInterface(message, classOfDiv);
        })
    } catch (error) {
        console.log(error);
    }
}

const addMessageToInterface = (message, classOfDiv) => {
    /*
    sender
    <div class="d-flex flex-row justify-content-start mb-4">
        <div class="pl-3 pb-3 pt-3 mt-3"
            style="border-radius: 15px; background-color: green;width: 50%;color: whitesmoke;" id="msg-box">
            Hi
        </div>
    </div>

    receiver
    <div class="d-flex flex-row justify-content-end mb-4">
        <div class="pl-3 pb-3 pt-3 me-3"
            style="border-radius: 15px; background-color: green;width: 50%;color: whitesmoke;" id="msg-box">
                Hello
        </div>
    </div>
    */
    const messageBox = document.createElement("div");
    messageBox.setAttribute("class", classOfDiv);
    const messageInside = document.createElement("div");
    messageInside.setAttribute("class", "pl-3 pb-3 pt-3 mt-3");
    messageInside.setAttribute("style", "border-radius: 15px; background-color: green;width: 50%;color: whitesmoke;");
    messageInside.setAttribute("id", "msg-box");
    messageInside.innerHTML = message;
    messageBox.appendChild(messageInside);
    messages.appendChild(messageBox);
}

const sendMessage = async () => {
    const username = sessionStorage.getItem("username");
    if (!username) return;
    const msg = inputMessage.value;
    if (msg) {
        try {
            connection.invoke("SendMessage", username, `${username}: ${msg}`);
        } catch (error) {
            console.log(error);
        }
        inputMessage.value = "";
    }
}


const startChat = async () => {
    try {
        await connection.start();
        console.log("Connected to the chat.");
    } catch (error) {
        console.log(error);
    }

    await setUsername();
    await receiveMessage();
}

startChat();