import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Trash2, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Hash, 
  Code, 
  Shuffle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

// 工具卡片组件
interface ToolCardProps {
  title: string;
  description: string;
  input: string;
  output: string;
  onInputChange: (value: string) => void;
  onEncode?: () => void;
  onDecode?: () => void;
  onConvert?: () => void;
  encodeLabel?: string;
  decodeLabel?: string;
  convertLabel?: string;
  showTips?: boolean;
  tips?: string;
  extraInput?: React.ReactNode;
}

function ToolCard({
  title,
  description,
  input,
  output,
  onInputChange,
  onEncode,
  onDecode,
  onConvert,
  encodeLabel = '加密',
  decodeLabel = '解密',
  convertLabel = '转换',
  showTips = false,
  tips = '',
  extraInput
}: ToolCardProps) {
  const [showHelp, setShowHelp] = useState(false);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success('已复制到剪贴板');
    } else {
      toast.error('没有可复制的内容');
    }
  };

  const handleClear = () => {
    onInputChange('');
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {showTips && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="shrink-0"
            >
              <Info className="w-4 h-4" />
            </Button>
          )}
        </div>
        {showHelp && tips && (
          <div className="mt-3 p-3 bg-muted rounded-md text-sm text-muted-foreground">
            {tips}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 额外输入（如密钥） */}
        {extraInput}

        {/* 输入区 */}
        <div className="space-y-2">
          <Label>输入文本</Label>
          <Textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="在此输入需要处理的文本..."
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2">
          {onEncode && (
            <Button onClick={onEncode} className="flex-1 min-w-[100px]">
              <Lock className="w-4 h-4 mr-2" />
              {encodeLabel}
            </Button>
          )}
          {onDecode && (
            <Button onClick={onDecode} variant="secondary" className="flex-1 min-w-[100px]">
              <Unlock className="w-4 h-4 mr-2" />
              {decodeLabel}
            </Button>
          )}
          {onConvert && (
            <Button onClick={onConvert} className="flex-1 min-w-[100px]">
              <ArrowRight className="w-4 h-4 mr-2" />
              {convertLabel}
            </Button>
          )}
          <Button onClick={handleClear} variant="outline" size="icon">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* 输出区 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>输出结果</Label>
            <Button onClick={handleCopy} variant="ghost" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              复制
            </Button>
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="处理结果将显示在这里..."
            className="min-h-[120px] font-mono text-sm bg-muted"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnimasTools() {
  // Base64
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');

  // URL编码
  const [urlInput, setUrlInput] = useState('');
  const [urlOutput, setUrlOutput] = useState('');

  // HTML实体
  const [htmlInput, setHtmlInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');

  // Unicode
  const [unicodeInput, setUnicodeInput] = useState('');
  const [unicodeOutput, setUnicodeOutput] = useState('');

  // 凯撒密码
  const [caesarInput, setCaesarInput] = useState('');
  const [caesarOutput, setCaesarOutput] = useState('');
  const [caesarShift, setCaesarShift] = useState('3');

  // ROT13
  const [rot13Input, setRot13Input] = useState('');
  const [rot13Output, setRot13Output] = useState('');

  // 摩斯电码
  const [morseInput, setMorseInput] = useState('');
  const [morseOutput, setMorseOutput] = useState('');

  // 维吉尼亚密码
  const [vigenereInput, setVigenereInput] = useState('');
  const [vigenereOutput, setVigenereOutput] = useState('');
  const [vigenereKey, setVigenereKey] = useState('');

  // MD5
  const [md5Input, setMd5Input] = useState('');
  const [md5Output, setMd5Output] = useState('');

  // SHA-1
  const [sha1Input, setSha1Input] = useState('');
  const [sha1Output, setSha1Output] = useState('');

  // SHA-256
  const [sha256Input, setSha256Input] = useState('');
  const [sha256Output, setSha256Output] = useState('');

  // 字符串倒序
  const [reverseInput, setReverseInput] = useState('');
  const [reverseOutput, setReverseOutput] = useState('');

  // 大小写转换
  const [caseInput, setCaseInput] = useState('');
  const [caseOutput, setCaseOutput] = useState('');

  // 进制转换
  const [baseInput, setBaseInput] = useState('');
  const [baseOutput, setBaseOutput] = useState('');
  const [baseFrom, setBaseFrom] = useState('10');
  const [baseTo, setBaseTo] = useState('16');

  // ==================== Base64 ====================
  const handleBase64Encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(base64Input)));
      setBase64Output(encoded);
      toast.success('Base64编码成功');
    } catch (error) {
      toast.error('编码失败，请检查输入');
    }
  };

  const handleBase64Decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(base64Input)));
      setBase64Output(decoded);
      toast.success('Base64解码成功');
    } catch (error) {
      toast.error('解码失败，请检查输入是否为有效的Base64');
    }
  };

  // ==================== URL编码 ====================
  const handleUrlEncode = () => {
    try {
      const encoded = encodeURIComponent(urlInput);
      setUrlOutput(encoded);
      toast.success('URL编码成功');
    } catch (error) {
      toast.error('编码失败');
    }
  };

  const handleUrlDecode = () => {
    try {
      const decoded = decodeURIComponent(urlInput);
      setUrlOutput(decoded);
      toast.success('URL解码成功');
    } catch (error) {
      toast.error('解码失败');
    }
  };

  // ==================== HTML实体 ====================
  const handleHtmlEncode = () => {
    const div = document.createElement('div');
    div.textContent = htmlInput;
    setHtmlOutput(div.innerHTML);
    toast.success('HTML编码成功');
  };

  const handleHtmlDecode = () => {
    const div = document.createElement('div');
    div.innerHTML = htmlInput;
    setHtmlOutput(div.textContent || '');
    toast.success('HTML解码成功');
  };

  // ==================== Unicode ====================
  const handleUnicodeEncode = () => {
    const encoded = Array.from(unicodeInput)
      .map(char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'))
      .join('');
    setUnicodeOutput(encoded);
    toast.success('Unicode编码成功');
  };

  const handleUnicodeDecode = () => {
    try {
      const decoded = unicodeInput.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
      });
      setUnicodeOutput(decoded);
      toast.success('Unicode解码成功');
    } catch (error) {
      toast.error('解码失败');
    }
  };

  // ==================== 凯撒密码 ====================
  const caesarCipher = (text: string, shift: number, decode: boolean = false) => {
    if (decode) shift = -shift;
    return text.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
    });
  };

  const handleCaesarEncode = () => {
    const shift = parseInt(caesarShift) || 0;
    setCaesarOutput(caesarCipher(caesarInput, shift));
    toast.success('凯撒加密成功');
  };

  const handleCaesarDecode = () => {
    const shift = parseInt(caesarShift) || 0;
    setCaesarOutput(caesarCipher(caesarInput, shift, true));
    toast.success('凯撒解密成功');
  };

  // ==================== ROT13 ====================
  const handleRot13 = () => {
    const result = rot13Input.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
    });
    setRot13Output(result);
    toast.success('ROT13转换成功');
  };

  // ==================== 摩斯电码 ====================
  const morseCode: Record<string, string> = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/'
  };

  const morseReverse = Object.fromEntries(
    Object.entries(morseCode).map(([k, v]) => [v, k])
  );

  const handleMorseEncode = () => {
    const encoded = morseInput
      .toUpperCase()
      .split('')
      .map(char => morseCode[char] || char)
      .join(' ');
    setMorseOutput(encoded);
    toast.success('摩斯编码成功');
  };

  const handleMorseDecode = () => {
    const decoded = morseInput
      .split(' ')
      .map(code => morseReverse[code] || code)
      .join('');
    setMorseOutput(decoded);
    toast.success('摩斯解码成功');
  };

  // ==================== 维吉尼亚密码 ====================
  const vigenereCipher = (text: string, key: string, decode: boolean = false) => {
    if (!key) {
      toast.error('请输入密钥');
      return '';
    }
    
    const keyUpper = key.toUpperCase();
    let keyIndex = 0;
    
    return text.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= 'Z' ? 65 : 97;
      const shift = keyUpper.charCodeAt(keyIndex % keyUpper.length) - 65;
      keyIndex++;
      
      const actualShift = decode ? -shift : shift;
      return String.fromCharCode(((char.charCodeAt(0) - base + actualShift + 26) % 26) + base);
    });
  };

  const handleVigenereEncode = () => {
    const result = vigenereCipher(vigenereInput, vigenereKey);
    if (result) {
      setVigenereOutput(result);
      toast.success('维吉尼亚加密成功');
    }
  };

  const handleVigenereDecode = () => {
    const result = vigenereCipher(vigenereInput, vigenereKey, true);
    if (result) {
      setVigenereOutput(result);
      toast.success('维吉尼亚解密成功');
    }
  };

  // ==================== 哈希函数 ====================
  const calculateHash = async (text: string, algorithm: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleMd5 = async () => {
    // MD5不被Web Crypto API支持，使用简单实现
    toast.info('MD5需要外部库支持，这里显示SHA-256作为替代');
    const hash = await calculateHash(md5Input, 'SHA-256');
    setMd5Output(hash);
  };

  const handleSha1 = async () => {
    try {
      const hash = await calculateHash(sha1Input, 'SHA-1');
      setSha1Output(hash);
      toast.success('SHA-1计算成功');
    } catch (error) {
      toast.error('计算失败');
    }
  };

  const handleSha256 = async () => {
    try {
      const hash = await calculateHash(sha256Input, 'SHA-256');
      setSha256Output(hash);
      toast.success('SHA-256计算成功');
    } catch (error) {
      toast.error('计算失败');
    }
  };

  // ==================== 字符串倒序 ====================
  const handleReverse = () => {
    setReverseOutput(reverseInput.split('').reverse().join(''));
    toast.success('倒序成功');
  };

  // ==================== 大小写转换 ====================
  const handleUpperCase = () => {
    setCaseOutput(caseInput.toUpperCase());
    toast.success('转换为大写');
  };

  const handleLowerCase = () => {
    setCaseOutput(caseInput.toLowerCase());
    toast.success('转换为小写');
  };

  const handleToggleCase = () => {
    setCaseOutput(
      caseInput.split('').map(char => 
        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
      ).join('')
    );
    toast.success('大小写切换成功');
  };

  // ==================== 进制转换 ====================
  const handleBaseConvert = () => {
    try {
      const fromBase = parseInt(baseFrom);
      const toBase = parseInt(baseTo);
      
      if (![2, 8, 10, 16].includes(fromBase) || ![2, 8, 10, 16].includes(toBase)) {
        toast.error('仅支持2、8、10、16进制');
        return;
      }
      
      const decimal = parseInt(baseInput, fromBase);
      if (isNaN(decimal)) {
        toast.error('输入格式错误');
        return;
      }
      
      const result = decimal.toString(toBase).toUpperCase();
      setBaseOutput(result);
      toast.success('进制转换成功');
    } catch (error) {
      toast.error('转换失败');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* 页面标题 */}
      <Card className="rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl xl:text-3xl">Animas解谜工具箱</CardTitle>
              <CardDescription className="mt-1 text-base">
                AnimasARG解谜工具汇总，我们在这里重新起航！
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 工具分类 */}
      <Tabs defaultValue="encoding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 xl:grid-cols-4 h-auto">
          <TabsTrigger value="encoding" className="gap-2">
            <Code className="w-4 h-4" />
            编码转换
          </TabsTrigger>
          <TabsTrigger value="cipher" className="gap-2">
            <Lock className="w-4 h-4" />
            经典密码
          </TabsTrigger>
          <TabsTrigger value="hash" className="gap-2">
            <Hash className="w-4 h-4" />
            哈希校验
          </TabsTrigger>
          <TabsTrigger value="utils" className="gap-2">
            <Shuffle className="w-4 h-4" />
            实用工具
          </TabsTrigger>
        </TabsList>

        {/* 编码转换 */}
        <TabsContent value="encoding" className="space-y-6">
          <ToolCard
            title="Base64 编码/解码"
            description="最常用的编码方式，用于在文本协议中传输二进制数据"
            input={base64Input}
            output={base64Output}
            onInputChange={setBase64Input}
            onEncode={handleBase64Encode}
            onDecode={handleBase64Decode}
            showTips
            tips="Base64是一种基于64个可打印字符来表示二进制数据的方法。常用于邮件、URL、Cookie等场景。"
          />

          <ToolCard
            title="URL 编码/解码"
            description="处理URL参数中的特殊字符"
            input={urlInput}
            output={urlOutput}
            onInputChange={setUrlInput}
            onEncode={handleUrlEncode}
            onDecode={handleUrlDecode}
            showTips
            tips="URL编码将特殊字符转换为%加十六进制的形式，确保URL的正确传输。"
          />

          <ToolCard
            title="HTML 实体编码/解码"
            description="转换HTML特殊字符为实体引用"
            input={htmlInput}
            output={htmlOutput}
            onInputChange={setHtmlInput}
            onEncode={handleHtmlEncode}
            onDecode={handleHtmlDecode}
            showTips
            tips="HTML实体编码将特殊字符（如<、>、&）转换为&lt;、&gt;、&amp;等形式。"
          />

          <ToolCard
            title="Unicode 编码/解码"
            description="Unicode字符与\uXXXX格式互转"
            input={unicodeInput}
            output={unicodeOutput}
            onInputChange={setUnicodeInput}
            onEncode={handleUnicodeEncode}
            onDecode={handleUnicodeDecode}
            showTips
            tips="Unicode编码将字符转换为\uXXXX格式，其中XXXX是字符的十六进制码点。"
          />
        </TabsContent>

        {/* 经典密码 */}
        <TabsContent value="cipher" className="space-y-6">
          <ToolCard
            title="凯撒密码"
            description="最简单的替换密码，通过字母移位进行加密"
            input={caesarInput}
            output={caesarOutput}
            onInputChange={setCaesarInput}
            onEncode={handleCaesarEncode}
            onDecode={handleCaesarDecode}
            showTips
            tips="凯撒密码通过将字母表中的字母向前或向后移动固定位数来加密。例如，移位3时，A变成D，B变成E。"
            extraInput={
              <div className="space-y-2">
                <Label>移位数（1-25）</Label>
                <Input
                  type="number"
                  min="1"
                  max="25"
                  value={caesarShift}
                  onChange={(e) => setCaesarShift(e.target.value)}
                  placeholder="输入移位数"
                />
              </div>
            }
          />

          <ToolCard
            title="ROT13 密码"
            description="凯撒密码的特殊形式，移位13位"
            input={rot13Input}
            output={rot13Output}
            onInputChange={setRot13Input}
            onConvert={handleRot13}
            convertLabel="转换"
            showTips
            tips="ROT13是凯撒密码的特殊情况，固定移位13位。由于26个字母的一半是13，所以加密和解密使用相同操作。"
          />

          <ToolCard
            title="摩斯电码"
            description="使用点(.)和划(-)表示字母和数字"
            input={morseInput}
            output={morseOutput}
            onInputChange={setMorseInput}
            onEncode={handleMorseEncode}
            onDecode={handleMorseDecode}
            encodeLabel="编码"
            decodeLabel="解码"
            showTips
            tips="摩斯电码使用点和划的组合表示字母、数字和标点。字母之间用空格分隔，单词之间用/分隔。"
          />

          <ToolCard
            title="维吉尼亚密码"
            description="使用密钥进行多表替换的加密方法"
            input={vigenereInput}
            output={vigenereOutput}
            onInputChange={setVigenereInput}
            onEncode={handleVigenereEncode}
            onDecode={handleVigenereDecode}
            showTips
            tips="维吉尼亚密码使用一个密钥词，根据密钥的每个字母对明文进行不同的凯撒移位。比凯撒密码更安全。"
            extraInput={
              <div className="space-y-2">
                <Label>密钥（仅字母）</Label>
                <Input
                  value={vigenereKey}
                  onChange={(e) => setVigenereKey(e.target.value)}
                  placeholder="输入密钥，如：KEY"
                />
              </div>
            }
          />
        </TabsContent>

        {/* 哈希校验 */}
        <TabsContent value="hash" className="space-y-6">
          <ToolCard
            title="MD5 哈希"
            description="计算文本的MD5哈希值（注：此处使用SHA-256替代）"
            input={md5Input}
            output={md5Output}
            onInputChange={setMd5Input}
            onConvert={handleMd5}
            convertLabel="计算"
            showTips
            tips="MD5是一种广泛使用的哈希算法，产生128位（32个十六进制字符）的哈希值。注意：MD5已不够安全，建议使用SHA-256。"
          />

          <ToolCard
            title="SHA-1 哈希"
            description="计算文本的SHA-1哈希值"
            input={sha1Input}
            output={sha1Output}
            onInputChange={setSha1Input}
            onConvert={handleSha1}
            convertLabel="计算"
            showTips
            tips="SHA-1产生160位（40个十六进制字符）的哈希值。虽然比MD5安全，但也已被认为不够安全。"
          />

          <ToolCard
            title="SHA-256 哈希"
            description="计算文本的SHA-256哈希值"
            input={sha256Input}
            output={sha256Output}
            onInputChange={setSha256Input}
            onConvert={handleSha256}
            convertLabel="计算"
            showTips
            tips="SHA-256是SHA-2家族的一员，产生256位（64个十六进制字符）的哈希值。目前被认为是安全的哈希算法。"
          />
        </TabsContent>

        {/* 实用工具 */}
        <TabsContent value="utils" className="space-y-6">
          <ToolCard
            title="字符串倒序"
            description="将文本内容完全反转"
            input={reverseInput}
            output={reverseOutput}
            onInputChange={setReverseInput}
            onConvert={handleReverse}
            convertLabel="倒序"
            showTips
            tips="将字符串从后向前完全反转。例如：'Hello' 变成 'olleH'。"
          />

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg">大小写转换</CardTitle>
              <CardDescription>转换文本的大小写形式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>输入文本</Label>
                <Textarea
                  value={caseInput}
                  onChange={(e) => setCaseInput(e.target.value)}
                  placeholder="在此输入需要处理的文本..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleUpperCase} className="flex-1 min-w-[100px]">
                  转大写
                </Button>
                <Button onClick={handleLowerCase} variant="secondary" className="flex-1 min-w-[100px]">
                  转小写
                </Button>
                <Button onClick={handleToggleCase} variant="outline" className="flex-1 min-w-[100px]">
                  切换大小写
                </Button>
                <Button onClick={() => setCaseInput('')} variant="outline" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>输出结果</Label>
                  <Button 
                    onClick={() => {
                      if (caseOutput) {
                        navigator.clipboard.writeText(caseOutput);
                        toast.success('已复制到剪贴板');
                      }
                    }} 
                    variant="ghost" 
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </Button>
                </div>
                <Textarea
                  value={caseOutput}
                  readOnly
                  placeholder="处理结果将显示在这里..."
                  className="min-h-[120px] font-mono text-sm bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">进制转换</CardTitle>
                  <CardDescription>二进制、八进制、十进制、十六进制互转</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>源进制</Label>
                  <select
                    value={baseFrom}
                    onChange={(e) => setBaseFrom(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="2">二进制 (2)</option>
                    <option value="8">八进制 (8)</option>
                    <option value="10">十进制 (10)</option>
                    <option value="16">十六进制 (16)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>目标进制</Label>
                  <select
                    value={baseTo}
                    onChange={(e) => setBaseTo(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="2">二进制 (2)</option>
                    <option value="8">八进制 (8)</option>
                    <option value="10">十进制 (10)</option>
                    <option value="16">十六进制 (16)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>输入数值</Label>
                <Input
                  value={baseInput}
                  onChange={(e) => setBaseInput(e.target.value)}
                  placeholder="输入要转换的数值..."
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBaseConvert} className="flex-1">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  转换
                </Button>
                <Button onClick={() => setBaseInput('')} variant="outline" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>输出结果</Label>
                  <Button 
                    onClick={() => {
                      if (baseOutput) {
                        navigator.clipboard.writeText(baseOutput);
                        toast.success('已复制到剪贴板');
                      }
                    }} 
                    variant="ghost" 
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </Button>
                </div>
                <Input
                  value={baseOutput}
                  readOnly
                  placeholder="转换结果将显示在这里..."
                  className="font-mono bg-muted"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 页面底部提示 */}
      <Card className="rounded-lg border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">使用提示</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>所有工具均在浏览器本地运行，不会上传您的数据</li>
                <li>点击工具标题旁的 <Info className="w-3 h-3 inline" /> 图标可查看使用说明</li>
                <li>使用复制按钮可快速复制结果到剪贴板</li>
                <li>哈希算法是单向的，只能加密不能解密</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
