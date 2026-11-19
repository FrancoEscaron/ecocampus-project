export default function FaqItem({ faq }) {
  return (
    <details className="faq-item">
      <summary>{faq.question}</summary>
      <p>{faq.answer}</p>
    </details>
  );
}
