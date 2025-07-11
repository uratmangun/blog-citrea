export interface Comment {
  id: number;
  author: string;
  content: string;
}

export interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  comments: Comment[];
}

export const mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Getting Started with Citrea',
    description: 'A beginner-friendly guide to understanding the Citrea ecosystem and how you can start contributing and earning.',
    content: 'This is the full content for Getting Started with Citrea. Here we would go into detail about the Citrea platform, how to set up your wallet, and how to make your first post. We would also cover the basics of the tokenomics and how you can earn rewards for your contributions.',
    comments: [
      { id: 1, author: 'Alice', content: 'Great introduction! Looking forward to more content.' },
      { id: 2, author: 'Bob', content: 'This was very helpful, thanks for sharing.' },
    ]
  },
  {
    id: 2,
    title: 'The Future of Decentralized Blogging',
    description: 'Exploring the potential of blockchain technology in revolutionizing the way we create and consume content.',
    content: 'In this post, we explore the exciting possibilities that blockchain and decentralization bring to the world of blogging. We discuss topics like censorship resistance, creator-owned platforms, and new monetization models that empower both writers and readers.',
    comments: [
      { id: 3, author: 'Charlie', content: 'A very thought-provoking read.' },
    ]
  },
  {
    id: 3,
    title: 'How to Write Your First Blog Post on Citrea',
    description: 'A step-by-step tutorial on creating, publishing, and monetizing your content on the Citrea platform.',
    content: 'This tutorial will walk you through the entire process of writing and publishing your first blog post on Citrea. From brainstorming ideas to hitting the publish button, we have got you covered. We will also share some tips on how to promote your content and engage with your audience.',
    comments: []
  },
  {
    id: 4,
    title: 'Top 5 Monetization Strategies for Bloggers',
    description: 'Learn about different ways to monetize your blog on Citrea, from direct payments to token rewards.',
    content: 'Monetizing your content is a key aspect of being a successful blogger. In this article, we cover the top 5 monetization strategies available on the Citrea platform. We will discuss the pros and cons of each method and help you choose the one that best suits your needs.',
    comments: [
      { id: 4, author: 'Dave', content: 'These are some great tips!' },
      { id: 5, author: 'Eve', content: 'I have been looking for something like this.' },
    ]
  },
];
