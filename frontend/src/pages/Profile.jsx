import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { User, Lock, Save, Edit3, Eye, EyeOff } from "lucide-react";
import { updateProfileService, changePasswordService } from "../services/auth.service";
import { setUser } from "../features/authSlice";
import { handleApiError } from "../utils/handleApiError";
import toast from "react-hot-toast";
import { useState } from "react";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { register: regProfile, handleSubmit: handleProfileSubmit, reset: resetProfile } = useForm({
    defaultValues: { name: user?.name, email: user?.email }
  });

  const { register: regPass, handleSubmit: handlePassSubmit, reset: resetPass } = useForm();

  const onUpdateProfile = async (data) => {
    setIsUpdatingProfile(true);
    try {
      const res = await updateProfileService(data);
      dispatch(setUser(res.data.user));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setIsUpdatingPassword(true);
    try {
      await changePasswordService(data);
      toast.success("Password changed successfully!");
      resetPass();
      setIsChangingPassword(false);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-2">Manage your account details and security.</p>
        </header>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Centered Avatar Section */}
          <div className="pt-10 pb-6 flex flex-col items-center border-b border-slate-50 bg-slate-50/30 relative">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-6 right-8 flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
              >
                <Edit3 size={16} /> Edit
              </button>
            )}
            
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-100 ring-8 ring-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Account</span>
            </div>
          </div>

          <div className="p-10 space-y-12">
            {/* Personal Information */}
            <section>
              <div className="flex items-center gap-2 mb-8 text-slate-900">
                <User size={20} className="text-blue-500" />
                <h3 className="text-lg font-bold">Personal Information</h3>
              </div>

              <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
                    <input 
                      {...regProfile("name")}
                      readOnly={!isEditing}
                      className={`w-full p-4 rounded-2xl border transition-all duration-200 outline-none font-medium ${
                        isEditing 
                        ? "bg-white border-blue-200 ring-4 ring-blue-50 text-slate-900" 
                        : "bg-slate-50 border-transparent text-slate-500 cursor-default"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
                    <input 
                      {...regProfile("email")}
                      readOnly={!isEditing}
                      className={`w-full p-4 rounded-2xl border transition-all duration-200 outline-none font-medium ${
                        isEditing 
                        ? "bg-white border-blue-200 ring-4 ring-blue-50 text-slate-900" 
                        : "bg-slate-50 border-transparent text-slate-500 cursor-default"
                      }`}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-3 pt-4">
                    <button 
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
                    >
                      <Save size={18} />
                      {isUpdatingProfile ? "Saving..." : "Save Changes"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => { resetProfile(); setIsEditing(false); }}
                      className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </section>

            <div className="h-px bg-slate-100" />

            {/* Security Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-slate-900">
                  <Lock size={20} className="text-amber-500" />
                  <h3 className="text-lg font-bold">Security</h3>
                </div>
                {!isChangingPassword && (
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-6 bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Current Password */}
                    <div className="relative">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Current Password</label>
                      <div className="relative">
                        <input 
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...regPass("currentPassword", { required: true })}
                          className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="relative">
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">New Password</label>
                      <div className="relative">
                        <input 
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...regPass("newPassword", { required: true })}
                          className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
                    >
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="px-4 py-3 font-bold text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                  Update your password regularly to keep your account secure. Use a combination of letters, numbers, and symbols.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;