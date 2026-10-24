import EducationHero from '../components/education/EducationHero';
import CareSection from '../components/education/CareSection';
import QuestionsSection from '../components/education/QuestionsSection';
import CommitmentSection from '../components/education/CommitmentSection';
import ArticlesSection from '../components/education/ArticlesSection';
import './EducationPage.css';

export default function EducationPage() {
    return (
        <div className="edu-page">
            <EducationHero />
            <CareSection />
            <QuestionsSection />
            <CommitmentSection />
            <ArticlesSection categoria="Tenencia responsable" title="Artículos sobre tenencia responsable" />
        </div>
    );
}