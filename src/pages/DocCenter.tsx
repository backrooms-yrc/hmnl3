import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Shield, 
  BookOpen, 
  Search, 
  Download, 
  Clock,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  List
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type DocSection = 'user-agreement' | 'privacy-policy' | 'feature-docs' | 'api-docs' | 'website-analysis';

interface DocItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

const DOC_VERSION = 'v1.0.0';
const DOC_UPDATE_DATE = '2026-03-18';

const UserAgreementContent = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        第一条 总则
      </h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>1.1 欢迎您使用HMNL直播系统（以下简称"本平台"）提供的服务。为使用本平台服务，您应当阅读并遵守《HMNL直播系统用户服务协议》（以下简称"本协议"）。请您务必审慎阅读、充分理解各条款内容，特别是免除或限制责任的相应条款。</p>
        <p>1.2 除非您已阅读并接受本协议所有条款，否则您无权使用本平台服务。您的任何使用本平台服务的行为即视为您已阅读并同意本协议的约束。</p>
        <p>1.3 本平台有权在必要时修改本协议条款。您可以在相关服务页面查阅最新版本的协议条款。本协议修改后，如果您继续使用本平台服务，即视为您已接受修改后的协议。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">第二条 服务内容</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>2.1 本平台为用户提供以下服务：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>直播频道管理与观看服务</li>
          <li>社区论坛交流服务</li>
          <li>世界观创作与分享服务</li>
          <li>AI智能对话服务</li>
          <li>实时聊天室服务</li>
          <li>用户个人中心服务</li>
          <li>其他由本平台提供的功能服务</li>
        </ul>
        <p>2.2 本平台有权根据业务发展需要调整、变更、暂停或终止部分或全部服务，并在平台上公告。</p>
        <p>2.3 本平台提供的服务仅供个人非商业用途使用。未经本平台书面许可，不得将本平台服务用于任何商业目的。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">第三条 账号注册与管理</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>3.1 用户在注册账号时应提供真实、准确、完整的个人资料，并在资料变更时及时更新。</p>
        <p>3.2 用户账号设置的用户名不得违反国家法律法规及本平台规则，不得含有任何侮辱、威胁、淫秽等不当内容。</p>
        <p>3.3 用户应妥善保管账号及密码，因用户保管不当可能造成的损失由用户自行承担。用户同意若发现账号被盗用或存在安全漏洞，应立即通知本平台。</p>
        <p>3.4 用户账号仅限本人使用，禁止赠与、借用、租用、转让或售卖。若本平台发现或有合理理由认为账号使用者并非账号初始注册人，本平台有权在未通知的情况下暂停或终止向该账号提供服务，并有权注销该账号。</p>
        <p>3.5 用户注册账号后长期未登录、未使用，本平台有权回收该账号，以免造成资源浪费。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">第四条 用户行为规范</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>4.1 用户在使用本平台服务过程中，必须遵守以下原则：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>遵守中国有关的法律法规</li>
          <li>不得为任何非法目的而使用网络服务系统</li>
          <li>遵守所有与网络服务有关的网络协议、规定和程序</li>
          <li>不得利用本平台服务进行任何可能对互联网正常运转造成不利影响的行为</li>
          <li>不得利用本平台服务传输任何骚扰性的、中伤他人的、辱骂性的、恐吓性的、庸俗淫秽的或其他任何非法的信息资料</li>
        </ul>
        <p>4.2 用户不得利用本平台账号或本平台服务进行以下行为：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>制作、复制、发布、传播或以其他方式传送含有下列内容之一的信息：反对宪法所确定的基本原则的；危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；损害国家荣誉和利益的；煽动民族仇恨、民族歧视、破坏民族团结的；破坏国家宗教政策，宣扬邪教和封建迷信的；散布谣言，扰乱社会秩序，破坏社会稳定的；散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；侮辱或者诽谤他人，侵害他人合法权利的；煽动非法集会、结社、游行、示威、聚众扰乱社会秩序的；以非法民间组织名义活动的；含有法律、行政法规禁止的其他内容的</li>
          <li>以任何方式危害未成年人</li>
          <li>冒充任何人或机构，或以虚伪不实的方式陈述或谎称与任何人或机构有关</li>
          <li>伪造标题或以其他方式操控识别资料，使人误认为该内容为本平台所传送</li>
          <li>将无权传送的内容进行上载、张贴、发送电子邮件或以其他方式传送</li>
          <li>将侵犯任何人的专利、商标、著作权、商业秘密或其他专属权利之内容加以上载、张贴、发送电子邮件或以其他方式传送</li>
          <li>将广告函件、促销资料、"垃圾邮件"等加以上载、张贴、发送电子邮件或以其他方式传送</li>
          <li>将有关干扰、破坏或限制任何计算机软件、硬件或通讯设备功能的软件病毒或其他计算机代码、档案和程序之资料加以上载、张贴、发送电子邮件或以其他方式传送</li>
        </ul>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">第五条 内容规范</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>5.1 用户在本平台发布的内容（包括但不限于文字、图片、音频、视频等）应遵守国家法律法规及本平台相关规定。</p>
        <p>5.2 用户发布的内容不得含有以下信息：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>违反宪法确定的基本原则的</li>
          <li>危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的</li>
          <li>损害国家荣誉和利益的</li>
          <li>煽动民族仇恨、民族歧视，破坏民族团结的</li>
          <li>破坏国家宗教政策，宣扬邪教和封建迷信的</li>
          <li>散布谣言，扰乱社会秩序，破坏社会稳定的</li>
          <li>散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的</li>
          <li>侮辱或者诽谤他人，侵害他人合法权益的</li>
          <li>含有法律、行政法规禁止的其他内容的</li>
        </ul>
        <p>5.3 本平台有权对用户发布的内容进行审核，对于违反本协议的内容，本平台有权在不通知用户的情况下删除或屏蔽。</p>
        <p>5.4 用户发布的内容仅代表用户个人观点，不代表本平台立场。用户对其发布的内容承担全部法律责任。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">第六条 知识产权</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>6.1 本平台服务中所涉及的任何知识产权（包括但不限于著作权、商标权、专利权等）均归本平台或相关权利人所有。</p>
        <p>6.2 用户在本平台发布的内容，用户保证拥有合法权利，不侵犯任何第三方的合法权益。用户授予本平台在全球范围内免费的、永久性的、不可撤销的、非独家的、可再许可的权利，以使用、复制、修改、改编、发布、翻译、创作衍生作品、传播、表演和展示此等内容。</p>
        <p>6.3 本平台尊重他人的知识产权。如用户认为本平台内容侵犯其合法权益，请及时向本平台提出权利通知，本平台将依法处理。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">第七条 隐私保护</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>7.1 本平台重视用户隐私保护，具体内容请参阅《HMNL直播系统隐私政策》。</p>
        <p>7.2 本平台将采取合理的安全措施保护用户个人信息，但用户理解互联网环境下的信息安全存在风险，本平台不对用户个人信息的安全性做任何担保。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">第八条 免责声明</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>8.1 用户明确同意其使用本平台服务所存在的风险将完全由其自己承担；因其使用本平台服务而产生的一切后果也由其自己承担，本平台对用户不承担任何责任。</p>
        <p>8.2 本平台不担保服务一定能满足用户的要求，也不担保服务不会中断，对服务的及时性、安全性、准确性也都不作担保。</p>
        <p>8.3 本平台不保证为向用户提供便利而设置的外部链接的准确性和完整性，同时，对于该等外部链接指向的不由本平台实际控制的任何网页上的内容，本平台不承担任何责任。</p>
        <p>8.4 对于因不可抗力或本平台不能控制的原因造成的服务中断或其它缺陷，本平台不承担任何责任。</p>
        <p>8.5 用户同意，对于本平台向用户提供的下列产品或服务的质量缺陷本身及其引发的任何损失，本平台无需承担任何责任：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>本平台向用户免费提供的各项服务</li>
          <li>本平台向用户赠送的任何产品或服务</li>
          <li>本平台向收费网络服务用户附赠的各种产品或服务</li>
        </ul>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">第九条 协议的变更与终止</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>9.1 本平台有权根据需要不时修订本协议，并在本平台公布，不再单独通知用户。变更后的协议一经公布即生效，并取代原协议。用户可以在本平台查阅最新版本的协议。用户继续使用本平台提供的服务即视为用户接受经修订的协议。</p>
        <p>9.2 如用户违反本协议规定，本平台有权终止向该用户提供服务。如该用户再次直接或间接或以他人名义注册为用户的，一经发现，本平台有权立即停止向该用户提供服务。</p>
        <p>9.3 如本平台终止向用户提供服务，则本平台将不再向用户提供任何服务，用户将不能再登录本平台。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">第十条 法律适用与争议解决</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>10.1 本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。</p>
        <p>10.2 如双方就本协议内容或其执行发生任何争议，双方应尽力友好协商解决；协商不成时，任何一方均可向本平台所在地有管辖权的人民法院提起诉讼。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">第十一条 其他</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>11.1 本协议构成用户与本平台之间的完整协议，取代用户与本平台之前就相关事项达成的所有口头或书面协议。</p>
        <p>11.2 本协议的标题仅为方便阅读而设，不影响本协议条款的含义或解释。</p>
        <p>11.3 如本协议中的任何条款无论因何种原因完全或部分无效或不具有执行力，本协议的其余条款仍应有效并且有约束力。</p>
      </div>
    </section>

    <div className="bg-muted/50 rounded-lg p-4 mt-8">
      <p className="text-sm text-muted-foreground text-center">
        本协议最后更新时间：{DOC_UPDATE_DATE}
      </p>
      <p className="text-sm text-muted-foreground text-center mt-1">
        HMNL直播系统保留对本协议的最终解释权
      </p>
    </div>
  </div>
);

const PrivacyPolicyContent = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        引言
      </h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>HMNL直播系统（以下简称"我们"）深知个人信息对您的重要性，我们将按照法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全可控。</p>
        <p>本隐私政策旨在向您说明我们如何收集、使用、存储、共享和保护您的个人信息，以及您享有的相关权利。请您在使用我们的服务前，仔细阅读并理解本隐私政策。</p>
        <p>本隐私政策与您使用我们的服务息息相关，请您仔细阅读。如果您不同意本隐私政策的任何内容，您应立即停止使用我们的服务。当您使用我们提供的任一服务时，即表示您已同意我们按照本隐私政策收集、使用、储存和分享您的相关信息。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">一、我们如何收集您的个人信息</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>个人信息是指以电子或者其他方式记录的能够单独或者与其他信息结合识别特定自然人身份的各种信息。我们仅会出于以下目的，收集和使用您的个人信息：</p>
        
        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2 text-foreground">1. 账号注册与登录</h3>
          <p className="text-sm">当您注册账号时，您需要向我们提供用户名、密码。如果您选择使用手机号注册，我们还会收集您的手机号码。这些信息是您注册和使用我们服务的必要条件。</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2 text-foreground">2. 实名认证</h3>
          <p className="text-sm">当您进行实名认证时，我们需要收集您的真实姓名和身份证号码。这些信息将经过加密存储，仅用于身份验证和配合法律法规要求的调查。</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2 text-foreground">3. 信息发布与互动</h3>
          <p className="text-sm">当您使用我们的服务发布内容（如帖子、评论、聊天消息等）时，我们会收集您发布的信息，并记录发布时间和相关操作日志。</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2 text-foreground">4. 设备信息</h3>
          <p className="text-sm">为了向您提供更好的服务，我们会收集您的设备信息，包括设备型号、操作系统版本、设备标识符、IP地址等。这些信息有助于我们优化服务体验和保障账号安全。</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2 text-foreground">5. 位置信息</h3>
          <p className="text-sm">根据您的IP地址，我们可能会获取您的大致地理位置信息，用于提供本地化服务和内容推荐。您可以在设备设置中关闭位置权限。</p>
        </div>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">二、我们如何使用您的个人信息</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>我们会出于以下目的使用您的个人信息：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>为您提供服务，包括账号注册、登录、内容发布等核心功能</li>
          <li>验证您的身份，确保账号安全</li>
          <li>向您发送服务通知和系统消息</li>
          <li>改进我们的产品和服务，提升用户体验</li>
          <li>进行数据分析，了解用户使用习惯和偏好</li>
          <li>保障平台安全，预防、发现、调查欺诈、危害安全等违法违规行为</li>
          <li>遵守法律法规的要求，响应政府机关的合法请求</li>
          <li>经您同意的其他用途</li>
        </ul>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">三、我们如何存储和保护您的个人信息</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>3.1 信息存储</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>您的个人信息将存储在中华人民共和国境内的服务器</li>
          <li>我们会在法律法规规定的期限内保存您的个人信息</li>
          <li>当您注销账号后，我们会删除您的个人信息或进行匿名化处理</li>
        </ul>

        <p className="mt-4">3.2 安全保护措施</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>我们采用业界标准的安全技术（如SSL加密）来保护您的个人信息</li>
          <li>我们对敏感信息（如身份证号）进行加密存储</li>
          <li>我们建立了严格的信息安全管理制度，限制员工访问个人信息的权限</li>
          <li>我们定期进行安全测试和漏洞扫描，及时修复安全隐患</li>
        </ul>

        <p className="mt-4">3.3 安全事件处置</p>
        <p>若不幸发生个人信息安全事件，我们将按照法律法规的要求，及时向您告知：安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施、您可自主防范和降低风险的建议等。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">四、我们如何共享、转让、公开披露您的个人信息</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>4.1 共享</p>
        <p>我们不会与任何第三方共享您的个人信息，除非：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>获得您的明确同意</li>
          <li>根据法律法规的要求</li>
          <li>根据政府主管部门的要求</li>
          <li>为维护我们、用户或社会公众的合法权益所必需</li>
        </ul>

        <p className="mt-4">4.2 转让</p>
        <p>我们不会将您的个人信息转让给任何公司、组织和个人，但以下情况除外：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>获得您的明确同意</li>
          <li>在涉及合并、收购或破产清算时，我们会要求新的持有您个人信息的公司继续受本隐私政策的约束</li>
        </ul>

        <p className="mt-4">4.3 公开披露</p>
        <p>我们仅会在以下情况下公开披露您的个人信息：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>获得您的明确同意</li>
          <li>基于法律法规的要求</li>
        </ul>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">五、您的权利</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>我们保障您对自己的个人信息行使以下权利：</p>
        
        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2 text-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            访问权
          </h3>
          <p className="text-sm">您有权访问您的个人信息，我们会在您提出请求后尽快提供。</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2 text-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            更正权
          </h3>
          <p className="text-sm">您有权更正您的不准确或不完整的个人信息。</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2 text-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            删除权
          </h3>
          <p className="text-sm">在特定情况下，您有权要求我们删除您的个人信息。</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2 text-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            注销账号
          </h3>
          <p className="text-sm">您有权注销您的账号。账号注销后，我们将停止为您提供服务，并删除您的个人信息或进行匿名化处理。</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2 text-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            撤回同意
          </h3>
          <p className="text-sm">对于基于您同意而进行的个人信息处理活动，您有权撤回同意。</p>
        </div>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">六、未成年人保护</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>我们非常重视对未成年人个人信息的保护：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>我们不会主动向未成年人收集个人信息</li>
          <li>如果您是未成年人，请在监护人的陪同下阅读本政策，并在取得监护人同意后使用我们的服务</li>
          <li>如果我们发现在未获得监护人同意的情况下收集了未成年人的个人信息，我们会设法尽快删除相关数据</li>
          <li>监护人有权代为行使未成年人的个人信息权利</li>
        </ul>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">七、本政策的更新</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>我们可能会适时修订本隐私政策。未经您明确同意，我们不会削减您依据本隐私政策所享有的权利。</p>
        <p>对于重大变更，我们会在本政策更新后，通过弹窗、站内信等方式向您告知。若您在政策更新后继续使用我们的服务，即表示您同意接受修订后的政策。</p>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">八、如何联系我们</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>如果您对本隐私政策有任何疑问、意见或建议，可以通过以下方式与我们联系：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>在平台内联系管理员</li>
          <li>使用平台举报功能</li>
        </ul>
        <p>我们将在15个工作日内回复您的请求。</p>
      </div>
    </section>

    <div className="bg-muted/50 rounded-lg p-4 mt-8">
      <p className="text-sm text-muted-foreground text-center">
        本隐私政策最后更新时间：{DOC_UPDATE_DATE}
      </p>
      <p className="text-sm text-muted-foreground text-center mt-1">
        HMNL直播系统保留对本隐私政策的最终解释权
      </p>
    </div>
  </div>
);

const FeatureDocsContent = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: '如何注册账号？',
      answer: '点击页面右上角的「登录」按钮，在弹出的对话框中选择「注册」，填写用户名和密码即可完成注册。您也可以选择使用手机号注册，需要接收短信验证码。'
    },
    {
      question: '如何进行实名认证？',
      answer: '登录后进入「个人中心」页面，找到「实名认证」选项，填写您的真实姓名和身份证号码，系统会自动验证信息是否匹配。实名信息经过加密存储，保障您的隐私安全。'
    },
    {
      question: '如何成为主播？',
      answer: '目前主播入驻需要管理员审核。您可以在个人中心申请成为入驻主播，填写频道名称和简介，等待管理员审核通过后即可获得直播权限。'
    },
    {
      question: '如何发布帖子？',
      answer: '登录后点击导航栏的「发布帖子」按钮，填写标题和内容，支持Markdown格式。发布后帖子会出现在帖子广场供其他用户浏览和评论。'
    },
    {
      question: '如何使用AI对话功能？',
      answer: '登录后进入「AI大模型」页面，选择您想要使用的AI模型，即可开始对话。部分模型支持文件上传功能，可以上传文档进行分析。'
    },
    {
      question: '忘记密码怎么办？',
      answer: '如果您绑定了手机号，可以使用手机验证码登录后重置密码。如果没有绑定手机号，请联系管理员协助处理。'
    },
    {
      question: '如何举报违规内容？',
      answer: '在帖子、评论或用户主页中，点击「举报」按钮，选择举报原因并填写详细说明。管理员会在收到举报后尽快处理。'
    },
    {
      question: '如何注销账号？',
      answer: '进入「个人中心」>「账号设置」，找到「注销账号」选项。请注意，账号注销后所有数据将被删除且无法恢复，请谨慎操作。'
    }
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          产品概述
        </h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>HMNL直播系统是一个综合性的内容管理与直播平台，集成了直播频道管理、社区论坛、世界观创作、AI对话等多种功能模块。平台采用现代化的前端技术栈，遵循 Material Design 3 设计规范，为用户提供流畅的使用体验。</p>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-xl font-semibold mb-4">核心功能模块</h2>
        <div className="grid gap-4">
          {[
            { title: "直播频道", desc: "观看直播、管理频道、实时互动", icon: "📺" },
            { title: "社区论坛", desc: "发布帖子、评论互动、内容分享", icon: "💬" },
            { title: "世界观创作", desc: "创作内容、分享作品、互动交流", icon: "🌍" },
            { title: "AI对话", desc: "智能对话、多模型选择、文件分析", icon: "🤖" },
            { title: "聊天室", desc: "实时聊天、弹幕互动", icon: "💭" },
            { title: "用户中心", desc: "个人资料、账号设置、消息通知", icon: "👤" }
          ].map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <List className="w-5 h-5 text-primary" />
          操作指南
        </h2>
        
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              账号与认证
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>注册登录：</strong>支持用户名密码登录、手机验证码登录、人脸识别登录三种方式。</p>
              <p><strong>实名认证：</strong>进入个人中心，填写真实姓名和身份证号，系统自动验证。</p>
              <p><strong>账号安全：</strong>建议绑定手机号，定期修改密码，开启二次验证。</p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              内容创作
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>发布帖子：</strong>点击"发布帖子"，填写标题和内容，支持Markdown格式。</p>
              <p><strong>世界观创作：</strong>进入世界观页面，创建您的专属内容，支持自定义样式。</p>
              <p><strong>放送页面：</strong>创建自定义HTML页面，展示直播内容或其他信息。</p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              直播功能
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>观看直播：</strong>进入频道列表，选择感兴趣的频道即可观看。</p>
              <p><strong>开启直播：</strong>入驻主播可获得推流地址，使用OBS等软件进行推流。</p>
              <p><strong>互动功能：</strong>支持弹幕聊天、点赞、关注等互动功能。</p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              AI对话
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>选择模型：</strong>进入AI对话页面，选择您需要的AI模型。</p>
              <p><strong>文件上传：</strong>部分模型支持文件上传，可分析文档内容。</p>
              <p><strong>历史记录：</strong>对话历史自动保存，可随时查看。</p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          常见问题解答
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card 
              key={index} 
              className="cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{faq.question}</h3>
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform duration-200 ${
                      expandedFaq === index ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
                {expandedFaq === index && (
                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                    {faq.answer}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-xl font-semibold mb-4">技术支持</h2>
        <div className="space-y-3 text-muted-foreground">
          <p>如果您在使用过程中遇到任何问题，可以通过以下方式获取帮助：</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>在聊天室中联系管理员</li>
            <li>使用平台举报功能反馈问题</li>
            <li>在帖子中 @管理员 寻求帮助</li>
          </ul>
        </div>
      </section>

      <div className="bg-muted/50 rounded-lg p-4 mt-8">
        <p className="text-sm text-muted-foreground text-center">
          功能文档最后更新时间：{DOC_UPDATE_DATE}
        </p>
        <p className="text-sm text-muted-foreground text-center mt-1">
          文档版本：{DOC_VERSION}
        </p>
      </div>
    </div>
  );
};

const ApiDocsContent = () => {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  const endpoints = [
    {
      id: 'room-url',
      method: 'GET',
      path: '/api/v1/live/room-url',
      title: '直播间URL获取',
      description: '获取直播间的推流地址和播放地址',
      params: [
        { name: 'channel_id', type: 'string', required: false, desc: '频道ID' },
        { name: 'channel_url', type: 'string', required: false, desc: '频道URL标识' },
        { name: 'stream_id', type: 'string', required: false, desc: '推流ID' }
      ]
    },
    {
      id: 'player-url',
      method: 'GET',
      path: '/api/v1/live/player-url',
      title: '播放器URL获取',
      description: '获取频道播放器的访问地址和嵌入代码',
      params: [
        { name: 'channel_id', type: 'string', required: false, desc: '频道ID' },
        { name: 'channel_url', type: 'string', required: false, desc: '频道URL标识' },
        { name: 'format', type: 'string', required: false, desc: '播放格式：hls、flv、auto' },
        { name: 'quality', type: 'string', required: false, desc: '画质：high、medium、low、auto' }
      ]
    },
    {
      id: 'channel-info',
      method: 'GET',
      path: '/api/v1/channel/info',
      title: '频道信息获取',
      description: '获取频道的详细信息，包括基本信息、主播信息、统计数据等',
      params: [
        { name: 'channel_id', type: 'string', required: false, desc: '频道ID' },
        { name: 'channel_url', type: 'string', required: false, desc: '频道URL标识' },
        { name: 'include_stats', type: 'boolean', required: false, desc: '是否包含统计数据' }
      ]
    },
    {
      id: 'channel-list',
      method: 'GET',
      path: '/api/v1/channel/list',
      title: '频道列表获取',
      description: '获取频道列表，支持分页、搜索、筛选和排序',
      params: [
        { name: 'page', type: 'number', required: false, desc: '页码（默认1）' },
        { name: 'limit', type: 'number', required: false, desc: '每页数量（默认20）' },
        { name: 'search', type: 'string', required: false, desc: '搜索关键词' },
        { name: 'is_live', type: 'boolean', required: false, desc: '筛选直播状态' },
        { name: 'sort_by', type: 'string', required: false, desc: '排序字段' }
      ]
    },
    {
      id: 'live-status',
      method: 'GET',
      path: '/api/v1/live/status',
      title: '直播状态获取',
      description: '获取单个频道的直播状态信息',
      params: [
        { name: 'channel_id', type: 'string', required: false, desc: '频道ID' },
        { name: 'channel_url', type: 'string', required: false, desc: '频道URL标识' }
      ]
    },
    {
      id: 'batch-status',
      method: 'POST',
      path: '/api/v1/live/status/batch',
      title: '批量直播状态获取',
      description: '批量获取多个频道的直播状态',
      params: [
        { name: 'channel_ids', type: 'string[]', required: true, desc: '频道ID数组（最多50个）' }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'POST': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'PUT': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <List className="w-5 h-5 text-primary" />
          API概述
        </h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>HMNL直播系统提供完整的RESTful API接口，支持直播间管理、频道信息获取、播放器集成等功能。</p>
          <div className="bg-muted/30 rounded-lg p-4 mt-4">
            <h3 className="font-semibold mb-2 text-foreground">基础信息</h3>
            <ul className="space-y-1 text-sm">
              <li><span className="font-medium">基础链接：</span>https://hmnl3.20110208.xyz</li>
              <li><span className="font-medium">API版本：</span>v1</li>
              <li><span className="font-medium">API前缀：</span>/api/v1</li>
              <li><span className="font-medium">数据格式：</span>JSON</li>
            </ul>
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-xl font-semibold mb-4">接口端点</h2>
        <div className="space-y-3">
          {endpoints.map((endpoint) => (
            <Card 
              key={endpoint.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`font-mono text-xs ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </Badge>
                    <div>
                      <h3 className="font-medium">{endpoint.title}</h3>
                      <code className="text-xs text-muted-foreground">{endpoint.path}</code>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform duration-200 ${
                      expandedEndpoint === endpoint.id ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
                {expandedEndpoint === endpoint.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    <div>
                      <h4 className="text-sm font-medium mb-2">请求参数</h4>
                      <div className="bg-muted/30 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium">参数名</th>
                              <th className="text-left p-2 font-medium">类型</th>
                              <th className="text-left p-2 font-medium">必填</th>
                              <th className="text-left p-2 font-medium">说明</th>
                            </tr>
                          </thead>
                          <tbody>
                            {endpoint.params.map((param, idx) => (
                              <tr key={idx} className="border-b last:border-0">
                                <td className="p-2 font-mono text-xs">{param.name}</td>
                                <td className="p-2 font-mono text-xs text-muted-foreground">{param.type}</td>
                                <td className="p-2">
                                  {param.required ? (
                                    <Badge variant="destructive" className="text-xs">必填</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">可选</Badge>
                                  )}
                                </td>
                                <td className="p-2 text-muted-foreground">{param.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-xl font-semibold mb-4">HTTP状态码</h2>
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">状态码</th>
                <th className="text-left p-3 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="p-3 font-mono">200</td><td className="p-3">请求成功</td></tr>
              <tr className="border-b"><td className="p-3 font-mono">201</td><td className="p-3">资源创建成功</td></tr>
              <tr className="border-b"><td className="p-3 font-mono">400</td><td className="p-3">请求参数错误</td></tr>
              <tr className="border-b"><td className="p-3 font-mono">401</td><td className="p-3">未授权，需要登录</td></tr>
              <tr className="border-b"><td className="p-3 font-mono">403</td><td className="p-3">禁止访问，权限不足</td></tr>
              <tr className="border-b"><td className="p-3 font-mono">404</td><td className="p-3">资源不存在</td></tr>
              <tr className="border-b"><td className="p-3 font-mono">429</td><td className="p-3">请求频率超限</td></tr>
              <tr className="border-b"><td className="p-3 font-mono">500</td><td className="p-3">服务器内部错误</td></tr>
              <tr><td className="p-3 font-mono">503</td><td className="p-3">服务暂时不可用</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-xl font-semibold mb-4">集成示例</h2>
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-foreground">JavaScript/TypeScript</h3>
            <pre className="text-xs overflow-x-auto text-muted-foreground">
{`// 获取直播间URL
const response = await fetch(
  'https://hmnl3.20110208.xyz/api/v1/live/room-url?channel_url=my-channel'
);
const data = await response.json();
console.log(data.data.hls_play_url);`}
            </pre>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-foreground">cURL</h3>
            <pre className="text-xs overflow-x-auto text-muted-foreground">
{`curl -X GET "https://hmnl3.20110208.xyz/api/v1/channel/info?channel_url=my-channel"`}
            </pre>
          </div>
        </div>
      </section>

      <div className="bg-muted/50 rounded-lg p-4 mt-8">
        <p className="text-sm text-muted-foreground text-center">
          API文档最后更新时间：{DOC_UPDATE_DATE}
        </p>
        <p className="text-sm text-muted-foreground text-center mt-1">
          完整API文档请访问：<ExternalLink className="w-3 h-3 inline mx-1" /><a href="/docs/live-api.md" className="text-primary hover:underline">live-api.md</a>
        </p>
      </div>
    </div>
  );
};

const WebsiteAnalysisContent = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-primary" />
        执行摘要
      </h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>HMNL直播系统是一个综合性的内容管理与直播平台，集成了直播频道管理、社区论坛、世界观创作、AI对话等多种功能模块。平台采用现代化的前端技术栈（React 18 + TypeScript + Vite），遵循 Material Design 3 设计规范，提供流畅的用户体验。</p>
        <div className="bg-primary/5 rounded-lg p-4 mt-4">
          <p className="font-medium text-foreground">核心价值主张</p>
          <p className="mt-2">"一站式直播与内容创作平台" - HMNL直播系统将直播、社区、创作工具整合于一体，为内容创作者和观众提供无缝的互动体验。</p>
        </div>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">核心功能模块</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              用户认证模块
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 用户名密码登录</li>
              <li>• 手机验证码登录</li>
              <li>• 人脸识别登录</li>
              <li>• 访客模式</li>
              <li>• 实名认证</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              直播频道模块
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 频道列表与播放</li>
              <li>• RTMP推流服务</li>
              <li>• HLS/FLV播放支持</li>
              <li>• 实时弹幕互动</li>
              <li>• 直播管理后台</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              社区论坛模块
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Markdown帖子编辑</li>
              <li>• 评论系统</li>
              <li>• 搜索功能</li>
              <li>• 举报机制</li>
              <li>• 实时聊天室</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              创作工具模块
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 世界观创作工具</li>
              <li>• 直播页面定制</li>
              <li>• AI对话集成</li>
              <li>• 天气服务</li>
              <li>• 地图导航</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">目标受众</h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-primary">创</span>
          </div>
          <div>
            <p className="font-medium">内容创作者</p>
            <p className="text-sm text-muted-foreground">拥有专业技能或特长，希望分享内容。核心需求：直播推流、粉丝互动、内容管理。</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-primary">观</span>
          </div>
          <div>
            <p className="font-medium">观众用户</p>
            <p className="text-sm text-muted-foreground">喜欢观看直播和视频内容。核心需求：观看直播、弹幕互动、关注主播。</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-primary">社</span>
          </div>
          <div>
            <p className="font-medium">社区用户</p>
            <p className="text-sm text-muted-foreground">活跃的互联网用户，喜欢讨论交流。核心需求：发帖讨论、评论互动、信息获取。</p>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">竞争优势</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm">功能全面整合</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm">技术架构先进</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm">用户体验优秀</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm">社区氛围良好</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm">持续迭代更新</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm">Material Design 3规范</span>
        </div>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">商业价值</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">订阅服务</p>
            <p className="text-sm mt-1">会员订阅收入</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">虚拟货币</p>
            <p className="text-sm mt-1">平台内充值</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">增值服务</p>
            <p className="text-sm mt-1">高级功能付费</p>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <section>
      <h2 className="text-xl font-semibold mb-4">潜在改进领域</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <Badge variant="destructive">高</Badge>
          <span>移动端体验优化</span>
        </div>
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <Badge variant="destructive">高</Badge>
          <span>搜索功能增强</span>
        </div>
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <Badge variant="destructive">高</Badge>
          <span>个性化推荐系统</span>
        </div>
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <Badge variant="secondary">中</Badge>
          <span>离线功能支持</span>
        </div>
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <Badge variant="secondary">中</Badge>
          <span>多语言国际化</span>
        </div>
      </div>
    </section>

    <div className="bg-muted/50 rounded-lg p-4 mt-8">
      <p className="text-sm text-muted-foreground text-center">
        网站分析报告最后更新时间：2026-03-19
      </p>
      <p className="text-sm text-muted-foreground text-center mt-1">
        完整报告请访问：<ExternalLink className="w-3 h-3 inline mx-1" /><a href="/docs/网站分析报告.md" className="text-primary hover:underline">网站分析报告.md</a>
      </p>
    </div>
  </div>
);

const docSections: Record<DocSection, { title: string; icon: React.ReactNode; description: string }> = {
  'user-agreement': {
    title: '用户协议',
    icon: <FileText className="w-5 h-5" />,
    description: '了解使用本平台服务的条款与条件'
  },
  'privacy-policy': {
    title: '隐私政策',
    icon: <Shield className="w-5 h-5" />,
    description: '了解我们如何收集、使用和保护您的个人信息'
  },
  'feature-docs': {
    title: '功能文档',
    icon: <BookOpen className="w-5 h-5" />,
    description: '查看产品功能说明、操作指南和常见问题'
  },
  'api-docs': {
    title: 'API文档',
    icon: <List className="w-5 h-5" />,
    description: '开发者接口文档与集成指南'
  },
  'website-analysis': {
    title: '网站分析报告',
    icon: <HelpCircle className="w-5 h-5" />,
    description: '全面分析网站功能、用户受益与商业价值'
  }
};

export default function DocCenter() {
  const [activeSection, setActiveSection] = useState<DocSection>('user-agreement');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return Object.entries(docSections);
    const query = searchQuery.toLowerCase();
    return Object.entries(docSections).filter(([key, value]) => 
      value.title.toLowerCase().includes(query) || 
      value.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleDownload = (section: DocSection) => {
    const docTitles = {
      'user-agreement': '用户协议',
      'privacy-policy': '隐私政策',
      'feature-docs': '功能文档',
      'api-docs': 'API文档',
      'website-analysis': '网站分析报告'
    };
    
    const content = document.querySelector('.doc-content')?.textContent || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HMNL直播系统${docTitles[section]}_${DOC_UPDATE_DATE}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadDialogOpen(true);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'user-agreement':
        return <UserAgreementContent />;
      case 'privacy-policy':
        return <PrivacyPolicyContent />;
      case 'feature-docs':
        return <FeatureDocsContent />;
      case 'api-docs':
        return <ApiDocsContent />;
      case 'website-analysis':
        return <WebsiteAnalysisContent />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-4 md:p-6 xl:p-8 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold">文档中心</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-muted-foreground">
            查阅用户协议、隐私政策和产品功能文档
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className={`lg:w-72 flex-shrink-0 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索文档..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-1">
                  {filteredSections.map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveSection(key as DocSection);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        activeSection === key
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {value.icon}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{value.title}</div>
                        <div className="text-xs truncate opacity-70">{value.description}</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        activeSection === key ? 'opacity-100' : 'opacity-0'
                      }`} />
                    </button>
                  ))}
                </nav>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>更新日期：{DOC_UPDATE_DATE}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>版本：{DOC_VERSION}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDownload(activeSection)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载当前文档
                </Button>
              </CardContent>
            </Card>
          </aside>

          <main className="flex-1 min-w-0">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {docSections[activeSection].icon}
                    <div>
                      <CardTitle>{docSections[activeSection].title}</CardTitle>
                      <CardDescription className="mt-1">
                        {docSections[activeSection].description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="hidden sm:flex">
                    {DOC_VERSION}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <ScrollArea className="doc-content">
                  {renderContent()}
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {Object.entries(docSections).map(([key, value]) => (
                <Button
                  key={key}
                  variant={activeSection === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveSection(key as DocSection)}
                  className="text-xs"
                >
                  {value.icon}
                  <span className="ml-1 hidden sm:inline">{value.title}</span>
                </Button>
              ))}
            </div>
          </main>
        </div>
      </div>

      <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              下载成功
            </DialogTitle>
            <DialogDescription>
              文档已成功下载到您的设备。您可以使用文本编辑器打开查看。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setDownloadDialogOpen(false)}>
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
