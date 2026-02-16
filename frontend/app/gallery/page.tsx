'use client';

import { useEffect, useState } from 'react';
import Gallery from 'react-photo-gallery';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

interface Photo {
  src: string;
  width: number;
  height: number;
  key: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    fetchPhotos();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: '#gallery',
      children: 'a',
      pswpModule: () => import('photoswipe'),
    });
    lightbox.init();

    return () => {
      lightbox.destroy();
    };
  }, [photos]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/list?year=${selectedYear}&month=${selectedMonth}`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_PASSWORD || '',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
        setYears(data.years || []);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    }
    setLoading(false);
  };

  const months = [
    { value: '01', label: 'Január' },
    { value: '02', label: 'Február' },
    { value: '03', label: 'Március' },
    { value: '04', label: 'Április' },
    { value: '05', label: 'Május' },
    { value: '06', label: 'Június' },
    { value: '07', label: 'Július' },
    { value: '08', label: 'Augusztus' },
    { value: '09', label: 'Szeptember' },
    { value: '10', label: 'Október' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Galéria</h1>
        <a
          href="/"
          style={{
            padding: '0.5rem 1rem',
            background: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Feltöltés
        </a>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        >
          <option value="">Minden év</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        >
          <option value="">Minden hónap</option>
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Betöltés...
        </div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Még nincsenek feltöltött képek
        </div>
      ) : (
        <div id="gallery">
          <Gallery
            photos={photos}
            renderImage={({ photo, margin }) => (
              <a
                href={photo.src}
                data-pswp-width={photo.width}
                data-pswp-height={photo.height}
                key={photo.key}
                target="_blank"
                rel="noreferrer"
                style={{ margin }}
              >
                <img
                  src={photo.src}
                  alt=""
                  style={{ display: 'block', width: '100%' }}
                />
              </a>
            )}
          />
        </div>
      )}
    </div>
  );
}
