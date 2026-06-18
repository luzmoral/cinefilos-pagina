/*
 * cuenta.js — Lógica de perfil + estado del ícono de usuario en la barra
 * Cinefilos
 */

document.addEventListener("DOMContentLoaded", function () {

  /* ── 1. Ícono de usuario en la barra: amarillo si hay sesión ── */
  const iconoUsuario = document.querySelector(".barra-icono-usuario");
  const estaLogueado = !!localStorage.getItem("usuario_nombre");

  if (iconoUsuario && estaLogueado) {
    iconoUsuario.classList.add("logueado");
  }

  /* ── 2. Lógica exclusiva de cuenta.html ─────────────────────── */
  const btnCerrar = document.getElementById("btn-cerrar-sesion");
  if (!btnCerrar) return; // No estamos en cuenta.html → salir

  const usuario = obtenerUsuario();
  if (usuario) {
    mostrarPerfil(usuario);
  }

  btnCerrar.addEventListener("click", cerrarSesion);
});

/* ─────────────────────────────────────────────────────────────────
   Funciones
───────────────────────────────────────────────────────────────── */

/**
 * Lee los datos del usuario desde localStorage.
 * Reemplazá con tu fuente real (fetch a tu API, sessionStorage, etc.)
 */
function obtenerUsuario() {
  const nombre = localStorage.getItem("usuario_nombre");
  if (!nombre) return null;

  return {
    nombre:         nombre,
    email:          localStorage.getItem("usuario_email")          || "",
    comentarios:    localStorage.getItem("usuario_comentarios")    || 0,
    calificaciones: localStorage.getItem("usuario_calificaciones") || 0
  };
}

/** Vuelca los datos del usuario en los elementos del DOM. */
function mostrarPerfil(usuario) {
  var elNombre         = document.getElementById("perfil-nombre");
  var elEmail          = document.getElementById("perfil-email");
  var elComentarios    = document.getElementById("stat-comentarios");
  var elCalificaciones = document.getElementById("stat-calificaciones");

  if (elNombre)         elNombre.textContent       = usuario.nombre;
  if (elEmail) {
    elEmail.textContent = usuario.email;
    elEmail.href        = "mailto:" + usuario.email;
  }
  if (elComentarios)    elComentarios.textContent    = usuario.comentarios;
  if (elCalificaciones) elCalificaciones.textContent = usuario.calificaciones;

  /* Nombre en las cards de comentarios */
  document.querySelectorAll("[id^='comentario-nombre-']").forEach(function (el) {
    el.textContent = usuario.nombre;
  });
}

/**
 * Cierra la sesión: limpia localStorage y redirige al inicio.
 * Adaptá según tu sistema de autenticación.
 */
function cerrarSesion() {
  localStorage.removeItem("usuario_nombre");
  localStorage.removeItem("usuario_email");
  localStorage.removeItem("usuario_comentarios");
  localStorage.removeItem("usuario_calificaciones");
  window.location.href = "index.html";
}