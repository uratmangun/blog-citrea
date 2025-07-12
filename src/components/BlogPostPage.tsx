import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { ArrowLeft, Clock, User, Tag, ArrowRight, Loader2 } from 'lucide-react';
import CommentSection from './CommentSection';
import { useAccount } from 'wagmi';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface Post {
  id: number;
  title: string;
  description: string;
  content: string;
  author_address: string;
  created_at: string;
  price: number;
}

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const [hasBought, setHasBought] = useState(false); // mock purchase state
  const [txHash, setTxHash] = useState<string | undefined>();
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send transaction hook
  const { sendTransaction } = useSendTransaction();
  // Wait for transaction confirmation
  const { isLoading: waitingTx, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: !!txHash,
  });

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

  // Check if user already bought (real check)
  useEffect(() => {
    const checkPurchase = async () => {
      if (!post || !address) return;
      if (post.author_address === address) {
        setHasBought(true);
        return;
      }
      
      try {
        // Check purchases table
        const { data, error } = await supabase
          .from('purchases')
          .select('id')
          .eq('post_id', post.id)
          .eq('buyer_address', address)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking purchase:', error);
          setHasBought(false);
        } else {
          setHasBought(!!data);
        }
      } catch (err) {
        console.error('Error checking purchase:', err);
        setHasBought(false);
      }
    };
    checkPurchase();
  }, [post, address, txSuccess]);

  // Save purchase to DB after tx success
  useEffect(() => {
    const savePurchase = async () => {
      if (txSuccess && post && address && txHash) {
        try {
          console.log('Saving purchase to database...', { post_id: post.id, buyer_address: address, tx_hash: txHash });
          const { data, error } = await supabase.from('purchases').insert({
            post_id: post.id,
            buyer_address: address,
            tx_hash: txHash,
          });
          
          if (error) {
            console.error('Error saving purchase:', error);
            setError('Failed to save purchase to database');
          } else {
            console.log('Purchase saved successfully:', data);
            setHasBought(true);
            setBuying(false);
          }
        } catch (err) {
          console.error('Error saving purchase:', err);
          setError('Failed to save purchase to database');
        }
      }
    };
    savePurchase();
  }, [txSuccess, post, address, txHash]);

  const handleBuy = async () => {
    setError(null);
    setBuying(true);
    try {
      if (!post || !address) throw new Error('Missing post or address');
      if (!isConnected) throw new Error('Please connect your wallet');
      
      console.log('Initiating purchase for post:', post.id, 'to:', post.author_address, 'amount:', post.price);
      
      // Send transaction
      sendTransaction({
        to: post.author_address as `0x${string}`,
        value: parseEther(post.price.toString()),
      }, {
        onSuccess: (hash) => {
          console.log('Transaction sent successfully:', hash);
          setTxHash(hash);
        },
        onError: (err) => {
          console.error('Transaction failed:', err);
          setError(err.message);
          setBuying(false);
        },
      });
    } catch (err: any) {
      console.error('Buy error:', err);
      setError(err.message);
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
        <p className="text-muted-foreground mb-8">The post you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    );
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="group mb-4 hover:bg-transparent p-0">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </Button>
        
        <Badge variant="secondary" className="mb-4">
          Premium Content
        </Badge>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <span>{formatAddress(post.author_address)}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-primary font-medium">
            <Tag className="h-4 w-4 mr-2" />
            <span>{post.price} cBTC</span>
          </div>
        </div>
        
        <p className="text-xl text-muted-foreground mb-8">{post.description}</p>
      </div>

      {/* Content section */}
      {(post.author_address === address || hasBought) ? (
        <Card className="mb-12 border-0 shadow-lg">
          <CardContent className="p-8">
            <article className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-12 overflow-hidden">
          <CardHeader className="bg-muted/50 pb-0">
            <h3 className="text-xl font-semibold">Premium Content</h3>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6 p-4 rounded-full bg-primary/10">
                <Tag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Purchase Required</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                This premium content requires a one-time purchase to access. 
                Your purchase directly supports the author.
              </p>
              <Button 
                size="lg" 
                onClick={handleBuy} 
                disabled={buying || waitingTx}
                className="min-w-[200px]"
              >
                {buying || waitingTx ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Buy for {post.price} cBTC
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}
              {txHash && !txSuccess && (
                <div className="mt-4 p-3 bg-primary/10 text-primary rounded-md text-sm">
                  Transaction sent! Waiting for confirmation...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Comments</h2>
        <CommentSection postId={post.id.toString()} />
      </div>
    </div>
  );
};

export default BlogPostPage;
