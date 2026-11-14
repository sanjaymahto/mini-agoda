import { useState } from 'react';
import { Modal, SmartImage } from '@mini-agoda/shared';
import styles from './Gallery.module.css';

export function Gallery({ images, name, seed }: { images: string[]; name: string; seed: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [main, ...rest] = images;

  return (
    <>
      <div className={styles.grid}>
        <button className={`${styles.tile} ${styles.main}`} onClick={() => setOpenIndex(0)} aria-label="Open photo gallery">
          <SmartImage src={main} alt={name} seed={`${seed}-0`} />
        </button>
        {rest.slice(0, 4).map((src, i) => (
          <button key={src + i} className={styles.tile} onClick={() => setOpenIndex(i + 1)} aria-label={`Open photo ${i + 2}`}>
            <SmartImage src={src} alt={`${name} photo ${i + 2}`} seed={`${seed}-${i + 1}`} />
            {i === 3 && images.length > 5 && <span className={styles.more}>+{images.length - 5} photos</span>}
          </button>
        ))}
      </div>

      <Modal title={`${name} · photo ${(openIndex ?? 0) + 1} of ${images.length}`} open={openIndex !== null} onClose={() => setOpenIndex(null)}>
        {openIndex !== null && (
          <div className={styles.viewer}>
            <div className={styles.viewerImage}>
              <SmartImage src={images[openIndex]} alt={name} seed={`${seed}-${openIndex}`} />
            </div>
            <div className={styles.viewerControls}>
              <button onClick={() => setOpenIndex((openIndex - 1 + images.length) % images.length)} aria-label="Previous photo">
                ‹
              </button>
              <div className={styles.thumbs}>
                {images.map((src, i) => (
                  <button key={src + i} className={`${styles.thumb} ${i === openIndex ? styles.thumbActive : ''}`} onClick={() => setOpenIndex(i)}>
                    <SmartImage src={src} alt="" seed={`${seed}-${i}`} />
                  </button>
                ))}
              </div>
              <button onClick={() => setOpenIndex((openIndex + 1) % images.length)} aria-label="Next photo">
                ›
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
