export default function Footer({ id }) {
  return (
    <footer className="site-footer" id={id}>
      <div className="inner-footer">
        <div className="footer-cont">
          <h2 className="footer-title">Contacto</h2>
          <p>
            <a href="tel:+59894335085">+598 94 335 085</a> <br />
            <a href="mailto:ecocampus@gmail.com">ecocampus@gmail.com</a> <br />
            Montevideo, Uruguay
          </p>
        </div>
        <div className="footer-cont">
          <h2 className="footer-title">Síguenos</h2>
          <ul className="networks">
            <li>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer">
                X
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-cont">
          <h2 className="footer-title">Legal</h2>
          <ul className="legal">
            <li>
              <a href="#terminos">Términos y condiciones</a>
            </li>
            <li>
              <a href="#validaciones">Política de validación de acciones</a>
            </li>
          </ul>
        </div>
      </div>
      <p className="copyright">© 2026 EcoCampus. Todos los derechos reservados.</p>
    </footer>
  );
}
