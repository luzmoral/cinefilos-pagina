document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // SISTEMA DE USUARIO (LocalStorage)
    // ==========================================
    let usuarioLogueado = JSON.parse(localStorage.getItem("usuarioCinefilo")) || null;
    
    const inputComunidad = document.getElementById("input-comunidad");
    const modalRegistro = document.getElementById("modal-registro");
    const btnCerrarModalRegistro = document.getElementById("cerrar-modal-registro");
    const formularioRegistro = document.getElementById("formulario-registro-real");

    // Actualizar UI según sesión
    const actualizarInterfazUsuario = () => {
        if (usuarioLogueado && inputComunidad) {
            inputComunidad.placeholder = `Comentar como ${usuarioLogueado.nombre}`;
        }
    };
    actualizarInterfazUsuario();

    // Manejo del Modal de Registro
    const abrirModalRegistro = () => { modalRegistro.style.display = "flex"; };
    const cerrarModalRegistro = () => { modalRegistro.style.display = "none"; };

    if(btnCerrarModalRegistro) btnCerrarModalRegistro.addEventListener("click", cerrarModalRegistro);

    window.addEventListener("click", (e) => { 
        if (e.target === modalRegistro) cerrarModalRegistro(); 
    });

    // Validar Registro
    if(formularioRegistro){
        formularioRegistro.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById("reg-nombre").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const pass = document.getElementById("reg-pass").value;

            if (nombre && email && pass) {
                usuarioLogueado = { nombre, email };
                localStorage.setItem("usuarioCinefilo", JSON.stringify(usuarioLogueado));
                
                actualizarInterfazUsuario();
                cerrarModalRegistro();
                alert(`¡Bienvenido/a a la comunidad, ${nombre}! Ya podés interactuar.`);
                
                formularioRegistro.reset();
            }
        });
    }

    const verificarSesion = (evento) => {
        if (!usuarioLogueado) {
            if (evento) evento.preventDefault();
            abrirModalRegistro();
            return false;
        }
        return true;
    };


    // ==========================================
    // INTERACCIONES: FEED DE LA COMUNIDAD
    // ==========================================
    const listaComentarios = document.getElementById("lista-comentarios");

    if (listaComentarios) {
        listaComentarios.addEventListener("click", (e) => {
            
            // --- DAR LIKE ---
            if (e.target.classList.contains("accion-like")) {
                if (!verificarSesion(e)) return;
                
                let text = e.target.textContent;
                let num = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                
                if (e.target.classList.contains("like-activo")) {
                    e.target.classList.remove("like-activo");
                    e.target.textContent = `👍 ${num - 1}`;
                } else {
                    e.target.classList.add("like-activo");
                    e.target.textContent = `👍 ${num + 1}`;
                }
            }

            // --- ABRIR CAJA RESPONDER ---
            if (e.target.classList.contains("accion-responder")) {
                if (!verificarSesion(e)) return;
                
                const contenedorTexto = e.target.closest('.texto-comentario');
                let cajaInputExistente = contenedorTexto.querySelector('.caja-input-respuesta');
                
                if (cajaInputExistente) {
                    cajaInputExistente.style.display = cajaInputExistente.style.display === 'none' ? 'flex' : 'none';
                    if (cajaInputExistente.style.display === 'flex') cajaInputExistente.querySelector('input').focus();
                } else {
                    const htmlInput = `
                        <div class="caja-input-respuesta" style="animation: fadeIn 0.3s ease; display: flex; gap: 10px; margin-top: 10px;">
                            <input type="text" placeholder="Escribí tu respuesta..." style="flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 20px; font-family: inherit; font-size: 0.85rem; outline: none;">
                            <button class="btn-enviar-subrespuesta" style="background: #000; color: #FAE204; border: none; padding: 5px 15px; border-radius: 20px; font-weight: bold; cursor: pointer;">Responder</button>
                        </div>
                    `;
                    contenedorTexto.insertAdjacentHTML('beforeend', htmlInput);
                    contenedorTexto.querySelector('.caja-input-respuesta input').focus();
                }
            }

            // --- ENVIAR SUB-RESPUESTA ---
            if (e.target.classList.contains("btn-enviar-subrespuesta")) {
                const cajaInput = e.target.closest('.caja-input-respuesta');
                const inputTexto = cajaInput.querySelector('input');
                const valor = inputTexto.value.trim();
                
                if (valor === "") return;

                const contenedorTexto = e.target.closest('.texto-comentario');
                
                let contenedorRespuestas = contenedorTexto.querySelector('.contenedor-respuestas');
                if (!contenedorRespuestas) {
                    contenedorRespuestas = document.createElement('div');
                    contenedorRespuestas.className = 'contenedor-respuestas';
                    contenedorRespuestas.style.marginTop = '15px';
                    contenedorRespuestas.style.paddingLeft = '15px';
                    contenedorRespuestas.style.borderLeft = '2px solid #E0E0E0';
                    contenedorTexto.insertBefore(contenedorRespuestas, cajaInput);
                }

                const htmlRespuesta = `
                    <div class="comentario respuesta" style="animation: fadeIn 0.4s ease; border-bottom: none; padding: 5px 0 10px 0; display: flex; gap: 15px;">
                        <div class="avatar-comentario"><div class="marcador-avatar mini" style="width: 25px; height: 25px; border-radius: 50%; background-color: #ccc;"></div></div>
                        <div class="texto-comentario" style="flex-grow: 1;">
                            <strong style="font-family: 'Montserrat', sans-serif; font-size: 0.95rem;">${usuarioLogueado.nombre}</strong>
                            <p style="font-family: 'Roboto Slab', serif; font-size: 0.95rem; margin: 5px 0 10px 0; color: #555;">${valor}</p>
                            <div class="acciones-comentario" style="display: flex; gap: 20px; font-size: 0.8rem; font-weight: 700; color: #999; cursor: pointer;">
                                <span class="accion-like">👍 0</span>
                            </div>
                        </div>
                    </div>
                `;

                contenedorRespuestas.insertAdjacentHTML('beforeend', htmlRespuesta);
                inputTexto.value = "";
                cajaInput.style.display = 'none'; 
            }
        });
    }

    // --- NUEVO COMENTARIO PRINCIPAL (ENTER) ---
    if (inputComunidad) {
        inputComunidad.addEventListener("click", (e) => {
            if (!verificarSesion(e)) inputComunidad.blur();
        });

        inputComunidad.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                if (!verificarSesion(e)) return;

                const valor = inputComunidad.value.trim();
                if (valor === "") return;

                const htmlNuevo = `
                    <div class="comentario" style="animation: fadeIn 0.4s ease; display: flex; gap: 15px; padding: 0 0 20px 0; border-bottom: 1px solid #DDDDDD; margin-bottom: 20px;">
                        <div class="avatar-comentario"><div class="marcador-avatar" style="width: 35px; height: 35px; border-radius: 50%; background-color: #ccc;"></div></div>
                        <div class="texto-comentario" style="flex-grow: 1;">
                            <strong style="font-family: 'Montserrat', sans-serif; font-size: 0.95rem;">${usuarioLogueado.nombre}</strong>
                            <p style="font-family: 'Roboto Slab', serif; font-size: 0.95rem; margin: 5px 0 10px 0; color: #555;">${valor}</p>
                            <div class="acciones-comentario" style="display: flex; gap: 20px; font-size: 0.8rem; font-weight: 700; color: #999; cursor: pointer;">
                                <span class="accion-like">👍 0</span>
                                <span class="accion-responder">↩ Responder...</span>
                            </div>
                        </div>
                    </div>
                `;

                listaComentarios.insertAdjacentHTML('beforeend', htmlNuevo); 
                inputComunidad.value = "";
                listaComentarios.scrollTop = listaComentarios.scrollHeight;
            }
        });
    }
});