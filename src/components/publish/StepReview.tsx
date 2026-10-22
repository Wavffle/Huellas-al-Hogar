import { useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import PublishPreview from './PublishPreview';
import { valuesToDetail } from './publishMappers';
import { ariaFor, type StepProps } from './publishForm';
import './StepReview.css';

export default function StepReview({ values, errors, set }: StepProps) {
    const animal = useMemo(() => valuesToDetail(values), [values]);

    return (
        <div className="pub-review">
            <PublishPreview animal={animal} />

            <aside className="pub-terms">
                <div className="pub-terms__info">
                    <IonIcon icon={informationCircleOutline} aria-hidden="true" />
                    <div>
                        <p className="pub-terms__title">Al publicar, confirmas que:</p>
                        <ul className="pub-terms__list selectable">
                            <li>La información es verídica y completa.</li>
                            <li>Tienes autorización para publicar este animal.</li>
                            <li>Te comprometes a mantener la información actualizada.</li>
                            <li>Seguirás las buenas prácticas de adopción responsable.</li>
                        </ul>
                    </div>
                </div>

                <label className="pub-terms__check">
                    <input
                        {...ariaFor('acepta', errors)}
                        type="checkbox"
                        checked={values.acepta}
                        onChange={(e) => set('acepta', e.target.checked)}
                    />
                    <span>Estoy de acuerdo con los términos y condiciones de publicación.</span>
                </label>
            </aside>

            {errors.acepta && (
                <p id="pub-acepta-error" className="form-error" role="alert">
                    {errors.acepta}
                </p>
            )}
        </div>
    );
}