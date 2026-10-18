import ConsequencesHero from '../components/consequences/ConsequencesHero';
import ConsequencesIntro from '../components/consequences/ConsequencesIntro';
import ConsequencesCarousel from '../components/consequences/ConsequencesCarousel';
import RealitySection from '../components/consequences/RealitySection';
import ActionsSection from '../components/consequences/ActionsSection';
import ChangeCta from '../components/consequences/ChangeCta';
import './AbandonmentConsequencesPage.css';

export default function AbandonmentConsequencesPage() {
    return (
        <div className="aban-page">
            <ConsequencesHero />

            <div className="aban-body">
                <ConsequencesIntro />
                <ConsequencesCarousel />
                <RealitySection />
                <ActionsSection />
            </div>

            <ChangeCta />
        </div>
    );
}
