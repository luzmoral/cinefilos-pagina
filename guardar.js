/*
 * guardar.js — Guardar favoritos y comentarios en localStorage
 * Se incluye en todas las páginas de artículos (noticia1-4, laEmpleada, etc.)
 *
 * Requiere que la página defina en el HTML:
 *   <meta name="articulo-titulo" content="Título del artículo">
 *   <meta name="articulo-imagen" content="imagenes/ruta.jpg">
 *   <meta name="articulo-url"    content="noticia1.html">
 */

(function () {
  "use strict";

  var CLAVE_FAVORITOS   = "cinefilo_favoritos";
  var CLAVE_COMENTARIOS = "cinefilo_comentarios";
  var CLAVE_CALIFICACIONES = "cinefilo_calificaciones";
  var CLAVE_USUARIO     = "usuarioCinefilo";
  var MAX_ITEMS         = 4;

  /* Leer meta del artículo actual */
  function getMeta(nombre) {
    var el = document.querySelector('meta[name="' + nombre + '"]');
    return el ? el.getAttribute("content") : "";
  }

  function obtenerInfoArticulo() {
    return {
      titulo:  getMeta("articulo-titulo") || document.title || "Artículo",
      imagen:  getMeta("articulo-imagen") || "",
      url:     getMeta("articulo-url")    || window.location.pathname.split("/").pop()
    };
  }

  /* localStorage helpers */
  function getFavoritos() {
    try { return JSON.parse(localStorage.getItem(CLAVE_FAVORITOS)) || []; }
    catch (e) { return []; }
  }

  function setFavoritos(arr) {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(arr));
  }

  function getComentarios() {
    try { return JSON.parse(localStorage.getItem(CLAVE_COMENTARIOS)) || []; }
    catch (e) { return []; }
  }

  function setComentarios(arr) {
    localStorage.setItem(CLAVE_COMENTARIOS, JSON.stringify(arr));
  }

  function getCalificaciones() {
    try { return JSON.parse(localStorage.getItem(CLAVE_CALIFICACIONES)) || []; }
    catch (e) { return []; }
  }

  function setCalificaciones(arr) {
    localStorage.setItem(CLAVE_CALIFICACIONES, JSON.stringify(arr));
  }

  function estaLogueado() {
    try {
      return !!JSON.parse(localStorage.getItem(CLAVE_USUARIO));
    } catch (e) { return false; }
  }

  /*¿Ya es favorito? */
  function esFavorito(url) {
    return getFavoritos().some(function (f) { return f.url === url; });
  }

  /* Guardar / quitar favorito  */
  function toggleFavorito(info, btn) {
    var favs = getFavoritos();
    var idx  = favs.findIndex(function (f) { return f.url === info.url; });

    if (idx >= 0) {
      /* Quitar */
      favs.splice(idx, 1);
      setFavoritos(favs);
      actualizarBtnFav(btn, false);
    } else {
      /* Agregar al inicio, máximo MAX_ITEMS */
      favs.unshift({ titulo: info.titulo, imagen: info.imagen, url: info.url });
      if (favs.length > MAX_ITEMS) favs = favs.slice(0, MAX_ITEMS);
      setFavoritos(favs);
      actualizarBtnFav(btn, true);
    }
  }

  function actualizarBtnFav(btn, guardado) {
    if (!btn) return;
    if (guardado) {
      btn.classList.add("guardado");
      btn.querySelector(".fav-btn-texto").textContent = "Guardado en favoritos";
    } else {
      btn.classList.remove("guardado");
      btn.querySelector(".fav-btn-texto").textContent = "Guardar en favoritos";
    }
  }

  /* Guardar comentario */
  function guardarComentario(texto, articulo) {
    var coms = getComentarios();
    coms.unshift({ texto: texto, articulo: articulo, fecha: Date.now() });
    if (coms.length > MAX_ITEMS) coms = coms.slice(0, MAX_ITEMS);
    setComentarios(coms);

    /* Actualizar contador de comentarios en usuario */
    var u = null;
    try { u = JSON.parse(localStorage.getItem(CLAVE_USUARIO)); } catch(e) {}
    if (u) {
      u.comentarios = (parseInt(u.comentarios) || 0) + 1;
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(u));
      localStorage.setItem("usuario_comentarios", u.comentarios);
    }
  }

  /* Guardar calificación (con datos de la película)*/
  function guardarCalificacion(info, valor) {
    var calfs = getCalificaciones();
    var idx   = calfs.findIndex(function (c) { return c.url === info.url; });
    var nueva = { titulo: info.titulo, imagen: info.imagen, url: info.url, valor: valor };

    if (idx >= 0) {
      /* Ya la habías calificado: actualizamos el valor y la subimos al frente */
      calfs.splice(idx, 1);
    }
    calfs.unshift(nueva);
    if (calfs.length > MAX_ITEMS) calfs = calfs.slice(0, MAX_ITEMS);
    setCalificaciones(calfs);

    /* Mantener el contador del perfil sincronizado */
    var u = null;
    try { u = JSON.parse(localStorage.getItem(CLAVE_USUARIO)); } catch(e) {}
    if (u) {
      u.calificaciones = calfs.length;
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(u));
      localStorage.setItem("usuario_calificaciones", u.calificaciones);
    }
  }

  /* Crear botón de favorito e inyectarlo */
  function inyectarBotonFavorito(info) {
    /* Si ya existe, no duplicar */
    if (document.getElementById("btn-guardar-favorito")) return;

    var btn = document.createElement("button");
    btn.id        = "btn-guardar-favorito";
    btn.className = "btn-favorito" + (esFavorito(info.url) ? " guardado" : "");
    btn.type      = "button";
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (esFavorito(info.url) ? "#e5d600" : "none") + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>' +
      '</svg>' +
      '<span class="fav-btn-texto">' + (esFavorito(info.url) ? "Guardado en favoritos" : "Guardar en favoritos") + '</span>';

    btn.addEventListener("click", function () {
      if (!estaLogueado()) {
        /* Abrir dropdown de sesión si existe, si no, alert simple */
        var iconoU = document.querySelector(".barra-icono-usuario");
        if (iconoU) {
          iconoU.click();
        } else {
          alert("Iniciá sesión para guardar favoritos.");
        }
        return;
      }
      toggleFavorito(info, btn);
    });

    /* Buscar dónde insertarlo: debajo del h1 del encabezado */
    var encabezado = document.querySelector(".encabezado-articulo");
    if (encabezado) {
      encabezado.appendChild(btn);
      return;
    }
    /* Fallback: debajo del título de la película en laEmpleada */
    var cabecera = document.querySelector(".cabecera-pelicula h1");
    if (cabecera) {
      cabecera.insertAdjacentElement("afterend", btn);
      return;
    }
    /* Último recurso: antes del main */
    var main = document.querySelector("main");
    if (main) main.prepend(btn);
  }

  /* HOOK en interaccion.js: escuchar comentario */
  function hookComentarios(info) {
    /* Esperar a que interaccion.js registre el botón enviar */
    var intento = 0;
    var MAX     = 20;

    function intentar() {
      intento++;
      var btnEnviar = document.getElementById("btn-enviar-resena");
      var input     = document.getElementById("input-comentario-resena");
      var btnCalif  = document.getElementById("btn-accion-calificar");

      if (btnEnviar && input) {
        /* Parchear: cuando el formulario se envía, guardar el texto */
        btnEnviar.addEventListener("click", function () {
          var texto = input.value.trim();
          if (texto) guardarComentario(texto, info.titulo);
        }, true); /* capture=true para ejecutarse antes que interaccion.js */
      }

      if (btnCalif) {
        btnCalif.addEventListener("click", function () {
          var estrellas = document.querySelectorAll("#calificacion-estrellas span.activa").length;
          if (estrellas > 0) guardarCalificacion(info, estrellas);
        }, true);
      }

      if ((!btnEnviar || !input) && intento < MAX) {
        setTimeout(intentar, 150);
      }
    }
    intentar();
  }

  /* ── INIT ── */
  function init() {
    var info = obtenerInfoArticulo();
    if (!info.titulo && !info.imagen) return; /* No es una página de artículo */

    inyectarBotonFavorito(info);
    hookComentarios(info);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
