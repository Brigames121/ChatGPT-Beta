// server.js (Ejemplo simplificado con Express y OpenAI)
const express = require('express');
// Importamos la clase 'OpenAI' desde el SDK instalado
const { OpenAI } = require('openai'); 
require('dotenv').config(); // Usar dotenv para desarrollo local, Railway lo ignora y usa su propia variable

const app = express();
app.use(express.json()); // Middleware para parsear JSON en las solicitudes

// 1. Inicialización de OpenAI
// El cliente buscará automáticamente la variable OPENAI_API_KEY en el entorno de Railway
const openai = new OpenAI(); 

// 2. Ruta para el chat
app.post('/api/chat', async (req, res) => {
    // Verificar que la clave se cargó (Solo para depuración)
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "La clave API de OpenAI no está configurada." });
    }
    
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: "Falta el mensaje de chat." });
    }

    try {
        // 3. Llamada al modelo de chat (GPT-3.5 Turbo es eficiente y rápido)
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Eres TechnoBotX, un asistente amigable y experto en tecnología que ayuda a los visitantes del canal." },
                { role: "user", content: message }
            ],
            temperature: 0.7, // Creatividad del modelo
        });

        // 4. Envío de la respuesta al cliente
        const aiResponse = completion.choices[0].message.content;
        res.json({ response: aiResponse });

    } catch (error) {
        console.error("Error al llamar a la API de OpenAI:", error);
        res.status(500).json({ error: "Hubo un error al contactar al asistente de IA." });
    }
});

// ... otras rutas de tu servidor (autenticación, youtube, etc.)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor ejecutándose en puerto ${PORT}`));
