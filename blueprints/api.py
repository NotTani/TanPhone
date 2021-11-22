import asyncio
import socket
from quart import Blueprint, jsonify, websocket


api = Blueprint('api', __name__, url_prefix='/api')
active_client = None


async def pretend_serial(command):
    await asyncio.sleep(1)
    return "You said: " + command


@api.route('/info')
def info():
    return jsonify({
        "serial": "CONNECTED",
        "network": "AT&T",
        "number": "+2122"
    })


@api.websocket('/ws')
async def ws():
    await websocket.send("Connected to " + socket.gethostname() + "!")

    while True:
        message = (await websocket.receive()).strip()
        if message == "@CLIENT":
            await websocket.send(socket.gethostname())
        elif message == "@HELP":
            await websocket.send("No <3")
        elif message == "@CLOSE":
            break
        elif message == "@DEVIN":
            await websocket.send("HELLO DEVIN")
        else:
            await websocket.send(await pretend_serial(message + '\n'))
