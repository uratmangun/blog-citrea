import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

interface Comment {
  id: number;
  content: string;
  author_address: string;
  created_at: string;
  parent_id?: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { address, isConnected } = useAccount();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [buyers, setBuyers] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        // Organize comments into parent-child structure
        const commentsMap = new Map<number, Comment>();
        const rootComments: Comment[] = [];

        // First pass: create all comments
        data.forEach(comment => {
          commentsMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: organize into tree structure
        data.forEach(comment => {
          const commentWithReplies = commentsMap.get(comment.id)!;
          if (comment.parent_id) {
            const parent = commentsMap.get(comment.parent_id);
            if (parent) {
              parent.replies!.push(commentWithReplies);
            }
          } else {
            rootComments.push(commentWithReplies);
          }
        });

        setComments(rootComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const fetchBuyers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('buyer_address')
        .eq('post_id', postId);

      if (error) throw error;
      if (data) {
        setBuyers(new Set(data.map(purchase => purchase.buyer_address)));
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
    fetchBuyers();
  }, [fetchComments, fetchBuyers]);

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

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !isConnected || !address || !replyingTo) return;

    const { error } = await supabase.from('comments').insert([
      {
        post_id: postId,
        content: replyContent,
        author_address: address,
        parent_id: replyingTo,
      },
    ]);

    if (error) {
      console.error('Error posting reply:', error);
      alert(`Error: ${error.message}`);
    } else {
      setReplyContent('');
      setReplyingTo(null);
      fetchComments(); // Refresh comments after posting
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : ''}`}>
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm truncate">{comment.author_address}</p>
            {buyers.has(comment.author_address) && (
              <Badge variant="secondary" className="text-xs">
                Buyer
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(comment.created_at).toLocaleString()}
          </p>
          <p className="mt-2">{comment.content}</p>
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs h-6 px-2"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              Reply
            </Button>
          )}
          {replyingTo === comment.id && (
            <form onSubmit={handleReply} className="mt-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-2 text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">Post Reply</Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

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
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
