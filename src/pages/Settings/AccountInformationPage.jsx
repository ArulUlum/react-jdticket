import { useState } from "react";
import {
  Instagram,
  Globe,
  User,
  Lock,
  Trash2,
  Upload,
  Camera,
  Settings as SettingsIcon,
} from "lucide-react";

const initialProfile = {
  fullName: "JoinDong",
  username: "JoinDong",
  email: "joindong@gmail.com",
  phone: "08XXXXXXXXXX",
  bio: "",
  instagram: "instagram.com/",
  tiktok: "tiktok.com/@",
  xHandle: "joindong_",
  website: "https://joindong.id",
  image: "https://i.imgur.com/1Q9Z1Zm.png",
};

function AccountInformation() {
  const [profile, setProfile] = useState(initialProfile);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
        {/* Left form */}
        <section>
          {/* Full name */}
          <div className="mb-4">
            <label className="block text-white mb-1">Full Name</label>
            <input
              name="fullName"
              value={profile.fullName}
              onChange={onChange}
              className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-white mb-1">Username</label>
            <input
              name="username"
              value={profile.username}
              onChange={onChange}
              className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-white mb-1">Email</label>
            <input
              name="email"
              value={profile.email}
              onChange={onChange}
              className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-white mb-1">Phone Number</label>
            <input
              name="phone"
              value={profile.phone}
              onChange={onChange}
              className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
            />
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label className="block text-white mb-1">Bio</label>
            <textarea
              rows={4}
              name="bio"
              value={profile.bio}
              onChange={onChange}
              className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none resize-none"
            />
          </div>

          {/* Social Links */}
          <div className="mb-5">
            <p className="text-white mb-2">Social Links</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Instagram (single input) */}
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-white shrink-0" />
                <input
                  name="instagram"
                  value={profile.instagram}
                  onChange={onChange}
                  className="flex-1 bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
                  placeholder="instagram.com/"
                />
              </div>

              {/* TikTok (single input) */}
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-white shrink-0" />
                <input
                  name="tiktok"
                  value={profile.tiktok}
                  onChange={onChange}
                  className="flex-1 bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
                  placeholder="tiktok.com/@"
                />
              </div>

              {/* X (prefix + handle) */}
              <div className="flex items-center gap-2">
                {/* little prefix box */}
                <div className="text-white/80 text-sm border border-white rounded-lg px-3 py-2 select-none">
                  x.com/
                </div>
                <input
                  name="xHandle"
                  value={profile.xHandle}
                  onChange={onChange}
                  className="flex-1 bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
                  placeholder="username"
                />
              </div>

              {/* Website (single input with globe) */}
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-white shrink-0" />
                <input
                  name="website"
                  value={profile.website}
                  onChange={onChange}
                  className="flex-1 bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          <button className="bg-white text-black rounded-lg px-4 py-2 font-medium mt-4 transition">Save Update</button>
        </section>

        {/* Right: Profile Picture */}
        <section className="flex flex-col items-center md:items-start gap-2">
          <p className="text-white mb-2">Profile Picture</p>
          <div className="relative">
            <img
              src={profile.image}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white"
            />
            <button
              type="button"
              className="absolute right-2 bottom-2 bg-white border border-white rounded-full p-2 shadow-md"
              aria-label="Upload new profile picture"
            >
              <Upload className="w-5 h-5 text-black" />
            </button>
          </div>
        </section>
      </div>

      {/* Change Password */}
      <section className="mt-10">
        <h2 className="text-white text-lg font-bold mb-3">Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <input
            type="password"
            placeholder="Enter old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="bg-transparent border border-[#2a2a2a] rounded-lg px-3 py-2 text-white outline-none"
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-transparent border border-[#2a2a2a] rounded-lg px-3 py-2 text-white outline-none"
          />
        </div>
        <button className="bg-[#232323] text-white rounded-lg px-4 py-2 hover:bg-[#303030] transition">
          Save Password
        </button>
      </section>

      {/* Delete Account */}
      <section className="mt-10">
        <h2 className="text-white text-lg font-bold mb-2">Delete Account</h2>
        <p className="text-[#a2a2a2] mb-3">
          If you no longer wish to use Kebbu, you can permanently delete your account.
        </p>
        <button className="bg-[#f94d4d] text-white rounded-lg px-4 py-2 font-bold flex items-center gap-2 hover:bg-red-600 transition">
          <Trash2 className="w-5 h-5" />
          Delete My Account
        </button>
      </section>
    </div>
  );
}

export default AccountInformation;