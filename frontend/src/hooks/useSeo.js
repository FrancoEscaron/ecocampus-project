import { useEffect } from "react";
import { toAbsoluteUrl } from "../utils/seo";

export default function useSeo({
  titulo,
  descripcion = "",
  ruta,
  imagen = "",
  tipo = "website",
  jsonLd,
  noindex = false,
}) {
  const jsonLdTexto = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const url = toAbsoluteUrl(ruta || window.location.pathname);
    const imagenAbsoluta = toAbsoluteUrl(imagen);
    const descripcionTag = document.head.querySelector('meta[name="description"]');
    const descripcionAnterior = descripcionTag?.getAttribute("content") || "";
    const creados = [];

    document.title = titulo;

    if (descripcionTag && descripcion) {
      descripcionTag.setAttribute("content", descripcion);
    }

    const setMeta = (atributo, clave, contenido) => {
      let etiqueta = document.head.querySelector(`meta[${atributo}="${clave}"]`);

      if (!etiqueta) {
        etiqueta = document.createElement("meta");
        etiqueta.setAttribute(atributo, clave);
        document.head.appendChild(etiqueta);
        creados.push(etiqueta);
      }

      etiqueta.setAttribute("content", contenido);
    };

    setMeta("property", "og:title", titulo);
    setMeta("property", "og:description", descripcion);
    setMeta("property", "og:type", tipo);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:card", imagenAbsoluta ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", titulo);
    setMeta("name", "twitter:description", descripcion);

    if (imagenAbsoluta) {
      setMeta("property", "og:image", imagenAbsoluta);
      setMeta("name", "twitter:image", imagenAbsoluta);
    }

    let canonical = document.head.querySelector('link[rel="canonical"]');
    const canonicalCreado = !canonical;

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    if (noindex) {
      canonical.remove();
      setMeta("name", "robots", "noindex, follow");
    } else {
      canonical.href = url;
    }

    let scriptJsonLd = null;

    if (jsonLdTexto && !noindex) {
      scriptJsonLd = document.createElement("script");
      scriptJsonLd.type = "application/ld+json";
      scriptJsonLd.textContent = jsonLdTexto;
      document.head.appendChild(scriptJsonLd);
    }

    return () => {
      document.title = "EcoCampus";

      if (descripcionTag && descripcion) {
        descripcionTag.setAttribute("content", descripcionAnterior);
      }

      creados.forEach((etiqueta) => etiqueta.remove());
      if (canonicalCreado) canonical.remove();
      if (scriptJsonLd) scriptJsonLd.remove();
    };
  }, [titulo, descripcion, ruta, imagen, tipo, jsonLdTexto, noindex]);
}
