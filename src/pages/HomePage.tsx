import { IonButton } from '@ionic/react';
import { Link } from 'react-router-dom';

const animals = [
  { name: 'Nombre', kind: 'Perro', button: 'Más información' },
  { name: 'Nombre', kind: 'Gato', button: 'Más información' },
  { name: 'Nombre', kind: 'Perro', button: 'Más información' },
  { name: 'Nombre', kind: 'Gato', button: 'Más información' },
];

const steps = [
  { number: '01', title: 'Encontrar', text: 'Conoce animales en adopción con perfiles claros y responsables.' },
  { number: '02', title: 'Cuidad', text: 'Lee información útil sobre cuidados, salud y convivencia.' },
  { number: '03', title: 'Prevenir', text: 'Aprende cómo fomentar tenencia responsable y reducción del abandono.' },
];

const faqs = [
  '¿Qué necesito para adoptar a un animal?',
  '¿Adoptar tiene algún costo?',
  '¿Cómo puedo publicar un animal?',
  '¿Qué significa tenencia responsable?',
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-shell">
        <div className="hero">
          <div>
            <p className="eyebrow">Adopción responsable en comunidad</p>
            <h1 className="hero-title">Cada huella merece un hogar</h1>
          </div>
          <div className="hero-side">
            <p className="hero-note">Conoce animales en adopción, aprende sobre tenencia responsable y ayuda a reducir el abandono.</p>
            <IonButton className="primary-btn" routerLink="/adopciones">Ver animales</IonButton>
          </div>
        </div>
      </section>

      <section className="quick-card-wrap">
        <div className="quick-card-grid">
          {animals.map((animal, idx) => (
            <article className="animal-card" key={idx}>
              <div className="card-label">{animal.name}</div>
              <div className="card-label">{animal.kind}</div>
              <button className="btn-mini">{animal.button}</button>
            </article>
          ))}
        </div>
      </section>

      <section className="block-section">
        <div className="block-header">
          <h2>Más que encontrar un nuevo hogar</h2>
        </div>

        <div className="process-grid">
          {steps.map((step) => (
            <div className="step-box" key={step.number}>
              <div className="step-num">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="block-section faq-wrap">
        <div className="block-header">
          <h2>Preguntas frecuentes</h2>
        </div>

        {faqs.map((item) => (
          <div className="faq-item" key={item}>
            <span>{item}</span>
            <span>+</span>
          </div>
        ))}
      </section>
    </main>
  );
}