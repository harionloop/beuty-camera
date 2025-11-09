'use client';

import { useEffect, useState } from 'react';
import { PhotoItem, listPhotos, deletePhoto, getPhoto, clearGallery } from '@/lib/indexeddb';
import { toast } from 'react-hot-toast';

interface GalleryProps {
  onShowConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: 'danger' | 'warning' | 'info'
  ) => void;
}

export default function Gallery({ onShowConfirm }: GalleryProps) {
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
    onShowConfirm(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      async () => {
        try {
          await deletePhoto(id);
          await refreshGallery();
          toast.success('Photo deleted');
        } catch (err) {
          console.error('Failed to delete photo', err);
          toast.error('Failed to delete photo');
        }
      },
      'danger'
    );
  };

  const handleDownload = async (id: number) => {
    try {
      const item = await getPhoto(id);
      if (!item) {
        toast.error('Photo not found');
        return;
      }
      
      // If Cloudinary URL exists, download from there, otherwise use local blob
      if (item.cloudinaryUrl) {
        const a = document.createElement('a');
        a.href = item.cloudinaryUrl;
        a.download = `beautycam_${new Date(item.createdAt).toISOString().replace(/[:.]/g, '-')}.jpg`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('Download started');
      } else {
        const url = URL.createObjectURL(item.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beautycam_${new Date(item.createdAt).toISOString().replace(/[:.]/g, '-')}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success('Download started');
      }
    } catch (err) {
      console.error('Failed to download photo', err);
      toast.error('Failed to download photo');
    }
  };

  const handleDownloadAll = async () => {
    if (photos.length === 0) {
      toast.error('No images to download');
      return;
    }
    
    onShowConfirm(
      'Download All Photos',
      `Download ${photos.length} image${photos.length > 1 ? 's' : ''}? Your browser may prompt for multiple downloads.`,
      async () => {
        for (const item of photos) {
          const url = item.cloudinaryUrl || URL.createObjectURL(item.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `beautycam_${new Date(item.createdAt).toISOString().replace(/[:.]/g, '-')}.jpg`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          if (!item.cloudinaryUrl) {
            URL.revokeObjectURL(url);
          }
          await new Promise((r) => setTimeout(r, 120));
        }
        toast.success(`Downloaded ${photos.length} image${photos.length > 1 ? 's' : ''}`);
      },
      'info'
    );
  };

  const handleClear = async () => {
    onShowConfirm(
      'Clear Gallery',
      'Are you sure you want to clear all photos from the gallery? This action cannot be undone.',
      async () => {
        try {
          await clearGallery();
          await refreshGallery();
          toast.success('Gallery cleared');
        } catch (err) {
          console.error('Failed to clear gallery', err);
          toast.error('Failed to clear gallery');
        }
      },
      'danger'
    );
  };

  if (loading) {
    return <div className="text-white/60 p-3">Loading gallery...</div>;
  }

  return (
    <div className="flex flex-col gap-3 h-full flex-1 min-h-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="font-bold text-base sm:text-lg bg-gradient-to-r from-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
            Gallery
          </div>
          <div className="text-[10px] sm:text-xs text-white/70">{photos.length} image{photos.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleDownloadAll}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg bg-gradient-to-r from-white/10 to-white/5 border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span className="hidden sm:inline">Download All</span>
            <span className="sm:hidden">⬇ All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 overflow-y-auto flex-1 min-h-0 p-1 custom-scrollbar">
        {photos.length === 0 ? (
          <div className="text-xs text-white/60 p-6 text-center">
            No photos yet — capture to fill the gallery.
          </div>
        ) : (
          photos.map((item) => {
            // Use Cloudinary URL if available, otherwise use local blob URL
            const imageUrl = item.cloudinaryUrl || URL.createObjectURL(item.blob);
            return (
              <div key={item.id} className="relative rounded-lg sm:rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 group shadow-lg hover:shadow-xl hover:scale-[1.02]">
                <img
                  src={imageUrl}
                  alt={`photo-${item.id}`}
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover block"
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
          className="px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white hover:from-[#dc2626] hover:to-[#b91c1c] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
