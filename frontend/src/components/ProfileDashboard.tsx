import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Link as LinkIcon, Briefcase, Calendar, Edit, Users, Heart, Github, Linkedin, Twitter } from "lucide-react";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";

export const ProfileDashboard = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          setProfile(null);
        } else if (res.ok) {
          const data = await res.json();
          setProfile({
            ...data,
            profileImage: data.profile_image
              ? `http://localhost:5000/uploads/${data.profile_image}`
              : undefined,
            dateOfBirth: data.date_of_birth,
            themePref: data.theme_pref,
            isPrivate: data.is_private,
            activities: data.activities || [],
            followers: data.followers ?? 0,
            following: data.following ?? 0,
            posts: data.posts ?? 0,
          });
        } else {
          setProfile(null);
        }
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!profile) {
    return (
      <div className="text-center text-red-500">
        Could not load profile. Please log in again.
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Helper for activity dot color
  const activityDotColor = (type: string) => {
    switch (type) {
      case "profile_update":
        return "bg-green-500";
      case "follow":
        return "bg-blue-500";
      case "join":
        return "bg-purple-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="relative overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 -mt-16">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg bg-white">
                <AvatarImage src={profile.profileImage} />
                <AvatarFallback className="text-2xl">
                  {profile.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {/* Edit button on mobile */}
              <div className="sm:hidden mt-4 w-full flex justify-center">
                <Button onClick={() => setIsEditDialogOpen(true)} className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 space-y-4 sm:ml-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">{profile.email}</p>
                {profile.isAdmin && (
                  <Badge variant="destructive" className="mt-1">Admin</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    <a href={profile.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile.career && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {profile.career}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(profile.createdAt)}
                </div>
              </div>
              {/* Social Links */}
              <div className="flex gap-3">
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {profile.twitter && (
                  <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
            {/* Edit button on desktop */}
            <div className="hidden sm:flex sm:flex-col sm:justify-end">
              <Button onClick={() => setIsEditDialogOpen(true)} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              {profile.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Born {formatDate(profile.dateOfBirth)} (Age {calculateAge(profile.dateOfBirth)})</span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Your recent activity and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-200">
                {profile.activities && profile.activities.length > 0 ? (
                  profile.activities.map((activity: any, idx: number) => (
                    <li key={idx} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full inline-block ${activityDotColor(activity.type)}`}></span>
                        <span>{activity.description}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {activity.timestamp
                          ? new Date(activity.timestamp).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : ""}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-gray-500">No recent activity.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Followers</span>
                </div>
                <Badge variant="secondary">{profile.followers}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Following</span>
                </div>
                <Badge variant="secondary">{profile.following}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-green-500" />
                  <span>Posts</span>
                </div>
                <Badge variant="secondary">{profile.posts}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Profile Visibility</span>
                <Badge variant={profile.isPrivate ? "secondary" : "default"}>
                  {profile.isPrivate ? "Private" : "Public"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Theme</span>
                <Badge variant="outline">
                  {profile.themePref === "light" ? "Light" : "Dark"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {profile.isPrivate 
                  ? "Only your followers can see your profile"
                  : "Your profile is visible to everyone"
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <ProfileEditDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        profile={profile}
        onSave={setProfile}
      />
    </div>
  );
};