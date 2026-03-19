// IP定位服务
export interface LocationInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

// 城市名称映射表（英文->中文）
const CITY_NAME_MAP: Record<string, string> = {
  // 直辖市
  'Beijing': '北京',
  'Shanghai': '上海',
  'Tianjin': '天津',
  'Chongqing': '重庆',
  
  // 省会城市
  'Guangzhou': '广州',
  'Shenzhen': '深圳',
  'Chengdu': '成都',
  'Hangzhou': '杭州',
  'Wuhan': '武汉',
  'Xi\'an': '西安',
  'Xian': '西安',
  'Nanjing': '南京',
  'Shenyang': '沈阳',
  'Harbin': '哈尔滨',
  'Changchun': '长春',
  'Jinan': '济南',
  'Qingdao': '青岛',
  'Dalian': '大连',
  'Zhengzhou': '郑州',
  'Changsha': '长沙',
  'Kunming': '昆明',
  'Fuzhou': '福州',
  'Xiamen': '厦门',
  'Hefei': '合肥',
  'Nanchang': '南昌',
  'Taiyuan': '太原',
  'Shijiazhuang': '石家庄',
  'Nanning': '南宁',
  'Guiyang': '贵阳',
  'Lanzhou': '兰州',
  'Haikou': '海口',
  'Sanya': '三亚',
  'Hohhot': '呼和浩特',
  'Urumqi': '乌鲁木齐',
  'Yinchuan': '银川',
  'Xining': '西宁',
  'Lhasa': '拉萨',
  
  // 其他主要城市
  'Suzhou': '苏州',
  'Wuxi': '无锡',
  'Ningbo': '宁波',
  'Wenzhou': '温州',
  'Foshan': '佛山',
  'Dongguan': '东莞',
  'Zhuhai': '珠海',
  'Zhongshan': '中山',
  'Huizhou': '惠州',
  'Jiangmen': '江门',
  'Shaoguan': '韶关',
  'Zhanjiang': '湛江',
  'Maoming': '茂名',
  'Meizhou': '梅州',
  'Shantou': '汕头',
  'Jieyang': '揭阳',
  'Chaozhou': '潮州',
  'Qingyuan': '清远',
  'Yunfu': '云浮',
  'Yangjiang': '阳江',
  'Heyuan': '河源',
  'Shanwei': '汕尾',
  'Baoding': '保定',
  'Tangshan': '唐山',
  'Qinhuangdao': '秦皇岛',
  'Handan': '邯郸',
  'Xingtai': '邢台',
  'Zhangjiakou': '张家口',
  'Chengde': '承德',
  'Cangzhou': '沧州',
  'Langfang': '廊坊',
  'Hengshui': '衡水',
};

/**
 * 将英文城市名转换为中文
 * @param englishName 英文城市名
 * @returns 中文城市名，如果找不到映射则返回原始名称
 */
function convertCityNameToChinese(englishName: string): string {
  if (!englishName) {
    return '';
  }

  // 直接查找映射表
  const chineseName = CITY_NAME_MAP[englishName];
  if (chineseName) {
    console.log(`城市名称转换: ${englishName} -> ${chineseName}`);
    return chineseName;
  }

  // 如果找不到映射，尝试首字母大写后再查找
  const capitalizedName = englishName.charAt(0).toUpperCase() + englishName.slice(1).toLowerCase();
  const chineseNameCapitalized = CITY_NAME_MAP[capitalizedName];
  if (chineseNameCapitalized) {
    console.log(`城市名称转换: ${englishName} -> ${chineseNameCapitalized}`);
    return chineseNameCapitalized;
  }

  // 如果还是找不到，返回原始名称
  console.warn(`未找到城市名称映射: ${englishName}，使用原始名称`);
  return englishName;
}

/**
 * 尝试使用ipapi.co获取位置信息
 */
async function tryIpapiCo(): Promise<LocationInfo | null> {
  try {
    console.log('[ipapi.co] 尝试获取位置信息...');
    
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('[ipapi.co] 响应状态:', response.status, response.statusText);

    if (!response.ok) {
      console.error('[ipapi.co] 请求失败:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('[ipapi.co] 响应数据:', data);

    if (data.error) {
      console.error('[ipapi.co] API返回错误:', data.reason || data.error);
      return null;
    }

    if (!data.ip) {
      console.error('[ipapi.co] 未返回IP地址');
      return null;
    }

    const englishCity = data.city || '';
    const chineseCity = convertCityNameToChinese(englishCity);

    return {
      ip: data.ip,
      city: chineseCity,
      region: data.region || '',
      country: data.country_name || '',
      countryCode: data.country_code || '',
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error('[ipapi.co] 请求异常:', error);
    return null;
  }
}

/**
 * 尝试使用ip-api.com获取位置信息
 */
async function tryIpApi(): Promise<LocationInfo | null> {
  try {
    console.log('[ip-api.com] 尝试获取位置信息...');
    
    const response = await fetch('http://ip-api.com/json/', {
      method: 'GET',
    });

    console.log('[ip-api.com] 响应状态:', response.status, response.statusText);

    if (!response.ok) {
      console.error('[ip-api.com] 请求失败:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('[ip-api.com] 响应数据:', data);

    if (data.status === 'fail') {
      console.error('[ip-api.com] API返回错误:', data.message);
      return null;
    }

    if (!data.query) {
      console.error('[ip-api.com] 未返回IP地址');
      return null;
    }

    const englishCity = data.city || '';
    const chineseCity = convertCityNameToChinese(englishCity);

    return {
      ip: data.query,
      city: chineseCity,
      region: data.regionName || '',
      country: data.country || '',
      countryCode: data.countryCode || '',
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch (error) {
    console.error('[ip-api.com] 请求异常:', error);
    return null;
  }
}

/**
 * 尝试使用ipify.org获取IP，然后使用ipapi.com获取位置信息
 */
async function tryIpifyAndIpapi(): Promise<LocationInfo | null> {
  try {
    console.log('[ipify.org] 尝试获取IP地址...');
    
    // 先获取IP地址
    const ipResponse = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
    });

    if (!ipResponse.ok) {
      console.error('[ipify.org] 请求失败:', ipResponse.status);
      return null;
    }

    const ipData = await ipResponse.json();
    console.log('[ipify.org] 获取到IP:', ipData.ip);

    if (!ipData.ip) {
      console.error('[ipify.org] 未返回IP地址');
      return null;
    }

    // 使用IP地址查询位置信息
    console.log('[ipapi.com] 尝试查询位置信息...');
    const locationResponse = await fetch(`https://ipapi.com/ip_api.php?ip=${ipData.ip}`, {
      method: 'GET',
    });

    if (!locationResponse.ok) {
      console.error('[ipapi.com] 请求失败:', locationResponse.status);
      // 如果位置查询失败，至少返回IP地址
      return {
        ip: ipData.ip,
        city: '北京', // 默认城市
        region: '',
        country: '',
        countryCode: '',
      };
    }

    const locationData = await locationResponse.json();
    console.log('[ipapi.com] 响应数据:', locationData);

    const englishCity = locationData.city || '';
    const chineseCity = convertCityNameToChinese(englishCity) || '北京';

    return {
      ip: ipData.ip,
      city: chineseCity,
      region: locationData.region || '',
      country: locationData.country || '',
      countryCode: locationData.country_code || '',
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    };
  } catch (error) {
    console.error('[ipify.org + ipapi.com] 请求异常:', error);
    return null;
  }
}

/**
 * 获取用户IP地址和城市信息
 * 使用多个API服务，按顺序尝试，提高成功率
 */
export async function getUserLocation(): Promise<LocationInfo | null> {
  console.log('开始获取用户IP和城市信息...');
  console.log('将尝试多个IP定位服务...');

  // 按顺序尝试多个API
  const apis = [
    { name: 'ipapi.co', fn: tryIpapiCo },
    { name: 'ip-api.com', fn: tryIpApi },
    { name: 'ipify.org + ipapi.com', fn: tryIpifyAndIpapi },
  ];

  for (const api of apis) {
    try {
      console.log(`尝试使用 ${api.name}...`);
      const result = await api.fn();
      
      if (result && result.ip) {
        console.log(`✅ ${api.name} 成功获取位置信息`);
        console.log('用户位置信息:', {
          ip: result.ip,
          city: result.city,
          region: result.region,
          country: result.country,
        });
        return result;
      } else {
        console.warn(`❌ ${api.name} 未能获取有效位置信息`);
      }
    } catch (error) {
      console.error(`❌ ${api.name} 发生异常:`, error);
    }
  }

  console.error('所有IP定位服务均失败');
  return null;
}

/**
 * 格式化城市显示
 * 优先显示城市，如果没有城市则显示地区，最后显示国家
 */
export function formatLocation(locationInfo: LocationInfo | null): string {
  if (!locationInfo) {
    return '未知';
  }

  const parts: string[] = [];

  if (locationInfo.city) {
    parts.push(locationInfo.city);
  }

  if (locationInfo.region && locationInfo.region !== locationInfo.city) {
    parts.push(locationInfo.region);
  }

  if (locationInfo.country) {
    parts.push(locationInfo.country);
  }

  return parts.length > 0 ? parts.join(', ') : '未知';
}

/**
 * 获取简短的城市名称
 * 只返回城市名，不包含地区和国家
 */
export function getShortCity(locationInfo: LocationInfo | null): string {
  if (!locationInfo || !locationInfo.city) {
    return '未知';
  }
  return locationInfo.city;
}
