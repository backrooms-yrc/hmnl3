import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDevice } from '@/contexts/DeviceContext';
import { supabase } from '@/db/supabase';
import { getAllAIModels, createAIModel, deleteAIModel } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Sparkles, 
  Loader2, 
  Bot, 
  Settings,
  X,
  Menu,
  Paperclip,
  File,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

// ==================== 类型定义 ====================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  message_count: number;
}

interface Model {
  id: string;
  model_name: string;
  display_name: string;
  description: string;
  is_system: boolean;
  supports_file_upload: boolean;
  created_by: string | null;
}

// ==================== 常量配置 ====================

const getApiBaseUrl = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? '/api/ai' : 'https://d.lconai.com';
};
const API_BASE_URL = getApiBaseUrl();
const API_KEY = 'sk-refdUOS7yAfwBsr8dZcXmoNtlfZp07asDPUQHp26PSWqJzwR';
const SYSTEM_PROMPT = '你是一个由HMNL直播系统运营的人工智能助手，热衷于为用户解答各类问题。';

// ==================== 主组件 ====================

export default function AIChat() {
  const { user } = useAuth();
  const { isMobile } = useDevice();
  
  // 状态管理
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // 自定义模型对话框状态
  const [customModelDialogOpen, setCustomModelDialogOpen] = useState(false);
  const [customModelForm, setCustomModelForm] = useState({
    model_name: '',
    display_name: '',
    description: ''
  });

  // 移动端对话列表Sheet状态
  const [conversationSheetOpen, setConversationSheetOpen] = useState(false);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5); // 每页显示5条
  const [jumpToPage, setJumpToPage] = useState('');
  
  // 文件上传状态
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 消息滚动引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ==================== 分页计算 ====================
  
  // 计算总页数
  const totalPages = Math.ceil(conversations.length / pageSize);
  
  // 获取当前页的对话列表
  const paginatedConversations = conversations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // 重置到第一页（当对话列表变化时）
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [conversations.length, totalPages, currentPage]);

  // ==================== 数据加载 ====================
  
  // 加载模型列表
  const loadModels = async () => {
    try {
      const data = await getAllAIModels();
      setModels(data);
      if (data.length > 0 && !selectedModel) {
        setSelectedModel(data[0].model_name);
      }
    } catch (error) {
      console.error('加载模型失败:', error);
      toast.error('加载模型列表失败');
    }
  };

  useEffect(() => {
    if (!user) return;
    loadModels();
  }, [user]);

  // 加载对话列表
  const loadConversations = async () => {
    if (!user) return;
    
    setLoadingConversations(true);
    
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('id, title, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // 获取每个对话的消息数量
      const conversationsWithCount = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('ai_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);
          
          return {
            ...conv,
            message_count: count || 0
          };
        })
      );
      
      setConversations(conversationsWithCount);
    } catch (error) {
      console.error('加载对话列表失败:', error);
      toast.error('加载对话列表失败');
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  // 加载对话消息
  useEffect(() => {
    if (!currentConvId) {
      setMessages([]);
      return;
    }
    
    const loadMessages = async () => {
      setLoadingMessages(true);
      
      try {
        const { data, error } = await supabase
          .from('ai_messages')
          .select('id, role, content, created_at')
          .eq('conversation_id', currentConvId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        setMessages((data || []).map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.created_at).getTime()
        })));
      } catch (error) {
        console.error('加载消息失败:', error);
        toast.error('加载消息失败');
      } finally {
        setLoadingMessages(false);
      }
    };
    
    loadMessages();
  }, [currentConvId]);

  // 自动滚动到底部（优化版）
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };
    
    // 使用requestAnimationFrame确保DOM更新后再滚动
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages, isStreaming]);

  // ==================== 核心功能 ====================
  
  // 分页控制函数
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handleFirstPage = () => {
    setCurrentPage(1);
  };
  
  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };
  
  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpToPage('');
    } else {
      toast.error(`请输入1-${totalPages}之间的页码`);
    }
  };
  
  // 文件上传处理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      // 限制文件大小为10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`文件 ${file.name} 超过10MB限制`);
        return false;
      }
      return true;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
    toast.success(`已添加 ${validFiles.length} 个文件`);
    
    // 重置input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 移除文件
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // 清空文件
  const handleClearFiles = () => {
    setUploadedFiles([]);
  };
  
  // 新建对话
  const handleNewConversation = () => {
    setCurrentConvId(null);
    setMessages([]);
    setInput('');
  };

  // 删除对话
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个对话吗？')) return;
    
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', convId);
      
      if (error) throw error;
      
      setConversations(prev => prev.filter(c => c.id !== convId));
      
      if (currentConvId === convId) {
        handleNewConversation();
      }
      
      toast.success('对话已删除');
    } catch (error) {
      console.error('删除对话失败:', error);
      toast.error('删除对话失败');
    }
  };

  // 发送消息（流式传输）
  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming || !user) return;

    const userMessage = input.trim();
    const files = uploadedFiles; // 保存当前文件列表
    setInput('');
    setUploadedFiles([]); // 清空文件列表
    setIsStreaming(true);

    // 生成唯一ID
    const userMsgId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const assistantMsgId = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    // 添加用户消息到UI（包含文件信息）
    let displayMessage = userMessage;
    if (files.length > 0) {
      displayMessage += `\n\n📎 附件: ${files.map(f => f.name).join(', ')}`;
    }
    
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: displayMessage,
      timestamp
    };
    
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: timestamp + 1
    };
    
    setMessages(prev => [...prev, userMsg, assistantMsg]);

    try {
      // 准备对话历史
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // 添加系统提示词和用户消息
      const requestMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      // 调用OpenAI兼容API
      const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: requestMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`请求失败 (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      let updateCounter = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') continue;
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              aiContent += content;
              updateCounter++;
              
              // 每5次更新一次UI，提供更流畅的动画效果
              if (updateCounter % 5 === 0) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastIdx = newMsgs.length - 1;
                  if (lastIdx >= 0 && newMsgs[lastIdx].id === assistantMsgId) {
                    newMsgs[lastIdx] = {
                      ...newMsgs[lastIdx],
                      content: aiContent
                    };
                  }
                  return newMsgs;
                });
              }
            }
          } catch (e) {
            console.error('解析SSE数据失败:', e);
          }
        }
      }

      // 最后一次更新
      if (aiContent) {
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastIdx = newMsgs.length - 1;
          if (lastIdx >= 0 && newMsgs[lastIdx].id === assistantMsgId) {
            newMsgs[lastIdx] = {
              ...newMsgs[lastIdx],
              content: aiContent
            };
          }
          return newMsgs;
        });

        // 保存到数据库
        await saveConversation(userMessage, aiContent);
      } else {
        throw new Error('AI未返回任何内容');
      }

    } catch (error: any) {
      console.error('发送消息失败:', error);
      toast.error(error.message || '发送失败，请重试');
      
      // 移除失败的消息
      setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId));
    } finally {
      setIsStreaming(false);
    }
  };

  // 保存对话到数据库
  const saveConversation = async (userMessage: string, aiResponse: string) => {
    if (!user) return;

    try {
      let convId = currentConvId;

      // 如果是新对话，创建对话记录
      if (!convId) {
        const title = userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
        
        const { data: newConv, error: convError } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            title,
            model_name: selectedModel
          })
          .select()
          .single();

        if (convError) throw convError;
        
        convId = newConv.id;
        setCurrentConvId(convId);

        // 更新对话列表
        setConversations(prev => [{
          id: newConv.id,
          title: newConv.title,
          updated_at: newConv.updated_at,
          message_count: 2
        }, ...prev]);
      }

      // 保存消息
      const { error: msgError } = await supabase
        .from('ai_messages')
        .insert([
          {
            conversation_id: convId,
            role: 'user',
            content: userMessage
          },
          {
            conversation_id: convId,
            role: 'assistant',
            content: aiResponse
          }
        ]);

      if (msgError) throw msgError;

      // 更新对话的updated_at
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);

      // 刷新对话列表
      loadConversations();

    } catch (error) {
      console.error('保存对话失败:', error);
    }
  };

  // 添加自定义模型
  const handleAddCustomModel = async () => {
    if (!customModelForm.model_name || !customModelForm.display_name) {
      toast.error('请填写模型名称和外显名称');
      return;
    }

    try {
      await createAIModel({
        model_name: customModelForm.model_name,
        display_name: customModelForm.display_name,
        description: customModelForm.description || '',
        display_order: 999
      });

      toast.success('自定义模型添加成功');
      setCustomModelDialogOpen(false);
      setCustomModelForm({
        model_name: '',
        display_name: '',
        description: ''
      });

      // 重新加载模型列表
      loadModels();
    } catch (error: any) {
      console.error('添加自定义模型失败:', error);
      toast.error(error.message || '添加失败');
    }
  };

  // 删除自定义模型
  const handleDeleteCustomModel = async (modelId: string) => {
    if (!confirm('确定要删除这个自定义模型吗？')) return;

    try {
      await deleteAIModel(modelId);
      toast.success('自定义模型已删除');
      loadModels();
    } catch (error: any) {
      console.error('删除自定义模型失败:', error);
      toast.error(error.message || '删除失败');
    }
  };

  // ==================== UI组件 ====================
  
  // 对话列表组件（桌面端和移动端共用）
  const ConversationList = () => (
    <>
      {/* 新建对话按钮 */}
      <div className="p-4 shrink-0">
        <Button 
          onClick={() => {
            handleNewConversation();
            if (isMobile) setConversationSheetOpen(false);
          }} 
          className="w-full rounded-lg shadow-sm"
          disabled={isStreaming}
        >
          <Plus className="w-4 h-4 mr-2" />
          新建对话
        </Button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-hidden px-4 flex flex-col">
        <div className="mb-3 shrink-0">
          <h3 className="text-sm font-medium text-muted-foreground">
            对话历史 ({conversations.length}条)
          </h3>
        </div>
        <ScrollArea className="flex-1">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无对话记录
            </div>
          ) : (
            <div className="space-y-2 pr-4 pb-2">
              {paginatedConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setCurrentConvId(conv.id);
                    if (isMobile) setConversationSheetOpen(false);
                  }}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md ${
                    currentConvId === conv.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-accent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate mb-1">
                        {conv.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <Badge variant="secondary" className="text-xs">
                          {conv.message_count} 条消息
                        </Badge>
                        <span>
                          {new Date(conv.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      disabled={isStreaming}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* 分页控件 */}
        {!loadingConversations && conversations.length > 0 && (
          <div className="mt-3 pt-3 border-t shrink-0">
            {/* 页码信息 */}
            <div className="text-xs text-center text-muted-foreground mb-2">
              第 {currentPage} / {totalPages} 页
            </div>
            
            {/* 分页按钮 */}
            <div className="flex items-center justify-center gap-1">
              {/* 首页 */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleFirstPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
                title="首页"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              
              {/* 上一页 */}
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
                title="上一页"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* 页码显示 */}
              <div className="px-2 text-sm font-medium min-w-[60px] text-center">
                {currentPage}/{totalPages}
              </div>
              
              {/* 下一页 */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
                title="下一页"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* 末页 */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleLastPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
                title="末页"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* 快速跳转 */}
            {totalPages > 5 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleJumpToPage();
                    }
                  }}
                  placeholder="页码"
                  className="h-7 w-16 text-xs text-center"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleJumpToPage}
                  disabled={!jumpToPage}
                  className="h-7 text-xs px-2"
                >
                  跳转
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  // ==================== UI渲染 ====================
  
  // 未登录
  if (!user) {
    return (
      <div className="container max-w-5xl mx-auto p-6 h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">AI大模型</CardTitle>
            <CardDescription>
              HMNL自营全免费AI对话服务，支持ChatGPT、DeepSeek等数百个全球主流大模型。
            </CardDescription>
            <CardDescription className="mt-4">
              请先登录使用AI对话功能
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 xl:p-4 xl:max-w-7xl h-[calc(100vh-4rem)]">
      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4 h-full">
        {/* 桌面端：左侧对话列表 */}
        <div className="hidden xl:flex xl:col-span-3 h-full">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <ConversationList />
          </Card>
        </div>

        {/* 移动端：对话列表Sheet */}
        <Sheet open={conversationSheetOpen} onOpenChange={setConversationSheetOpen}>
          <SheetContent side="left" className="w-80 p-0 flex flex-col">
            <SheetHeader className="p-4 border-b shrink-0">
              <SheetTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                对话历史
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 flex flex-col overflow-hidden">
              <ConversationList />
            </div>
          </SheetContent>
        </Sheet>

        {/* 对话区域 */}
        <div className="flex-1 xl:col-span-9 flex flex-col gap-4 min-h-0">
          {/* 顶部栏 */}
          <Card className="shrink-0">
            <CardHeader className="pb-3 xl:pb-4 px-3 xl:px-6 pt-3 xl:pt-6">
              <div className="flex flex-col xl:flex-row items-start xl:justify-between gap-3">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConversationSheetOpen(true)}
                      className="xl:hidden shrink-0"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                    <CardTitle className="flex items-center gap-2 text-lg xl:text-xl">
                      <Bot className="w-5 h-5 xl:w-6 xl:h-6" />
                      AI大模型
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-1 hidden xl:block">
                    HMNL自营全免费AI对话服务，支持ChatGPT、DeepSeek等数百个全球主流大模型。
                  </CardDescription>
                </div>
                <div className="hidden xl:block">
                  <Dialog open={customModelDialogOpen} onOpenChange={setCustomModelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        自定义模型
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加自定义模型</DialogTitle>
                        <DialogDescription>
                          添加的模型仅对您可见，可用于对话
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="model_name">请求体模型名称</Label>
                          <Input
                            id="model_name"
                            placeholder="例如：gpt-4o"
                            value={customModelForm.model_name}
                            onChange={(e) => setCustomModelForm(prev => ({
                              ...prev,
                              model_name: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="display_name">外显名称</Label>
                          <Input
                            id="display_name"
                            placeholder="例如：ChatGPT 4o"
                            value={customModelForm.display_name}
                            onChange={(e) => setCustomModelForm(prev => ({
                              ...prev,
                              display_name: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">简介</Label>
                          <Input
                            id="description"
                            placeholder="例如：快速且聪明的模型👍"
                            value={customModelForm.description}
                            onChange={(e) => setCustomModelForm(prev => ({
                              ...prev,
                              description: e.target.value
                            }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCustomModelDialogOpen(false)}>
                          取消
                        </Button>
                        <Button onClick={handleAddCustomModel}>
                          添加
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 xl:mt-4">
                <span className="text-sm text-muted-foreground shrink-0">模型：</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border rounded-lg bg-background shadow-sm"
                  disabled={isStreaming}
                >
                  {models.map(m => (
                    <option key={m.id} value={m.model_name}>
                      {m.display_name} {m.description ? `- ${m.description}` : ''}
                    </option>
                  ))}
                </select>
                {models.find(m => m.model_name === selectedModel && !m.is_system) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const model = models.find(m => m.model_name === selectedModel);
                      if (model) handleDeleteCustomModel(model.id);
                    }}
                    disabled={isStreaming}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <div className="xl:hidden">
                  <Dialog open={customModelDialogOpen} onOpenChange={setCustomModelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw]">
                      <DialogHeader>
                        <DialogTitle>添加自定义模型</DialogTitle>
                        <DialogDescription>
                          添加的模型仅对您可见
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="model_name_mobile">请求体模型名称</Label>
                          <Input
                            id="model_name_mobile"
                            placeholder="例如：gpt-4o"
                            value={customModelForm.model_name}
                            onChange={(e) => setCustomModelForm(prev => ({
                              ...prev,
                              model_name: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="display_name_mobile">外显名称</Label>
                          <Input
                            id="display_name_mobile"
                            placeholder="例如：ChatGPT 4o"
                            value={customModelForm.display_name}
                            onChange={(e) => setCustomModelForm(prev => ({
                              ...prev,
                              display_name: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description_mobile">简介</Label>
                          <Input
                            id="description_mobile"
                            placeholder="例如：快速且聪明的模型👍"
                            value={customModelForm.description}
                            onChange={(e) => setCustomModelForm(prev => ({
                              ...prev,
                              description: e.target.value
                            }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCustomModelDialogOpen(false)}>
                          取消
                        </Button>
                        <Button onClick={handleAddCustomModel}>
                          添加
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* 消息列表 */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div className="p-3 xl:p-6 space-y-4 xl:space-y-6">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">开始与AI对话</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        在下方输入框中输入您的问题，AI将为您提供详细的回答
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[90%] xl:max-w-[85%] rounded-lg p-4 shadow-md ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border'
                            }`}
                          >
                            {msg.role === 'assistant' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>
                                  {msg.content || (isStreaming ? '正在思考...' : '')}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 输入区域 */}
          <Card className="shrink-0">
            <CardContent className="p-3 xl:p-4">
              {/* 文件列表显示 */}
              {uploadedFiles.length > 0 && (
                <div className="mb-3 p-2 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">已选择 {uploadedFiles.length} 个文件</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFiles}
                      className="h-6 px-2"
                    >
                      <X className="w-3 h-3 mr-1" />
                      清空
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-background p-2 rounded text-sm">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <File className="w-4 h-4 shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="h-6 w-6 p-0 shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                {/* 文件上传按钮 - 根据模型配置显示 */}
                {models.find(m => m.model_name === selectedModel)?.supports_file_upload && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isStreaming}
                      className="rounded-lg shadow-sm h-[60px] xl:h-[80px] w-[60px] xl:w-[80px] shrink-0"
                      title="上传文件"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                  </>
                )}
                
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="输入您的问题... (Shift + Enter 换行)"
                  disabled={isStreaming}
                  className="flex-1 resize-none rounded-lg shadow-sm min-h-[60px] xl:min-h-[80px] max-h-[120px] xl:max-h-[200px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isStreaming || !input.trim()}
                  className="rounded-lg shadow-sm h-[60px] xl:h-[80px] px-4 xl:px-6 shrink-0"
                >
                  {isStreaming ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 hidden xl:block">
                按 Enter 发送，Shift + Enter 换行
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
