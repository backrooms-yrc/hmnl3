import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, MessageSquare } from 'lucide-react';
import { ForumPost } from '@/types/forum';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '@/utils/forum-api';

interface ForumPostCardProps {
  post: ForumPost;
}

export default function ForumPostCard({ post }: ForumPostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Link to={`/forum/${post.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-base sm:text-lg">
              {post.title}
            </CardTitle>
            <Badge variant="secondary" className="shrink-0 text-xs">
              #{post.PostNumber}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2 sm:line-clamp-3 text-sm">
            {post.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {post.author.avatar ? (
              <img
                src={getFullImageUrl(post.author.avatar)}
                alt={post.author.username}
                className="w-6 h-6 rounded-full object-cover bg-muted"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`${post.author.avatar ? 'hidden' : ''} w-6 h-6 rounded-full bg-muted flex items-center justify-center`}>
              <User className="w-3 h-3" />
            </div>
            <span className="font-medium truncate">{post.author.username}</span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>评论</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
