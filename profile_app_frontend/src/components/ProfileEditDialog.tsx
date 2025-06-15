import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Github, Linkedin, Twitter } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSave: (profile: any) => void;
}

export const ProfileEditDialog = ({ isOpen, onClose, profile, onSave }: ProfileEditDialogProps) => {
  const [editedProfile, setEditedProfile] = useState(profile);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(profile.profileImage);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when dialog is reopened with new profile
  // (prevents stale state if user opens dialog multiple times)
  React.useEffect(() => {
    setEditedProfile(profile);
    setPreviewImage(profile.profileImage);
    setProfileImageFile(null);
  }, [profile, isOpen]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreviewImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", editedProfile.name || "");
      formData.append("email", editedProfile.email || "");
      formData.append("bio", editedProfile.bio || "");
      formData.append("location", editedProfile.location || "");
      formData.append("date_of_birth", editedProfile.dateOfBirth || "");
      formData.append("website", editedProfile.website || "");
      formData.append("career", editedProfile.career || "");
      formData.append("linkedin", editedProfile.linkedin || "");
      formData.append("github", editedProfile.github || "");
      formData.append("twitter", editedProfile.twitter || "");
      formData.append("is_private", editedProfile.isPrivate ? "true" : "false");
      formData.append("theme_pref", editedProfile.themePref || "light");
      if (profileImageFile) {
        formData.append("profile_image", profileImageFile);
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Profile updated!",
          description: "Your profile has been successfully updated.",
        });
        onSave({
          ...editedProfile,
          profileImage: profileImageFile
            ? URL.createObjectURL(profileImageFile)
            : previewImage,
        });
        onClose();
      } else {
        toast({
          title: "Update failed",
          description: data.message || "Could not update profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information, social links, and privacy settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={previewImage} />
                <AvatarFallback className="text-lg">
                  {editedProfile.name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <p className="text-sm text-gray-600">Click the camera icon to change your profile picture</p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editedProfile.name || ""}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedProfile.email || ""}
                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
              value={editedProfile.bio || ""}
              onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
            />
          </div>
          
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={editedProfile.location || ""}
                onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={editedProfile.dateOfBirth || ""}
                onChange={(e) => setEditedProfile({ ...editedProfile, dateOfBirth: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={editedProfile.website || ""}
                onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="career">Career</Label>
              <Input
                id="career"
                placeholder="Your job title and company"
                value={editedProfile.career || ""}
                onChange={(e) => setEditedProfile({ ...editedProfile, career: e.target.value })}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Links</h3>
            
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/yourprofile"
                value={editedProfile.linkedin || ""}
                onChange={(e) => setEditedProfile({ ...editedProfile, linkedin: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub
              </Label>
              <Input
                id="github"
                placeholder="https://github.com/yourusername"
                value={editedProfile.github || ""}
                onChange={(e) => setEditedProfile({ ...editedProfile, github: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
              </Label>
              <Input
                id="twitter"
                placeholder="https://twitter.com/yourusername"
                value={editedProfile.twitter || ""}
                onChange={(e) => setEditedProfile({ ...editedProfile, twitter: e.target.value })}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Settings</h3>
            
            <div className="flex items-center justify-between py-4 border rounded-lg px-4">
              <div className="space-y-1">
                <Label htmlFor="privacy">Private Profile</Label>
                <p className="text-sm text-gray-600">
                  Only your followers can see your profile when enabled
                </p>
              </div>
              <Switch
                id="privacy"
                checked={editedProfile.isPrivate}
                onCheckedChange={(checked) => setEditedProfile({ ...editedProfile, isPrivate: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-4 border rounded-lg px-4">
              <div className="space-y-1">
                <Label htmlFor="theme">Dark Theme</Label>
                <p className="text-sm text-gray-600">
                  Choose your preferred theme appearance
                </p>
              </div>
              <Switch
                id="theme"
                checked={editedProfile.themePref === "dark"}
                onCheckedChange={(checked) => setEditedProfile({ ...editedProfile, themePref: checked ? "dark" : "light" })}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};