import { useCallback, useEffect, useState } from "react";

export default function useCarga(cargar, mensajeError, activo = true) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const ejecutar = useCallback(async () => {
    try {
      const { respuesta, datos: respuestaDatos } = await cargar();

      if (!respuesta.ok || !respuestaDatos?.success) {
        return { ok: false, datos: null };
      }

      return { ok: true, datos: respuestaDatos.data };
    } catch {
      return { ok: false, datos: null };
    }
  }, [cargar]);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError("");

    const resultado = await ejecutar();

    if (!resultado.ok) {
      setError(mensajeError);
      setCargando(false);
      return null;
    }

    setDatos(resultado.datos);
    setCargando(false);
    return resultado.datos;
  }, [ejecutar, mensajeError]);

  useEffect(() => {
    if (!activo) return;

    let vigente = true;

    const cargarInicial = async () => {
      const resultado = await ejecutar();
      if (!vigente) return;

      if (resultado.ok) {
        setDatos(resultado.datos);
      } else {
        setError(mensajeError);
      }

      setCargando(false);
    };

    cargarInicial();

    return () => {
      vigente = false;
    };
  }, [activo, ejecutar, mensajeError]);

  return {
    datos,
    cargando: activo ? cargando : false,
    error: activo ? error : "",
    recargar,
  };
}
