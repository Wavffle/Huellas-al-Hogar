import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { IonIcon } from '@ionic/react';
import { close, cloudUploadOutline, image, star } from 'ionicons/icons';
import { FOTO_TIPOS, MAX_FOTOS, MAX_FOTO_MB, type FotoItem } from '../../data/publish';
import './PhotoUploader.css';

interface Props {
    /** Mismo id que se le pasó al <Field> que lo contiene. */
    id: string;
    photos: FotoItem[];
    onChange: (photos: FotoItem[]) => void;
    error?: string;
    /** El <Field> tiene texto de ayuda. */
    hasHint?: boolean;
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function PhotoUploader({ id, photos, onChange, error, hasHint }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [notice, setNotice] = useState('');
    const [dragging, setDragging] = useState(false);

    const addFiles = (list: FileList | File[]) => {
        const free = MAX_FOTOS - photos.length;
        const accepted: FotoItem[] = [];
        const problems: string[] = [];
        let tooMany = false;

        for (const file of Array.from(list)) {
            if (!FOTO_TIPOS.includes(file.type)) {
                problems.push(`"${file.name}" no es una imagen JPG, PNG o WebP.`);
            } else if (file.size > MAX_FOTO_MB * 1024 * 1024) {
                problems.push(`"${file.name}" pesa más de ${MAX_FOTO_MB} MB.`);
            } else if (accepted.length >= free) {
                tooMany = true;
            } else {
                accepted.push({ id: newId(), file, url: URL.createObjectURL(file) });
            }
        }
        if (tooMany) problems.push(`Solo puedes subir ${MAX_FOTOS} fotos.`);

        setNotice(problems.join(' '));
        if (accepted.length) onChange([...photos, ...accepted]);
    };

    const remove = (photo: FotoItem) => {
        URL.revokeObjectURL(photo.url);
        setNotice('');
        onChange(photos.filter((p) => p.id !== photo.id));
    };

    const makeCover = (photo: FotoItem) => {
        onChange([photo, ...photos.filter((p) => p.id !== photo.id)]);
    };

    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const firstEmpty = photos.length < MAX_FOTOS ? photos.length : -1;
    const describedBy = [hasHint ? `${id}-hint` : '', error ? `${id}-error` : '', notice ? `${id}-notice` : '']
        .filter(Boolean)
        .join(' ');

    return (
        <div
            id={id}
            className="pub-photos-wrap"
            role="group"
            aria-labelledby={`${id}-label`}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            tabIndex={-1}
        >
            <ul className="pub-photos">
                {Array.from({ length: MAX_FOTOS }, (_, i) => {
                    const photo = photos[i];

                    if (photo) {
                        return (
                            <li key={photo.id} className="pub-photo">
                                <img src={photo.url} alt={`Foto ${i + 1}`} className="pub-photo__image" />
                                {i === 0 && <span className="pub-photo__badge">Portada</span>}
                                <button
                                    type="button"
                                    className="pub-photo__btn pub-photo__btn--remove"
                                    aria-label={`Quitar foto ${i + 1}`}
                                    onClick={() => remove(photo)}
                                >
                                    <IonIcon icon={close} aria-hidden="true" />
                                </button>
                                {i > 0 && (
                                    <button
                                        type="button"
                                        className="pub-photo__btn pub-photo__btn--cover"
                                        aria-label={`Usar la foto ${i + 1} como portada`}
                                        title="Usar como portada"
                                        onClick={() => makeCover(photo)}
                                    >
                                        <IonIcon icon={star} aria-hidden="true" />
                                    </button>
                                )}
                            </li>
                        );
                    }

                    if (i === firstEmpty) {
                        return (
                            <li key="drop" className="pub-photos__drop">
                                <label
                                    className={`pub-drop${dragging ? ' is-dragging' : ''}`}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragging(true);
                                    }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={onDrop}
                                >
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        className="pub-drop__input"
                                        accept={FOTO_TIPOS.join(',')}
                                        multiple
                                        onChange={(e) => {
                                            addFiles(e.target.files ?? []);
                                            e.target.value = '';
                                        }}
                                    />
                                    <IonIcon icon={cloudUploadOutline} aria-hidden="true" />
                                    <span className="pub-drop__title">Subir fotos</span>
                                    <span className="pub-drop__text">Arrastra y suelta o haz clic para seleccionar</span>
                                    <span className="pub-drop__rules">
                                        JPG, PNG o WebP (máx. {MAX_FOTO_MB} MB c/u)
                                    </span>
                                </label>
                            </li>
                        );
                    }

                    return (
                        <li key={`slot-${i}`} className="pub-slot" aria-hidden="true">
                            <IonIcon icon={image} />
                        </li>
                    );
                })}
            </ul>

            {notice && (
                <p id={`${id}-notice`} className="form-error pub-photos__notice" role="alert">
                    {notice}
                </p>
            )}
        </div>
    );
}
