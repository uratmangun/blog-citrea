import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';

// Define the type for a post
interface Post {
  id: string;
  title: string;
  created_at: string;
  price: number;
}

// Define the type for purchase analytics
interface PostAnalytics {
  post_id: string;
  total_buyers: number;
  total_revenue: number;
}

const DashboardPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [posts, setPosts] = useState<Post[]>([]);
  const [analytics, setAnalytics] = useState<Map<string, PostAnalytics>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, created_at, price')
          .eq('author_address', address)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setPosts(data);
          // Fetch analytics for each post
          fetchAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalytics = async (postsData: Post[]) => {
      try {
        const analyticsData = new Map<string, PostAnalytics>();
        
        for (const post of postsData) {
          const { data: purchases, error } = await supabase
            .from('purchases')
            .select('buyer_address')
            .eq('post_id', post.id);

          if (error) {
            console.error('Error fetching purchases for post', post.id, error);
            continue;
          }

          const totalBuyers = purchases?.length || 0;
          const totalRevenue = totalBuyers * post.price;

          analyticsData.set(post.id, {
            post_id: post.id,
            total_buyers: totalBuyers,
            total_revenue: totalRevenue
          });
        }
        
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchPosts();
  }, [address, isConnected]);

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      // First verify the post belongs to the current user
      const { data: postData, error: fetchError } = await supabase
        .from('posts')
        .select('author_address')
        .eq('id', postId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (postData.author_address !== address) {
        alert('You can only delete your own posts.');
        return;
      }

      const { error } = await supabase.rpc('delete_post', { post_id: parseInt(postId) });

      if (error) {
        throw error;
      }

      setPosts(posts.filter((post) => post.id !== postId));
      alert('Post deleted successfully!');

    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(`Error deleting post: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!isConnected) {
    return (
      <div className="text-center py-10">
        <p>Please connect your wallet to see your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link to="/">← Back to Home</Link>
          </Button>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
        </div>
        <Button asChild>
          <Link to="/create-post">Create New Post</Link>
        </Button>
      </div>
      
      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p>You haven't created any posts yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created on: {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-primary font-medium">
                  Price: {post.price} cBTC
                </p>
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Buyers</p>
                      <p className="text-lg font-semibold">{analytics.get(post.id)?.total_buyers || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                      <p className="text-lg font-semibold text-green-600">{analytics.get(post.id)?.total_revenue || 0} cBTC</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button asChild variant="default" size="sm">
                  <Link to={`/post/${post.id}`}>View Post</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/edit-post/${post.id}`}>Edit Post</Link>
                </Button>
                {(analytics.get(post.id)?.total_buyers || 0) === 0 && (
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                    Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
