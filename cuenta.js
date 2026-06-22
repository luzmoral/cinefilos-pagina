/*
 * cuenta.js — Lógica de la página Mi Cuenta (cuenta.html)
 * Maneja perfil, favoritos dinámicos, comentarios dinámicos y cierre de sesión.
 */

document.addEventListener("DOMContentLoaded", function () {

  var CLAVE_USUARIO    = "usuarioCinefilo";
  var CLAVE_FAVORITOS  = "cinefilo_favoritos";
  var CLAVE_COMENTARIOS = "cinefilo_comentarios";
  var CLAVE_CALIFICACIONES = "cinefilo_calificaciones";

  /* ── Ícono de usuario: amarillo si hay sesión ── */
  var iconoUsuario = document.querySelector(".barra-icono-usuario");
  var usuario = obtenerUsuario();

  if (iconoUsuario && usuario) {
    iconoUsuario.classList.add("logueado");
    iconoUsuario.style.color = "#e5d600";
  }

  /* ── Lógica exclusiva de cuenta.html ── */
  var btnCerrar = document.getElementById("btn-cerrar-sesion");
  if (!btnCerrar) return;

  if (usuario) {
    mostrarPerfil(usuario);
  }

  renderFavoritos();
  renderComentarios();
  renderCalificaciones();

  /* Delegación de eventos: un solo listener por contenedor, así
     funciona aunque las tarjetas se vuelvan a dibujar al borrar algo */
  var listaFavoritos = document.getElementById("lista-favoritos");
  var listaComentarios = document.getElementById("lista-comentarios");
  var listaCalificaciones = document.getElementById("lista-calificaciones");

  if (listaFavoritos) {
    listaFavoritos.addEventListener("click", function (e) {
      var btn = e.target.closest(".card-eliminar");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      eliminarFavorito(parseInt(btn.getAttribute("data-idx"), 10));
    });
  }

  if (listaComentarios) {
    listaComentarios.addEventListener("click", function (e) {
      var btn = e.target.closest(".card-eliminar");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      eliminarComentario(parseInt(btn.getAttribute("data-idx"), 10));
    });
  }

  if (listaCalificaciones) {
    listaCalificaciones.addEventListener("click", function (e) {
      var btn = e.target.closest(".card-eliminar");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      eliminarCalificacion(parseInt(btn.getAttribute("data-idx"), 10));
    });
  }

  btnCerrar.addEventListener("click", cerrarSesion);

  /* ─────────────── Funciones auxiliares ─────────────── */

  function obtenerUsuario() {
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE_USUARIO));
      if (datos) return datos;
      var nombre = localStorage.getItem("usuario_nombre");
      if (!nombre) return null;
      return { nombre: nombre, email: localStorage.getItem("usuario_email") || "" };
    } catch (e) { return null; }
  }

  function mostrarPerfil(u) {
    var elNombre = document.getElementById("perfil-nombre");
    var elEmail  = document.getElementById("perfil-email");
    var elComentariosN = document.getElementById("stat-comentarios");
    var elCalif  = document.getElementById("stat-calificaciones");

    if (elNombre) elNombre.textContent = u.nombre;
    if (elEmail) { elEmail.textContent = u.email; elEmail.href = "mailto:" + u.email; }

    /* Contar desde localStorage */
    var comentarios = obtenerComentarios();
    var califs      = obtenerCalificaciones().length;
    if (elComentariosN) elComentariosN.textContent = comentarios.length;
    if (elCalif)        elCalif.textContent         = califs;

    document.querySelectorAll(".comentario-nombre").forEach(function (el) {
      el.textContent = u.nombre;
    });
  }

  function obtenerFavoritos() {
    try { return JSON.parse(localStorage.getItem(CLAVE_FAVORITOS)) || []; }
    catch (e) { return []; }
  }

  function obtenerComentarios() {
    try { return JSON.parse(localStorage.getItem(CLAVE_COMENTARIOS)) || []; }
    catch (e) { return []; }
  }

  function obtenerCalificaciones() {
    try { return JSON.parse(localStorage.getItem(CLAVE_CALIFICACIONES)) || []; }
    catch (e) { return []; }
  }

  function setFavoritos(arr) {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(arr));
  }

  function setComentarios(arr) {
    localStorage.setItem(CLAVE_COMENTARIOS, JSON.stringify(arr));
  }

  function setCalificaciones(arr) {
    localStorage.setItem(CLAVE_CALIFICACIONES, JSON.stringify(arr));
  }

  function actualizarStats() {
    var elComentariosN = document.getElementById("stat-comentarios");
    var elCalif        = document.getElementById("stat-calificaciones");
    if (elComentariosN) elComentariosN.textContent = obtenerComentarios().length;
    if (elCalif)        elCalif.textContent         = obtenerCalificaciones().length;
  }

  /* ── Eliminar un favorito, comentario o calificación ── */
  function eliminarFavorito(idx) {
    var favs = obtenerFavoritos();
    if (idx < 0 || idx >= favs.length) return;
    favs.splice(idx, 1);
    setFavoritos(favs);
    renderFavoritos();
  }

  function eliminarComentario(idx) {
    var coms = obtenerComentarios();
    if (idx < 0 || idx >= coms.length) return;
    coms.splice(idx, 1);
    setComentarios(coms);
    renderComentarios();
    actualizarStats();
  }

  function eliminarCalificacion(idx) {
    var calfs = obtenerCalificaciones();
    if (idx < 0 || idx >= calfs.length) return;
    calfs.splice(idx, 1);
    setCalificaciones(calfs);
    renderCalificaciones();
    actualizarStats();
  }

  /* ─── RENDER FAVORITOS ─── */
  function renderFavoritos() {
    var contenedor = document.getElementById("lista-favoritos");
    if (!contenedor) return;

    var favoritos = obtenerFavoritos();
    contenedor.innerHTML = "";

    /* Mostrar siempre 4 slots */
    var SLOTS = 4;
    for (var i = 0; i < SLOTS; i++) {
      var fav = favoritos[i] || null;
      var card = document.createElement(fav ? "a" : "div");
      card.className = "fav-card";

      if (fav) {
        card.href = fav.url || "#";
        card.innerHTML =
          '<button class="card-eliminar" type="button" data-idx="' + i + '" aria-label="Quitar de favoritos">&times;</button>' +
          '<img src="' + fav.imagen + '" alt="' + escHtml(fav.titulo) + '" onerror="this.style.display=\'none\'">' +
          '<div class="fav-card-overlay">' +
            '<span class="fav-card-titulo">' + escHtml(fav.titulo) + '</span>' +
          '</div>';
      } else {
        card.className += " fav-card--vacio";
        card.innerHTML =
          '<div class="fav-card-vacio-contenido">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="32" height="32"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
            '<span>Guardá tus artículos favoritos</span>' +
          '</div>';
      }

      contenedor.appendChild(card);
    }
  }

  /* ─── RENDER COMENTARIOS ─── */
  function renderComentarios() {
    var contenedor = document.getElementById("lista-comentarios");
    if (!contenedor) return;

    var comentarios = obtenerComentarios();
    contenedor.innerHTML = "";

    var SLOTS = 4;
    var u = obtenerUsuario();
    var nombreUsuario = u ? u.nombre : "Vos";

    for (var i = 0; i < SLOTS; i++) {
      var com = comentarios[i] || null;
      var card = document.createElement("div");
      card.className = "comentario-card";

      if (com) {
        card.innerHTML =
          '<button class="card-eliminar" type="button" data-idx="' + i + '" aria-label="Eliminar comentario">&times;</button>' +
          '<div class="comentario-header">' +
            '<div class="comentario-avatar">' +
              '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<circle cx="20" cy="15" r="9" fill="#aaa"/>' +
                '<ellipse cx="20" cy="36" rx="14" ry="10" fill="#aaa"/>' +
              '</svg>' +
            '</div>' +
            '<div class="comentario-info">' +
              '<p class="comentario-nombre">' + escHtml(nombreUsuario) + '</p>' +
              '<p class="comentario-pelicula">&ldquo;' + escHtml(com.articulo) + '&rdquo;</p>' +
            '</div>' +
          '</div>' +
          '<p class="comentario-texto">' + escHtml(com.texto) + '</p>';
      } else {
        card.className += " comentario-card--vacio";
        card.innerHTML =
          '<div class="comentario-vacio-contenido">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
            '<span>Tus comentarios van a aparecer acá</span>' +
          '</div>';
      }

      contenedor.appendChild(card);
    }
  }

  /* ─── RENDER PELÍCULAS CALIFICADAS ─── */
  function renderCalificaciones() {
    var contenedor = document.getElementById("lista-calificaciones");
    if (!contenedor) return;

    var calificaciones = obtenerCalificaciones();
    contenedor.innerHTML = "";

    var SLOTS = 4;
    for (var i = 0; i < SLOTS; i++) {
      var c = calificaciones[i] || null;
      var card = document.createElement(c ? "a" : "div");
      card.className = "calificacion-card";

      if (c) {
        card.href = c.url || "#";
        var valor = parseInt(c.valor) || 0;
        var estrellas = "★★★★★".slice(0, valor) + "☆☆☆☆☆".slice(0, 5 - valor);
        card.innerHTML =
          '<button class="card-eliminar" type="button" data-idx="' + i + '" aria-label="Quitar calificación">&times;</button>' +
          '<img src="' + c.imagen + '" alt="' + escHtml(c.titulo) + '" onerror="this.style.display=\'none\'">' +
          '<div class="calificacion-card-estrellas">' + estrellas + '</div>';
      } else {
        card.className += " calificacion-card--vacio";
        card.innerHTML =
          '<div class="calificacion-vacio-contenido">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
            '<span>Tus películas calificadas van a aparecer acá</span>' +
          '</div>';
      }

      contenedor.appendChild(card);
    }
  }

  function cerrarSesion() {
    localStorage.removeItem(CLAVE_USUARIO);
    localStorage.removeItem("usuario_nombre");
    localStorage.removeItem("usuario_email");
    localStorage.removeItem("usuario_comentarios");
    localStorage.removeItem("usuario_calificaciones");
    localStorage.removeItem(CLAVE_FAVORITOS);
    localStorage.removeItem(CLAVE_COMENTARIOS);
    localStorage.removeItem(CLAVE_CALIFICACIONES);
    window.location.href = "index.html";
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

});
