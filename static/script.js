let command_input = document.querySelector('#command-input');
let console_field = document.querySelector('.console');

let endpoint_input = document.querySelector('#endpoint-input');
let socket = null;

let close_conn_button = document.querySelector('#close_conn_button');


function submitCommand(command_text, sender) {
    if (sender === 'you') {
        console_field.innerHTML += "<p>[<span class='ok'>YOU</span>] " + command_text + "</p>";
        command_input.value = "";
        command_input.blur();
        command_input.disabled = true;
        window.setTimeout(renable, 500);
    } else if (sender === 'modem') {
        console_field.innerHTML += "<p>[<span class='warn'>MODEM</span>] " + command_text + "</p>";
    } else if (sender === 'system') {
        console_field.innerHTML += "<p>[SYSTEM] " + command_text + "</p>";
    }
}


function renable() {
    command_input.disabled = false;
    command_input.focus();

    // submitCommand('no bestie <3', 'modem');
}

command_input.onkeydown = function (e) {

}

async function fetchData(url) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'omit', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).catch((_) => {
      alert("The server could not be contacted.");
      return Promise.reject();
  });
  return await response.json();
}


async function initConnection(e) {
    document.querySelector('#warning').style.display = 'none';
    document.querySelector('#info').style.display = 'block';
    document.querySelector('#console').style.display = 'block';
    document.querySelector('#common_commands').style.display = 'block';

    let data = await fetchData("http://localhost/api/info");
    document.querySelector('#network').innerHTML = data.network;
    document.querySelector('#serial-state').innerHTML = data.serial;
    document.querySelector('#number').innerHTML = data.number;

    socket = new WebSocket("ws://localhost/api/ws");

    socket.onopen = function (_) {
        submitCommand("Websocket connection established", "system");
        command_input.focus();
        command_input.disabled = false;

        command_input.onkeydown = function (e) {
            if (e.keyCode === 13 && command_input.value !== '') {
                socket.send(command_input.value + '\n');
                submitCommand(command_input.value, 'you');
                }
        };

        close_conn_button.onclick = async function (e) {
            submitCommand("User issued close command", "system");
            await socket.send("@CLOSE");
        }

        socket.onmessage = function (e) {
            submitCommand(e.data, "modem");
        }
    }

    socket.onclose = function (e) {
        command_input.disabled = true;
        command_input.blur();

        close_conn_button.onclick = undefined;

        submitCommand("Connection closed. <button onclick='initConnection();'>Attempt to reopen</button>",
            "system");
    }
}

endpoint_input.onkeydown = initConnection;