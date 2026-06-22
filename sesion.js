/*
 * sesion.js — Sistema de sesión unificado para todas las páginas de Cinefilos
 * Maneja: login, logout, modal de registro/login, ícono de usuario y sincronización.
 */

(function () {
  "use strict";

  var CLAVE = "usuarioCinefilo";

  function obtenerUsuario() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || null; }
    catch (e) { return null; }
  }

  function guardarUsuario(usuario) {
    localStorage.setItem(CLAVE, JSON.stringify(usuario));
    localStorage.setItem("usuario_nombre",         usuario.nombre   || "");
    localStorage.setItem("usuario_email",          usuario.email    || "");
    localStorage.setItem("usuario_comentarios",    usuario.comentarios    || 0);
    localStorage.setItem("usuario_calificaciones", usuario.calificaciones || 0);
    document.dispatchEvent(new CustomEvent("cinefilo:sesion", { detail: { logueado: true } }));
  }

  function eliminarUsuario() {
    localStorage.removeItem(CLAVE);
    localStorage.removeItem("usuario_nombre");
    localStorage.removeItem("usuario_email");
    localStorage.removeItem("usuario_comentarios");
    localStorage.removeItem("usuario_calificaciones");
    document.dispatchEvent(new CustomEvent("cinefilo:sesion", { detail: { logueado: false } }));
  }

  /* ─────────────────────────────────────────────
     MODAL HTML — se inyecta en TODAS las páginas
  ───────────────────────────────────────────── */
  var estilosModal = `
    /* ── overlay ── */
    .modal-sesion-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.75);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    }
    .modal-sesion-overlay.oculto { display: none; }

    /* ── caja ── */
    .modal-sesion-caja {
      position: relative;
      background: #fff;
      border-radius: 14px;
      width: 100%;
      max-width: 340px;
      padding: 36px 28px 28px;
      font-family: 'Montserrat', sans-serif;
      box-sizing: border-box;
    }

    /* ── botón cerrar ── */
    .modal-sesion-cerrar {
      position: absolute;
      top: 12px; right: 16px;
      background: none; border: none;
      color: #aaa; font-size: 24px; line-height: 1; cursor: pointer;
    }
    .modal-sesion-cerrar:hover { color: #111; }

    /* ── títulos y textos ── */
    .modal-sesion-titulo {
      margin: 0 0 10px;
      font-size: 22px; font-weight: 900; color: #111;
      line-height: 1.15; letter-spacing: -.01em; text-transform: uppercase;
    }
    .modal-sesion-subtexto {
      margin: 0 0 20px;
      font-size: 12px; color: #666; line-height: 1.5; font-weight: 400;
    }

    /* ── campos con ícono ── */
    .modal-campo-icono {
      position: relative; margin-bottom: 10px;
    }
    .modal-campo-icono svg {
      position: absolute; left: 14px; top: 50%;
      transform: translateY(-50%);
      width: 18px; height: 18px; stroke: #e5d600; pointer-events: none;
    }
    .modal-sesion-campo {
      width: 100%; box-sizing: border-box;
      background: #111; border: none; border-radius: 50px;
      color: #f4f4f4; padding: 13px 16px 13px 44px;
      font-size: 13px; font-family: 'Montserrat', sans-serif; font-weight: 500;
    }
    .modal-sesion-campo::placeholder { color: #888; }
    .modal-sesion-campo:focus { outline: 2px solid #e5d600; outline-offset: 0; }

    /* ── botón principal ── */
    .modal-sesion-btn {
      width: 100%; background: #e5d600; color: #111;
      border: none; border-radius: 50px; padding: 13px;
      font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 14px;
      cursor: pointer; margin-top: 6px; transition: background .18s ease;
    }
    .modal-sesion-btn:hover { background: #ffd700; }

    /* ── cambiar panel ── */
    .modal-sesion-cambiar {
      margin: 16px 0 0; font-size: 12px; color: #888; text-align: center;
    }
    .modal-sesion-link {
      background: none; border: none; padding: 0;
      font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700;
      color: #111; text-decoration: underline; cursor: pointer;
    }
    .modal-sesion-link:hover { color: #c9a800; }

    /* ── error ── */
    .modal-sesion-error {
      color: #cc0000; font-size: 11px; margin: 6px 0 0;
      display: none; padding-left: 4px;
    }

    /* ── panel oculto ── */
    .modal-sesion-panel.oculto { display: none; }

    /* ── mobile: caja más compacta ── */
    @media (max-width: 480px) {
      .modal-sesion-caja {
        padding: 30px 20px 22px;
        border-radius: 12px;
      }
      .modal-sesion-titulo { font-size: 19px; }
      .modal-sesion-campo  { padding: 11px 14px 11px 40px; font-size: 13px; }
      .modal-sesion-btn    { padding: 12px; font-size: 13px; }
    }
  `;

  var modalHTML = `
    <div id="modal-sesion-global" class="modal-sesion-overlay oculto">
      <div class="modal-sesion-caja">
        <button type="button" class="modal-sesion-cerrar" id="cerrar-modal-sesion-global" aria-label="Cerrar">&times;</button>

        <!-- Panel: Registrarse -->
        <div class="modal-sesion-panel" id="panel-registro-global">
          <h3 class="modal-sesion-titulo">FORMÁ PARTE DE<br>LA COMUNIDAD</h3>
          <p class="modal-sesion-subtexto">Unite para calificar tus películas favoritas, dejar tus opiniones y debatir con la comunidad de cinéfilos más grande.</p>

          <div class="modal-campo-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <input class="modal-sesion-campo" id="modal-reg-nombre" type="text" placeholder="Nombre" maxlength="20" autocomplete="username">
          </div>
          <div class="modal-campo-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
            <input class="modal-sesion-campo" id="modal-reg-email" type="email" placeholder="Email" autocomplete="email">
          </div>
          <div class="modal-campo-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            <input class="modal-sesion-campo" id="modal-reg-pass" type="password" placeholder="Contraseña" autocomplete="new-password">
          </div>

          <p class="modal-sesion-error" id="modal-reg-error">Completá todos los campos.</p>
          <button class="modal-sesion-btn" id="modal-btn-registro" type="button">Registrarme</button>
          <p class="modal-sesion-cambiar">¿Ya tenés cuenta? <button type="button" class="modal-sesion-link" id="modal-ir-login">iniciar sesión</button></p>
        </div>

        <!-- Panel: Iniciar sesión -->
        <div class="modal-sesion-panel oculto" id="panel-login-global">
          <h3 class="modal-sesion-titulo">BIENVENIDO<br>DE VUELTA</h3>
          <p class="modal-sesion-subtexto">Ingresá con tu cuenta para poder calificar y dejar tus reseñas.</p>

          <div class="modal-campo-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
            <input class="modal-sesion-campo" id="modal-login-email" type="email" placeholder="Email" autocomplete="email">
          </div>
          <div class="modal-campo-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            <input class="modal-sesion-campo" id="modal-login-pass" type="password" placeholder="Contraseña" autocomplete="current-password">
          </div>

          <p class="modal-sesion-error" id="modal-login-error">Completá todos los campos.</p>
          <button class="modal-sesion-btn" id="modal-btn-login" type="button">Ingresar</button>
          <p class="modal-sesion-cambiar">¿No tenés cuenta? <button type="button" class="modal-sesion-link" id="modal-ir-registro">registrarse</button></p>
        </div>

      </div>
    </div>
  `;

  /* ─────────────────────────────────────────────
     ÍCONO: amarillo si hay sesión
  ───────────────────────────────────────────── */
  function actualizarIcono() {
    var logueado = !!obtenerUsuario();
    document.querySelectorAll(".barra-icono-usuario").forEach(function (icono) {
      if (logueado) {
        icono.classList.add("logueado");
        icono.style.color = "#e5d600";
      } else {
        icono.classList.remove("logueado");
        icono.style.color = "";
      }
    });
  }

  /* ─────────────────────────────────────────────
     MODAL: inyectar + lógica
  ───────────────────────────────────────────── */
  function inyectarModal() {
    if (document.getElementById("modal-sesion-global")) return;

    /* Estilos */
    if (!document.getElementById("sesion-modal-estilos")) {
      var tag = document.createElement("style");
      tag.id = "sesion-modal-estilos";
      tag.textContent = estilosModal;
      document.head.appendChild(tag);
    }

    /* HTML */
    var wrapper = document.createElement("div");
    wrapper.innerHTML = modalHTML;
    document.body.appendChild(wrapper.firstElementChild);

    var modal      = document.getElementById("modal-sesion-global");
    var panelReg   = document.getElementById("panel-registro-global");
    var panelLogin = document.getElementById("panel-login-global");

    function mostrarPanel(panel) {
      panelReg.classList.toggle("oculto", panel !== panelReg);
      panelLogin.classList.toggle("oculto", panel !== panelLogin);
      var primerCampo = panel.querySelector(".modal-sesion-campo");
      if (primerCampo) primerCampo.focus();
      var errReg   = document.getElementById("modal-reg-error");
      var errLogin = document.getElementById("modal-login-error");
      if (errReg)   errReg.style.display   = "none";
      if (errLogin) errLogin.style.display = "none";
    }

    function cerrarModal() {
      modal.classList.add("oculto");
    }

    /* API pública para abrir el modal desde cualquier página */
    window.abrirModalIniciarSesion = function (panelInicial) {
      mostrarPanel(panelInicial === "login" ? panelLogin : panelReg);
      modal.classList.remove("oculto");
    };

    /* Cerrar */
    document.getElementById("cerrar-modal-sesion-global").addEventListener("click", cerrarModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) cerrarModal(); });

    /* Cambiar panel */
    document.getElementById("modal-ir-login").addEventListener("click", function () { mostrarPanel(panelLogin); });
    document.getElementById("modal-ir-registro").addEventListener("click", function () { mostrarPanel(panelReg); });

    /* ── Registro ── */
    var regNombre = document.getElementById("modal-reg-nombre");
    var regEmail  = document.getElementById("modal-reg-email");
    var regPass   = document.getElementById("modal-reg-pass");
    var regError  = document.getElementById("modal-reg-error");

    document.getElementById("modal-btn-registro").addEventListener("click", function () {
      var nombre = regNombre.value.trim();
      var email  = regEmail.value.trim();
      var pass   = regPass.value;
      if (!nombre || !email || !pass) {
        regError.textContent = "Completá todos los campos.";
        regError.style.display = "block";
        return;
      }
      regError.style.display = "none";
      var usuario = { nombre: nombre, email: email };
      guardarUsuario(usuario);
      actualizarIcono();
      /* Actualizar UI de interaccion.js si existe en la página */
      var inputCom = document.getElementById("input-comunidad");
      if (inputCom) inputCom.placeholder = "Comentar como " + nombre;
      var labelRes = document.getElementById("nombre-usuario-resena");
      if (labelRes) labelRes.textContent = nombre;
      regNombre.value = ""; regEmail.value = ""; regPass.value = "";
      cerrarModal();
    });

    [regNombre, regEmail, regPass].forEach(function (c) {
      c.addEventListener("keydown", function (e) {
        if (e.key === "Enter") document.getElementById("modal-btn-registro").click();
      });
    });

    /* ── Login ── */
    var loginEmail = document.getElementById("modal-login-email");
    var loginPass  = document.getElementById("modal-login-pass");
    var loginError = document.getElementById("modal-login-error");

    document.getElementById("modal-btn-login").addEventListener("click", function () {
      var email = loginEmail.value.trim();
      var pass  = loginPass.value;
      if (!email || !pass) {
        loginError.textContent = "Completá todos los campos.";
        loginError.style.display = "block";
        return;
      }
      loginError.style.display = "none";
      var usuario = { nombre: email.split("@")[0], email: email };
      guardarUsuario(usuario);
      actualizarIcono();
      loginEmail.value = ""; loginPass.value = "";
      cerrarModal();
    });

    [loginEmail, loginPass].forEach(function (c) {
      c.addEventListener("keydown", function (e) {
        if (e.key === "Enter") document.getElementById("modal-btn-login").click();
      });
    });
  }

  /* ─────────────────────────────────────────────
     ÍCONO DE USUARIO → va a cuenta.html
  ───────────────────────────────────────────── */
  function initIconos() {
    document.querySelectorAll(".barra-icono-usuario").forEach(function (icono) {
      if (!icono.dataset.sesionInit) {
        icono.dataset.sesionInit = "1";
        icono.setAttribute("href", "cuenta.html");
      }
    });
  }

  /* ─────────────────────────────────────────────
     API pública
  ───────────────────────────────────────────── */
  window.cinefiloSesion = {
    obtenerUsuario: obtenerUsuario,
    guardarUsuario: guardarUsuario,
    eliminarUsuario: eliminarUsuario,
    actualizarIcono: actualizarIcono
  };

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    inyectarModal();
    actualizarIcono();
    initIconos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
