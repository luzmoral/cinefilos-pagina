document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // SISTEMA DE USUARIO (LocalStorage)
    // ==========================================
    let usuarioLogueado = JSON.parse(localStorage.getItem("usuarioCinefilo")) || null;
    
    // Elementos Globales
    const inputComunidad = document.getElementById("input-comunidad");
    const modalRegistro = document.getElementById("modal-registro");
    const btnCerrarModalRegistro = document.getElementById("cerrar-modal-registro");
    const formularioRegistro = document.getElementById("formulario-registro-real");
    
    // Elementos de Reseña Izquierda
    const formResenaDesplegable = document.getElementById("formulario-resena-especifica");
    const labelNombreResena = document.getElementById("nombre-usuario-resena");
    const inputResenaEspecifica = document.getElementById("input-comentario-resena");
    const contadorResena = document.getElementById("contador-caracteres-resena");
    const btnEnviarResenaEspecifica = document.getElementById("btn-enviar-resena");

    // NUEVO MODAL PODIO
    const modalRanking = document.getElementById("modal-ranking");
    const btnCerrarModalRanking = document.getElementById("cerrar-modal-ranking");

    // Actualizar UI según sesión
    const actualizarInterfazUsuario = () => {
        if (usuarioLogueado) {
            if (inputComunidad) inputComunidad.placeholder = `Comentar como ${usuarioLogueado.nombre}`;
            if (labelNombreResena) labelNombreResena.textContent = usuarioLogueado.nombre;
        }
    };
    actualizarInterfazUsuario();

    // Modales de Registro y Podio
    const abrirModalRegistro = () => { modalRegistro.style.display = "flex"; };
    const cerrarModalRegistro = () => { modalRegistro.style.display = "none"; };

    if(btnCerrarModalRegistro) btnCerrarModalRegistro.addEventListener("click", cerrarModalRegistro);
    if(btnCerrarModalRanking) btnCerrarModalRanking.addEventListener("click", () => { modalRanking.style.display = "none"; });

    window.addEventListener("click", (e) => { 
        if (e.target === modalRegistro) cerrarModalRegistro(); 
        if (e.target === modalRanking) modalRanking.style.display = "none";
    });

    // Registro Simulado
    if(formularioRegistro){
        formularioRegistro.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById("reg-nombre").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const pass = document.getElementById("reg-pass").value;

            if (nombre && email && pass) {
                usuarioLogueado = { nombre, email };
                localStorage.setItem("usuarioCinefilo", JSON.stringify(usuarioLogueado));
                /* Compatibilidad con cuenta.js */
                localStorage.setItem("usuario_nombre", nombre);
                localStorage.setItem("usuario_email",  email);
                
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
    // INTERACCIONES: Caja Blanca (Reseñas/Estrellas)
    // ==========================================
    const estrellas = document.querySelectorAll("#calificacion-estrellas span");
    const btnCalificar = document.getElementById("btn-accion-calificar");
    const btnDejarComentario = document.getElementById("btn-accion-comentar");
    let calificacionActual = 0;

    const pintarEstrellas = (limite) => {
        estrellas.forEach((estrella, indice) => {
            if (indice < limite) {
                estrella.classList.add("activa");
                estrella.textContent = "★";
            } else {
                estrella.classList.remove("activa");
                estrella.textContent = "☆";
            }
        });
    };

    estrellas.forEach(estrella => {
        estrella.addEventListener("mouseover", function() { pintarEstrellas(this.getAttribute("data-value")); });
        estrella.addEventListener("mouseout", function() { pintarEstrellas(calificacionActual); });
        
        estrella.addEventListener("click", function(e) {
            if (!verificarSesion(e)) return;
            calificacionActual = this.getAttribute("data-value");
            pintarEstrellas(calificacionActual);
        });
    });

    // Acción al tocar "CALIFICAR"
    if (btnCalificar) {
        btnCalificar.addEventListener("click", (e) => {
            if (verificarSesion(e)) {
                if (calificacionActual === 0) {
                    alert("¡Elegí una cantidad de estrellas primero!");
                } else {
                    // SE ABRE EL MODAL PODIO
                    modalRanking.style.display = "flex";
                }
            }
        });
    }

    if (btnDejarComentario) {
        btnDejarComentario.addEventListener("click", (e) => {
            if (verificarSesion(e)) {
                formResenaDesplegable.style.display = formResenaDesplegable.style.display === "none" ? "block" : "none";
            }
        });
    }

    if (inputResenaEspecifica && contadorResena) {
        inputResenaEspecifica.addEventListener("input", function() {
            contadorResena.textContent = `${this.value.length}/100`;
        });
    }

    // Acción al tocar "ENVIAR" en el comentario de la caja
    if (btnEnviarResenaEspecifica) {
        btnEnviarResenaEspecifica.addEventListener("click", () => {
            if (inputResenaEspecifica.value.trim() === "") return alert("Escribí tu reseña.");
            
            // Limpiamos el formulario
            inputResenaEspecifica.value = "";
            contadorResena.textContent = "0/100";
            formResenaDesplegable.style.display = "none";

            // SE ABRE EL MODAL PODIO
            modalRanking.style.display = "flex";
        });
    }


    // ==========================================
    // INTERACCIONES: FEED DE LA COMUNIDAD (Derecha)
    // ==========================================
    const listaComentarios = document.getElementById("lista-comentarios");

    if (listaComentarios) {
        listaComentarios.addEventListener("click", (e) => {
            
            // --- Acción: DAR LIKE ---
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

            // --- Acción: ABRIR CAJA RESPONDER ---
            if (e.target.classList.contains("accion-responder")) {
                if (!verificarSesion(e)) return;
                
                const contenedorTexto = e.target.closest('.texto-comentario');
                let cajaInputExistente = contenedorTexto.querySelector('.caja-input-respuesta');
                
                if (cajaInputExistente) {
                    cajaInputExistente.style.display = cajaInputExistente.style.display === 'none' ? 'flex' : 'none';
                    if (cajaInputExistente.style.display === 'flex') cajaInputExistente.querySelector('input').focus();
                } else {
                    const htmlInput = `
                        <div class="caja-input-respuesta" style="animation: fadeIn 0.3s ease;">
                            <input type="text" placeholder="Escribí tu respuesta...">
                            <button class="btn-enviar-subrespuesta">Responder</button>
                        </div>
                    `;
                    contenedorTexto.insertAdjacentHTML('beforeend', htmlInput);
                    contenedorTexto.querySelector('.caja-input-respuesta input').focus();
                }
            }

            // --- Acción: ENVIAR LA SUB-RESPUESTA ---
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
                    contenedorTexto.insertBefore(contenedorRespuestas, cajaInput);
                }

                const htmlRespuesta = `
                    <div class="comentario respuesta" style="animation: fadeIn 0.4s ease;">
                        <div class="avatar-comentario"><div class="marcador-avatar mini"></div></div>
                        <div class="texto-comentario">
                            <strong>${usuarioLogueado.nombre}</strong>
                            <p>${valor}</p>
                            <div class="acciones-comentario">
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
                    <div class="comentario" style="animation: fadeIn 0.4s ease;">
                        <div class="avatar-comentario"><div class="marcador-avatar"></div></div>
                        <div class="texto-comentario">
                            <strong>${usuarioLogueado.nombre}</strong>
                            <p>${valor}</p>
                            <div class="acciones-comentario">
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