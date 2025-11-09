'use client';

import { useEffect, useState } from 'react';
import { PhotoItem, listPhotos, deletePhoto, getPhoto, clearGallery } from '@/lib/indexeddb';

export default function Gallery() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshGallery = async () => {
    try {
      const items = await listPhotos();
      items.sort((a, b) => b.createdAt - a.createdAt);
      setPhotos(items);
    } catch (err) {
      console.error('Failed to load photos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGallery();
    // Listen for custom event when a photo is added
    const handlePhotoAdded = () => {
      refreshGallery();
    };
    window.addEventListener('photoAdded', handlePhotoAdded);
    return () => {
      window.removeEventListener('photoAdded', handlePhotoAdded);
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await deletePhoto(id);
      await refreshGallery();
    } catch (err) {
      console.error('Failed to delete photo', err);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const item = await getPhoto(id);
      if (!item) return;
      
      // If Cloudinary URL exists, download from there, otherwise use local blob
      if (item.cloudinaryUrl) {
        const a = document.createElement('a');
        a.href = item.cloudinaryUrl;
        a.download = `beautycam_${new Date(item.createdAt).toISOString().replace(/[:.]/g, '-')}.jpg`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const url = URL.createObjectURL(item.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beautycam_${new Date(item.createdAt).toISOString().replace(/[:.]/g, '-')}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to download photo', err);
    }
  };

  const handleDownloadAll = async () => {
    if (photos.length === 0) {
      alert('No images to download.');
      return;
    }
    if (!confirm(`Download ${photos.length} images? Your browser may prompt for multiple downloads.`)) return;
    
    for (const item of photos) {
      const url = URL.createObjectURL(item.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beautycam_${new Date(item.createdAt).toISOString().replace(/[:.]/g, '-')}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await new Promise((r) => setTimeout(r, 120));
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear all saved photos from local gallery? This cannot be undone.')) return;
    try {
      await clearGallery();
      await refreshGallery();
    } catch (err) {
      console.error('Failed to clear gallery', err);
    }
  };

  if (loading) {
    return <div className="text-white/60 p-3">Loading gallery...</div>;
  }

  return (
    <div className="flex flex-col gap-3 h-full flex-1 min-h-0">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-lg">Gallery</div>
          <div className="text-xs text-white/70">{photos.length} image{photos.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleDownloadAll}
            className="px-2 py-1.5 text-xs rounded-lg bg-white/10 border border-white/30 hover:bg-white/20 transition-colors"
          >
            Download All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto flex-1 min-h-0 p-1 custom-scrollbar">
        {photos.length === 0 ? (
          <div className="text-xs text-white/60 p-6 text-center">
            No photos yet — capture to fill the gallery.
          </div>
        ) : (
          photos.map((item) => {
            // Use Cloudinary URL if available, otherwise use local blob URL
            const imageUrl = item.cloudinaryUrl || URL.createObjectURL(item.blob);
            return (
              <div key={item.id} className="relative rounded-lg overflow-hidden border border-white/20 hover:border-white/40 transition-colors group">
                <img
                  src={imageUrl}
                  alt={`photo-${item.id}`}
                  className="w-full h-48 object-cover block"
                />
                <div className="absolute left-2 bottom-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
                <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(item.id)}
                    className="px-2 py-1 text-xs rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors"
                  >
                    ⬇
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-2 py-1 text-xs rounded-lg bg-red-500/80 backdrop-blur-sm border border-red-400/30 hover:bg-red-500 transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2 items-center justify-between pt-2 border-t border-white/10">
        <div className="text-xs text-white/60">
          Stored locally
        </div>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-[#ff7b7b] to-[#ffb47b] text-[#211] hover:opacity-90 transition-opacity"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

