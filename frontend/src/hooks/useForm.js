import { useState } from "react";

export default function useForm(valoresIniciales) {
  const [valores, setValores] = useState(valoresIniciales);

  const cambiar = (evento) => {
    const { name, type, value, checked } = evento.target;

    setValores((anteriores) => ({
      ...anteriores,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const reiniciar = () => setValores(valoresIniciales);

  return { valores, cambiar, reiniciar, setValores };
}
