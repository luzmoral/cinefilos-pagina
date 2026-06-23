/*
 * carrusel.js — Lógica de las flechas, arrastre y puntos para los
 * carruseles de tipo ".carrusel-noticias" (ej: "Los favoritos de la
 * comunidad" en entrevista.html, novedades.html, resenas.html, etc.)
 *
 * La misma lógica vive embebida en index.html; este archivo permite
 * reutilizarla en el resto de las páginas sin duplicar código.
 */

document.addEventListener("DOMContentLoaded", function () {

  const carruselSecciones = Array.from(document.querySelectorAll(".carrusel-noticias")).map(function (seccion) {
    return {
      pista: seccion.querySelector(".carrusel-pista"),
      miniNoticias: Array.from(seccion.querySelectorAll(".mini-noticia")),
      puntosCarrusel: Array.from(seccion.querySelectorAll(".carrusel-puntos span")),
      botonIzquierda: seccion.querySelector(".carrusel-flecha-izquierda"),
      botonDerecha: seccion.querySelector(".carrusel-flecha-derecha"),
      arrastrando: false,
      inicioArrastreX: 0,
      inicioScrollX: 0
    };
  });

  if (carruselSecciones.length === 0) return;

  function actualizarPuntoCarrusel(estado) {
    if (!estado.pista || estado.miniNoticias.length === 0 || estado.puntosCarrusel.length === 0) {
      return;
    }

    const centroVisible = estado.pista.getBoundingClientRect().left + estado.pista.clientWidth / 2;
    let indiceActivo = 0;
    let distanciaMenor = Infinity;

    estado.miniNoticias.forEach(function (noticia, indice) {
      const rect = noticia.getBoundingClientRect();
      const centroNoticia = rect.left + rect.width / 2;
      const distancia = Math.abs(centroVisible - centroNoticia);

      if (distancia < distanciaMenor) {
        distanciaMenor = distancia;
        indiceActivo = indice;
      }
    });

    estado.puntosCarrusel.forEach(function (punto, indice) {
      punto.classList.toggle("activo", indice === indiceActivo);
    });
  }

  const UMBRAL_ARRASTRE = 10; // px: por debajo de esto, se considera un click, no un arrastre

  function cancelarClickSiHuboArrastre(pista) {
    function cancelarUnaVez(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      pista.removeEventListener("click", cancelarUnaVez, true);
    }
    pista.addEventListener("click", cancelarUnaVez, true);
  }

  function iniciarArrastreCarrusel(estado, evento) {
    if (!estado.pista) {
      return;
    }

    estado.arrastrando = true;
    estado.arrastreReal = false;
    estado.inicioArrastreX = evento.clientX;
    estado.inicioScrollX = estado.pista.scrollLeft;
    estado.pointerIdActual = evento.pointerId;
  }

  function moverCarrusel(estado, evento) {
    if (!estado.arrastrando || !estado.pista) {
      return;
    }

    const diferencia = evento.clientX - estado.inicioArrastreX;

    if (!estado.arrastreReal && Math.abs(diferencia) > UMBRAL_ARRASTRE) {
      estado.arrastreReal = true;
      estado.pista.classList.add("arrastrando");
      if (typeof estado.pista.setPointerCapture === "function") {
        estado.pista.setPointerCapture(evento.pointerId);
      }
    }

    if (estado.arrastreReal) {
      estado.pista.scrollLeft = estado.inicioScrollX - diferencia;
      actualizarPuntoCarrusel(estado);
    }
  }

  function terminarArrastreCarrusel(estado, evento) {
    if (!estado.pista) {
      return;
    }

    if (estado.arrastreReal) {
      cancelarClickSiHuboArrastre(estado.pista);
    }

    estado.arrastrando = false;
    estado.arrastreReal = false;
    estado.pista.classList.remove("arrastrando");

    if (evento && typeof estado.pista.hasPointerCapture === "function" && estado.pista.hasPointerCapture(evento.pointerId)) {
      estado.pista.releasePointerCapture(evento.pointerId);
    }
  }

  function moverConFlecha(estado, direccion) {
    if (!estado.pista || estado.miniNoticias.length === 0) {
      return;
    }

    const anchoTarjeta = estado.miniNoticias[0].getBoundingClientRect().width;
    estado.pista.scrollBy({
      left: anchoTarjeta * direccion,
      behavior: "smooth"
    });
  }

  carruselSecciones.forEach(function (estado) {
    if (!estado.pista || estado.miniNoticias.length === 0 || estado.puntosCarrusel.length === 0) {
      return;
    }

    estado.pista.addEventListener("scroll", function () {
      actualizarPuntoCarrusel(estado);
    }, { passive: true });

    estado.pista.addEventListener("pointerdown", function (evento) {
      iniciarArrastreCarrusel(estado, evento);
    });

    estado.pista.addEventListener("pointermove", function (evento) {
      moverCarrusel(estado, evento);
    });

    estado.pista.addEventListener("pointerup", function (evento) {
      terminarArrastreCarrusel(estado, evento);
    });

    estado.pista.addEventListener("pointercancel", function (evento) {
      terminarArrastreCarrusel(estado, evento);
    });

    estado.pista.addEventListener("pointerleave", function (evento) {
      terminarArrastreCarrusel(estado, evento);
    });

    if (estado.botonIzquierda) {
      estado.botonIzquierda.addEventListener("click", function () {
        moverConFlecha(estado, -1);
      });
    }

    if (estado.botonDerecha) {
      estado.botonDerecha.addEventListener("click", function () {
        moverConFlecha(estado, 1);
      });
    }

    window.addEventListener("resize", function () {
      actualizarPuntoCarrusel(estado);
    });

    window.addEventListener("load", function () {
      actualizarPuntoCarrusel(estado);
    });

    actualizarPuntoCarrusel(estado);
  });

});
