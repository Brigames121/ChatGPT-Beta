// server.js (Servidor Express)
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { OpenAI } = require('openai');

// Cargar variables de entorno (para desarrollo local)
// En Railway/Heroku, estas variables se cargan automáticamente
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON y servir archivos estáticos (Frontend)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar OpenAI (usa la variable de entorno OPENAI_API_KEY)
const openai = new OpenAI(); 

// **********************************************
// 1. SIMULACIÓN DE BASE DE DATOS DE USUARIOS
// **********************************************
const users = [];

// Hash de la contraseña del administrador para simular un registro seguro
const adminPasswordHash = bcrypt.hashSync("1456", 10); 
users.push({ 
    email: "Admin3@gmail.com", 
    password: adminPasswordHash, 
    role: "admin",
    username: "AdminTechno"
});

// **********************************************
// 2. RUTAS DE AUTENTICACIÓN
// **********************************************

// Ruta de Registro
app.post('/api/register', async (req, res) => {
    const { email, password, username } = req.body;
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ success: false, message: "El correo ya está registrado." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ email, password: hashedPassword, role: "user", username });
        // En un proyecto real, se usarían sesiones/JWTs para iniciar sesión aquí
        res.json({ success: true, message: "Registro exitoso. Puedes iniciar sesión.", redirectTo: '/dashboard.html' });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el servidor." });
    }
});

// Ruta de Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ success: false, message: "Credenciales incorrectas." });
    }

    try {
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // En un proyecto real, generarías un token JWT aquí
            const redirectUrl = `/dashboard.html?role=${user.role}&username=${user.username}`;
            res.json({ success: true, message: "Login exitoso.", redirectTo: redirectUrl });
        } else {
            res.status(401).json({ success: false, message: "Credenciales incorrectas." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el servidor." });
    }
});


// **********************************************
// 3. RUTA DE DATOS DEL CANAL (SIMULACIÓN DE YOUTUBE API)
// **********************************************

app.get('/api/channel-data', (req, res) => {
    // Aquí es donde harías la llamada real a la YouTube Data API V3
    
    // Simulación de datos:
    const channelData = {
        subscribers: 15400,
        channelName: "TechnoByteX",
        welcomeMessage: "¡Bienvenido a la comunidad de tecnología!", // Esto podría ser configurable por Admin
        videos: [
            { title: "Review del nuevo Chip M4 Pro", thumbnail: "/img/thumb1.jpg", id: "VIDEOID1" },
            { title: "Guía completa de Python para IA", thumbnail: "/img/thumb2.jpg", id: "VIDEOID2" },
            { title: "Monta tu propio PC Gaming 2025", thumbnail: "/img/thumb3.jpg", id: "VIDEOID3" },
        ]
    };
    res.json(channelData);
});


// **********************************************
// 4. RUTA DE CHATGPT
// **********************************************

app.post('/api/chat', async (req, res) => {
    // La seguridad real debe verificar si el usuario está autenticado
    if (!process.env.OPENAI_API_KEY) {
        console.error("Clave API de OpenAI no configurada.");
        return res.status(500).json({ error: "El asistente de IA no está disponible." });
    }
    
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: "Falta el mensaje de chat." });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Eres TechnoBotX, un asistente amigable y experto en tecnología, hardware y desarrollo de software. Muestra entusiasmo por el canal TechnoByteX." },
                { role: "user", content: message }
            ],
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;
        res.json({ response: aiResponse });

    } catch (error) {
        console.error("Error al llamar a la API de OpenAI:", error.response?.data || error.message);
        res.status(500).json({ error: "Hubo un error al contactar al asistente de IA. Por favor, revisa la consola del servidor." });
    }
});


// **********************************************
// 5. RUTA DE ADMINISTRACIÓN (SIMPLIFICADA)
// **********************************************

// En un entorno real, esta ruta requeriría verificar el rol 'admin'
app.post('/api/admin/settings', (req, res) => {
    const { settingId, value } = req.body;
    console.log(`[ADMIN] Guardando ${settingId}: ${value}`);
    // Aquí se guardaría en la base de datos o se activaría una acción
    res.json({ success: true, message: `Ajuste ${settingId} guardado con éxito.` });
});


// **********************************************
// 6. SERVIR EL INDEX (Ruta principal)
// **********************************************

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Servidor Express ejecutándose en puerto ${PORT}`));
  
