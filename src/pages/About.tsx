import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, FileText, AlertTriangle, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function About() {
  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 xl:p-8 max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Info className="w-8 h-8 text-primary" />
          <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold">关于本站</h1>
        </div>
        <p className="text-muted-foreground">
          了解 HMNL 直播讨论站的服务协议、免责声明和相关规定
        </p>
      </div>
      <div className="space-y-6">
        {/* 网站介绍 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              网站介绍
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{"HMNL 直播讨论站（以下简称\"本站\"）由 Rcst Network Studio 开发，由 hmedia幻霜传媒 提供宣发支持。本站是一个专注于直播讨论的在线社区平台，致力于为用户提供一个开放、友好、有序的交流环境，让用户能够自由分享观点、讨论话题、交流经验。"}</p>
            <p>
              本站提供帖子发布、实时聊天、个人中心、实名认证等功能，支持用户进行多样化的互动交流。我们重视用户隐私保护，采用先进的加密技术保护用户数据安全。
            </p>
            <p>
              本站由专业团队运营维护，配备管理员和超级管理员负责内容审核和社区管理，确保社区环境健康有序。
            </p>
          </CardContent>
        </Card>

        {/* 重要提示 */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>重要提示</AlertTitle>
          <AlertDescription>
            使用本站服务即表示您已阅读、理解并同意遵守以下服务协议和免责声明。如果您不同意本协议的任何内容，请立即停止使用本站服务。
          </AlertDescription>
        </Alert>

        {/* 使用协议 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              服务使用协议
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">一、用户注册与账号管理</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>用户注册时应提供真实、准确、完整的个人信息</li>
                <li>用户应妥善保管账号和密码，不得将账号转让或借给他人使用</li>
                <li>用户对使用该账号进行的所有活动和行为承担全部责任</li>
                <li>如发现账号被盗用，应立即通知管理员</li>
                <li>本站有权对违规账号进行封禁或删除处理</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">二、内容发布规范</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>用户发布的内容应遵守中华人民共和国相关法律法规</li>
                <li>禁止发布违法违规、淫秽色情、暴力血腥、恐怖主义等内容</li>
                <li>禁止发布侵犯他人知识产权、隐私权、名誉权等合法权益的内容</li>
                <li>禁止发布虚假信息、谣言、诈骗信息等误导性内容</li>
                <li>禁止发布广告、垃圾信息、恶意刷屏等干扰正常秩序的内容</li>
                <li>禁止发布人身攻击、侮辱诽谤、挑衅争吵等不文明内容</li>
                <li>用户对自己发布的内容承担全部法律责任</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">三、用户行为规范</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>用户应文明交流，尊重他人，维护良好的社区氛围</li>
                <li>禁止恶意举报、虚假举报等滥用平台功能的行为</li>
                <li>禁止使用技术手段干扰、破坏平台正常运行</li>
                <li>禁止盗用他人账号、冒充他人身份</li>
                <li>禁止传播病毒、木马等恶意程序</li>
                <li>禁止进行任何违反法律法规的活动</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">四、实名认证</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>用户可自愿选择进行实名认证</li>
                <li>实名认证需提供真实姓名和身份证号码</li>
                <li>实名信息经过加密存储，仅超级管理员在必要时可查看</li>
                <li>实名认证用户在发布不当内容时，本站有权配合公安机关调查</li>
                <li>提供虚假实名信息的用户将被永久封禁</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">五、隐私保护</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>本站重视用户隐私保护，采用加密技术保护用户数据</li>
                <li>本站不会向第三方出售、出租或以其他方式披露用户个人信息</li>
                <li>在以下情况下，本站可能披露用户信息：
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>根据法律法规要求或司法机关、行政机关要求</li>
                    <li>为维护本站合法权益所必需</li>
                    <li>为维护社会公共利益所必需</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">六、知识产权</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>本站的所有内容（包括但不限于文字、图片、音频、视频、软件等）的知识产权归本站或原作者所有</li>
                <li>用户发布的原创内容，知识产权归用户所有</li>
                <li>用户发布内容即视为授权本站在平台内使用、展示该内容</li>
                <li>未经许可，任何人不得擅自复制、传播、修改本站内容</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">七、服务变更与中断</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>本站有权根据业务需要随时变更、中断或终止部分或全部服务</li>
                <li>因系统维护、升级等原因需要暂停服务时，本站会提前通知用户</li>
                <li>因不可抗力因素导致服务中断，本站不承担责任</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">八、违规处理</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>对于违反本协议的用户，本站有权采取以下措施：
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>删除违规内容</li>
                    <li>限制账号功能</li>
                    <li>暂时封禁账号</li>
                    <li>永久封禁账号</li>
                    <li>向有关部门报告</li>
                  </ul>
                </li>
                <li>情节严重的，本站保留追究法律责任的权利</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">九、协议修改</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>本站有权根据需要修改本协议条款</li>
                <li>协议修改后会在网站上公布，不再单独通知用户</li>
                <li>用户继续使用本站服务即视为接受修改后的协议</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 免责声明 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              免责声明
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">一、内容免责</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>本站为用户提供信息发布和交流平台，用户发布的内容不代表本站观点</li>
                <li>用户发布的内容由用户本人负责，本站不对其真实性、准确性、完整性负责</li>
                <li>用户因使用本站内容而产生的任何损失，本站不承担责任</li>
                <li>本站会尽力审核用户发布的内容，但不保证能够发现所有违规内容</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">二、服务免责</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>本站不保证服务一定能满足用户的要求</li>
                <li>本站不保证服务不会中断，也不保证服务的及时性、安全性、准确性</li>
                <li>因网络故障、系统维护、黑客攻击等原因导致的服务中断或数据丢失，本站不承担责任</li>
                <li>用户应自行备份重要数据，本站不对数据丢失承担责任</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">三、第三方链接</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>本站可能包含第三方网站的链接</li>
                <li>本站不对第三方网站的内容、隐私政策等负责</li>
                <li>用户访问第三方网站的风险由用户自行承担</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">四、法律责任</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>用户违反法律法规的，应自行承担全部法律责任</li>
                <li>因用户违法违规行为给本站造成损失的，本站有权要求用户赔偿</li>
                <li>因用户违法违规行为给第三方造成损失的，用户应自行承担赔偿责任</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">五、争议解决</h3>
              <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>本协议的解释、效力及纠纷的解决，适用中华人民共和国法律</li>
                <li>因本协议产生的争议，双方应友好协商解决</li>
                <li>协商不成的，任何一方均可向本站所在地人民法院提起诉讼</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 特别说明 */}
        <Card>
          <CardHeader>
            <CardTitle>特别说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold mb-2 text-foreground">关于直播内容</h3>
              <p className="text-sm">
                本站是直播讨论平台，不提供直播服务本身。用户讨论的直播内容来自第三方直播平台，本站不对第三方直播内容负责。如发现直播内容存在违法违规情况，请及时向相关直播平台和有关部门举报。
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-foreground">关于实名信息使用</h3>
              <p className="text-sm">
                用户的实名信息仅用于身份验证和必要时配合公安机关调查。本站承诺：
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4 mt-2">
                <li>实名信息经过加密存储，采用业界标准的安全措施</li>
                <li>仅超级管理员在以下情况可查看实名信息：
                  <ul className="list-circle list-inside ml-6 mt-1">
                    <li>配合公安机关调查违法犯罪行为</li>
                    <li>处理重大违规事件</li>
                    <li>维护平台和用户合法权益所必需</li>
                  </ul>
                </li>
                <li>普通管理员和其他用户无法查看实名信息</li>
                <li>本站不会将实名信息用于商业目的</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-foreground">联系方式</h3>
              <p className="text-sm">
                如对本协议有任何疑问，或需要举报违法违规内容，请通过以下方式联系我们：
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4 mt-2">
                <li>在聊天室中联系管理员</li>
                <li>使用平台举报功能</li>
                <li>在帖子中 @管理员</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 最后更新时间 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>本协议最后更新时间：2025年12月16日</p>
          <p className="mt-2">© 2025 HMNL直播讨论站 版权所有</p>
        </div>
      </div>
    </div>
  );
}
