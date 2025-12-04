import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

const CLOUD_URL = 'https://api.cloudinary.com/v1_1/dnkxuaai5/image/upload';
const PRESET = 'test_api';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  // Upload image to Cloudinary (Web compatible)
  const uploadImage = async (uri: string) => {
    if (!uri || uri.startsWith('http')) return uri;
    
    try {
      const formData = new FormData();
      formData.append('upload_preset', PRESET);
      formData.append('file', await fetch(uri).then(r => r.blob()));
      
      const res = await fetch(CLOUD_URL, { method: 'POST', body: formData });
      const data = await res.json();
      return res.ok ? data.secure_url : null;
    } catch {
      return null;
    }
  };

  // Pick image from library
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    
    return res.canceled ? null : res.assets[0].uri;
  };

  // Upload with loading state
  const uploadWithLoading = async (uri: string) => {
    setUploading(true);
    const url = await uploadImage(uri) || 'https://via.placeholder.com/150';
    setUploading(false);
    return url;
  };

  return {
    uploading,
    pickImage,
    uploadImage,
    uploadWithLoading,
  };
};
