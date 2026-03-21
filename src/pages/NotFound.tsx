import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';
import { generateErrorReport, logError } from '@/utils/error-utils';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const report = generateErrorReport('404', `页面未找到: ${location.pathname}`);
    logError(report);
  }, [location.pathname]);

  const handleGoHome = () => {
    setIsOpen(false);
    navigate('/');
  };

  const handleGoBack = () => {
    setIsOpen(false);
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const suggestedPaths = [
    { path: '/', label: '首页', icon: Home },
    { path: '/forum', label: '论坛', icon: Search },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <DialogTitle className="text-2xl">404 - 页面未找到</DialogTitle>
          <DialogDescription className="text-base">
            抱歉，您访问的页面不存在或已被移除
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">访问的路径:</p>
            <code className="text-sm font-mono bg-background px-2 py-1 rounded break-all">
              {location.pathname}
            </code>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center mb-3">
            您可以尝试以下操作:
          </p>
          
          <div className="grid gap-2">
            {suggestedPaths.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                variant="outlined"
                className="w-full justify-start"
                onClick={() => {
                  setIsOpen(false);
                  navigate(path);
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="text"
            onClick={handleGoBack}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回上页
          </Button>
          <Button onClick={handleGoHome} className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
