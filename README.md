# MAQUETADO HTML GEMINI
<!DOCTYPE html>
<html lang="es">
<head>
    </head>
<body>

    <header>
        <div class="logo-container">
            </div>
        <nav>
            <ul>
                <li><a href="#cursos">Cursos</a></li>
                <li><a href="#como-funciona">¿Cómo pago con acciones?</a></li>
                <li><a href="#impacto">Nuestro Impacto</a></li>
            </ul>
        </nav>
        <div class="user-actions">
            </div>
    </header>

    <main>
        
        <section id="hero">
            <div class="hero-content">
                <h1>Aprende y cambia el mundo. Paga tus cursos con acciones sustentables.</h1>
                <p>Usa tu dinero, tu esfuerzo ecológico, o una mezcla de ambos.</p>
                <button class="cta-primary">Explorar Cursos</button>
            </div>
            <div class="hero-image">
                </div>
        </section>

        <section id="como-funciona">
            <h2>El Sistema de Pago EcoCampus</h2>
            <div class="steps-container">
                <article class="step">
                    <h3>1. Elige tu curso</h3>
                    <p>Encuentra tu pasión en nuestro catálogo.</p>
                </article>
                <article class="step">
                    <h3>2. Define tu método de pago</h3>
                    <p>Selecciona qué porcentaje pagarás con dinero y qué porcentaje con acciones (ej. plantar árboles, reciclaje).</p>
                </article>
                <article class="step">
                    <h3>3. Sube tu evidencia</h3>
                    <p>Valida tu impacto en nuestro sistema.</p>
                </article>
                <article class="step">
                    <h3>4. ¡Desbloquea tu aprendizaje!</h3>
                </article>
            </div>
        </section>

        <section id="cursos-destacados">
            <h2>Cursos Populares</h2>
            <div class="course-grid">
                
                <article class="course-card">
                    <div class="course-thumbnail"></div>
                    <div class="course-info">
                        <h3>Introducción al Desarrollo Web</h3>
                        <p>Duración: 4 semanas</p>
                    </div>
                    <div class="course-pricing">
                        <span class="price-money">$50 USD</span>
                        <span class="price-separator">o</span>
                        <span class="price-eco">25 Eco-Acciones + $25 USD</span>
                    </div>
                    <button>Ver opciones de inscripción</button>
                </article>
                </div>
        </section>

        <section id="impacto-comunidad">
            <h2>Lo que hemos logrado juntos</h2>
            <div class="stats-container">
                <div class="stat"><span>1,500</span> Árboles plantados</div>
                <div class="stat"><span>500 kg</span> Plástico reciclado</div>
                <div class="stat"><span>3,000</span> Horas de educación</div>
            </div>
        </section>

    </main>

    <footer>
        <div class="footer-links">
            <section class="legal">
                <h4>Legal</h4>
                <ul>
                    <li>Términos y condiciones</li>
                    <li>Política de validación de acciones</li>
                </ul>
            </section>
            <section class="socials">
                </section>
        </div>
        <div class="footer-copyright">
            <p>&copy; 2026 EcoCampus. Educación que regenera el planeta.</p>
        </div>
    </footer>

</body>
</html>

# Para llevar este maquetado al siguiente nivel considerar lo siguiente:

El "Slider" de Pago Mixto: Cuando el usuario esté en el checkout, en lugar de botones estáticos, implementa un <input type="range"> (un slider). En un extremo está "100% Dinero" y en el otro "100% Acciones Sustentables". Al mover el slider, los montos se ajustan dinámicamente. Esto hace que la experiencia sea muy interactiva.

Taxonomía de Acciones: Debes estandarizar qué es una "acción".

Ejemplo de conversión: 1 kg de PET reciclado = 5 Eco-Puntos. 1 hora de voluntariado = 20 Eco-Puntos.

Panel de Usuario (Dashboard): Necesitarás estructurar una vista muy clara donde el usuario vea su estado: “Acciones en revisión”, “Acciones aprobadas” y “Cursos desbloqueados”.



# Maquetado de HTML PERPLEXITY
<body>
  <header>
    <div class="brand">
      <img src="logo.png" alt="EcoCampus">
      <div>
        <h1>EcoCampus</h1>
        <p>Aprendé pagando con acciones sustentables</p>
      </div>
    </div>

    <nav aria-label="Navegación principal">
      <ul>
        <li><a href="#inicio">Inicio</a></li>
        <li><a href="#como-funciona">Cómo funciona</a></li>
        <li><a href="#cursos">Cursos</a></li>
        <li><a href="#impacto">Impacto</a></li>
        <li><a href="#testimonios">Testimonios</a></li>
        <li><a href="#faq">Preguntas frecuentes</a></li>
        <li><a href="#contacto">Contacto</a></li>
      </ul>
    </nav>

    <div class="header-actions">
      <a href="#login">Ingresar</a>
      <a href="#registro">Crear cuenta</a>
    </div>
  </header>

  <main>
    <section id="inicio" class="hero">
      <h2>Educación accesible con impacto positivo</h2>
      <p>
        En EcoCampus podés pagar cursos con acciones sustentables, dinero electrónico,
        o combinando ambas opciones.
      </p>
      <div class="hero-actions">
        <a href="#cursos">Ver cursos</a>
        <a href="#como-funciona">Cómo pagar</a>
      </div>
      <figure>
        <img src="hero-ecocampus.jpg" alt="Personas aprendiendo y cuidando el ambiente">
        <figcaption>Aprender y generar impacto ambiental al mismo tiempo.</figcaption>
      </figure>
    </section>

    <section id="como-funciona">
      <h2>Cómo funciona</h2>
      <div class="steps">
        <article>
          <h3>1. Elegí tu curso</h3>
          <p>Seleccionás el curso que querés tomar según tu nivel o interés.</p>
        </article>
        <article>
          <h3>2. Calculá tu forma de pago</h3>
          <p>Podés pagar con porcentaje de acciones sustentables y completar con dinero.</p>
        </article>
        <article>
          <h3>3. Confirmá tu aporte</h3>
          <p>Subís evidencia de tu acción sustentable y validás tu inscripción.</p>
        </article>
      </div>
    </section>

    <section id="acciones-sustentables">
      <h2>Acciones sustentables aceptadas</h2>
      <ul>
        <li>Separación de residuos.</li>
        <li>Plantación de árboles o plantas nativas.</li>
        <li>Campañas de limpieza de espacios públicos.</li>
        <li>Reutilización o donación de materiales.</li>
        <li>Movilidad sustentable: bicicleta, caminata, transporte compartido.</li>
        <li>Voluntariado ambiental o educativo.</li>
      </ul>
    </section>

    <section id="cursos">
      <h2>Cursos disponibles</h2>

      <article>
        <h3>Introducción a la sostenibilidad</h3>
        <p>Un curso base para comprender hábitos, impacto y consumo responsable.</p>
        <p><strong>Pago:</strong> 50% acciones sustentables + 50% dinero electrónico.</p>
        <a href="#detalle-curso-1">Ver detalle</a>
      </article>

      <article>
        <h3>Huerta urbana</h3>
        <p>Aprendé a iniciar una huerta pequeña en casa, patio o centro educativo.</p>
        <p><strong>Pago:</strong> 100% acciones sustentables o mixto.</p>
        <a href="#detalle-curso-2">Ver detalle</a>
      </article>

      <article>
        <h3>Reciclaje creativo</h3>
        <p>Transformá materiales en recursos útiles para hogar, escuela o negocio.</p>
        <p><strong>Pago:</strong> Acciones sustentables + complemento monetario.</p>
        <a href="#detalle-curso-3">Ver detalle</a>
      </article>
    </section>

    <section id="impacto">
      <h2>Impacto de la comunidad</h2>
      <div class="metrics">
        <article>
          <h3>Kg recuperados</h3>
          <p>Indicador de materiales reciclados o reutilizados.</p>
        </article>
        <article>
          <h3>Árboles plantados</h3>
          <p>Registro de acciones vinculadas a reforestación.</p>
        </article>
        <article>
          <h3>Horas de voluntariado</h3>
          <p>Tiempo dedicado a actividades con valor ambiental o social.</p>
        </article>
      </div>
    </section>

    <section id="testimonios">
      <h2>Testimonios</h2>
      <article>
        <p>“Pude inscribirme aportando una acción real y eso me motivó mucho más.”</p>
        <p>— Nombre de usuario</p>
      </article>
      <article>
        <p>“EcoCampus hace que estudiar se sienta parte de algo más grande.”</p>
        <p>— Nombre de usuario</p>
      </article>
    </section>

    <aside>
      <h2>Dato destacado</h2>
      <p>Cuantas más acciones sustentables completes, menor será el costo en dinero.</p>
    </aside>

    <section id="faq">
      <h2>Preguntas frecuentes</h2>
      <article>
        <h3>¿Cómo se valida una acción sustentable?</h3>
        <p>Podés hacerlo con foto, video, certificado o comprobante según la actividad.</p>
      </article>
      <article>
        <h3>¿Puedo pagar solo con acciones?</h3>
        <p>Sí, algunos cursos pueden habilitar esa modalidad si cumplen los requisitos.</p>
      </article>
      <article>
        <h3>¿Qué pasa si no llego al porcentaje requerido?</h3>
        <p>Podés completar el resto con dinero electrónico.</p>
      </article>
    </section>

    <section id="contacto">
      <h2>Contacto</h2>
      <form>
        <label for="nombre">Nombre</label>
        <input id="nombre" type="text">

        <label for="email">Correo electrónico</label>
        <input id="email" type="email">

        <label for="mensaje">Mensaje</label>
        <textarea id="mensaje"></textarea>

        <button type="submit">Enviar</button>
      </form>
    </section>
  </main>

  <footer>
    <div>
      <h2>EcoCampus</h2>
      <p>Educación con impacto ambiental positivo.</p>
    </div>

    <div>
      <h3>Enlaces rápidos</h3>
      <ul>
        <li><a href="#cursos">Cursos</a></li>
        <li><a href="#faq">FAQ</a></li>
        <li><a href="#contacto">Contacto</a></li>
      </ul>
    </div>

    <div>
      <h3>Legal</h3>
      <ul>
        <li><a href="#">Términos y condiciones</a></li>
        <li><a href="#">Política de privacidad</a></li>
      </ul>
    </div>

    <p>© 2026 EcoCampus. Todos los derechos reservados.</p>
  </footer>
</body>

# Ideas útiles para EcoCampus
Podrías sumar componentes extra que encajan muy bien con tu propuesta:

Un contador de impacto: “+120 accioncleaes sustentables verificadas”.

Una calculadora de pago: el usuario elige curso y ve cuánto paga en dinero y cuánto en acciones.

Badges: “Curso 100% sustentable”, “Pago mixto”, “Nivel inicial”.

Filtro de cursos por tipo de acción aceptada.

Perfil de usuario con historial de acciones sustentables.

Un sistema de validación de evidencias antes de aprobar la inscripción.

Una sección de alianzas con ONG, escuelas o organizaciones ambientales.

# Colocar iconos de Redes Sociales de FontAwesome
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<article class="contacto">
  <h2>Contacto</h2>
  <ul>
    <li>
      <a href="https://instagram.com/tuusuario" target="_blank">
        <i class="fa-brands fa-instagram"></i>
        <span>Instagram</span>
      </a>
    </li>
    <li>
      <a href="https://wa.me/123456789" target="_blank">
        <i class="fa-brands fa-whatsapp"></i>
        <span>WhatsApp</span>
      </a>
    </li>
    <li>
      <a href="mailto:correo@ejemplo.com">
        <i class="fa-solid fa-envelope"></i>
        <span>Email</span>
      </a>
    </li>
  </ul>
</article>

# Usar Imagenes SVG-PNG

<article class="contacto">
  <h2>Contacto</h2>
  <ul>
    <li>
      <a href="#">
        <img src="icono-instagram.svg" alt="Instagram" class="icono">
        <span>Instagram</span>
      </a>
    </li>
  </ul>
</article>

# APLICAR CSS

/* Quitar los puntos de la lista */
.contacto ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Espaciado entre elementos de la lista */
.contacto li {
  margin-bottom: 12px;
}

/* Alineación del icono con el texto */
.contacto a {
  display: inline-flex;  /* Alinea el contenido en línea */
  align-items: center;  /* Centra verticalmente icono y texto */
  gap: 10px;            /* Espacio exacto entre el icono y el texto */
  text-decoration: none;
  color: #333;          /* Color del texto */
  font-size: 16px;
}

/* Si usas la Opción 2 (imágenes locales), dale tamaño a los iconos */
.contacto .icono {
  width: 20px;
  height: 20px;
}

/* Si usas Font Awesome, puedes cambiar el tamaño y color del icono */
.contacto i {
  font-size: 20px;
  /* color: #E1306C; (Opcional: cambiar color del icono) */
}



2. Catálogo de Cursos
Curso 1: Programación
Título: Desarrollo Web Full Stack: De Cero a Tu Primer Empleo

Etiqueta: Más Vendido

Descripción breve: Aprende a construir aplicaciones y sitios web reales utilizando HTML, CSS, JavaScript, React y Node.js. Incluye la creación de proyectos para tu portafolio personal.

Ficha Técnica:

⏱️ Duración: 40 horas

📊 Nivel: Principiante / Intermedio

📜 Certificado: Incluido

Curso 2: Idiomas
Título: Inglés Práctico para Profesionales y Tecnología

Etiqueta: Alta Demanda

Descripción breve: Desarrolla fluidez para entrevistas de trabajo, reuniones remotas y lectura de documentación técnica sin trabas. Enfocado en comunicación real e interactiva.

Ficha Técnica:

⏱️ Duración: 25 horas

📊 Nivel: Todos los niveles

📜 Certificado: Incluido

Curso 3: Productividad & Análisis de Datos
Título: Excel Avanzado, Macros y Dashboards Interactivos

Etiqueta: Imprescindible

Descripción breve: Automatiza tareas repetitivas, domina fórmulas complejas y analiza grandes volúmenes de datos para tomar decisiones estratégicas en cualquier empresa.

Ficha Técnica:

⏱️ Duración: 15 horas

📊 Nivel: Intermedio

📜 Certificado: Incluido

3. Detalle de Contenido (Temarios)
Módulos: Desarrollo Web Full Stack
Módulo 1: Fundamentos de la Web (HTML5, CSS3, Flexbox y Grid).

Módulo 2: Lógica de programación con JavaScript y manipulación del DOM.

Módulo 3: Frontend moderno con React.js.

Módulo 4: Backend y bases de datos con Node.js y MongoDB.

Módulo 5: Deploy (publicación de tu proyecto) y preparación para entrevistas técnicas.

Módulos: Inglés Práctico para Profesionales
Módulo 1: Vocabulario clave de la industria digital y corporativa.

Módulo 2: Cómo redactar correos, documentación y chats de forma profesional.

Módulo 3: Preparación para entrevistas de trabajo en inglés.

Módulo 4: Presentación de proyectos y participación fluida en reuniones.

Módulos: Excel Avanzado & Dashboards
Módulo 1: Fórmulas avanzadas y funciones de búsqueda (BUSCARX, INDICE/COINCIDIR).

Módulo 2: Tablas dinámicas y análisis cuantitativo eficiente.

Módulo 3: Creación de Dashboards e informes visuales interactivos.

Módulo 4: Introducción a Macros y automatización con Power Query.

# TRABAJAR CON POSITION


# COURSE-CARD HTML

<article class="course-card">
  <!-- Imagen / Portada del curso -->
  <div class="card-header">
    <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80" alt="Curso de HTML y CSS" class="card-image">
    <span class="badge badge-level">Principiante</span>
  </div>

  <!-- Contenido principal -->
  <div class="card-body">
    <span class="card-category">Desarrollo Web</span>
    <h3 class="card-title">Aprende HTML y CSS desde Cero hasta Profesional</h3>
    <p class="card-description">Domina las bases de la web creando proyectos reales y responsivos con las mejores prácticas.</p>
    
    <!-- Detalles/Metadatos -->
    <div class="card-meta">
      <span>⏱️ 12 horas</span>
      <span>👨‍💻 24 lecciones</span>
    </div>
  </div>

  <!-- Pie de la tarjeta: Precio y Acción -->
  <div class="card-footer">
    <div class="card-price">
      <span class="price-discount">$49 USD</span>
      <span class="price-original">$99 USD</span>
    </div>
    <a href="#" class="btn btn-primary">Ver Curso</a>
  </div>
</article>



# STYLES CSS COURSE-CARD

/* 1. Definición de la Paleta de Colores y Variables Globales */
:root {
  --color-primary: #4F46E5;        /* Azul Índigo */
  --color-primary-hover: #4338CA;  /* Azul un poco más oscuro al pasar el mouse */
  --color-accent: #10B981;         /* Verde Esmeralda */
  --color-text-main: #1E293B;      /* Gris Oscuro para títulos */
  --color-text-muted: #64748B;     /* Gris Medio para texto secundario */
  --color-bg-card: #FFFFFF;        /* Fondo blanco para la tarjeta */
  --color-border: #E2E8F0;         /* Líneas divisorias suaves */
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  --radius: 12px;                  /* Bordes redondeados */
  --font-main: system-ui, -apple-system, sans-serif;
}

/* Reset básico y fondo general de la página */
body {
  font-family: var(--font-main);
  background-color: #F8FAFC;
  display: flex;
  justify-content: center;
  padding: 2rem;
  margin: 0;
}

/* 2. Contenedor de la Tarjeta */
.course-card {
  width: 100%;
  max-width: 350px;
  background-color: var(--color-bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

/* Efecto Hover: Eleva la tarjeta suavemente */
.course-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

/* 3. Encabezado e Imagen */
.card-header {
  position: relative;
  width: 100%;
  height: 180px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Insignia / Badge */
.badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: var(--color-accent);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

/* 4. Cuerpo de la Tarjeta */
.card-body {
  padding: 1.25rem;
  flex-grow: 1;
}

.card-category {
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-title {
  color: var(--color-text-main);
  font-size: 1.15rem;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.card-description {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.card-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  padding-top: 0.75rem;
}

/* 5. Pie de la Tarjeta */
.card-footer {
  padding: 1.25rem;
  background-color: #FAFAFA;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-price {
  display: flex;
  flex-direction: column;
}

.price-discount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.price-original {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

/* Botón Call To Action (CTA) */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}


💡 Consejos para adaptarla a tu idea de negocio
Ajusta según tu nicho: Si tus cursos son más de diseño o tecnología creativa, puedes cambiar el color primario --color-primary por un violeta (#8B5CF6) o coral (#FF6B6B).

Reutiliza componentes: Puedes duplicar la estructura <article class="course-card">...</article> dentro de un contenedor CSS Grid (display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));) para crear un catálogo de cursos responsivo en tu web.


# RESPONSIVE DESIGN
1. Estructura HTML (El Catálogo)
Solo necesitas envolver las tarjetas dentro de un contenedor, por ejemplo <section class="courses-grid">:


<main class="container">
  <h2 class="section-title">Nuestros Cursos</h2>
  
  <section class="courses-grid">
    <!-- Tarjeta 1 -->
    <article class="course-card">
      <div class="card-header">
        <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80" alt="Curso de HTML y CSS" class="card-image">
        <span class="badge">Principiante</span>
      </div>
      <div class="card-body">
        <span class="card-category">Desarrollo Web</span>
        <h3 class="card-title">Aprende HTML y CSS desde Cero</h3>
        <p class="card-description">Domina las bases de la web creando proyectos reales y responsivos.</p>
        <div class="card-meta">
          <span>⏱️ 12 horas</span>
          <span>👨‍💻 24 lecciones</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="card-price">
          <span class="price-discount">$49 USD</span>
        </div>
        <a href="#" class="btn btn-primary">Ver Curso</a>
      </div>
    </article>

    <!-- Tarjeta 2 -->
    <article class="course-card">
      <div class="card-header">
        <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80" alt="Curso de JavaScript" class="card-image">
        <span class="badge">Intermedio</span>
      </div>
      <div class="card-body">
        <span class="card-category">Programación</span>
        <h3 class="card-title">JavaScript Moderno y ES6+</h3>
        <p class="card-description">Crea aplicaciones dinámicas e interactivas aprendiendo la lógica del lenguaje.</p>
        <div class="card-meta">
          <span>⏱️ 18 horas</span>
          <span>👨‍💻 36 lecciones</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="card-price">
          <span class="price-discount">$69 USD</span>
        </div>
        <a href="#" class="btn btn-primary">Ver Curso</a>
      </div>
    </article>

    <!-- Tarjeta 3 -->
    <article class="course-card">
      <div class="card-header">
        <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80" alt="Curso de React" class="card-image">
        <span class="badge">Avanzado</span>
      </div>
      <div class="card-body">
        <span class="card-category">Frontend</span>
        <h3 class="card-title">React.js y Gestión de Estado</h3>
        <p class="card-description">Construye interfaces de usuario profesionales con componentes reutilizables.</p>
        <div class="card-meta">
          <span>⏱️ 25 horas</span>
          <span>👨‍💻 48 lecciones</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="card-price">
          <span class="price-discount">$89 USD</span>
        </div>
        <a href="#" class="btn btn-primary">Ver Curso</a>
      </div>
    </article>
  </section>
</main>



2. Estilos CSS para la Retícula
Agrega estas reglas a tu archivo CSS. La clave aquí es la propiedad grid-template-columns con auto-fill y minmax():

/* Contenedor principal centrado */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.section-title {
  font-size: 2rem;
  color: var(--color-text-main);
  margin-bottom: 1.5rem;
  text-align: center;
}

/* 🚀 LA RETÍCULA RESPONSIVA */
.courses-grid {
  display: grid;
  /* Define columnas automáticas: mínimo 300px, máximo 1fr (ocupa el espacio restante) */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem; /* Espacio uniforme entre tarjetas */
  justify-content: center;
}

/* Nota: Asegúrate de quitar el "max-width: 350px;" de la clase .course-card 
   si quieres que las tarjetas se adapten perfectamente a las columnas del grid */
.course-card {
  width: 100%; /* La tarjeta llena la columna que le asigna el Grid */
  /* el resto de tus estilos de .course-card se mantienen igual */
}

¿Cómo funciona la magia del minmax(300px, 1fr)?
En pantalla grande (escritorio): Caben 3 o 4 tarjetas por fila.

En tablet: Se reajusta a 2 tarjetas por fila.

En celular: Al no haber 300px disponibles para poner dos tarjetas lado a lado, automáticamente se apilan una debajo de otra ocupando el 100% del ancho móvil.