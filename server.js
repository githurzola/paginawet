const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir los archivos de la carpeta 'public' (donde estará el HTML)
app.use(express.static('public'));

// BASE DE DATOS TEMPORAL (En memoria)
// Nota: Si reinicias el servidor, esto se borra. Luego le pondremos MongoDB.
let apodos = [];
const META_VIDEO = 3; // Cada cuántos apodos sale el video

io.on('connection', (socket) => {
    console.log('Un usuario se conectó');

    // 1. Cuando alguien entra, le mandamos los apodos que ya existen
    socket.emit('cargar_apodos', apodos);

    // 2. Escuchar cuando alguien envía un nuevo apodo
    socket.on('enviar_apodo', (nuevoApodo) => {
        // Guardamos el apodo
        apodos.push(nuevoApodo);

        // Avisamos a TODOS los usuarios (incluido el que lo envió) para que actualicen la lista
        io.emit('nuevo_apodo', nuevoApodo);

        // 3. VERIFICAR SI LLEGAMOS A LA META (50, 100, 150...)
        // Usamos el operador % (módulo) para saber si es múltiplo de 50
        if (apodos.length > 0 && apodos.length % META_VIDEO === 0) {
            console.log(`¡Llegamos a ${apodos.length}! Lanzando video...`);
            io.emit('lanzar_video', { cantidad: apodos.length });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});