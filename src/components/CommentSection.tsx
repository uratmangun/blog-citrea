import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

interface Comment {
  id: number;
  content: string;
  author_address: string;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { address, isConnected } = useAccount();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isConnected || !address) return;

    const { error } = await supabase.from('comments').insert([
      {
        post_id: postId,
        content: newComment,
        author_address: address,
      },
    ]);

    if (error) {
      console.error('Error posting comment:', error);
      alert(`Error: ${error.message}`);
    } else {
      setNewComment('');
      fetchComments(); // Refresh comments after posting
    }
  };

  return (
    <div className="mt-16">
      <Separator />
      <h2 className="text-2xl font-bold mt-8 mb-6">Comments ({comments.length})</h2>

      {isConnected ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-4"
          />
          <Button type="submit">Post Comment</Button>
        </form>
      ) : (
        <div className="mb-8 p-4 border rounded-md text-center text-muted-foreground">
          <p>Please connect your wallet to post a comment.</p>
        </div>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start">
              <div className="flex-1">
                <p className="font-semibold text-sm truncate">{comment.author_address}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                <p className="mt-2">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
