import { useState, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateProfile } from "../lib/api";
import {
  UserIcon,
  MapPinIcon,
  ShuffleIcon,
  SaveIcon,
  Loader2,
  Globe2,
  Languages,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { LANGUAGES } from "../constants";
import Avatar from "../components/Avatar.jsx";
import LanguageDropdown from "../components/LanguageDropdown.jsx";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: "",
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
    location: "",
    profilePic: "",
  });

  useEffect(() => {
    if (authUser) {
      setFormState({
        fullName: authUser.fullName || "",
        bio: authUser.bio || "",
        nativeLanguage: authUser.nativeLanguage || "",
        learningLanguage: authUser.learningLanguage || "",
        location: authUser.location || "",
        profilePic: authUser.profilePic || "",
      });
    }
  }, [authUser]);

  const { mutate: profileMutation, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.fullName.trim()) {
      return toast.error("Full name is required");
    }
    profileMutation(formState);
  };

  const handleRandomAvatar = () => {
    const styles = ["avataaars", "bottts", "fun-emoji", "adventurer", "lorelei"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomSeed = Math.random().toString(36).substring(2, 9) + "_" + Date.now();
    const randomAvatar = `https://api.dicebear.com/9.x/${randomStyle}/svg?seed=${randomSeed}`;

    setFormState((prev) => ({ ...prev, profilePic: randomAvatar }));
    toast.success("New avatar generated!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-sm opacity-70 mt-1">
          Customize how other language learners see you on hiMEStream
        </p>
      </div>

      <div className="card bg-base-200/80 border border-base-content/10 shadow-lg rounded-3xl overflow-hidden">
        <form onSubmit={handleSubmit} className="card-body p-6 sm:p-8 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center p-6 bg-base-300/40 rounded-2xl border border-base-content/5 space-y-4">
            <div className="relative">
              <Avatar
                key={formState.profilePic}
                src={formState.profilePic}
                name={formState.fullName || "User"}
                size="xl"
                className="ring-4 ring-primary/20 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-content shadow-md">
                <Sparkles className="size-4" />
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleRandomAvatar}
                className="btn btn-outline btn-sm btn-primary rounded-full gap-2 font-medium"
              >
                <ShuffleIcon className="size-4" />
                <span>Randomize Avatar</span>
              </button>
              <span className="text-[11px] opacity-60">
                Powered by DiceBear AI Avatars
              </span>
            </div>
          </div>

          {/* User Details Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-1.5">
                  <UserIcon className="size-4 opacity-70" />
                  Full Name
                </span>
              </label>
              <input
                type="text"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered rounded-xl w-full"
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-success" />
                  Email Address
                </span>
              </label>
              <input
                type="email"
                value={authUser?.email || ""}
                disabled
                className="input input-bordered rounded-xl w-full opacity-60 cursor-not-allowed bg-base-300/30"
              />
            </div>

            {/* Native Language */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-1.5">
                  <Languages className="size-4 text-emerald-400" />
                  Native Language
                </span>
              </label>
              <LanguageDropdown
                icon={Languages}
                value={formState.nativeLanguage}
                onChange={(val) => setFormState({ ...formState, nativeLanguage: val })}
                languages={LANGUAGES}
                placeholder="Select your native language"
                showAllOption={false}
                allowClear={false}
              />
            </div>

            {/* Learning Language */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-1.5">
                  <Globe2 className="size-4 text-indigo-400" />
                  Learning Language
                </span>
              </label>
              <LanguageDropdown
                icon={Globe2}
                value={formState.learningLanguage}
                onChange={(val) => setFormState({ ...formState, learningLanguage: val })}
                languages={LANGUAGES}
                placeholder="Select language you're learning"
                showAllOption={false}
                allowClear={false}
              />
            </div>

            {/* Location */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-1.5">
                  <MapPinIcon className="size-4 text-primary" />
                  Location
                </span>
              </label>
              <input
                type="text"
                value={formState.location}
                onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                className="input input-bordered rounded-xl w-full"
                placeholder="e.g. Tokyo, Japan or London, UK"
              />
            </div>

            {/* Bio */}
            <div className="form-control md:col-span-2">
              <label className="label flex items-center justify-between">
                <span className="label-text font-medium">Bio</span>
                <span className="text-xs opacity-50">{formState.bio.length}/250</span>
              </label>
              <textarea
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value.slice(0, 250) })}
                className="textarea textarea-bordered rounded-xl h-24 resize-none w-full"
                placeholder="Tell learning partners about your goals, interests, and hobbies..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary rounded-xl px-8 font-medium shadow-md hover:shadow-lg transition-transform active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <SaveIcon className="size-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
