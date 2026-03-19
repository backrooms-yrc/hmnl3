import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Eye, User, Calendar } from 'lucide-react';
import { Worldview } from '@/types/worldview';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '@/utils/worldview-api';

interface PostCardProps {
  post: Worldview;
  onLike?: (postId: string) => void;
  isLiked?: boolean;
}

export default function PostCard({ post, onLike, isLiked }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      onLike(post.id);
    }
  };

  return (
    <Link to={`/worldview/${post.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
        {/* 封面图 */}
        {post.coverImage && (
          <div className="relative w-full h-48 overflow-hidden bg-muted">
            <img
              src={getFullImageUrl(post.coverImage) || 'https://via.placeholder.com/400x200?text=No+Image'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
              }}
            />
            {/* 分类标签 */}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                {post.category}
              </Badge>
            </div>
          </div>
        )}

        <CardHeader>
          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">{post.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 作者信息 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {post.author.avatar ? (
              <img
                src={getFullImageUrl(post.author.avatar)}
                alt={post.author.username}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <User className="w-4 h-4" />
            )}
            <span>{post.author.username}</span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-4">
            {/* 浏览量 */}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.views}</span>
            </div>

            {/* 点赞数 */}
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 h-auto p-0 hover:bg-transparent ${
                isLiked ? 'text-red-500' : ''
              }`}
              onClick={handleLikeClick}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likingUsers?.length || 0}</span>
            </Button>
          </div>

          {/* 发布时间 */}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
