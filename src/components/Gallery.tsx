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
    const handlePhotoAdded = () => refreshGallery();
    window.addEventListener('photoAdded', handlePhotoAdded);
    return () => window.removeEventListener('photoAdded', handlePhotoAdded);
  }, []);

  const handleDelete = (id: number) => {
    onShowConfirm(
      'Delete Photo',
      'Are you sure you want to permanently delete this photo?',
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
      
      const url = item.cloudinaryUrl || URL.createObjectURL(item.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beautycam_${new Date(item.createdAt).toISOString().replace(/[:.]/g, '-')}.jpg`;
      a.target = '_blank'; // Open in new tab for cloud URLs
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (!item.cloudinaryUrl) URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      console.error('Failed to download photo', err);
      toast.error('Failed to download photo');
    }
  };

  const handleDownloadAll = () => {
    if (photos.length === 0) {
      toast.error('No images to download');
      return;
    }
    
    onShowConfirm(
      'Download All Photos',
      `Download ${photos.length} image${photos.length > 1 ? 's' : ''}?`,
      async () => {
        for (const item of photos) {
          await handleDownload(item.id);
          await new Promise((r) => setTimeout(r, 200)); // Stagger downloads
        }
        toast.success(`Downloaded ${photos.length} image${photos.length > 1 ? 's' : ''}`);
      },
      'info'
    );
  };

  const handleClear = () => {
    onShowConfirm(
      'Clear Gallery',
      'Are you sure you want to clear all photos? This cannot be undone.',
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
    return <div className="text-white/60 p-4 text-center">Loading Gallery...</div>;
  }

  return (
    <div className="flex flex-col gap-4 h-full flex-1 min-h-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Your Gallery
          </div>
          <div className="text-xs text-white/60">{photos.length} image{photos.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleDownloadAll}
            className="btn-glow px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md hover:shadow-lg"
          >
            ⬇ Download All
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {photos.length === 0 ? (
            <div className="text-sm text-white/50 p-8 text-center col-span-full">
              Your captured photos will appear here.
            </div>
          ) : (
            photos.map((item) => {
              const imageUrl = item.cloudinaryUrl || URL.createObjectURL(item.blob);
              return (
                <div key={item.id} className="relative rounded-xl overflow-hidden border-2 border-white/10 hover:border-purple-400/70 transition-all duration-300 group shadow-lg hover:shadow-purple-500/20 hover:scale-[1.03] animated-border aspect-w-16 aspect-h-9">
                  <img
                    src={imageUrl}
                    alt={`photo-${item.id}`}
                    className="w-full h-full object-cover"
                    onLoad={() => { if (!item.cloudinaryUrl) URL.revokeObjectURL(imageUrl) }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute left-3 bottom-3 text-xs text-white/80 drop-shadow-md">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                  <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleDownload(item.id)}
                      className="px-2.5 py-1.5 text-sm rounded-md bg-black/40 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      ⬇
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2.5 py-1.5 text-sm rounded-md bg-red-600/60 backdrop-blur-md border border-red-400/30 hover:bg-red-500 transition-colors"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t-2 border-white/10">
        <div className="text-xs text-white/50">
          Images stored in browser
        </div>
        <button
          onClick={handleClear}
          className="btn-glow px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-red-600 to-red-800 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-red-500/30 font-semibold"
        >
          Clear Gallery
        </button>
      </div>
    </div>
  );
}
