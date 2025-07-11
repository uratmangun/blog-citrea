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
}

const DashboardPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [posts, setPosts] = useState<Post[]>([]);
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
          .select('id, title, created_at')
          .eq('author_address', address)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [address, isConnected]);

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
        <h1 className="text-3xl font-bold">My Dashboard</h1>
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
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button asChild variant="default" size="sm">
                  <Link to={`/post/${post.id}`}>View Post</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/edit-post/${post.id}`}>Edit Post</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
