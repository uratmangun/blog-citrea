import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';
import { useAccount } from 'wagmi';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  content: z.string().min(20, 'Content must be at least 20 characters long.'),
});

const CreatePostPage: React.FC = () => {
  const [isPreview, setIsPreview] = useState(false);
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      content: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first.');
      return;
    }

    const { error } = await supabase.from('posts').insert([
      {
        title: values.title,
        description: values.description,
        content: values.content,
        price: values.price,
        author_address: address,
      },
    ]);

    if (error) {
      console.error('Error creating post:', error);
      alert(`Error creating post: ${error.message}`);
    } else {
      console.log('Post created successfully!');
      alert('Post created successfully!');
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <Button asChild variant="outline" className="mb-8">
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <h1 className="text-3xl font-bold mb-8">Create a New Blog Post</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your blog post title" {...field} />
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
                <FormLabel>Price (in cBTC)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter a price for your post" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write a short description for your post..."
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
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
                  <>
                  {isPreview ? (
                    <div className="prose dark:prose-invert min-h-[300px] rounded-md border p-4">
                      <ReactMarkdown>{form.getValues('content')}</ReactMarkdown>
                    </div>
                  ) : (
                    <Textarea
                      placeholder="Write your blog post content here... (Markdown is supported)"
                      className="resize-none"
                      rows={20}
                      {...field}
                    />
                  )}
                </>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <Button type="submit">Publish Post</Button>
            <Button type="button" variant="outline" onClick={() => setIsPreview(!isPreview)}>
              {isPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreatePostPage;
