import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, BookOpen, MessageSquare, FileText, User, Shield, Zap } from 'lucide-react';

export default function Help() {
  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 xl:p-8 max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold">帮助中心</h1>
        </div>
        <p className="text-muted-foreground">
          欢迎来到 HMNL 直播讨论站帮助中心，这里提供详细的使用指南和功能介绍
        </p>
      </div>

      <div className="space-y-6">
        {/* 网站介绍 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              关于 HMNL 直播讨论站
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              HMNL 直播讨论站是一个专注于直播讨论的在线社区平台。用户可以在这里发布话题帖子、参与实时聊天、分享观点和交流经验。
            </p>
            <p className="text-muted-foreground">
              我们致力于为用户提供一个友好、开放、有序的讨论环境，让每个人都能自由表达观点，同时维护社区的良好氛围。
            </p>
          </CardContent>
        </Card>

        {/* 功能介绍 */}
        <Card>
          <CardHeader>
            <CardTitle>核心功能介绍</CardTitle>
            <CardDescription>了解平台的主要功能和使用方法</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="flex gap-3 p-4 border rounded-lg">
                <FileText className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">发布帖子</h3>
                  <p className="text-sm text-muted-foreground">
                    支持 Markdown 格式编辑，可以发布图文并茂的讨论帖子，分享您的观点和经验。
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 border rounded-lg">
                <MessageSquare className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">实时聊天</h3>
                  <p className="text-sm text-muted-foreground">
                    在聊天室中与其他用户进行实时交流，讨论热门话题，结识志同道合的朋友。
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 border rounded-lg">
                <User className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">个人中心</h3>
                  <p className="text-sm text-muted-foreground">
                    管理您的个人信息、查看发布的帖子、设置头像和个性签名。
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 border rounded-lg">
                <Shield className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">实名认证</h3>
                  <p className="text-sm text-muted-foreground">
                    通过实名认证可以获得更高的信任度，参与更多社区活动。
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 border rounded-lg">
                <Zap className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">性能模式</h3>
                  <p className="text-sm text-muted-foreground">
                    启用性能模式可以关闭动画效果，提升应用响应速度，适合低配置设备。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 使用指南 */}
        <Card>
          <CardHeader>
            <CardTitle>使用指南</CardTitle>
            <CardDescription>快速上手平台的各项功能</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>如何注册和登录？</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p>1. 点击页面右上角的"登录"按钮</p>
                  <p>2. 如果是新用户，点击"注册"按钮创建账号</p>
                  <p>3. 填写用户名、邮箱和密码完成注册</p>
                  <p>4. 使用注册的账号信息登录系统</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>如何发布帖子？</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p>1. 登录后，点击左侧菜单的"发帖"按钮</p>
                  <p>2. 填写帖子标题和内容（支持 Markdown 格式）</p>
                  <p>3. 可以添加标签方便其他用户搜索</p>
                  <p>4. 点击"发布"按钮即可发布帖子</p>
                  <p>5. 发布后可以在"帖子"页面查看所有帖子</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>如何参与聊天室讨论？</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p>1. 点击左侧菜单的"聊天室"进入聊天页面</p>
                  <p>2. 在底部输入框输入消息内容</p>
                  <p>3. 按回车键或点击发送按钮发送消息</p>
                  <p>4. 可以使用搜索功能查找历史消息</p>
                  <p>5. 支持实时接收其他用户的消息</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>如何进行实名认证？</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p>1. 进入"个人中心"页面</p>
                  <p>2. 找到"实名认证"区域</p>
                  <p>3. 填写真实姓名和身份证号码</p>
                  <p>4. 提交后等待管理员审核</p>
                  <p>5. 审核通过后会显示"已实名"标识</p>
                  <p className="text-amber-600 dark:text-amber-500">
                    注意：实名信息仅用于身份验证，仅超级管理员可查看，请放心填写。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>如何举报不当内容？</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p>1. 在帖子或消息旁边找到举报按钮</p>
                  <p>2. 点击后填写举报原因（至少5个字符）</p>
                  <p>3. 提交举报后管理员会尽快处理</p>
                  <p>4. 可以在通知中心查看举报处理结果</p>
                  <p className="text-amber-600 dark:text-amber-500">
                    注意：请勿恶意举报，恶意举报可能会受到处罚。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>如何使用性能模式？</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p>1. 在左侧菜单底部找到"性能模式"开关</p>
                  <p>2. 或者进入"系统设置"页面</p>
                  <p>3. 开启性能模式后，嵌入式网页会被隐藏</p>
                  <p>4. 所有动画和过渡效果会被禁用</p>
                  <p>5. 适合低配置设备或网络较慢的情况</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>如何修改个人信息？</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p>1. 进入"个人中心"页面</p>
                  <p>2. 可以修改用户名、个性签名等信息</p>
                  <p>3. 可以上传头像图片</p>
                  <p>4. 修改后点击保存按钮</p>
                  <p>5. 修改后的信息会立即生效</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* 常见问题 */}
        <Card>
          <CardHeader>
            <CardTitle>常见问题</CardTitle>
            <CardDescription>解答用户最关心的问题</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>忘记密码怎么办？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  目前暂不支持自助找回密码功能，请联系管理员协助重置密码。建议您妥善保管账号密码。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger>为什么我的帖子被删除了？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  帖子被删除可能是因为违反了社区规则，如发布违法违规内容、广告信息、恶意攻击他人等。请查看"关于本站"页面了解详细的使用协议。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger>实名信息会被泄露吗？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  您的实名信息经过加密存储，仅超级管理员在必要时（如配合公安机关调查）可以查看。普通用户和管理员无法查看您的实名信息，请放心使用。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4">
                <AccordionTrigger>如何成为管理员？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  管理员由超级管理员指定。如果您希望成为管理员，请积极参与社区建设，保持良好的行为记录，并联系超级管理员申请。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5">
                <AccordionTrigger>可以删除自己的帖子吗？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  目前暂不支持用户自行删除帖子。如果您需要删除帖子，请联系管理员说明原因，管理员会协助处理。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-6">
                <AccordionTrigger>如何联系管理员？</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  您可以通过聊天室发送消息，或者在帖子中 @管理员。管理员会定期查看消息并及时回复。
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* 联系我们 */}
        <Card>
          <CardHeader>
            <CardTitle>需要更多帮助？</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>如果您在使用过程中遇到问题，或者有任何建议和反馈，欢迎通过以下方式联系我们：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>在聊天室中发送消息</li>
              <li>在帖子中 @管理员</li>
              <li>使用举报功能反馈问题</li>
            </ul>
            <p className="mt-4">我们会尽快回复您的问题，感谢您对 HMNL 直播讨论站的支持！</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
