export const uploadImageToCloudinary = async (file: File) => {
  const CLOUD_NAME = "dghhgxszt"; // đúng cloud name
  const UPLOAD_PRESET = "Websofa"; // preset Unsigned

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log(data)
  if (!res.ok) {
    console.error("Cloudinary error:", data);
    throw new Error("Upload to Cloudinary failed");
  }

  return data.secure_url;
};
