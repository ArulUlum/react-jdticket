import { useEffect, useState } from "react";
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import axios from "axios";
import {
  Instagram,
  Globe,
  User,
  Lock,
  Trash2,
  Upload,
  Download,
  TriangleAlert
} from "lucide-react";


const urlBe = import.meta.env.VITE_URL_BE;

function AccountInformation() {
  const [profile, setProfile] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  // Cropper states
  const [showCropper, setShowCropper] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Helper to convert dataURL to File
  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    for (var i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${urlBe}/user/show-settings`, {
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        },
      });
      if (res.data && res.data.data) {
        setProfile(res.data.data);
        setAvatarPreview(res.data.data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.data.data.name || "User")}&background=random`);
      }
    } catch (err) {
      // Optionally handle error
      console.error('Failed to fetch user settings:', err);
    }
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      let updatedProfile = { ...profile };
      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile);

        const saveImgRes = await axios.post(`${urlBe}/image/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        updatedProfile.image = saveImgRes.data.img_url;
        setProfile((prev) => ({ ...prev, image: saveImgRes.data.img_url }));
      }

      // Send profile update
      const res = await axios.post(`${urlBe}/user/edit-profile`, updatedProfile, {
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        },
      });
      // Update localStorage and notify app to refresh header
      localStorage.setItem("user", JSON.stringify({
        ...updatedProfile,
        // fallback for name field if needed
        name: updatedProfile.name || updatedProfile.fullName || ""
      }));
      window.dispatchEvent(new Event("userProfileUpdated"));
      alert(res.data.message || "Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert("Error: " + err.response.data.message);
      } else if (err.message) {
        alert("Error: " + err.message);
      } else {
        alert("Error: Terjadi kesalahan tak dikenal.");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
        {/* Left form */}
        <section>
          {/* Full name */}
          <div className="mb-4">
            <label className="block text-white text-responsive-medium mb-1">Full Name</label>
            <input
              name="fullName"
              value={profile.name || ""}
              onChange={onChange}
              className="w-full text-responsive-medium-normal bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-white text-responsive-medium mb-1">Username</label>
            <input
              name="username"
              value={profile.username || ""}
              placeholder="Enter your username"
              onChange={onChange}
              className="w-full text-responsive-medium-normal bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-white text-responsive-medium mb-1">Email</label>
            <input
              name="email"
              value={profile.email || ""}
              onChange={onChange}
              className="w-full text-responsive-medium-normal bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-white text-responsive-medium mb-1">Phone Number</label>
            <input
              name="phone"
              value={profile.phone || ""}
              onChange={onChange}
              placeholder="08XXXXXXXXXX"
              className="w-full text-responsive-medium-normal bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label className="block text-white text-responsive-medium mb-1">Bio</label>
            <textarea
              rows={2}
              name="bio"
              value={profile.bio || ""}
              onChange={onChange}
              className="w-full text-responsive-medium-normal bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none resize-none"
            />
          </div>
        </section>

        {/* Right: Profile Picture */}
        <section className="flex flex-col items-center">
          <h2 className="text-responsive-medium mb-2">Profile Picture</h2>
          <label htmlFor="avatar-upload" className="relative w-20 h-20 cursor-pointer">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border border-gray-700"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#1e1e1e] border border-gray-600 rounded-full flex items-center justify-center hover:bg-[#333] transition">
              <Upload className="w-3 h-3" />
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const img = new window.Image();
                      img.src = reader.result;
                      img.onload = () => {
                        if (img.width !== img.height) {
                          setRawImage(reader.result);
                          setAvatarFile(file); // keep file for later upload
                          setShowCropper(true);
                        } else {
                          setAvatarPreview(reader.result);
                          setAvatarFile(file);
                        }
                      };
                    };
                    reader.readAsDataURL(file);
                    e.target.value = null;
                  }
                }}
                className="hidden"
              />
              {/* Cropper Modal for Avatar */}
            </div>
          </label>
          {showCropper && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setShowCropper(false)}>
              <div className="bg-[#181818] rounded-xl p-6 shadow-lg w-[90vw] max-w-lg relative" onClick={e => e.stopPropagation()}>
                <h2 className="text-white text-lg mb-4">Crop Image to 1:1</h2>
                <div className="relative w-full h-[350px] bg-black">
                  <Cropper
                    image={rawImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"  // 🔥 ini bikin preview jadi bulat
                    showGrid={false}   // opsional, gridnya biar ga ganggu
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={e => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    className="bg-gray-700 text-white px-4 py-2 rounded"
                    onClick={() => setShowCropper(false)}
                  >Cancel</button>
                  <button
                    className="bg-[#00594F] text-white px-4 py-2 rounded"
                    onClick={async () => {
                      const croppedImg = await getCroppedImg(rawImage, croppedAreaPixels);
                      setAvatarPreview(croppedImg);
                      setAvatarFile(dataURLtoFile(croppedImg, 'avatar.png'));
                      setShowCropper(false);
                    }}
                  >Crop & Use</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      {/* Social Links */}
      <p className="text-white text-responsive-medium mb-2">Social Links</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
        <section>
          {/* Instagram (single input) */}
          <div className="flex items-center gap-2 mb-4">
            <Instagram className="w-5 h-5 text-white shrink-0" />
            <input
              name="instagram"
              value={profile.instagram || ""}
              onChange={onChange}
              className="flex-1 text-responsive-medium-normal bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
              placeholder="instagram.com/"
            />
          </div>

          {/* X (Twitter) */}
          <div className="flex items-center gap-2 mb-4">
            {/* little prefix box */}
            <User className="w-5 h-5 text-white shrink-0" />
            <input
              name="xTwitter"
              value={profile.x || ""}
              onChange={onChange}
              className="flex-1 text-responsive-medium-normal bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
              placeholder="xTwitter"
            />
          </div>
        </section>
        <section>
          {/* TikTok (single input) */}
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-white shrink-0" />
            <input
              name="tiktok"
              value={profile.tiktok || ""}
              onChange={onChange}
              className="flex-1 text-responsive-medium-normal bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
              placeholder="tiktok.com/@"
            />
          </div>

          {/* Website (single input with globe) */}
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-white shrink-0" />
            <input
              name="website"
              value={profile.website || ""}
              onChange={onChange}
              className="flex-1 text-responsive-medium-normal bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
              placeholder="https://"
            />
          </div>
        </section>
      </div>
      <button
        className="bg-white text-black rounded-lg px-4 py-2 text-responsive-item-title mt-1 transition disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleSaveProfile}
        disabled={isUpdating}
      >
        {isUpdating ? "Updating..." : "Save Update"}
      </button>

      {/* Change Password */}
      <section className="mt-10">
        <h2 className="text-white text-responsive-medium-big mb-3">Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-white text-responsive-medium mb-2">Old Password</label>
            <input
              type="password"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="bg-transparent text-responsive-medium-normal border border-[#ffffff] rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-white text-responsive-medium mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-transparent text-responsive-medium-normal border border-[#ffffff] rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>
        </div>
        <button className="bg-white text-black rounded-lg px-4 py-2 text-responsive-item-title mt-1 transition">Save Password</button>
      </section>

      {/* Delete Account */}
      <section className="mt-10">
        <h2 className="text-white text-responsive-medium-big mb-2">Delete Account</h2>
        <p className="text-[#a2a2a2] text-responsive-medium-normal mb-3">
          If you no longer wish to use Kebbu, you can permanently delete your account.
        </p>
        <button className="flex items-center gap-2 bg-[#f94d4d] text-white rounded-lg px-4 py-2 text-responsive-item-title mt-1 transition">
          <TriangleAlert className="w-5 h-5" />
          Delete My Account
        </button>
      </section>
    </div>
  );
}

export default AccountInformation;