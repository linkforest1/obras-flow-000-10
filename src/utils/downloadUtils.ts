
import { supabase } from '@/integrations/supabase/client';

export const downloadActivityImages = async (activityId: string, activityTitle: string) => {
  try {
    // Fetch activity photos
    const { data: photos, error } = await supabase
      .from('activity_photos')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!photos || photos.length === 0) {
      throw new Error('Nenhuma foto encontrada para esta atividade');
    }

    // Sanitize activity title for filename
    const sanitizedTitle = activityTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');

    // If there's only one photo, download it directly
    if (photos.length === 1) {
      const photo = photos[0];
      await downloadImageFromUrl(photo.photo_url, `${sanitizedTitle}_foto.jpg`);
      return;
    }

    // If there are multiple photos, download them all with sequential processing
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const fileName = `${sanitizedTitle}_foto_${i + 1}.jpg`;
      
      try {
        await downloadImageFromUrl(photo.photo_url, fileName);
        
        // Add a delay between downloads to prevent browser throttling
        if (i < photos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (downloadError) {
        console.error(`Error downloading photo ${i + 1}:`, downloadError);
        // Continue with other photos even if one fails
      }
    }
  } catch (error) {
    console.error('Error downloading images:', error);
    throw error;
  }
};

const downloadImageFromUrl = async (url: string, filename: string) => {
  try {
    // Create a unique identifier for this download to avoid conflicts
    const downloadId = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.id = downloadId;
    
    // Temporarily add to document for download
    document.body.appendChild(link);
    link.click();
    
    // Clean up with proper timing
    setTimeout(() => {
      const linkElement = document.getElementById(downloadId);
      if (linkElement) {
        document.body.removeChild(linkElement);
      }
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
    
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};
