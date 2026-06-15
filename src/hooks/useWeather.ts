import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WeatherData {
  temperature: number;
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
  forecast: { day: string; temp: number; condition: string; icon: string }[];
}

const MOCK: WeatherData = {
  temperature: 28,
  condition: 'Sunny',
  conditionIcon: '☀️',
  humidity: 64,
  windSpeed: 12,
  rainChance: 12,
  feelsLike: 30,
  sunrise: '6:15 AM',
  sunset: '6:45 PM',
  soilHealth: 'Good',
  location: 'Sangareddy',
  forecast: [
    { day: 'Mon', temp: 29, condition: 'Sunny', icon: '☀️' },
    { day: 'Tue', temp: 27, condition: 'Partly Cloudy', icon: '⛅' },
    { day: 'Wed', temp: 26, condition: 'Cloudy', icon: '☁️' },
    { day: 'Thu', temp: 28, condition: 'Sunny', icon: '☀️' },
    { day: 'Fri', temp: 25, condition: 'Rain', icon: '🌧️' },
  ],
};

const CACHE_KEY = 'boer_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 min

// Get a free API key from https://www.weatherapi.com and set it in .env as EXPO_PUBLIC_WEATHER_API_KEY
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || '';
const API_URL = 'https://api.weatherapi.com/v1';

export function useWeather(location?: string) {
  const [weather, setWeather] = useState<WeatherData>({ ...MOCK, location: location || MOCK.location });
  const [loading, setLoading] = useState(false);

  const fetchWeather = useCallback(async (loc: string) => {
    // Try cache first
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY}_${loc}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setWeather(data);
          return;
        }
      }
    } catch {}

    if (!API_KEY) {
      setWeather(prev => ({ ...prev, location: loc }));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(loc)}&days=5&aqi=no&alerts=no`);
      if (!res.ok) throw new Error('Weather fetch failed');
      const json = await res.json();

      const current = json.current;
      const forecast = json.forecast?.forecastday?.slice(0, 5).map((d: any) => ({
        day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        temp: Math.round(d.day.avgtemp_c),
        condition: d.day.condition.text,
        icon: getWeatherEmoji(d.day.condition.text),
      })) || MOCK.forecast;

      const wd: WeatherData = {
        temperature: Math.round(current.temp_c),
        condition: current.condition.text,
        conditionIcon: getWeatherEmoji(current.condition.text),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_kph),
        rainChance: forecast[0]?.condition.includes('Rain') ? 70 : Math.round(current.cloud * 0.7),
        feelsLike: Math.round(current.feelslike_c),
        sunrise: forecast[0]?.astro?.sunrise || '6:15 AM',
        sunset: forecast[0]?.astro?.sunset || '6:45 PM',
        soilHealth: current.humidity > 70 ? 'Moist' : current.humidity < 30 ? 'Dry' : 'Good',
        location: loc,
        forecast,
      };

      setWeather(wd);
      await AsyncStorage.setItem(`${CACHE_KEY}_${loc}`, JSON.stringify({ data: wd, timestamp: Date.now() }));
    } catch {
      setWeather(prev => ({ ...prev, location: loc }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) fetchWeather(location);
  }, [location, fetchWeather]);

  return { weather, loading, refresh: () => location && fetchWeather(location) };
}

function getWeatherEmoji(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('sunny') || c.includes('clear')) return '☀️';
  if (c.includes('partly cloudy')) return '⛅';
  if (c.includes('cloudy') || c.includes('overcast')) return '☁️';
  if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
  if (c.includes('thunder') || c.includes('storm')) return '⛈️';
  if (c.includes('snow') || c.includes('sleet')) return '❄️';
  if (c.includes('fog') || c.includes('mist')) return '🌫️';
  if (c.includes('wind')) return '💨';
  return '☀️';
}
