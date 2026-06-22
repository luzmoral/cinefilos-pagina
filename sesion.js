/*
 * sesion.js — Sistema de sesión unificado para todas las páginas de Cinefilos
 * Maneja: login, logout, ícono de usuario, dropdown y sincronización con cuenta.js e interaccion.js
 */

(function () {
  "use strict";

  /* ─────────────────────────────────────────────
     CLAVE ÚNICA en localStorage (compatible con
     interaccion.js que usa "usuarioCinefilo")
  ───────────────────────────────────────────── */
  var CLAVE = "usuarioCinefilo";

  function obtenerUsuario() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE)) || null;
    } catch (e) {
      return null;
    }
  }

  function guardarUsuario(usuario) {
    localStorage.setItem(CLAVE, JSON.stringify(usuario));
    /* Compatibilidad con cuenta.js (claves separadas) */
    localStorage.setItem("usuario_nombre",         usuario.nombre   || "");
    localStorage.setItem("usuario_email",          usuario.email    || "");
    localStorage.setItem("usuario_comentarios",    usuario.comentarios    || 0);
    localStorage.setItem("usuario_calificaciones", usuario.calificaciones || 0);
    /* Avisar al resto de la página que cambió la sesión (ej: estrellas del Top 5) */
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
     DROPDOWN HTML
  ───────────────────────────────────────────── */
  var estilosDropdown = `
    .sesion-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: #1a1a1a;
      border: 1.5px solid #e5d600;
      border-radius: 10px;
      min-width: 230px;
      padding: 20px 18px 16px;
      z-index: 9999;
      box-shadow: 0 8px 32px rgba(0,0,0,.55);
      font-family: 'Montserrat', sans-serif;
    }
    .sesion-dropdown.oculto { display: none; }

    .sesion-dropdown h4 {
      margin: 0 0 14px;
      font-size: 14px;
      color: #e5d600;
      letter-spacing: .05em;
    }

    .sesion-campo {
      width: 100%;
      box-sizing: border-box;
      background: #2c2c2c;
      border: 1px solid #444;
      border-radius: 6px;
      color: #f4f4f4;
      padding: 8px 10px;
      font-size: 13px;
      font-family: inherit;
      margin-bottom: 8px;
    }
    .sesion-campo:focus { outline: none; border-color: #e5d600; }

    .sesion-btn-login {
      width: 100%;
      background: #e5d600;
      color: #111;
      border: none;
      border-radius: 6px;
      padding: 9px;
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      margin-top: 4px;
    }
    .sesion-btn-login:hover { background: #ffd700; }

    .sesion-info-usuario {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .sesion-nombre {
      color: #f4f4f4;
      font-weight: 700;
      font-size: 15px;
    }
    .sesion-email {
      color: #aaa;
      font-size: 11px;
      word-break: break-all;
    }
    .sesion-divider {
      border: none;
      border-top: 1px solid #333;
      margin: 12px 0;
    }
    .sesion-btn-cuenta {
      display: block;
      width: 100%;
      background: transparent;
      border: 1px solid #444;
      border-radius: 6px;
      color: #f4f4f4;
      padding: 8px;
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      cursor: pointer;
      margin-bottom: 8px;
      text-align: center;
      text-decoration: none;
    }
    .sesion-btn-cuenta:hover { border-color: #e5d600; color: #e5d600; }
    .sesion-btn-logout {
      display: block;
      width: 100%;
      background: transparent;
      border: 1px solid #555;
      border-radius: 6px;
      color: #bbb;
      padding: 8px;
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      cursor: pointer;
      text-align: center;
    }
    .sesion-btn-logout:hover { background: #2c2c2c; color: #fff; border-color: #888; }

    .sesion-error {
      color: #ff6b6b;
      font-size: 11px;
      margin-top: 6px;
      display: none;
    }

    /* Wrapper posicionado para que el dropdown salga bien */
    .barra-icono-usuario-wrapper {
      position: relative;
      display: inline-flex;
    }
  `;

  function inyectarEstilos() {
    if (document.getElementById("sesion-estilos")) return;
    var tag = document.createElement("style");
    tag.id = "sesion-estilos";
    tag.textContent = estilosDropdown;
    document.head.appendChild(tag);
  }

  /* ─────────────────────────────────────────────
     RENDER del dropdown según estado de sesión
  ───────────────────────────────────────────── */
  function renderDropdown(dropdown) {
    var usuario = obtenerUsuario();

    if (usuario) {
      /* ── USUARIO LOGUEADO ── */
      dropdown.innerHTML = `
        <div class="sesion-info-usuario">
          <span class="sesion-nombre">${usuario.nombre}</span>
          <span class="sesion-email">${usuario.email || ""}</span>
        </div>
        <hr class="sesion-divider">
        <a class="sesion-btn-cuenta" href="cuenta.html">Mi cuenta</a>
        <button class="sesion-btn-logout" id="sesion-btn-logout">Cerrar sesión</button>
      `;

      var btnLogout = dropdown.querySelector("#sesion-btn-logout");
      if (btnLogout) {
        btnLogout.addEventListener("click", function () {
          eliminarUsuario();
          actualizarIcono();
          renderDropdown(dropdown);
          /* Si estamos en cuenta.html, redirigir al inicio */
          if (window.location.pathname.endsWith("cuenta.html")) {
            window.location.href = "index.html";
          }
        });
      }
    } else {
      /* ── NO HAY SESIÓN: mostrar formulario ── */
      dropdown.innerHTML = `
        <h4>Iniciar sesión</h4>
        <input class="sesion-campo" id="sesion-nombre" type="text" placeholder="Nombre de usuario" maxlength="20" autocomplete="username">
        <input class="sesion-campo" id="sesion-email"  type="email" placeholder="Correo electrónico" autocomplete="email">
        <input class="sesion-campo" id="sesion-pass"   type="password" placeholder="Contraseña" autocomplete="current-password">
        <button class="sesion-btn-login" id="sesion-btn-entrar">ENTRAR / REGISTRARSE</button>
        <p class="sesion-error" id="sesion-error">Completá todos los campos.</p>
      `;

      var btnEntrar = dropdown.querySelector("#sesion-btn-entrar");
      if (btnEntrar) {
        btnEntrar.addEventListener("click", function () {
          var nombre = dropdown.querySelector("#sesion-nombre").value.trim();
          var email  = dropdown.querySelector("#sesion-email").value.trim();
          var pass   = dropdown.querySelector("#sesion-pass").value;
          var error  = dropdown.querySelector("#sesion-error");

          if (!nombre || !email || !pass) {
            error.style.display = "block";
            return;
          }
          error.style.display = "none";

          var usuario = { nombre: nombre, email: email };
          guardarUsuario(usuario);
          actualizarIcono();
          renderDropdown(dropdown);

          /* Actualizar placeholder del input de comunidad si existe (laEmpleada) */
          var inputCom = document.getElementById("input-comunidad");
          if (inputCom) inputCom.placeholder = "Comentar como " + nombre;
          var labelRes = document.getElementById("nombre-usuario-resena");
          if (labelRes) labelRes.textContent = nombre;
        });

        /* Enviar con Enter */
        dropdown.querySelectorAll(".sesion-campo").forEach(function (campo) {
          campo.addEventListener("keydown", function (e) {
            if (e.key === "Enter") btnEntrar.click();
          });
        });
      }
    }
  }

  /* ─────────────────────────────────────────────
     ÍCONO: amarillo si hay sesión
  ───────────────────────────────────────────── */
  function actualizarIcono() {
    var iconos = document.querySelectorAll(".barra-icono-usuario");
    var logueado = !!obtenerUsuario();
    iconos.forEach(function (icono) {
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
     INIT: convertir cada .barra-icono-usuario en
     un botón con dropdown (en todas las páginas
     excepto cuenta.html donde va directo)
  ───────────────────────────────────────────── */
  function init() {
    inyectarEstilos();
    actualizarIcono();

    /* En cuenta.html el ícono sigue siendo un link normal;
       el logout lo maneja cuenta.js. Sólo actualizamos el color. */
    var esCuentaHtml = window.location.pathname.endsWith("cuenta.html");
    if (esCuentaHtml) return;

    var iconos = document.querySelectorAll(".barra-icono-usuario");

    iconos.forEach(function (icono) {
      /* Evitar doble inicialización */
      if (icono.dataset.sesionInit) return;
      icono.dataset.sesionInit = "1";

      /* Convertir <a> en botón visual (mantener accesibilidad) */
      icono.removeAttribute("href");
      icono.setAttribute("role", "button");
      icono.setAttribute("tabindex", "0");
      icono.style.cursor = "pointer";

      /* Crear wrapper relativo */
      var wrapper = document.createElement("div");
      wrapper.className = "barra-icono-usuario-wrapper";
      icono.parentNode.insertBefore(wrapper, icono);
      wrapper.appendChild(icono);

      /* Crear dropdown */
      var dropdown = document.createElement("div");
      dropdown.className = "sesion-dropdown oculto";
      wrapper.appendChild(dropdown);

      function abrirDropdown() {
        renderDropdown(dropdown);
        dropdown.classList.remove("oculto");
      }

      function cerrarDropdown() {
        dropdown.classList.add("oculto");
      }

      /* Toggle al hacer click en el ícono */
      icono.addEventListener("click", function (e) {
        e.stopPropagation();
        if (dropdown.classList.contains("oculto")) {
          abrirDropdown();
        } else {
          cerrarDropdown();
        }
      });

      icono.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          icono.click();
        }
      });

      /* Cerrar al hacer click fuera */
      document.addEventListener("click", function (e) {
        if (!wrapper.contains(e.target)) {
          cerrarDropdown();
        }
      });
    });
  }

  /* ─────────────────────────────────────────────
     API pública: permite que otras partes de la
     página (ej: modal de "iniciar sesión para
     calificar" en el Top 5 de index.html) reutilicen
     la misma lógica de login sin duplicar código.
  ───────────────────────────────────────────── */
  window.cinefiloSesion = {
    obtenerUsuario: obtenerUsuario,
    guardarUsuario: guardarUsuario,
    eliminarUsuario: eliminarUsuario,
    actualizarIcono: actualizarIcono
  };

  /* Esperar al DOM */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();