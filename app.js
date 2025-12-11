// app.js (Lógica Frontend)

document.addEventListener('DOMContentLoaded', () => {
    // **********************************************
    // 1. LÓGICA DE AUTENTICACIÓN (index.html)
    // **********************************************

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    // Función para mostrar/ocultar formularios
    if (document.getElementById('show-register')) {
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            loginMessage.textContent = '';
        });
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            registerMessage.textContent = '';
        });
    }

    // Manejo de Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginMessage.textContent = 'Iniciando sesión...';
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (data.success) {
                    // Simulación de guardar credenciales/rol
                    localStorage.setItem('userRole', data.redirectTo.split('role=')[1].split('&')[0]); 
                    localStorage.setItem('username', data.redirectTo.split('username=')[1]); 
                    loginMessage.textContent = 'Éxito. Redirigiendo...';
                    window.location.href = data.redirectTo;
                } else {
                    loginMessage.textContent = `Error: ${data.message}`;
                }
            } catch (error) {
                loginMessage.textContent = 'Error de conexión con el servidor.';
                console.error('Login Error:', error);
            }
        });
    }

    // Manejo de Registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            registerMessage.textContent = 'Registrando usuario...';
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await response.json();

                if (data.success) {
                    registerMessage.textContent = data.message;
                    // Cambiar a vista de login después de un registro exitoso
                    document.getElementById('show-login').click(); 
                } else {
                    registerMessage.textContent = `Error: ${data.message}`;
                }
            } catch (error) {
                registerMessage.textContent = 'Error de conexión con el servidor.';
                console.error('Register Error:', error);
            }
        });
    }
    
    // **********************************************
    // 2. LÓGICA DE DASHBOARD (dashboard.html)
    // **********************************************
    
    if (document.querySelector('.channel-view')) {
        const username = localStorage.getItem('username') || 'Invitado';
        const userRole = localStorage.getItem('userRole');

        // Mostrar enlace de administración si es admin
        if (userRole === 'admin') {
            document.getElementById('admin-nav').classList.remove('hidden');
        }

        async function loadChannelData() {
            try {
                const response = await fetch('/api/channel-data');
                const data = await response.json();

                document.getElementById('welcome-title').textContent = `¡Hola, ${username}! ${data.welcomeMessage}`;
                document.getElementById('subs-number').textContent = data.subscribers.toLocaleString();
                
                const videosContainer = document.getElementById('videos-container');
                videosContainer.innerHTML = ''; // Limpiar mensaje de carga

                data.videos.forEach(video => {
                    const videoCard = document.createElement('div');
                    videoCard.className = 'video-card';
                    // Usamos el placeholder para las miniaturas ya que no las tenemos localmente
                    const thumbnailUrl = video.thumbnail.includes('placeholder') ? video.thumbnail : `https://via.placeholder.com/300x170/333333/FFFFFF?text=Video+${video.id}`;
                    
                    videoCard.innerHTML = `
                        <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank">
                            <img src="${thumbnailUrl}" alt="${video.title}">
                            <h4>${video.title}</h4>
                        </a>
                    `;
                    videosContainer.appendChild(videoCard);
                });

            } catch (error) {
                console.error("Error al cargar datos del canal:", error);
                document.getElementById('videos-container').innerHTML = '<div class="loading-message">No se pudieron cargar los datos de YouTube.</div>';
            }
        }
        
        loadChannelData();
    }
    
    // **********************************************
    // 3. LÓGICA DE ADMINISTRACIÓN (admin.html)
    // **********************************************

    if (document.querySelector('.admin-panel')) {
        const userRole = localStorage.getItem('userRole');
        const username = localStorage.getItem('username') || 'Admin';
        
        // Bloqueo de seguridad (El backend es la seguridad real, esto es solo UX)
        if (userRole !== 'admin') {
             alert("Acceso no autorizado.");
             window.location.href = 'dashboard.html';
             return;
        }
        
        document.getElementById('admin-welcome').textContent = `Bienvenido, Administrador ${username}.`;
        
        window.saveSetting = async (settingId) => {
            const value = document.getElementById(settingId).value;
            const messageElement = document.getElementById(`msg-${settingId}`);
            messageElement.textContent = 'Guardando...';

            try {
                const response = await fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ settingId, value })
                });
                const data = await response.json();

                if (data.success) {
                    messageElement.textContent = '¡Guardado con éxito!';
                    setTimeout(() => messageElement.textContent = '', 3000);
                }
            } catch (error) {
                messageElement.textContent = 'Error al guardar.';
                console.error("Admin Save Error:", error);
            }
        };

        window.triggerSync = () => {
            const statusElement = document.getElementById('last-sync');
            const messageElement = document.getElementById('msg-sync-status');
            
            messageElement.textContent = 'Sincronizando...';
            statusElement.textContent = 'En curso...';
            
            // Simulación de llamada al backend para iniciar sincronización
            setTimeout(() => {
                statusElement.textContent = new Date().toLocaleString('es-ES');
                messageElement.textContent = 'Sincronización completa.';
                setTimeout(() => messageElement.textContent = '', 3000);
            }, 2500);
        };
        
        // Inicializar el tiempo de última sincronización
        document.getElementById('last-sync').textContent = new Date().toLocaleString('es-ES');
    }
    
    // **********************************************
    // 4. LÓGICA DEL CHATBOT
    // **********************************************

    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatbot = document.getElementById('close-chatbot');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            chatbotWindow.classList.toggle('chatbot-hidden');
            chatbotInput.focus();
        });

        closeChatbot.addEventListener('click', () => {
            chatbotWindow.classList.add('chatbot-hidden');
        });

        const addMessage = (content, sender) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
            msgDiv.textContent = content;
            chatbotMessages.appendChild(msgDiv);
            // Desplazar hacia abajo para ver el último mensaje
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        };

        chatbotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = chatbotInput.value.trim();
            if (!message) return;

            addMessage(message, 'user');
            chatbotInput.value = '';
            
            // Simulación de mensaje de carga del bot
            const loadingMsg = document.createElement('div');
            loadingMsg.className = 'bot-message loading';
            loadingMsg.textContent = 'TechnoBotX está pensando...';
            chatbotMessages.appendChild(loadingMsg);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                const data = await response.json();
                
                // Eliminar mensaje de carga
                chatbotMessages.removeChild(loadingMsg);

                if (data.response) {
                    addMessage(data.response, 'bot');
                } else {
                    addMessage('Lo siento, el asistente está fuera de línea. Revisa la clave OPENAI_API_KEY en Railway.', 'bot');
                }
            } catch (error) {
                chatbotMessages.removeChild(loadingMsg);
                addMessage('Error de conexión con el servidor de chat.', 'bot');
                console.error('Chat API Error:', error);
            }
        });
    }

});
                                                               
