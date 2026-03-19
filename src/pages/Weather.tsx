import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Wind, Droplets, Eye, AlertTriangle, Sun, Cloud, CloudRain, Snowflake, CloudDrizzle, Zap, CloudFog, ChevronDown, ChevronUp, Shirt, Umbrella, Car, Activity, Flower, Navigation, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile } from '@/db/api';
import { toast } from 'sonner';

// 百度地图类型声明
declare global {
  interface Window {
    BMapGL: any;
    initBaiduMapForWeather: () => void;
  }
}

interface CityInfo {
  areaCn: string;
  areaCode: string;
  cityCn: string;
}

interface NowWeather {
  temp: string;
  weather: string;
  WD: string;
  WS: string;
  SD: string;
  aqi: string;
}

interface DayNightWeather {
  weather: string;
  temperature: string;
  wind: string;
  wind_pow: string;
}

interface LifeIndexItem {
  state: string;
  reply: string;
}

interface Weather1dData {
  cityInfo: CityInfo;
  now: NowWeather;
  day: DayNightWeather;
  night: DayNightWeather;
  lifeIndex?: Record<string, LifeIndexItem>;
}

interface DayWeather {
  time: string;
  weather: string;
  temperature_max: string;
  temperature_min: string;
  wind_day?: string;
  wind_night?: string;
  wind?: string;
  wind_pow: string;
  day_weather_pic?: string;
  night_weather_pic?: string;
}

interface Weather7dData {
  cityInfo: CityInfo;
  d1: DayWeather;
  d2: DayWeather;
  d3: DayWeather;
  d4: DayWeather;
  d5: DayWeather;
  d6: DayWeather;
  d7: DayWeather;
}

interface Weather15dData {
  cityInfo: CityInfo;
  d8: DayWeather;
  d9: DayWeather;
  d10: DayWeather;
  d11: DayWeather;
  d12: DayWeather;
  d13: DayWeather;
  d14: DayWeather;
  d15: DayWeather;
}

export default function Weather() {
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [weather1d, setWeather1d] = useState<Weather1dData | null>(null);
  const [weather7d, setWeather7d] = useState<Weather7dData | null>(null);
  const [weather15d, setWeather15d] = useState<Weather15dData | null>(null);
  const [show15d, setShow15d] = useState(false);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 加载百度地图脚本
  useEffect(() => {
    const loadBaiduMap = () => {
      if (window.BMapGL) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api.map.baidu.com/api?v=1.0&type=webgl&ak=OeTpXHgdUrRT2pPyAPRL7pog6GlMlQzl&callback=initBaiduMapForWeather';
      script.async = true;
      
      (window as any).initBaiduMapForWeather = () => {
        setMapLoaded(true);
      };

      document.body.appendChild(script);
    };

    loadBaiduMap();
  }, []);

  // 获取用户城市信息
  useEffect(() => {
    const fetchUserCity = async () => {
      if (user) {
        try {
          console.log('获取用户城市信息...');
          const profile = await getProfile(user.id);
          if (profile && profile.city) {
            console.log('用户城市:', profile.city);
            setUserCity(profile.city);
            setCity(profile.city);
          } else {
            console.log('用户未设置城市，使用默认城市：北京');
            setCity('北京');
          }
        } catch (error) {
          console.error('获取用户城市信息失败:', error);
          setCity('北京');
        }
      } else {
        // 未登录用户使用默认城市
        setCity('北京');
      }
      setInitialized(true);
    };

    fetchUserCity();
  }, [user]);

  // 获取天气数据
  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      // 并行请求三个API
      const [res1d, res7d, res15d] = await Promise.all([
        fetch(`${supabaseUrl}/functions/v1/weather1d?areaCn=${encodeURIComponent(cityName)}`),
        fetch(`${supabaseUrl}/functions/v1/weather7d?areaCn=${encodeURIComponent(cityName)}`),
        fetch(`${supabaseUrl}/functions/v1/weather15d?areaCn=${encodeURIComponent(cityName)}`),
      ]);

      const data1d = await res1d.json();
      const data7d = await res7d.json();
      const data15d = await res15d.json();

      if (data1d.desc === '成功' && data1d.data) {
        setWeather1d(data1d.data);
      } else {
        throw new Error(data1d.error || '获取当日天气失败');
      }

      if (data7d.desc === '成功' && data7d.data) {
        setWeather7d(data7d.data);
      }

      if (data15d.desc === '成功' && data15d.data) {
        setWeather15d(data15d.data);
      }

      setCity(cityName);
    } catch (err) {
      console.error('获取天气失败:', err);
      setError(err instanceof Error ? err.message : '获取天气信息失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载 - 等待初始化完成且有城市时才获取天气
  useEffect(() => {
    if (initialized && city) {
      fetchWeather(city);
    }
  }, [initialized, city]);

  // 搜索天气
  const handleSearch = () => {
    if (searchCity.trim()) {
      fetchWeather(searchCity.trim());
      setSearchCity('');
    }
  };

  // GPS定位获取当前城市
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      toast.error('您的浏览器不支持地理定位');
      return;
    }

    if (!mapLoaded) {
      toast.error('地图服务加载中，请稍后再试');
      return;
    }

    setLocating(true);
    toast.info('正在获取您的位置...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('GPS定位成功:', { latitude, longitude });

        // 使用百度地图逆地理编码将坐标转换为城市名称
        const geocoder = new window.BMapGL.Geocoder();
        const point = new window.BMapGL.Point(longitude, latitude);

        geocoder.getLocation(point, (result: any) => {
          setLocating(false);
          
          if (result) {
            const cityName = result.addressComponents?.city || result.addressComponents?.province || '北京';
            // 移除"市"字
            const cleanCityName = cityName.replace('市', '');
            console.log('逆地理编码结果:', cleanCityName);
            
            toast.success(`定位成功：${cleanCityName}`);
            fetchWeather(cleanCityName);
          } else {
            toast.error('无法获取城市信息');
          }
        });
      },
      (error) => {
        setLocating(false);
        console.error('GPS定位失败:', error);
        
        let errorMessage = '定位失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '您拒绝了位置权限请求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '定位请求超时';
            break;
        }
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // 获取天气图标
  const getWeatherIcon = (weather: string) => {
    if (weather.includes('晴')) return <Sun className="w-12 h-12 text-yellow-500" />;
    if (weather.includes('云')) return <Cloud className="w-12 h-12 text-gray-400" />;
    if (weather.includes('雨')) return <CloudRain className="w-12 h-12 text-blue-500" />;
    if (weather.includes('雪')) return <Snowflake className="w-12 h-12 text-blue-300" />;
    if (weather.includes('雷')) return <Zap className="w-12 h-12 text-yellow-600" />;
    if (weather.includes('雾') || weather.includes('霾')) return <CloudFog className="w-12 h-12 text-gray-500" />;
    if (weather.includes('阴')) return <Cloud className="w-12 h-12 text-gray-500" />;
    return <Sun className="w-12 h-12 text-yellow-500" />;
  };

  // 获取空气质量等级
  const getAQILevel = (aqi: string) => {
    const aqiNum = parseInt(aqi);
    if (aqiNum <= 50) return { level: '优', color: 'text-green-600', bg: 'bg-green-100' };
    if (aqiNum <= 100) return { level: '良', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (aqiNum <= 150) return { level: '轻度污染', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (aqiNum <= 200) return { level: '中度污染', color: 'text-red-600', bg: 'bg-red-100' };
    if (aqiNum <= 300) return { level: '重度污染', color: 'text-purple-600', bg: 'bg-purple-100' };
    return { level: '严重污染', color: 'text-red-800', bg: 'bg-red-200' };
  };

  // 获取生活指数图标
  const getLifeIndexIcon = (indexName: string) => {
    if (indexName.includes('穿衣')) return <Shirt className="w-5 h-5" />;
    if (indexName.includes('紫外线')) return <Sun className="w-5 h-5" />;
    if (indexName.includes('感冒')) return <Activity className="w-5 h-5" />;
    if (indexName.includes('洗车')) return <Car className="w-5 h-5" />;
    if (indexName.includes('运动')) return <Activity className="w-5 h-5" />;
    if (indexName.includes('花粉') || indexName.includes('过敏')) return <Flower className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      {/* 搜索栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="输入城市名称，如：北京、上海、广州"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || locating}>
              <Search className="w-4 h-4 mr-2" />
              查询
            </Button>
            <Button 
              onClick={handleGPSLocation} 
              disabled={loading || locating || !mapLoaded}
              variant="outline"
              title="使用GPS定位当前城市"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </Button>
          </div>
          {/* 用户城市提示 */}
          {userCity && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>当前显示：{city === userCity ? '您所在的城市' : city}（{userCity}）</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full bg-muted" />
          <Skeleton className="h-32 w-full bg-muted" />
          <Skeleton className="h-48 w-full bg-muted" />
        </div>
      )}

      {/* 天气内容 */}
      {!loading && weather1d && (
        <>
          {/* 实时天气 */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{weather1d.cityInfo.cityCn}</span>
                </div>
                <div className="text-sm font-normal">实时天气</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="text-6xl font-bold">{weather1d.now.temp}°</div>
                  <div className="text-xl">{weather1d.now.weather}</div>
                  <div className="flex items-center gap-4 text-sm opacity-90">
                    <div className="flex items-center gap-1">
                      <Wind className="w-4 h-4" />
                      <span>{weather1d.now.WD} {weather1d.now.WS}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-4 h-4" />
                      <span>湿度 {weather1d.now.SD}</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  {getWeatherIcon(weather1d.now.weather)}
                  <div className={`mt-4 px-3 py-1 rounded-full text-sm ${getAQILevel(weather1d.now.aqi).bg} ${getAQILevel(weather1d.now.aqi).color}`}>
                    AQI {weather1d.now.aqi} {getAQILevel(weather1d.now.aqi).level}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 今日详情 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  白天
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">天气</span>
                  <span className="font-medium">{weather1d.day.weather}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">温度</span>
                  <span className="font-medium">{weather1d.day.temperature}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">风向风力</span>
                  <span className="font-medium">{weather1d.day.wind} {weather1d.day.wind_pow}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-gray-500" />
                  夜间
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">天气</span>
                  <span className="font-medium">{weather1d.night.weather}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">温度</span>
                  <span className="font-medium">{weather1d.night.temperature}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">风向风力</span>
                  <span className="font-medium">{weather1d.night.wind} {weather1d.night.wind_pow}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 生活指数 */}
          {weather1d.lifeIndex && Object.keys(weather1d.lifeIndex).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>生活指数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(weather1d.lifeIndex).map(([key, value]) => (
                    <div key={key} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2 font-medium">
                        {getLifeIndexIcon(key)}
                        <span>{key}</span>
                      </div>
                      <div className="text-sm text-primary font-medium">{value.state}</div>
                      <div className="text-xs text-muted-foreground">{value.reply}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 7日天气预报 */}
          {weather7d && (
            <Card>
              <CardHeader>
                <CardTitle>未来7日天气预报</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                  {['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].map((day) => {
                    const dayData = weather7d[day as keyof Weather7dData] as DayWeather;
                    if (!dayData) return null;
                    return (
                      <div key={day} className="p-4 border rounded-lg text-center space-y-2">
                        <div className="text-sm font-medium">{dayData.time}</div>
                        <div className="flex justify-center">{getWeatherIcon(dayData.weather)}</div>
                        <div className="text-xs text-muted-foreground">{dayData.weather}</div>
                        <div className="text-sm">
                          <span className="text-red-500">{dayData.temperature_max}</span>
                          <span className="mx-1">/</span>
                          <span className="text-blue-500">{dayData.temperature_min}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{dayData.wind_pow}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 8-15日天气预报 */}
          {weather15d && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>未来8-15日天气预报</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShow15d(!show15d)}
                  >
                    {show15d ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        收起
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        展开
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              {show15d && (
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {['d8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15'].map((day) => {
                      const dayData = weather15d[day as keyof Weather15dData] as DayWeather;
                      if (!dayData) return null;
                      return (
                        <div key={day} className="p-4 border rounded-lg text-center space-y-2">
                          <div className="text-sm font-medium">{dayData.time}</div>
                          <div className="flex justify-center">{getWeatherIcon(dayData.weather)}</div>
                          <div className="text-xs text-muted-foreground">{dayData.weather}</div>
                          <div className="text-sm">
                            <span className="text-red-500">{dayData.temperature_max}</span>
                            <span className="mx-1">/</span>
                            <span className="text-blue-500">{dayData.temperature_min}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{dayData.wind_pow}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
