import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import CommentSection from './CommentSection';

interface Post {
  id: number;
  title: string;
  content: string;
  author_address: string;
  created_at: string;
}

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setPost(data);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-10">Post not found.</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
       <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <article className="prose dark:prose-invert max-w-none">
        <h1>{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          By: {post.author_address} | Created on: {new Date(post.created_at).toLocaleDateString()}
        </p>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>

      <CommentSection postId={post.id.toString()} />
    </div>
  );
};

export default BlogPostPage;
