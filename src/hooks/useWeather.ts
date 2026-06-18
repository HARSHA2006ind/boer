import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WeatherData {
  temperature: number;
  highTemp: number;
  lowTemp: number;
  condition: string;
  conditionIcon: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  feelsLike: number;
  sunrise: string;
  sunset: string;
  soilHealth: string;
  location: string;
  farmName?: string;
  isDay: boolean;
  forecast: { day: string; temp: number; high: number; low: number; condition: string; icon: string }[];
}

function isNightTime(): boolean {
  const h = new Date().getHours();
  return h < 6 || h >= 18;
}

function generateMock(location: string): WeatherData {
  const h = new Date().getHours();
  const isDay = h >= 6 && h < 18;
  const baseTemp = isDay ? 28 : 22;
  return {
    temperature: baseTemp, highTemp: 31, lowTemp: 21,
    condition: isDay ? 'Sunny' : 'Clear', conditionIcon: isDay ? '☀️' : '🌙',
    humidity: 64, windSpeed: 12, rainChance: 12,
    feelsLike: isDay ? 30 : 21,
    sunrise: '6:15 AM', sunset: '6:45 PM',
    soilHealth: 'Good', location, isDay,
    forecast: [
      { day: 'Mon', temp: 29, high: 32, low: 22, condition: 'Sunny', icon: isDay ? '☀️' : '🌙' },
      { day: 'Tue', temp: 27, high: 30, low: 21, condition: 'Partly Cloudy', icon: '⛅' },
      { day: 'Wed', temp: 26, high: 29, low: 20, condition: 'Cloudy', icon: '☁️' },
      { day: 'Thu', temp: 28, high: 31, low: 22, condition: 'Sunny', icon: isDay ? '☀️' : '🌙' },
      { day: 'Fri', temp: 25, high: 28, low: 19, condition: 'Rain', icon: '🌧️' },
    ],
  };
}

const CACHE_KEY = 'boer_weather_cache';
const ALERT_CACHE_KEY = 'boer_weather_alerts';
const CACHE_DURATION = 30 * 60 * 1000;
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || '';
const API_URL = 'https://api.weatherapi.com/v1';

export interface WeatherAlert {
  id: string;
  type: 'heavy_rain' | 'cyclone' | 'flood' | 'heat_wave' | 'drought';
  severity: 'warning' | 'alert' | 'critical';
  message: string;
  farmName: string;
  farmLocation: string;
  timestamp: number;
}

function generateAlertsFromForecast(location: string, farmName: string, forecast: WeatherData['forecast']): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const rainDays = forecast.filter(d => d.icon === '🌧️' || d.icon === '⛈️');
  if (rainDays.length > 0) {
    alerts.push({
      id: `rain_${location}_${Date.now()}`,
      type: 'heavy_rain',
      severity: 'warning',
      message: `Heavy rainfall expected tomorrow for: ${farmName}`,
      farmName, farmLocation: location, timestamp: Date.now(),
    });
  }
  const hotDays = forecast.filter(d => d.high > 38);
  if (hotDays.length > 0) {
    alerts.push({
      id: `heat_${location}_${Date.now()}`,
      type: 'heat_wave',
      severity: 'alert',
      message: `Heat wave alert for: ${farmName}`,
      farmName, farmLocation: location, timestamp: Date.now(),
    });
  }
  return alerts;
}

export function useWeather(location?: string, farmName?: string) {
  const [weather, setWeather] = useState<WeatherData>(generateMock(location || 'Sangareddy'));
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  const fetchWeather = useCallback(async (loc: string) => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY}_${loc}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setWeather(data);
          setOffline(false);
          return data;
        }
      }
    } catch {}

    if (!API_KEY) {
      const mock = generateMock(loc);
      setWeather(mock);
      if (farmName) mock.farmName = farmName;
      return mock;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(loc)}&days=5&aqi=no&alerts=no`);
      if (!res.ok) throw new Error('Weather fetch failed');
      const json = await res.json();
      const current = json.current;
      const fore = json.forecast?.forecastday;
      const nowH = new Date().getHours();
      const isDay = nowH >= 6 && nowH < 18;

      const forecast = (fore?.slice(0, 5) || []).map((d: any) => ({
        day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        temp: Math.round(d.day.avgtemp_c),
        high: Math.round(d.day.maxtemp_c),
        low: Math.round(d.day.mintemp_c),
        condition: d.day.condition.text,
        icon: getTimeAwareEmoji(d.day.condition.text),
      }));

      const wd: WeatherData = {
        temperature: Math.round(current.temp_c),
        highTemp: fore?.[0]?.day?.maxtemp_c ? Math.round(fore[0].day.maxtemp_c) : Math.round(current.temp_c + 3),
        lowTemp: fore?.[0]?.day?.mintemp_c ? Math.round(fore[0].day.mintemp_c) : Math.round(current.temp_c - 5),
        condition: current.condition.text,
        conditionIcon: getTimeAwareEmoji(current.condition.text),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_kph),
        rainChance: fore?.[0]?.day?.daily_chance_of_rain || Math.round(current.cloud * 0.7),
        feelsLike: Math.round(current.feelslike_c),
        sunrise: fore?.[0]?.astro?.sunrise || '6:15 AM',
        sunset: fore?.[0]?.astro?.sunset || '6:45 PM',
        soilHealth: current.humidity > 70 ? 'Moist' : current.humidity < 30 ? 'Dry' : 'Good',
        location: loc,
        farmName,
        isDay,
        forecast,
      };

      setWeather(wd);
      setOffline(false);
      await AsyncStorage.setItem(`${CACHE_KEY}_${loc}`, JSON.stringify({ data: wd, timestamp: Date.now() }));

      const weatherAlerts = generateAlertsFromForecast(loc, farmName || loc, forecast);
      setAlerts(weatherAlerts);
      if (weatherAlerts.length > 0) {
        const existing = await AsyncStorage.getItem(ALERT_CACHE_KEY);
        const allAlerts = existing ? JSON.parse(existing) : [];
        const merged = [...weatherAlerts, ...allAlerts.filter((a: WeatherAlert) => a.farmLocation !== loc)].slice(0, 20);
        await AsyncStorage.setItem(ALERT_CACHE_KEY, JSON.stringify(merged));
      }
      return wd;
    } catch {
      const mock = generateMock(loc);
      setWeather(mock);
      setOffline(true);
      if (farmName) mock.farmName = farmName;
      return mock;
    } finally {
      setLoading(false);
    }
  }, [farmName]);

  useEffect(() => {
    if (location) {
      fetchWeather(location);
      loadCachedAlerts();
    }
  }, [location, fetchWeather]);

  async function loadCachedAlerts() {
    try {
      const cached = await AsyncStorage.getItem(ALERT_CACHE_KEY);
      if (cached) {
        const allAlerts = JSON.parse(cached);
        const relevant = allAlerts.filter((a: WeatherAlert) => location ? a.farmLocation === location : true);
        setAlerts(relevant);
      }
    } catch {}
  }

  return { weather, loading, offline, alerts, refresh: () => location && fetchWeather(location) };
}

function getTimeAwareEmoji(condition: string): string {
  const c = condition.toLowerCase();
  const night = isNightTime();
  let emoji = '☀️';
  if (c.includes('sunny') || c.includes('clear')) emoji = '☀️';
  else if (c.includes('partly cloudy')) emoji = '⛅';
  else if (c.includes('cloudy') || c.includes('overcast')) emoji = '☁️';
  else if (c.includes('rain') || c.includes('drizzle')) emoji = '🌧️';
  else if (c.includes('thunder') || c.includes('storm')) emoji = '⛈️';
  else if (c.includes('snow') || c.includes('sleet')) emoji = '❄️';
  else if (c.includes('fog') || c.includes('mist')) emoji = '🌫️';
  else if (c.includes('wind')) emoji = '💨';
  if (night && (emoji === '☀️' || emoji === '🌤️')) return '🌙';
  if (night && emoji === '⛅') return '☁️';
  return emoji;
}
