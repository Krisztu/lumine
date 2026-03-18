'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp } from 'lucide-react'

export function AdminStatisticsTab() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      // Cache-elt statisztika betöltés
      const cacheKey = 'admin_statistics'
      const cachedStats = localStorage.getItem(cacheKey)
      const cacheTime = localStorage.getItem(cacheKey + '_time')
      
      // Ha van cache és 5 percnél frissebb
      if (cachedStats && cacheTime && (Date.now() - parseInt(cacheTime)) < 300000) {
        setStats(JSON.parse(cachedStats))
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/admin/statistics', {
        headers: {
          'x-user-role': 'admin'
        }
      })
      const data = await response.json()
      
      // Cache-elés
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(cacheKey + '_time', Date.now().toString())
      
      setStats(data)
    } catch (error) {
      console.error('Statisztikák betöltése sikertelen:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Betöltés...</div>
  if (!stats || !stats.today) return <div className="p-8 text-center">Hiba az adatok betöltésekor</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Statisztikák</h2>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Áttekintés</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">Felhasználók</TabsTrigger>
          <TabsTrigger value="grades" className="text-xs sm:text-sm">Jegyek</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Összes Felhasználó" value={stats.today?.users?.total || 0} color="blue" />
            <StatCard title="Diákok" value={stats.today?.users?.students || 0} color="green" />
            <StatCard title="Tanárok" value={stats.today?.users?.teachers || 0} color="orange" />
            <StatCard title="Szülők" value={stats.today?.users?.parents || 0} color="purple" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Osztályok (Átlag szerint)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="sm:hidden">
                <BarChart data={stats.topClasses || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value) => [Number(value).toFixed(2), 'Átlag']}
                    labelStyle={{ color: '#000' }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  />
                  <Bar dataKey="averageGrade" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={600} className="hidden sm:block">
                <BarChart data={stats.topClasses || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip 
                    formatter={(value) => [Number(value).toFixed(2), 'Átlag']}
                    labelStyle={{ color: '#000' }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  />
                  <Bar dataKey="averageGrade" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard title="Összes" value={stats.today?.users?.total || 0} color="blue" />
            <StatCard title="Diákok" value={stats.today?.users?.students || 0} color="green" />
            <StatCard title="Tanárok" value={stats.today?.users?.teachers || 0} color="orange" />
            <StatCard title="Szülők" value={stats.today?.users?.parents || 0} color="purple" />
            <StatCard title="DJ" value={stats.today?.users?.djs || 0} color="pink" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Felhasználók Eloszlása</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="sm:hidden">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Diákok', value: stats.today?.users?.students || 0 },
                      { name: 'Tanárok', value: stats.today?.users?.teachers || 0 },
                      { name: 'Szülők', value: stats.today?.users?.parents || 0 },
                      { name: 'DJ', value: stats.today?.users?.djs || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {['#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={600} className="hidden sm:block">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Diákok', value: stats.today?.users?.students || 0 },
                      { name: 'Tanárok', value: stats.today?.users?.teachers || 0 },
                      { name: 'Szülők', value: stats.today?.users?.parents || 0 },
                      { name: 'DJ', value: stats.today?.users?.djs || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={240}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {['#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Összes Jegy" value={stats.today?.grades?.total || 0} color="blue" />
            <StatCard title="Átlag" value={stats.today?.grades?.average?.toFixed(2) || '0.00'} color="green" />
            <StatCard title="5-ös Jegyek" value={stats.today?.grades?.byGrade?.[5] || 0} color="purple" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Jegyek Eloszlása</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="sm:hidden">
                <PieChart>
                  <Pie
                    data={[
                      { name: '1-es', value: stats.today?.grades?.byGrade?.[1] || 0 },
                      { name: '2-es', value: stats.today?.grades?.byGrade?.[2] || 0 },
                      { name: '3-as', value: stats.today?.grades?.byGrade?.[3] || 0 },
                      { name: '4-es', value: stats.today?.grades?.byGrade?.[4] || 0 },
                      { name: '5-ös', value: stats.today?.grades?.byGrade?.[5] || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={600} className="hidden sm:block">
                <PieChart>
                  <Pie
                    data={[
                      { name: '1-es', value: stats.today?.grades?.byGrade?.[1] || 0 },
                      { name: '2-es', value: stats.today?.grades?.byGrade?.[2] || 0 },
                      { name: '3-as', value: stats.today?.grades?.byGrade?.[3] || 0 },
                      { name: '4-es', value: stats.today?.grades?.byGrade?.[4] || 0 },
                      { name: '5-ös', value: stats.today?.grades?.byGrade?.[5] || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={240}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  )
}

function StatCard({ title, value, color = 'blue' }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800'
  }

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  )
}