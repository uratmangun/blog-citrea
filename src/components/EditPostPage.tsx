import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabaseClient';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
});

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      price: 0,
    },
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setLoading(false);
        navigate('/dashboard');
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('title, content, price, author_address')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching post:', error);
        alert('Could not fetch post data.');
        navigate('/dashboard');
        return;
      }

      if (!isConnected || address !== data.author_address) {
        alert('You are not authorized to edit this post.');
        navigate('/dashboard');
        return;
      }

      form.reset({
        title: data.title,
        content: data.content,
        price: data.price ?? 0,
      });

      setLoading(false);
    };

    fetchPost();
  }, [id, navigate, form, address, isConnected]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id) return;

    const { error } = await supabase
      .from('posts')
      .update({
        title: values.title,
        content: values.content,
        price: values.price,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating post:', error);
      alert(`Error updating post: ${error.message}`);
    } else {
      alert('Post updated successfully!');
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading post...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-2">Edit Post</h1>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
          {isPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>
      {isPreview ? (
        <div className="prose dark:prose-invert max-w-none p-4 border rounded-md">
          <ReactMarkdown>{form.getValues('content')}</ReactMarkdown>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Your post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post content here... Supports Markdown."
                      className="min-h-[250px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (in ETH)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.05" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update Post</Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default EditPostPage;
