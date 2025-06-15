import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMinus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const Following = () => {
    const [following, setFollowing] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowing = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");
            try {
                const res = await fetch("http://localhost:5000/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Assuming your backend returns a list of following user IDs or objects
                    // If not, you may need to create an endpoint like /following
                    if (data.following_users) {
                        setFollowing(data.following_users);
                    } else {
                        setFollowing([]);
                    }
                } else {
                    setFollowing([]);
                }
            } catch {
                setFollowing([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFollowing();
    }, []);

    const handleUnfollow = async (userId: number) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/unfollow/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setFollowing(prev => prev.filter(user => user.id !== userId));
                toast({
                    title: "Unfollowed",
                    description: "You are no longer following this user.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Could not unfollow user.",
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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Following</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center text-gray-500 py-8">Loading...</div>
                    ) : following.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">You are not following anyone yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {following.map(user => (
                                <div key={user.id} className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src={user.profile_image ? `http://localhost:5000/uploads/${user.profile_image}` : undefined} />
                                            <AvatarFallback>
                                                {user.name?.split(" ").map((n: string) => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUnfollow(user.id)}
                                        className="flex items-center gap-1"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                        Unfollow
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};