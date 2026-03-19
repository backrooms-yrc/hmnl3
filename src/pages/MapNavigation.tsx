import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  MapPin,
  Navigation,
  Search,
  Route,
  Loader2,
  MapPinned,
  Car,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';

// 百度地图API密钥
const BAIDU_MAP_AK = 'OeTpXHgdUrRT2pPyAPRL7pog6GlMlQzl';

// 百度地图类型声明
declare global {
  interface Window {
    BMapGL: any;
    initBaiduMap: () => void;
  }
}

// 地点搜索结果类型
interface PlaceResult {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  uid?: string;
}

// 路线规划结果类型
interface RouteResult {
  distance: number; // 距离（米）
  duration: number; // 时间（秒）
  steps: Array<{
    instruction: string;
    distance: number;
  }>;
}

export default function MapNavigation() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  
  // 路线规划状态
  const [routeStart, setRouteStart] = useState('');
  const [routeEnd, setRouteEnd] = useState('');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [planning, setPlanning] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);

  // 加载百度地图脚本
  useEffect(() => {
    const loadBaiduMap = () => {
      if (window.BMapGL) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${BAIDU_MAP_AK}&callback=initBaiduMap`;
      script.async = true;
      
      (window as any).initBaiduMap = () => {
        setMapLoaded(true);
      };

      document.body.appendChild(script);
    };

    loadBaiduMap();
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new (window as any).BMapGL.Map(mapRef.current);
    const point = new (window as any).BMapGL.Point(116.404, 39.915); // 默认北京天安门
    map.centerAndZoom(point, 12);
    map.enableScrollWheelZoom(true);

    // 添加控件
    map.addControl(new (window as any).BMapGL.NavigationControl());
    map.addControl(new (window as any).BMapGL.ScaleControl());

    mapInstanceRef.current = map;

    // 获取当前位置
    getCurrentLocation();
  }, [mapLoaded]);

  // 获取当前位置
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('您的浏览器不支持地理定位');
      return;
    }

    if (!mapInstanceRef.current) {
      toast.error('地图未加载完成');
      return;
    }

    setLocating(true);
    toast.info('正在获取您的位置...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        if (mapInstanceRef.current) {
          const point = new (window as any).BMapGL.Point(longitude, latitude);
          mapInstanceRef.current.centerAndZoom(point, 15);
          
          // 清除之前的标记
          markersRef.current.forEach(marker => {
            mapInstanceRef.current.removeOverlay(marker);
          });
          markersRef.current = [];
          
          // 添加当前位置标记
          const marker = new (window as any).BMapGL.Marker(point, {
            icon: new (window as any).BMapGL.Icon(
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjZjM5YzEyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
              new (window as any).BMapGL.Size(24, 24)
            )
          });
          mapInstanceRef.current.addOverlay(marker);
          markersRef.current.push(marker);
          
          // 添加信息窗口
          const infoWindow = new (window as any).BMapGL.InfoWindow(
            `<div style="padding: 8px;">
              <p style="margin: 0; font-weight: bold; color: #f39c12;">📍 当前位置</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
                经度: ${longitude.toFixed(6)}<br/>
                纬度: ${latitude.toFixed(6)}
              </p>
            </div>`,
            { width: 200, height: 80 }
          );
          marker.addEventListener('click', () => {
            mapInstanceRef.current.openInfoWindow(infoWindow, point);
          });
          
          setLocating(false);
          toast.success('GPS定位成功');
        }
      },
      (error) => {
        setLocating(false);
        console.error('GPS定位失败:', error);
        
        let errorMessage = '定位失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '您拒绝了位置权限请求，请在浏览器设置中允许位置访问';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用，请检查GPS是否开启';
            break;
          case error.TIMEOUT:
            errorMessage = '定位请求超时，请重试';
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

  // 搜索地点
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('请输入搜索关键词');
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      // 使用百度地图Place API搜索
      const local = new (window as any).BMapGL.LocalSearch(mapInstanceRef.current, {
        onSearchComplete: (results: any) => {
          setSearching(false);
          
          const numPois = results?.getNumPois?.() || 0;
          if (numPois === 0) {
            toast.error('未找到相关地点');
            return;
          }

          const places: PlaceResult[] = [];
          for (let i = 0; i < Math.min(numPois, 10); i++) {
            const poi = results.getPoi(i);
            if (poi && poi.point) {
              places.push({
                name: poi.title || '未知地点',
                address: poi.address || '地址未知',
                location: {
                  lat: poi.point.lat,
                  lng: poi.point.lng
                },
                uid: poi.uid
              });
            }
          }

          if (places.length === 0) {
            toast.error('未找到有效地点');
            return;
          }

          setSearchResults(places);
          toast.success(`找到 ${places.length} 个相关地点`);
        }
      });

      local.search(searchQuery);
    } catch (error) {
      console.error('搜索失败:', error);
      toast.error('搜索失败，请重试');
      setSearching(false);
    }
  };

  // 选择地点
  const handleSelectPlace = (place: PlaceResult) => {
    setSelectedPlace(place);
    
    if (mapInstanceRef.current) {
      // 清除之前的标记
      markersRef.current.forEach(marker => mapInstanceRef.current.removeOverlay(marker));
      markersRef.current = [];

      // 添加新标记
      const point = new (window as any).BMapGL.Point(place.location.lng, place.location.lat);
      const marker = new (window as any).BMapGL.Marker(point);
      mapInstanceRef.current.addOverlay(marker);
      markersRef.current.push(marker);

      // 添加信息窗口
      const infoWindow = new (window as any).BMapGL.InfoWindow(
        `<div style="padding: 10px;">
          <h4 style="margin: 0 0 8px 0; font-weight: bold;">${place.name}</h4>
          <p style="margin: 0; color: #666;">${place.address}</p>
        </div>`,
        { width: 250, height: 100 }
      );
      marker.addEventListener('click', () => {
        mapInstanceRef.current.openInfoWindow(infoWindow, point);
      });

      // 移动地图中心
      mapInstanceRef.current.centerAndZoom(point, 15);
      
      // 自动填充到终点
      if (!routeEnd) {
        setRouteEnd(place.name);
      }
    }
  };

  // 路线规划
  const handlePlanRoute = async () => {
    if (!routeStart.trim() || !routeEnd.trim()) {
      toast.error('请输入起点和终点');
      return;
    }

    setPlanning(true);
    setRouteResult(null);

    try {
      // 清除之前的路线
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeOverlay(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      // 使用百度地图Driving API规划路线
      const driving = new (window as any).BMapGL.DrivingRoute(mapInstanceRef.current, {
        onSearchComplete: (results: any) => {
          setPlanning(false);
          
          // 尝试获取第一个路线方案
          const plan = results?.getPlan(0);
          if (!plan) {
            toast.error('未找到可用路线');
            return;
          }

          const route: RouteResult = {
            distance: plan.getDistance(false),
            duration: plan.getDuration(false),
            steps: []
          };

          for (let i = 0; i < plan.getNumRoutes(); i++) {
            const routeItem = plan.getRoute(i);
            for (let j = 0; j < routeItem.getNumSteps(); j++) {
              const step = routeItem.getStep(j);
              route.steps.push({
                instruction: step.getDescription(false),
                distance: step.getDistance(false)
              });
            }
          }

          setRouteResult(route);
          toast.success('路线规划成功');

          // 绘制路线
          const polyline = new (window as any).BMapGL.Polyline(
            plan.getRoute(0).getPath(),
            {
              strokeColor: 'hsl(38, 92%, 55%)',
              strokeWeight: 6,
              strokeOpacity: 0.8
            }
          );
          mapInstanceRef.current.addOverlay(polyline);
          routeLayerRef.current = polyline;

          // 调整视野
          mapInstanceRef.current.setViewport(plan.getRoute(0).getPath());
        },
        onSearchError: () => {
          setPlanning(false);
          toast.error('路线规划失败，请检查起点和终点');
        }
      });

      driving.search(routeStart, routeEnd);
    } catch (error) {
      console.error('路线规划失败:', error);
      toast.error('路线规划失败，请重试');
      setPlanning(false);
    }
  };

  // 清除路线
  const handleClearRoute = () => {
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeOverlay(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    setRouteResult(null);
    setRouteStart('');
    setRouteEnd('');
  };

  // 格式化距离
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}米`;
    }
    return `${(meters / 1000).toFixed(1)}公里`;
  };

  // 格式化时间
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 xl:p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl xl:text-3xl font-bold mb-2 flex items-center gap-2">
          <MapPinned className="w-7 h-7 xl:w-8 xl:h-8 text-primary" />
          地图导航
        </h1>
        <p className="text-muted-foreground text-sm xl:text-base">
          地点搜索、路线规划、实时导航
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6">
        {/* 左侧功能区 */}
        <div className="xl:col-span-1 space-y-4">
          {/* 地点搜索 */}
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5" />
                地点搜索
              </CardTitle>
              <CardDescription className="text-xs">
                搜索地点、商家、景点等
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="输入地点名称或地址"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searching || !mapLoaded}
                  size="icon"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* 搜索结果 */}
              {searchResults.length > 0 && (
                <ScrollArea className="h-48 rounded-md border">
                  <div className="p-2 space-y-2">
                    {searchResults.map((place, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectPlace(place)}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedPlace?.name === place.name
                            ? 'bg-primary/10 border border-primary'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <div className="font-medium text-sm mb-1">{place.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {place.address}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* 路线规划 */}
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Route className="w-5 h-5" />
                路线规划
              </CardTitle>
              <CardDescription className="text-xs">
                规划驾车路线
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="route-start" className="text-sm">起点</Label>
                <Input
                  id="route-start"
                  placeholder="输入起点地址"
                  value={routeStart}
                  onChange={(e) => setRouteStart(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="route-end" className="text-sm">终点</Label>
                <Input
                  id="route-end"
                  placeholder="输入终点地址"
                  value={routeEnd}
                  onChange={(e) => setRouteEnd(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handlePlanRoute}
                  disabled={planning || !mapLoaded}
                  className="flex-1"
                >
                  {planning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      规划中...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      开始规划
                    </>
                  )}
                </Button>
                {routeResult && (
                  <Button
                    onClick={handleClearRoute}
                    variant="outline"
                    size="icon"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* 路线结果 */}
              {routeResult && (
                <div className="mt-4 p-3 rounded-md bg-muted space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {formatDistance(routeResult.distance)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {formatDuration(routeResult.duration)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      驾车路线
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {routeResult.steps.length} 个路段
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 当前位置 */}
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                当前位置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                className="w-full"
                disabled={!mapLoaded || locating}
              >
                {locating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    定位中...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    重新定位
                  </>
                )}
              </Button>
              {currentLocation && (
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>GPS定位成功</span>
                  </div>
                  <div>经度: {currentLocation.lng.toFixed(6)}</div>
                  <div>纬度: {currentLocation.lat.toFixed(6)}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧地图区 */}
        <div className="xl:col-span-2">
          <Card className="rounded-lg h-[600px] xl:h-[calc(100vh-8rem)]">
            <CardContent className="p-0 h-full">
              {!mapLoaded ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">加载地图中...</p>
                  </div>
                </div>
              ) : (
                <div ref={mapRef} className="w-full h-full rounded-lg" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
