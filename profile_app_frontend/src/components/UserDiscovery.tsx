import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Briefcase, Users, Search, UserPlus, UserMinus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const UserDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Optionally, fetch each user's profile for more info
          const userProfiles = await Promise.all(
            data.map(async (user: any) => {
              const profileRes = await fetch(`http://localhost:5000/profile/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (profileRes.ok) {
                const profileData = await profileRes.json();
                return {
                  ...user,
                  ...profileData,
                  avatar: profileData.profile_image
                    ? `http://localhost:5000/uploads/${profileData.profile_image}`
                    : undefined,
                  followers: profileData.followers ?? 0,
                  following: profileData.following ?? 0,
                  isFollowing: profileData.is_following ?? false,
                };
              }
              return user;
            })
          );
          setUsers(userProfiles.filter((u: any) => !u.is_admin)); // Hide admins from discovery
        } else {
          setUsers([]);
        }
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/${isFollowing ? "unfollow" : "follow"}/${userId}`,
        {
          method: isFollowing ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.ok) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? {
                  ...user,
                  isFollowing: !user.isFollowing,
                  followers: user.isFollowing ? user.followers - 1 : user.followers + 1
                }
              : user
          )
        );
        toast({
          title: isFollowing ? `Unfollowed ${users.find(u => u.id === userId)?.name}` : `Following ${users.find(u => u.id === userId)?.name}`,
          description: isFollowing
            ? "You are no longer following this user"
            : "You are now following this user",
        });
      } else {
        toast({
          title: "Action failed",
          description: "Could not update follow status.",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Could not connect to server.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Discover People
          </CardTitle>
          <CardDescription>
            Find and connect with amazing people in your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, bio, or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading users...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{user.bio}</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      {user.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {user.location}
                        </div>
                      )}
                      {user.career && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {user.career}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-4 text-sm">
                        <span><strong>{user.followers}</strong> followers</span>
                        <span><strong>{user.following}</strong> following</span>
                      </div>
                      <Button
                        size="sm"
                        variant={user.isFollowing ? "outline" : "default"}
                        onClick={() => handleFollow(user.id, user.isFollowing)}
                        className="flex items-center gap-1"
                      >
                        {user.isFollowing ? (
                          <>
                            <UserMinus className="w-4 h-4" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              Try adjusting your search query to find more people.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};