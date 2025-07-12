import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight } from 'lucide-react';


import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent, CardFooter } from './components/ui/card';
import { Input } from './components/ui/input';
import { supabase } from './lib/supabaseClient';

import BlogPostPage from './components/BlogPostPage';
import CreatePostPage from './components/CreatePostPage';
import DashboardPage from './components/DashboardPage';
import EditPostPage from './components/EditPostPage';

const Home: React.FC = () => {
  const [posts, setPosts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);
  const { isConnected } = useAccount();

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.description && post.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">Get Paid for Your Content</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Citrea Blogging</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Unleash your creativity, share your stories, and get paid while blogging with the power of Citrea's decentralized platform.
          </p>
          <div className="flex justify-center gap-4">
            <ConnectButton />
            {isConnected && (
              <Button asChild size="lg" variant="outline">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Blog Posts</h2>
          <div className="max-w-md mx-auto mb-8">
            <Input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <p>Loading posts...</p>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground line-clamp-3">{post.description}</p>
                  <p className="text-sm text-primary font-medium mt-2">
                    Price: {post.price} cBTC
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link to={`/post/${post.id}`} className="flex items-center">
                      Read more <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              {posts.length === 0 ? 'No posts found.' : 'No posts match your search.'}
            </p>
          )}
        </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Citrea?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-primary"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/><path d="M7 7h.01"/></svg>
              <h3 className="text-xl font-semibold mb-2">Direct Monetization</h3>
              <p className="text-muted-foreground">Earn directly from your readers without intermediaries. Your content, your revenue.</p>
            </div>
            <div className="p-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <h3 className="text-xl font-semibold mb-2">Censorship-Resistant</h3>
              <p className="text-muted-foreground">Your content is stored on a decentralized network, making it resistant to censorship and removal.</p>
            </div>
            <div className="p-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <h3 className="text-xl font-semibold mb-2">Community-Owned</h3>
              <p className="text-muted-foreground">Be part of a platform governed by its users. Have a say in the future of Citrea.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join a growing community of writers, creators, and readers on the decentralized web. Create your account today and start publishing.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/40">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">&copy; 2024 Citrea Blogging. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 2.8 3.2 2.8 5.5 0 3.9-3.1 7.1-7 7.1-3.9 0-7-3.2-7-7.1 0-2.3 1.2-4.1 2.8-5.5-1.3-1.3-2-3.4-2-3.4s-7 1.4-7 8.4c0 4.6 3.1 8.4 7 8.4s7-3.8 7-8.4c0-7-7-8.4-7-8.4z"></path></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<BlogPostPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/edit-post/:id" element={<EditPostPage />} />
      </Routes>
    </div>
  );
};

export default App;
