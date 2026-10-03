'use client';

import { useEffect, useState } from 'react';
import { PhotoItem, listPhotos, deletePhoto, getPhoto, clearGallery } from '@/lib/indexeddb';
import { toast } from 'react-hot-toast';
import ImageEditor from './ImageEditor';

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
  const [editingPhoto, setEditingPhoto] = useState<{ id: number; url: string } | null>(null);
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({});

  const refreshGallery = async () => {
    try {
      const items = await listPhotos();
      items.sort((a, b) => b.createdAt - a.createdAt);
      // Create stable blob URLs for local items
      const urls: Record<number, string> = {};
      for (const item of items) {
        if (!item.cloudinaryUrl) {
          urls[item.id] = URL.createObjectURL(item.blob);
        }
      }
      setBlobUrls(prev => {
        // Revoke old ones
        Object.values(prev).forEach(u => URL.revokeObjectURL(u));
        return urls;
      });
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
    return () => {
      window.removeEventListener('photoAdded', handlePhotoAdded);
      Object.values(blobUrls).forEach(u => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getImageUrl = (item: PhotoItem) => item.cloudinaryUrl || blobUrls[item.id] || '';

  const handleDelete = (id: number) => {
    onShowConfirm(
      'Delete Photo',
      'Are you sure you want to permanently delete this photo?',
      async () => {
        try {
          await deletePhoto(id);
          await refreshGallery();
          toast.success('Photo deleted', {
            style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px' }
          });
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
      if (!item) { toast.error('Photo not found'); return; }
      const url = item.cloudinaryUrl || URL.createObjectURL(item.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beautycam_${new Date(item.createdAt).toISOString().replace(/[:.]/g, '-')}.jpg`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (!item.cloudinaryUrl) URL.revokeObjectURL(url);
      toast.success('Download started', {
        style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px' }
      });
    } catch (err) {
      console.error('Failed to download photo', err);
      toast.error('Failed to download photo');
    }
  };

  const handleDownloadAll = () => {
    if (photos.length === 0) { toast.error('No images to download'); return; }
    onShowConfirm(
      'Download All Photos',
      `Download ${photos.length} image${photos.length > 1 ? 's' : ''}?`,
      async () => {
        for (const item of photos) {
          await handleDownload(item.id);
          await new Promise(r => setTimeout(r, 200));
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
          toast.success('Gallery cleared', {
            style: { background: '#fff', color: '#3d2b1a', border: '1px solid #f0e6dc', borderRadius: '12px' }
          });
        } catch (err) {
          console.error('Failed to clear gallery', err);
          toast.error('Failed to clear gallery');
        }
      },
      'danger'
    );
  };

  const handleOpenEditor = (item: PhotoItem) => {
    const url = getImageUrl(item);
    if (!url) { toast.error('Cannot open this photo for editing'); return; }
    setEditingPhoto({ id: item.id, url });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading gallery...</div>
      </div>
    );
  }

  return (
    <>
      {editingPhoto && (
        <ImageEditor
          imageUrl={editingPhoto.url}
          imageId={editingPhoto.id}
          onClose={() => setEditingPhoto(null)}
        />
      )}

      <div className="flex flex-col gap-4 h-full flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Your Gallery
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {photos.length} image{photos.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 text-xs rounded-full font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6bb8f5, #4a8ad4)', boxShadow: '0 2px 8px rgba(74,138,212,0.25)' }}
          >
            ⬇ Download All
          </button>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
            {photos.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3 opacity-30">📷</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Your captured photos will appear here.
                </div>
              </div>
            ) : (
              photos.map((item) => {
                const imageUrl = getImageUrl(item);
                return (
                  <div
                    key={item.id}
                    className="relative rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      border: '1px solid var(--border)',
                      boxShadow: '0 2px 10px var(--shadow-card)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`photo-${item.id}`}
                      className="w-full h-full object-cover cursor-pointer"
                      style={{ display: 'block', aspectRatio: '4/3' }}
                      onClick={() => handleOpenEditor(item)}
                    />
                    {/* Overlay on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(61,43,26,0.6) 0%, transparent 50%)' }}
                    />

                    {/* Click to edit hint */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                      onClick={() => handleOpenEditor(item)}
                    >
                      <div
                        className="px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                        style={{ background: 'rgba(224,123,84,0.85)' }}
                      >
                        ✏️ Edit & Share
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div
                      className="absolute left-3 bottom-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                    >
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleDownload(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-sm rounded-full backdrop-blur-md transition-all hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.85)', color: '#3d2b1a' }}
                        title="Download"
                      >⬇</button>
                      <button
                        onClick={() => handleOpenEditor(item)}
                        className="w-8 h-8 flex items-center justify-center text-sm rounded-full backdrop-blur-md transition-all hover:scale-110"
                        style={{ background: 'rgba(224,123,84,0.9)', color: 'white' }}
                        title="Edit & Share"
                      >✏️</button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-sm rounded-full backdrop-blur-md transition-all hover:scale-110"
                        style={{ background: 'rgba(232,130,110,0.9)', color: 'white' }}
                        title="Delete"
                      >🗑</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Stored locally in browser
          </div>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-xs rounded-full font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #e8826e, #d45c44)', boxShadow: '0 2px 8px rgba(212,92,68,0.25)' }}
          >
            Clear Gallery
          </button>
        </div>
      </div>
    </>
  );
}
