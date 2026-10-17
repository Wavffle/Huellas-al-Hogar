import EducationHero from '../components/education/EducationHero';
import CareSection from '../components/education/CareSection';
import QuestionsSection from '../components/education/QuestionsSection';
import CommitmentSection from '../components/education/CommitmentSection';
import './EducationPage.css';

export default function EducationPage() {
    return (
        <div className="edu-page">
            <EducationHero />
            <CareSection />
            <QuestionsSection />
            <CommitmentSection />
        </div>
    );
}
